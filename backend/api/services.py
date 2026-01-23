from django.conf import settings
from django.http import JsonResponse
from googleapiclient.errors import HttpError
from api.pull_youtube import find_videos


def log(message):
    """Print and flush immediately for Docker logs."""
    print(message, flush=True)


def search_videos(tag, page_token=None):
    """
    Search for videos by tag using YouTube API.
    Returns JsonResponse with video IDs or error.
    """
    log(f"[SEARCH] Received search request for: '{tag}' (page_token: {page_token})")

    if not tag:
        log("[SEARCH] Error: No tag provided")
        return JsonResponse({"error": "No tag provided"}, status=400)

    try:
        log(f"[SEARCH] Calling find_videos with tag: '{tag}'")
        video_ids, next_page_token = find_videos([tag], page_token, settings.YOUTUBE_API_KEY)
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
