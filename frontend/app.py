from flask import Flask, request, jsonify, send_file
import os
from pathfinder import find_path, save_result
import time
from rover import RobotPathAnimator
from flask_cors import CORS

app = Flask(__name__)
CORS(app) 

# Configure folders
UPLOAD_FOLDER = 'uploads'
OUTPUT_FOLDER = 'outputs'
for folder in [UPLOAD_FOLDER, OUTPUT_FOLDER]:
    if not os.path.exists(folder):
        os.makedirs(folder)

# Configuration
IMAGE_FILENAME = "C:\\Users\\GARV\\Moon_Project\\newfinaldata\\newcombinedout\\combined_image_batch_1.jpg"
LABELS_FILENAME = 'path1.txt'
ROVER_IMAGE_PATH = "isro_rover.png"

def get_image_path():
    if not os.path.exists(IMAGE_FILENAME):
        raise FileNotFoundError(f"Image file not found: {IMAGE_FILENAME}")
    return IMAGE_FILENAME

def get_labels_path():
    labels_path = os.path.join(UPLOAD_FOLDER, LABELS_FILENAME)
    if not os.path.exists(labels_path):
        raise FileNotFoundError(f"Labels file not found: {labels_path}")
    return labels_path  

@app.route('/')
def index():
    return send_file('index.html')

@app.route('/get_image')
def get_image():
    try:
        image_path = get_image_path()
        return send_file(image_path, mimetype='image/jpeg')
    except FileNotFoundError as e:
        return jsonify({'error': str(e)}), 404

@app.route('/get_output_image/<filename>')
def get_output_image(filename):
    output_path = os.path.join(OUTPUT_FOLDER, filename)
    if not os.path.exists(output_path):
        return jsonify({'error': 'Output image not found'}), 404
    return send_file(output_path, mimetype='image/jpeg')

@app.route('/get_video/<filename>')
def get_video(filename):
    video_path = os.path.join(OUTPUT_FOLDER, filename)
    if not os.path.exists(video_path):
        return jsonify({'error': 'Video not found'}), 404

    return send_file(
        video_path,
        mimetype='video/mp4',
        as_attachment=True,
        download_name='path_animation.mp4'
    )

@app.route('/api/points', methods=['POST'])
def handle_points():
    try:
        import sys
        print("Raw JSON Received:", request.json, file=sys.stderr)

        data = request.json
        if not data or 'points' not in data:
            return jsonify({'error': 'No points data provided'}), 400
        
        points = data['points']
        if len(points) != 2:
            return jsonify({'error': 'Exactly 2 points required'}), 400
        
        for point in points:
            if not isinstance(point, dict) or 'x' not in point or 'y' not in point:
                return jsonify({'error': 'Invalid point format'}), 400
            if not isinstance(point['x'], (int, float)) or not isinstance(point['y'], (int, float)):
                return jsonify({'error': 'Point coordinates must be numbers'}), 400
        
        start_point = (points[0]['x'], points[0]['y'])
        end_point = (points[1]['x'], points[1]['y'])

        print(f"Start Point: {start_point}, End Point: {end_point}", file=sys.stderr)

        image_path = get_image_path()
        labels_path = get_labels_path()

        print(f"Image Path: {image_path}, Labels Path: {labels_path}", file=sys.stderr)

        timestamp = int(time.time())
        output_path = os.path.join(OUTPUT_FOLDER, f'result_{timestamp}.jpg')

        # Compute path
        path, bounding_boxes = find_path(start_point, end_point, image_path, labels_path)

        if not path:
            return jsonify({'error': 'No valid path found between points'}), 400

        output_file = save_result(image_path, output_path, path, bounding_boxes)

        # Save computed path to a text file
        path_txt_file = os.path.join(OUTPUT_FOLDER, f'path_{timestamp}.txt')
        with open(path_txt_file, 'w') as f:
            for point in path:
                f.write(f"{point[0]},{point[1]}\n")

        # Create animation
        animation_output = os.path.join(OUTPUT_FOLDER, f'animation_{timestamp}.mp4')
        animator = RobotPathAnimator(
            image_path=output_path,
            rover_image_path=ROVER_IMAGE_PATH,
            path_file=path_txt_file,
            output_video=animation_output,
            window_size=(1920, 1080),
            frame_rate=30,
            rover_size=(100, 100)
        )
        animator.create_animation()

        print("Path computation and animation creation successful", file=sys.stderr)

        return jsonify({
            'message': 'Path found successfully',
            'result_image_url': f"/get_output_image/{os.path.basename(output_file)}",
            'video_url': f"/get_video/animation_{timestamp}.mp4",
            'path_file': path_txt_file
        })

    except FileNotFoundError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        app.logger.error(f"Error processing points: {str(e)}")
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True)