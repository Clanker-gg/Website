import sys
from flask import Flask, request, jsonify
from flask_cors import CORS
from googleapiclient.errors import HttpError
from pull_youtube import find_videos

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend requests


def log(message):
    """Print and flush immediately for Docker logs."""
    print(message, flush=True)


@app.route('/api/videos', methods=['GET'])
def get_videos():
    """
    Get video IDs based on search tags.
    Query params:
        - tag: The search tag (required)
        - page_token: Token for fetching next page of results (optional)
        - api_key: User's YouTube API key (required)
    """
    tag = request.args.get('tag', '')
    page_token = request.args.get('page_token', None)
    api_key = request.args.get('api_key', '')
    log(f"[SEARCH] Received search request for: '{tag}' (page_token: {page_token})")
    
    if not tag:
        log("[SEARCH] Error: No tag provided")
        return jsonify({'error': 'No tag provided'}), 400
    
    if not api_key:
        log("[SEARCH] Error: No API key provided")
        return jsonify({'error': 'No API key provided. Please add your YouTube API key in settings.'}), 400
    
    try:
        log(f"[SEARCH] Calling find_videos with tag: '{tag}'")
        video_ids, next_page_token = find_videos([tag], page_token, api_key)
        log(f"[SEARCH] Found {len(video_ids)} videos for '{tag}'")
        return jsonify({
            'tag': tag,
            'videos': video_ids,
            'count': len(video_ids),
            'next_page_token': next_page_token
        })
    except HttpError as e:
        if e.resp.status == 403 and 'quotaExceeded' in str(e):
            log(f"[SEARCH] Quota exceeded for API key")
            return jsonify({
                'error': 'quota_exceeded',
                'message': 'YouTube API quota exceeded. The daily limit has been reached. Please try again tomorrow or use a different API key.'
            }), 429
        log(f"[SEARCH] YouTube API error for '{tag}': {e}")
        return jsonify({'error': str(e)}), 500
    except Exception as e:
        log(f"[SEARCH] Error searching for '{tag}': {e}")
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
