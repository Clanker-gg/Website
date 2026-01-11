import os
import random
import isodate
from googleapiclient.discovery import build

# Get API key from environment variable
API_KEY = os.environ.get('YOUTUBE_API_KEY', '')

# Max duration for Shorts (60 seconds)
MAX_SHORT_DURATION = 60

# Regions to search (developed English-speaking + major developed nations)
SEARCH_REGIONS = ['US', 'GB', 'CA', 'AU', 'NZ', 'IE', 'DE', 'FR', 'NL', 'SE']


def get_youtube_client():
    """Create YouTube API client."""
    if not API_KEY:
        raise ValueError("YOUTUBE_API_KEY environment variable not set")
    return build('youtube', 'v3', developerKey=API_KEY)


def filter_shorts(youtube, video_ids):
    """Filter video IDs to only include embeddable Shorts (under 60 seconds), sorted by popularity."""
    if not video_ids:
        return []
    
    shorts = []  # List of (video_id, view_count) tuples
    # API allows up to 50 IDs per request
    for i in range(0, len(video_ids), 50):
        batch = video_ids[i:i+50]
        request = youtube.videos().list(
            part='contentDetails,statistics,status',
            id=','.join(batch)
        )
        response = request.execute()
        
        for item in response.get('items', []):
            # Skip videos that can't be embedded
            status = item.get('status', {})
            if not status.get('embeddable', False):
                continue
            
            # Skip private or unlisted videos that may not play
            privacy = status.get('privacyStatus', '')
            if privacy != 'public':
                continue
            
            duration_str = item['contentDetails']['duration']
            # Parse ISO 8601 duration (e.g., "PT45S" = 45 seconds)
            duration = isodate.parse_duration(duration_str).total_seconds()
            if duration <= MAX_SHORT_DURATION:
                view_count = int(item.get('statistics', {}).get('viewCount', 0))
                shorts.append((item['id'], view_count))
    
    # Sort by view count descending (most popular first)
    shorts.sort(key=lambda x: x[1], reverse=True)
    
    # Return just the video IDs in sorted order
    return [video_id for video_id, _ in shorts]


def search_tag(tag):
    """Search for a single tag and return video IDs (Shorts only)."""
    youtube = get_youtube_client()
    candidate_ids = set()  # Use set to avoid duplicates across regions
    
    # Multiple search strategies to find better content
    search_queries = [
        f"{tag}",                    # Direct search (most natural)
        f"{tag} explained",          # Educational framing
        f"{tag} tutorial",           # Tutorial content
    ]
    
    try:
        for search_query in search_queries:
            print(f"Searching for: {search_query}", flush=True)
            
            # Search across multiple regions
            for region in SEARCH_REGIONS[:3]:  # Top 3 regions to save quota
                request = youtube.search().list(
                    q=search_query,
                    part='id',
                    type='video',
                    videoDuration='short',  # Videos under 4 minutes (pre-filter)
                    maxResults=15,
                    regionCode=region,
                    relevanceLanguage='en',
                    safeSearch='moderate'
                )
                response = request.execute()
                
                # Extract video IDs
                for item in response.get('items', []):
                    video_id = item['id'].get('videoId')
                    if video_id:
                        candidate_ids.add(video_id)
        
        # Filter to actual Shorts (under 60 seconds)
        candidate_list = list(candidate_ids)
        print(f"Found {len(candidate_list)} unique candidates, filtering for Shorts...", flush=True)
        shorts = filter_shorts(youtube, candidate_list)
        print(f"Filtered to {len(shorts)} actual Shorts", flush=True)
        return shorts
                    
    except Exception as e:
        print(f"Error searching YouTube: {e}", flush=True)
    
    return []


def find_videos(tags):
    """Find videos for multiple tags."""
    id_list = []
    
    for tag in tags:
        try:
            result = search_tag(tag)  # Pass tag directly, search_tag handles variations
            id_list.extend(result)
            print(f"Found {len(result)} videos for {tag}", flush=True) 
        except Exception as e:
            print(f"Error searching {tag}: {e}", flush=True)
    
    # Videos are already sorted by popularity within each tag
    # Keep them in order (most popular from each tag first)
    return id_list