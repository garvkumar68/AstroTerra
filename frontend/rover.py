import os
import cv2
import numpy as np

class RobotPathAnimator:
    def __init__(self, image_path, rover_image_path, path_file, output_video="robot_path_animation.mp4", 
                 window_size=(1920, 1080), frame_rate=30, rover_size=(100, 100)):
        self.image_path = image_path
        self.rover_image_path = rover_image_path
        self.path_file = path_file
        self.output_video = output_video
        self.window_size = window_size
        self.frame_rate = frame_rate
        self.rover_size = rover_size
        
    def read_path_coordinates(self):
        """Read coordinates from the text file"""
        coordinates = []
        with open(self.path_file, 'r') as f:
            for line in f:
                x, y = map(int, line.strip().split(','))
                coordinates.append((x, y))
        return coordinates

    def get_window_bounds(self, center_x, center_y, full_height, full_width):
        """Calculate window boundaries ensuring they stay within image bounds"""
        half_width = self.window_size[0] // 2
        half_height = self.window_size[1] // 2
        
        # Calculate window boundaries
        left = max(0, center_x - half_width)
        right = min(full_width, center_x + half_width)
        top = max(0, center_y - half_height)
        bottom = min(full_height, center_y + half_height)
        
        # Adjust if window goes beyond image boundaries
        if right - left < self.window_size[0]:
            if left == 0:
                right = min(self.window_size[0], full_width)
            else:
                left = max(0, full_width - self.window_size[0])
                
        if bottom - top < self.window_size[1]:
            if top == 0:
                bottom = min(self.window_size[1], full_height)
            else:
                top = max(0, full_height - self.window_size[1])
                
        return int(left), int(right), int(top), int(bottom)

    def calculate_rover_angle(self, current_pos, next_pos):
        """Calculate angle of rover based on movement direction"""
        dx = next_pos[0] - current_pos[0]
        dy = next_pos[1] - current_pos[1]
        angle = np.degrees(np.arctan2(dy, dx))
        return angle

    def overlay_rover(self, background, rover_img, pos_x, pos_y, angle):
        """Overlay rotated rover image on background"""
        # Rotate rover image
        center = (rover_img.shape[1] // 2, rover_img.shape[0] // 2)
        rotation_matrix = cv2.getRotationMatrix2D(center, -angle, 1.0)
        rotated_rover = cv2.warpAffine(rover_img, rotation_matrix, 
                                     (rover_img.shape[1], rover_img.shape[0]))

        # Calculate position to place rover
        x_offset = pos_x - (rover_img.shape[1] // 2)
        y_offset = pos_y - (rover_img.shape[0] // 2)

        # Create mask for transparent overlay
        if rover_img.shape[2] == 4:  # If rover image has alpha channel
            mask = rotated_rover[:, :, 3] / 255.0
            mask = np.stack([mask] * 3, axis=-1)
            rover_rgb = rotated_rover[:, :, :3]
        else:
            mask = np.ones_like(rotated_rover)
            rover_rgb = rotated_rover

        # Define region of interest on background
        roi_x = max(0, x_offset)
        roi_y = max(0, y_offset)
        roi_w = min(rotated_rover.shape[1], background.shape[1] - roi_x)
        roi_h = min(rotated_rover.shape[0], background.shape[0] - roi_y)

        # Overlay rover on background
        if roi_w > 0 and roi_h > 0:
            roi = background[roi_y:roi_y + roi_h, roi_x:roi_x + roi_w]
            rover_roi = rover_rgb[:roi_h, :roi_w]
            mask_roi = mask[:roi_h, :roi_w]
            background[roi_y:roi_y + roi_h, roi_x:roi_x + roi_w] = \
                roi * (1 - mask_roi) + rover_roi * mask_roi

        return background

    def create_animation(self):
        # Read the full image and rover image
        image = cv2.imread(self.image_path)
        rover_img = cv2.imread(self.rover_image_path, cv2.IMREAD_UNCHANGED)
        
        if image is None or rover_img is None:
            print("Error: Could not read image files")
            return
            
        # Resize rover image
        rover_img = cv2.resize(rover_img, self.rover_size)
        
        full_height, full_width = image.shape[:2]
        
        # Read path coordinates
        coordinates = self.read_path_coordinates()
        if not coordinates:
            print("Error: No coordinates found in the path file")
            return
            
        # Set up video writer
        fourcc = cv2.VideoWriter_fourcc(*"mp4v")
        video_writer = cv2.VideoWriter(
            self.output_video,
            fourcc,
            self.frame_rate,
            self.window_size
        )
        
        # Create frames for each coordinate
        for i, (x, y) in enumerate(coordinates):
            # Get window boundaries
            left, right, top, bottom = self.get_window_bounds(x, y, full_height, full_width)
            
            # Extract window
            window = image[top:bottom, left:right].copy()
            
            # Resize window if necessary
            if window.shape[:2] != self.window_size[::-1]:
                window = cv2.resize(window, self.window_size)
            
            # Calculate rover angle
            next_idx = min(i + 1, len(coordinates) - 1)
            angle = self.calculate_rover_angle(
                coordinates[i],
                coordinates[next_idx]
            )
            
            # Draw path up to current position
            for j in range(max(0, i-20), i):
                prev_x, prev_y = coordinates[j]
                next_x, next_y = coordinates[j+1]
                
                # Convert to window coordinates
                prev_x_rel = prev_x - left
                prev_y_rel = prev_y - top
                next_x_rel = next_x - left
                next_y_rel = next_y - top
                
                cv2.line(window, (prev_x_rel, prev_y_rel), 
                         (next_x_rel, next_y_rel), (0, 255, 0), 2)
            
            # Calculate rover position relative to window
            rover_x = x - left
            rover_y = y - top
            
            # Overlay rover on window
            window = self.overlay_rover(window, rover_img, rover_x, rover_y, angle)
            
            video_writer.write(window)
            
            if i % 100 == 0:
                print(f"Processed frame {i}/{len(coordinates)}")
        
        video_writer.release()
        print(f"Animation saved as {self.output_video}")

if __name__ == "__main__":
    # Example usage
    animator = RobotPathAnimator(
        image_path="C:\\Users\\GARV\\OneDrive\\Desktop\\frontend\\outputs\\result_1739517716.jpg",
        rover_image_path="C:\\Users\\GARV\\OneDrive\\Desktop\\frontend\\isro_rover.png",  # Add your rover image path here
        path_file="C:\\Users\\GARV\\OneDrive\\Desktop\\frontend\\outputs\\path_1739517716.txt",
        window_size=(1920, 1080),
        frame_rate=30,
        rover_size=(100, 100)  # Adjust size of rover image as needed
    )
    animator.create_animation()