# AstroTerra 🌒

## A Deep Learning Framework for Automated Lunar Crater Detection with Efficient Rover Navigation

![AstroTerra Banner](https://github.com/garvkumar68/AstroTerra/blob/main/frontend/img/logo.jpg)

## Overview

AstroTerra is an advanced framework designed to analyze the lunar plane by utilizing image processing and machine learning techniques. With a focus on detecting and mapping surface depressions, AstroTerra operates on high-resolution images captured by the Orbiter High-Resolution Camera (OHRC), deployed in ISRO's Chandrayaan-2 mission.<br><br>

The primary objective is to streamline moon crater detection and support rover navigation. Given the enormous dataset generated by lunar missions, manual analysis is impractical. AstroTerra addresses this gap using a deep learning-based approach that combines pattern recognition with intelligent pathfinding algorithms.

## OHRC IMAGE (12000*10000)<br>
![Crater Detection](https://github.com/garvkumar68/AstroTerra/blob/main/frontend/img/Ohrc_img.png)
<br>

## OHRC IMAGE detected result<br>
![Crater Detection](https://github.com/garvkumar68/AstroTerra/blob/main/frontend/img/large_img_detection.jpg)
<br>


<br>
## Key Features

- **Automated Crater Detection**: Utilizing YOLOv8l deep learning model optimized on a self-labeled dataset<br>
- **Efficient Processing**: Handles ultra-high-resolution OHRC images (12,000 × 90,148 pixels)<br>
- **Intelligent Path Planning**: A* algorithm implementation for optimal rover trajectory planning<br>
- **Box Map Analysis**: Combines overlapping bounding boxes into unified crater regions<br>
- **Pixel-to-Lunar Coordinate Mapping**: Ensures precise geospatial alignment

## Technical Implementation

### Data Processing Pipeline

1. **Data Gathering**: Acquire lunar surface imagery from OHRC with ultra-high-resolution (12,000 × 90,148 pixels)<br>
2. **Image Segmentation**: Divide images into smaller, manageable 1,000 × 1,000-pixel tiles<br>
3. **Preprocessing**: Enhance image quality through noise reduction and contrast enhancement<br>
4. **Dataset Annotation**: Label crater features using ImageLabelingTool<br>
5. **Model Training**: Fine-tune YOLOv8l model on the annotated dataset<br>
6. **Coordinate Transformation**:Map geospatial coordinates to image pixel indices<br>
7. **Assembly**: Combine processed tiles back into large mosaics<br>
8. **Grid Visualization**: Using 2D binary array (0/1) it overcomes the issue of overlapping bounding boxes and adds safety margins<br>
9. **Path Finding**: Implement A* algorithm to determine optimal routes between points
10. **Efficient coordinates mapping**: Uses Hash-maps to map coordinates optimized the efficiency from o(n^2) to o(1)

![Pipeline Architecture](https://github.com/garvkumar68/AstroTerra/blob/main/frontend/img/flowchart.png)

## Results

AstroTerra demonstrates strong performance in crater detection, box merging, and map generation. The system effectively handles large datasets and produces precise path-finding solutions in addition to accurate crater maps.

![Grid Visualization for Rover Navigation](https://github.com/garvkumar68/AstroTerra/blob/main/frontend/img/grid%20visualization.png)

The A* algorithm successfully finds the shortest path between two points while avoiding crater obstacles, ensuring safe navigation for lunar rovers.

![Shortest Path](https://github.com/garvkumar68/AstroTerra/blob/main/frontend/img/shortest%20path%20cropped.png)

![Shortest Path GIF](https://github.com/garvkumar68/AstroTerra/blob/main/frontend/img/rover_path.gif)

## Applications

- Lunar exploration and mission planning<br>
- Automated rover navigation<br>
- Geological surveys and surface analysis<br>
- Educational tools for planetary science<br>

## Contributors

- Atri Rathore<br>
- Garv Kumar<br>
- Nandini Katare<br>
- Prabal Batra<br>


## License
This project is licensed under the MIT License - see the LICENSE file for details.