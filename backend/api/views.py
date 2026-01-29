from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from googleapiclient.errors import HttpError
from api.pull_youtube import find_videos
from api.helpers import log
from openai import OpenAI
from pydantic import BaseModel, Field
from typing import List
from instructor import patch

import json
import os


# Data models for lesson plan generation
class Lesson(BaseModel):
    name: str = Field(description="Title of the lesson (5-8 words)")
    description: str = Field(description="Brief description of the lesson")
    subtopics: List[str] = Field(description="3-5 specific learning points")
    real_life_examples: List[str] = Field(description="2-4 real-life examples")
    difficulty: str = Field(
        description="Educational level like Elementary School, Middle School, High School, University"
    )


class LessonPlan(BaseModel):
    genre: str = Field(
        description="Subject category like biology, history, math, physics, english, chinese, french, etc."
    )
    lessons: List[Lesson] = Field(
        description="Array of lessons matching the count requested"
    )
    prerequisites: List[str] = Field(
        description="Prerequisites topic required for this course"
    )


# View to get videos based on search tags
@require_http_methods(["GET"])
def get_videos(request):
    """
    Get video IDs based on search tags.
    Query params:
        - tag: The search tag
        - page_token (optional): Token for fetching next page of results
    """
    tag = request.GET.get("tag")
    if not tag:
        return JsonResponse({"error": "Tag parameter is required"}, status=400)

    page_token = request.GET.get("page_token")
    log(f"[SEARCH] Searching for tag: '{tag}' (page_token: {page_token})")

    try:
        video_ids, next_page_token = find_videos(
            [tag], page_token, settings.YOUTUBE_API_KEY
        )
        log(f"[SEARCH] Found {len(video_ids)} videos for '{tag}'")

        return JsonResponse(
            {
                "tag": tag,
                "videos": video_ids,
                "count": len(video_ids),
                "next_page_token": next_page_token,
            }
        )
    except HttpError as e:
        if e.resp.status == 403 and "quotaExceeded" in str(e):
            log("[SEARCH] Quota exceeded")
            return JsonResponse(
                {
                    "error": "quota_exceeded",
                    "message": "YouTube API quota exceeded. Please try again tomorrow.",
                },
                status=429,
            )
        log(f"[SEARCH] YouTube API error for '{tag}': {e}")
        return JsonResponse({"error": str(e)}, status=500)
    except Exception as e:
        log(f"[SEARCH] Unexpected error for '{tag}': {e}")
        return JsonResponse({"error": str(e)}, status=500)
    
# Lesson plan generation
def create_lesson_planner_prompt(topic: str, num_lessons: int) -> str:
    """System prompt for lesson plan generation instructions"""
    return f"""You are an expert curriculum designer. 
    Generate a structured lesson plan on the topic: {topic}.
    
    REQUIREMENTS:
    1. Generate exactly {num_lessons} lessons
    2. Each lesson must have:
       - A clear name/title
       - A brief description (1-2 sentences)
       - 3-5 key subtopics
       - 2-4 real-life examples
       - A difficulty level (Elementary School, Middle School, High School, or University)
    
    3. Determine the main genre/category:
       - Choose from: Math, Science, History, Literature, Art, Technology, 
         Business, Philosophy, Psychology, Sociology, Biology, Physics, 
         Chemistry, Computer Science, Engineering, Economics, or related fields
       
    4. Lessons should progress logically:
       - Start with foundational concepts
       - Build to intermediate applications
       - End with advanced/synthesis topics
    
    IMPORTANT: Always follow this exact JSON structure:
    {{
      "genre": "Main subject category",
      "prerequisites": ["Linear Algebra", "Multivariable Calculus", ...] list all the prerequisites no matter how simple they may seem, even basic algebra,
      "lessons": [
        {{
          "name": "Lesson title",
          "difficulty": "Elementary School, Middle School, High School, or University",
          "description": "Brief description",
          "subtopics": ["subtopic1", "subtopic2", "subtopic3"],
          "real_life_examples": ["example1", "example2", "example3"]
        }}
      ]
    }}
    
    Make sure to include exactly {num_lessons} lesson objects in the lessons array."""

# Django view to generate course material
@csrf_exempt  # Remove in production - implement proper CSRF
@require_http_methods(["POST"])
def generate_course(request):
    """
    API endpoint to generate course material using Mistral AI.
    
    Expected JSON payload:
    {
        "topic": "Course topic",
        "lessons_count": 5,
        "difficulty": "High School" (optional)
    }
    
    Returns:
    {
        "success": true,
        "course": {
            "genre": "...",
            "prerequisites": [...],
            "lessons": [...]
        }
    }
    """
    try:
        # Parse incoming JSON
        data = json.loads(request.body)
        topic = data.get('topic')
        lessons_count = data.get('lessons_count', 5)
        
        # Validate required fields
        if not topic:
            return JsonResponse({
                'error': 'Topic is required'
            }, status=400)
        
        # Validate lessons_count
        if not isinstance(lessons_count, int) or lessons_count < 1 or lessons_count > 20:
            return JsonResponse({
                'error': 'lessons_count must be an integer between 1 and 20'
            }, status=400)
        
        # Get Mistral API key from environment
        api_key = os.environ.get("MISTRAL_API_KEY")
        if not api_key:
            return JsonResponse({
                'error': 'MISTRAL_API_KEY not configured'
            }, status=500)
        
        # Initialize OpenAI client with Mistral base URL
        client = OpenAI(
            api_key=api_key,
            base_url="https://api.mistral.ai/v1"
        )
        
        # Patch client for instructor support
        client = patch(client)
        
        # Create system prompt
        system_prompt = create_lesson_planner_prompt(topic, lessons_count)
        
        # Generate lesson plan using Mistral
        response = client.chat.completions.create(
            model="mistral-large-latest",
            response_model=LessonPlan,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": topic}
            ],
            temperature=0.7
        )
        
        # Convert Pydantic model to dict
        lesson_plan_data = {
            "genre": response.genre,
            "prerequisites": response.prerequisites,
            "total_lessons": len(response.lessons),
            "lessons": [lesson.model_dump() for lesson in response.lessons]
        }
        
        return JsonResponse({
            'success': True,
            'course': lesson_plan_data
        }, status=200)
    
    except json.JSONDecodeError:
        return JsonResponse({
            'error': 'Invalid JSON in request body'
        }, status=400)
    
    except Exception as e:
        # Log the error in production
        print(f"Error in generate_course: {str(e)}")
        return JsonResponse({
            'error': 'An error occurred while generating the course'
        }, status=500)
