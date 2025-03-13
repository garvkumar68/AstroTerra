import numpy as np
import cv2
from queue import PriorityQueue

def heuristic(a, b): 
    return abs(a[0] - b[0]) + abs(a[1] - b[1])

def a_star(grid, start, goal):
    rows, cols = grid.shape
    open_set = PriorityQueue()
    open_set.put((0, start))
    came_from = {}
    g_score = {start: 0}
    f_score = {start: heuristic(start, goal)}

    while not open_set.empty():
        current = open_set.get()[1]

        if current == goal:
            path = []
            while current in came_from:
                path.append(current)
                current = came_from[current]
            path.reverse()
            return path

        neighbors = [
            (current[0] + 1, current[1]), (current[0] - 1, current[1]),
            (current[0], current[1] + 1), (current[0], current[1] - 1),
            (current[0] + 1, current[1] + 1), (current[0] + 1, current[1] - 1),
            (current[0] - 1, current[1] + 1), (current[0] - 1, current[1] - 1)
        ]

        for neighbor in neighbors:
            if 0 <= neighbor[0] < rows and 0 <= neighbor[1] < cols:
                if grid[neighbor[0], neighbor[1]] == 1:
                    continue

                if (neighbor[0] != current[0] and neighbor[1] != current[1]):
                    tentative_g_score = g_score[current] + 1.4
                else:
                    tentative_g_score = g_score[current] + 1

                if neighbor not in g_score or tentative_g_score < g_score[neighbor]:
                    came_from[neighbor] = current
                    g_score[neighbor] = tentative_g_score
                    f_score[neighbor] = tentative_g_score + heuristic(neighbor, goal)
                    open_set.put((f_score[neighbor], neighbor))

    return []

def read_bounding_boxes(filename, img_width, img_height):
    bounding_boxes = []
    with open(filename, 'r') as f:
        for line in f:
            values = line.strip().split()
            class_label = int(values[0])
            center_x = float(values[1]) * img_width
            center_y = float(values[2]) * img_height
            box_width = float(values[3]) * img_width
            box_height = float(values[4]) * img_height

            x_min = int(center_x - (box_width / 2))
            y_min = int(center_y - (box_height / 2))
            x_max = int(center_x + (box_width / 2))
            y_max = int(center_y + (box_height / 2))

            bounding_boxes.append((x_min, y_min, x_max, y_max))

    return bounding_boxes

def create_grid(image_width, image_height, bounding_boxes, cell_size=10, margin=50):
    grid_width = image_width // cell_size
    grid_height = image_height // cell_size
    grid = np.zeros((grid_height, grid_width))

    for box in bounding_boxes:
        x_min, y_min, x_max, y_max = box
        x_min = max(0, x_min - margin)
        y_min = max(0, y_min - margin)
        x_max = min(image_width, x_max + margin)
        y_max = min(image_height, y_max + margin)

        for i in range(y_min // cell_size, y_max // cell_size):
            for j in range(x_min // cell_size, x_max // cell_size):
                if i < grid_height and j < grid_width:
                    grid[i, j] = 1

    return grid

def find_path(start_point, end_point, image_path, labels_path):
    # Read image
    image = cv2.imread(image_path)
    if image is None:
        raise Exception(f"Could not load image from {image_path}")

    img_height, img_width = image.shape[:2]
    
    # Read bounding boxes
    bounding_boxes = read_bounding_boxes(labels_path, img_width, img_height)
    
    # Create grid
    cell_size = 10
    margin = 5
    grid = create_grid(img_width, img_height, bounding_boxes, cell_size, margin)
    
    # Convert points to grid coordinates
    start = (int(start_point[1] // cell_size), int(start_point[0] // cell_size))
    goal = (int(end_point[1] // cell_size), int(end_point[0] // cell_size))
    
    # Find path
    path = a_star(grid, start, goal)
    
    # Convert path to image coordinates
    image_path = []
    for point in path:
        pixel_x = point[1] * cell_size + cell_size // 2
        pixel_y = point[0] * cell_size + cell_size // 2
        image_path.append((pixel_x, pixel_y))
    
    return image_path, bounding_boxes

def save_result(image_path, output_path, path, bounding_boxes):
    image = cv2.imread(image_path)
    
    # Draw bounding boxes
    for box in bounding_boxes:
        x_min, y_min, x_max, y_max = box
        cv2.rectangle(image, (x_min, y_min), (x_max, y_max), (255, 0, 0), 2)
    
    # Draw path
    for i in range(len(path) - 1):
        cv2.line(image, path[i], path[i + 1], (0, 255, 0), 2)
        cv2.circle(image, path[i], 5, (0, 0, 255), -1)
    if path:
        cv2.circle(image, path[-1], 5, (0, 0, 255), -1)
    
    cv2.imwrite(output_path, image)
    return output_path