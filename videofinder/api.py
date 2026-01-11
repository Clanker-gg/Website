import sys
from flask import Flask, request, jsonify
from flask_cors import CORS
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
    """
    tag = request.args.get('tag', '')
    page_token = request.args.get('page_token', None)
    log(f"[SEARCH] Received search request for: '{tag}' (page_token: {page_token})")
    
    if not tag:
        log("[SEARCH] Error: No tag provided")
        return jsonify({'error': 'No tag provided'}), 400
    
    try:
        log(f"[SEARCH] Calling find_videos with tag: '{tag}'")
        video_ids, next_page_token = find_videos([tag], page_token)
        log(f"[SEARCH] Found {len(video_ids)} videos for '{tag}'")
        return jsonify({
            'tag': tag,
            'videos': video_ids,
            'count': len(video_ids),
            'next_page_token': next_page_token
        })
    except Exception as e:
        log(f"[SEARCH] Error searching for '{tag}': {e}")
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
