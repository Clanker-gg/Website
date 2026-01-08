from pytubefix import Search
from pytubefix.exceptions import LiveStreamError
import random
from concurrent.futures import ThreadPoolExecutor, as_completed


def search_tag(tag):
    """Search for a single tag and return video IDs."""
    id_list = []
    s = Search(tag + " shorts")
    print(f"Searching for: {tag} shorts")    
    # Load more pages of results (each call gets ~20 more videos)
    for _ in range(5):  # Get 5 pages of results
        s.get_next_results()
    # Filter for shorts (videos under 60 seconds)
    for video in s.videos:
        try:
            if video.length and video.length <= 120:
                id_list.append(video.video_id)
        except LiveStreamError:
            # Skip live streams
            continue
    return id_list


def find_videos(tags):
    id_list = []
    # Use ThreadPoolExecutor to search tags in parallel
    with ThreadPoolExecutor(max_workers=len(tags)) as executor:
        futures = {executor.submit(search_tag, tag): tag for tag in tags}
        for future in as_completed(futures):
            tag = futures[future]
            try:
                result = future.result()
                id_list.extend(result)
                print(f"Found {len(result)} videos for {tag}")
            except Exception as e:
                print(f"Error searching {tag}: {e}")
    random.shuffle(id_list)
    return id_list