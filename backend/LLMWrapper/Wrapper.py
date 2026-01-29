from openai import OpenAI
from pydantic import BaseModel, Field
from typing import List
from instructor import patch
import json
from pathlib import Path

class Lesson(BaseModel):
    name: str = Field(description="Title of the lesson (5-8 words)")
    #Name of topic

    description: str = Field(description="Brief description of the lesson")
    #Content of the topic

    subtopics: List[str] = Field(
        description="3-5 specific learning points"
    )
    #Subtopics

    real_life_examples: List[str] = Field(description="2-4 real-life examples")
    #Examples irl

    
    #Difficulty level
    difficulty: str = Field(
        description="Educational level like Elementary School, Middle School, High School, University"
    )    
class LessonPlan(BaseModel):
    genre: str = Field(description="Subject category like biology, history, math, physics, english, chinese, french, etc.")
    #the genre of lessons

    lessons: List[Lesson] = Field(
        description="Array of lessons matching the count requested"
    )
        #List of lessons
    prerequisites: List[str] = Field(description = "Prerequisites topic required for this course")
    #prerequisites

def main():
    print("Please specify how many lessons you want to generate:  ")
    checkNum = True
    while checkNum:
        try:
            user_lessons = int(input("User: "))
            checkNum = False
        except ValueError:
            print("Please enter a valid number.")

    while True:
        client = OpenAI(api_key="uwWccmym6rsRtqvPeo0IHaOhNW9DeOUw", base_url="https://api.mistral.ai/v1")
        #hardcoded api key for testing (will implement env var later)
        
        client = patch(client)
        #line to patch the client for instructor support from line 68
        
        print("Client initialized: Type quit to exit.")
        print("Please specify on what topic you want to generate lessons on:  ")
        user_input = input("User: ")
        
        if user_input.lower() == "quit":
            break
        
        system_prompt = lessonPlanner(user_input, user_lessons)
        #just gives it a prompt to follow for generating lesson plans

        response = client.chat.completions.create(
            model="mistral-large-latest", 
            #using mistral large 3 as our model

            response_model = LessonPlan,
            #models the response according to LessonPlan structure line 27

            messages=[
                {"role": "system", "content": system_prompt},
                #What the model should follow
                {"role": "user", "content": user_input}
                #What the user wants to learn about
            ],
            temperature=0.7
        )
         #output formatting
        
        print(f"\nGenre: {response.genre}")
        #Main genre/category

        print(f"\nPrerequisites: {response.prerequisites}")

        print(f"Total Lessons: {len(response.lessons)}\n")
        #Amt Lessons
        
        #output formatting
        for i, lesson in enumerate(response.lessons, 1):
            print(f"Lesson {i}: {lesson.name}")
            #Lesson title(Lesson i: xxxxx)

            #Difficulty
            print(f"Difficulty: {lesson.difficulty}")

            print(f"Description: {lesson.description}") 
            #short description/content
            
            print(f"Subtopics: {', '.join(lesson.subtopics)}") 
            #List of topics
            
            print(f"Real-life Examples: {', '.join(lesson.real_life_examples)}")
            #Real life examples of when it's used
            
            print("-" * 40) 
            #Separator

            # Save to JSON file
            file_path = Path(f"lesson_plan_{user_input.replace(' ', '_')}.json")
            if file_path.exists():
                try:
                    with open("example.txt", 'w') as f:
                        f.write(str(response))
                except Exception as e:
                    print(f"Error saving to example.txt: {e}")
            else:
                filename = f"lesson_plan_{user_input.replace(' ', '_')}.json" 
                #Creates a json file based on the name of the topic
                
                # Prepare data
                data = {
                    "topic": user_input,
                    "requested_lessons": user_lessons,
                    "generated_lessons": len(response.lessons),
                    "genre": response.genre,
                    "prerequisites": response.prerequisites,
                    "lessons": [lesson.model_dump() for lesson in response.lessons]
                }
                
                # Save to file
                with open(filename, 'w') as f:
                    json.dump(data, f, indent=2)

def lessonPlanner(topic: str, num_lessons: int) -> str:
    #System prompt for lesson plan generation instructions read by model
    return f"""You are an expert curriculum designer. 
    Generate a structured lesson plan on the topic: {topic}.
    
    REQUIREMENTS:
    1. Generate exactly {num_lessons} lessons
    2. Each lesson must have:
       - A clear name/title
       - A brief description (1-2 sentences)
       - 3-5 key subtopics
       - 2-4 real-life examples
       - A difficulty level (Middle School, High School, or University)
    
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

if __name__ == "__main__":
    main()
    