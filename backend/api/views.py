import os
import sys
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from googleapiclient.errors import HttpError
from api.pull_youtube import find_videos

# API key from environment variable (set in docker-compose.yml)
API_KEY = os.environ.get("YOUTUBE_API_KEY", "")


def log(message):
    """Print and flush immediately for Docker logs."""
    print(message, flush=True)


@require_http_methods(["GET"])
def get_videos(request):
    """
    Get video IDs based on search tags.
    Query params:
        - tag: The search tag (required)
        - page_token: Token for fetching next page of results (optional)
    """

    tag = request.GET.get("tag", "")
    page_token = request.GET.get("page_token", None)
    log(f"[SEARCH] Received search request for: '{tag}' (page_token: {page_token})")

    if not tag:
        log("[SEARCH] Error: No tag provided")
        return JsonResponse({"error": "No tag provided"}, status=400)

    if not API_KEY:
        log("[SEARCH] Error: No API key configured on server")
        return JsonResponse(
            {
                "error": "Server API key not configured. Please contact the administrator."
            },
            status=500,
        )

    try:
        log(f"[SEARCH] Calling find_videos with tag: '{tag}'")
        video_ids, next_page_token = find_videos([tag], page_token, API_KEY)
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
            log(f"[SEARCH] Quota exceeded")
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
        log(f"[SEARCH] Error searching for '{tag}': {e}")
        return JsonResponse({"error": str(e)}, status=500)
