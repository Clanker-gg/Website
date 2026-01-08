import os
import random
from googleapiclient.discovery import build

# Get API key from environment variable
API_KEY = os.environ.get('YOUTUBE_API_KEY', '')

def get_youtube_client():
    """Create YouTube API client."""
    if not API_KEY:
        raise ValueError("YOUTUBE_API_KEY environment variable not set")
    return build('youtube', 'v3', developerKey=API_KEY)


def search_tag(tag):
    """Search for a single tag and return video IDs."""
    youtube = get_youtube_client()
    id_list = []
    
    search_query = f"{tag} shorts"
    print(f"Searching for: {search_query}", flush=True)
    
    try:
        # Search for videos - get up to 50 results per request
        request = youtube.search().list(
            q=search_query,
            part='id',
            type='video',
            videoDuration='short',  # Videos under 4 minutes
            maxResults=50,
            relevanceLanguage='en',
            safeSearch='moderate'
        )
        response = request.execute()
        
        # Extract video IDs
        for item in response.get('items', []):
            video_id = item['id'].get('videoId')
            if video_id:
                id_list.append(video_id)
        
        # Get next page if available (uses more quota)
        if 'nextPageToken' in response and len(id_list) < 100:
            request = youtube.search().list(
                q=search_query,
                part='id',
                type='video',
                videoDuration='short',
                maxResults=50,
                relevanceLanguage='en',
                safeSearch='moderate',
                pageToken=response['nextPageToken']
            )
            response = request.execute()
            for item in response.get('items', []):
                video_id = item['id'].get('videoId')
                if video_id:
                    id_list.append(video_id)
                    
    except Exception as e:
        print(f"Error searching YouTube: {e}", flush=True)
    
    return id_list


def find_videos(tags):
    """Find videos for multiple tags."""
    id_list = []
    
    for tag in tags:
        try:
            result = search_tag("Learn "  + tag + " English shorts")
            id_list.extend(result)
            print(f"Found {len(result)} videos for {tag}", flush=True)
        except Exception as e:
            print(f"Error searching {tag}: {e}", flush=True)
    
    random.shuffle(id_list)
    return id_list