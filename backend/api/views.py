from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from api.services import search_videos


@require_http_methods(["GET"])
def get_videos(request):
    """
    Get video IDs based on search tags.
    Query params:
        - tag: The search tag
        - page_token (optional): Token for fetching next page of results
    """
    tag = request.GET.get("tag", "")
    page_token = request.GET.get("page_token", None)
    return search_videos(tag, page_token)
