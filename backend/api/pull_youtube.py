import os
import json
import hashlib
from pathlib import Path
import isodate
import tempfile
from googleapiclient.discovery import build

# Max duration for Shorts (60 seconds)
MAX_SHORT_DURATION = 60

# Cache directory
CACHE_DIR = Path(tempfile.gettempdir()) / 'youtube_cache'
CACHE_DIR.mkdir(exist_ok=True)


def get_cache_key(tag, page_token=None):
    """Generate a cache key for a search."""
    key = f"{tag}:{page_token or 'first'}"
    return hashlib.md5(key.encode()).hexdigest()


def get_cached_results(tag, page_token=None):
    """Get cached results if available."""
    cache_file = CACHE_DIR / f"{get_cache_key(tag, page_token)}.json"
    if cache_file.exists():
        try:
            with open(cache_file, 'r') as f:
                data = json.load(f)
                print(f"Cache hit for '{tag}'", flush=True)
                return data['videos'], data.get('next_page_token')
        except Exception:
            pass
    return None, None


def save_to_cache(tag, videos, next_page_token, page_token=None):
    """Save results to cache."""
    cache_file = CACHE_DIR / f"{get_cache_key(tag, page_token)}.json"
    try:
        with open(cache_file, 'w') as f:
            json.dump({'videos': videos, 'next_page_token': next_page_token}, f)
    except Exception as e:
        print(f"Failed to cache: {e}", flush=True)


def get_youtube_client(api_key):
    """Create YouTube API client with provided API key."""
    if not api_key:
        raise ValueError("No API key provided")
    return build('youtube', 'v3', developerKey=api_key)


def filter_shorts(youtube, video_ids):
    """Filter video IDs to only include playable Shorts (under 60 seconds), sorted by popularity."""
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
            video_id = item['id']
            status = item.get('status', {})
            content_details = item.get('contentDetails', {})
            
            # Skip private or unlisted videos that may not play
            privacy = status.get('privacyStatus', '')
            if privacy != 'public':
                continue
            
            # Skip videos that aren't fully processed
            upload_status = status.get('uploadStatus', '')
            if upload_status != 'processed':
                continue
            
            # Skip age-restricted content (requires sign-in to embed)
            content_rating = content_details.get('contentRating', {})
            if content_rating.get('ytRating') == 'ytAgeRestricted':
                continue
            
            duration_str = content_details.get('duration', 'PT0S')
            # Parse ISO 8601 duration (e.g., "PT45S" = 45 seconds)
            duration = isodate.parse_duration(duration_str).total_seconds()
            if duration <= MAX_SHORT_DURATION:
                view_count = int(item.get('statistics', {}).get('viewCount', 0))
                shorts.append((video_id, view_count))
    
    # Sort by view count descending (most popular first)
    shorts.sort(key=lambda x: x[1], reverse=True)
    
    # Return just the video IDs in sorted order
    return [video_id for video_id, _ in shorts]


def search_tag(tag, page_token=None, api_key=None):
    """Search for a single tag and return video IDs (Shorts only) and next page token."""
    
    # Check cache first
    cached_videos, cached_token = get_cached_results(tag, page_token)
    if cached_videos is not None:
        return cached_videos, cached_token
    
    youtube = get_youtube_client(api_key)
    candidate_ids = set()
    next_page_token = None
    
    try:
        # Single optimized search - let YouTube handle relevance
        search_params = {
            'q': f"{tag} shorts",
            'part': 'id',
            'type': 'video',
            'videoDuration': 'short',
            'maxResults': 50,  # Max allowed per request
            'regionCode': 'US',
            'relevanceLanguage': 'en',
            'safeSearch': 'moderate',
            'order': 'relevance'
        }
        if page_token:
            search_params['pageToken'] = page_token
        
        print(f"Searching for: {tag}", flush=True)
        request = youtube.search().list(**search_params)
        response = request.execute()
        
        # Store next page token
        next_page_token = response.get('nextPageToken')
        
        # Extract video IDs
        for item in response.get('items', []):
            video_id = item['id'].get('videoId')
            if video_id:
                candidate_ids.add(video_id)
        
        # Filter to actual Shorts (under 60 seconds)
        candidate_list = list(candidate_ids)
        print(f"Found {len(candidate_list)} candidates, filtering...", flush=True)
        shorts = filter_shorts(youtube, candidate_list)
        print(f"Filtered to {len(shorts)} Shorts", flush=True)
        
        # Cache the results
        save_to_cache(tag, shorts, next_page_token, page_token)
        
        return shorts, next_page_token
                    
    except Exception as e:
        print(f"Error searching YouTube: {e}", flush=True)
    
    return [], None


def find_videos(tags, page_token=None, api_key=None):
    """Find videos for multiple tags. Returns (video_ids, next_page_token)."""
    id_list = []
    next_page_token = None
    
    for tag in tags:
        try:
            result, token = search_tag(tag, page_token, api_key)
            id_list.extend(result)
            if token:
                next_page_token = token
            print(f"Found {len(result)} videos for {tag}", flush=True) 
        except Exception as e:
            print(f"Error searching {tag}: {e}", flush=True)
    
    return id_list, next_page_token

def test_pull_youtube():
    """Test the pull_youtube module."""
    tags = ["Maslow's hierarchy of needs"]
    videos, token = find_videos(tags)
    print(f"Videos: {videos}")
    print(f"Next page token: {token}")

if __name__ == '__main__':
    test_pull_youtube()