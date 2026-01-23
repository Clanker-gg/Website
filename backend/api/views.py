from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from googleapiclient.errors import HttpError
from api.pull_youtube import find_videos
from api.helpers import log


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
