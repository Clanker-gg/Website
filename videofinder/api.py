from flask import Flask, request, jsonify
from flask_cors import CORS
from pull_youtube import find_videos

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend requests


@app.route('/api/videos', methods=['GET'])
def get_videos():
    """
    Get video IDs based on search tags.
    Query params:
        - tag: The search tag (required)
    """
    tag = request.args.get('tag', '')
    
    if not tag:
        return jsonify({'error': 'No tag provided'}), 400
    
    try:
        video_ids = find_videos([tag])
        return jsonify({
            'tag': tag,
            'videos': video_ids,
            'count': len(video_ids)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
