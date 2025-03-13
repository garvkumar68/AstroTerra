import React, { useEffect, useRef, useState } from 'react';

interface Point {
  x: number;
  y: number;
}

const Next: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(new Image());
  const [selectedPoints, setSelectedPoints] = useState<Point[]>([]);
  const [apiUrl, setApiUrl] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [resultImageUrl, setResultImageUrl] = useState<string>('');
  const [resultImageLoading, setResultImageLoading] = useState<boolean>(false);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [showResult, setShowResult] = useState<boolean>(false);

  // Initialize API URL from localStorage
  useEffect(() => {
    const storedApiUrl = localStorage.getItem('apiUrl') || 'https://garv68-moon.hf.space';
    setApiUrl(storedApiUrl);
  }, []);

  // Load and draw the initial image when apiUrl changes
  useEffect(() => {
    if (apiUrl) {
      loadImage();
    }
  }, [apiUrl]);

  const loadImage = () => {
    const image = imageRef.current;
    image.crossOrigin = "Anonymous";  // Enable CORS for the image
    
    image.onload = function() {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = image.width;
        canvas.height = image.height;
        drawCanvas();
      }
    };
    
    image.onerror = function() {
      setErrorMessage('Failed to load image from API');
    };
    
    // Add cache-busting parameter to prevent caching
    image.src = `${apiUrl}/api/image?t=${new Date().getTime()}`;
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imageRef.current, 0, 0);
    
    // Draw selected points
    selectedPoints.forEach((point, index) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = 'red';
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.stroke();
      
      // Add point number
      ctx.fillStyle = 'white';
      ctx.font = '16px Arial';
      ctx.fillText((index + 1).toString(), point.x + 10, point.y + 10);
    });
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (selectedPoints.length >= 2) {
      setErrorMessage('You can only select 2 points');
      return;
    }
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    const newPoints = [...selectedPoints, { x, y }];
    setSelectedPoints(newPoints);
    
    drawCanvas();
  };

  const clearPoints = () => {
    setSelectedPoints([]);
    setErrorMessage('');
    setShowResult(false);
    setVideoUrl('');
    drawCanvas();
  };

  const saveApiUrl = () => {
    const inputApiUrl = (document.getElementById('apiUrl') as HTMLInputElement).value.trim();
    if (inputApiUrl) {
      localStorage.setItem('apiUrl', inputApiUrl);
      setApiUrl(inputApiUrl);
      setErrorMessage('API URL saved successfully');
    }
  };

  const sendPoints = async () => {
    if (selectedPoints.length !== 2) {
      setErrorMessage('Please select exactly 2 points');
      return;
    }
    
    setIsLoading(true);
    setVideoUrl('');
    
    try {
      const response = await fetch(`${apiUrl}/api/calculate_path`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          points: selectedPoints.map(point => ({
            x: Math.round(point.x),
            y: Math.round(point.y)
          }))
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to calculate path');
      }
      
      const result = await response.json();
      
      if (result.result_image_url) {
        setResultImageLoading(true);
        setResultImageUrl(result.result_image_url);
        setShowResult(true);
        
        if (result.video_url) {
          setVideoUrl(result.video_url);
        }
        
        setErrorMessage('Path calculated successfully!');
      } else {
        setErrorMessage('No result image URL received');
      }
      
    } catch (err) {
      if (err instanceof Error) {
        setErrorMessage('Error calculating path: ' + err.message);
      } else {
        setErrorMessage('Error calculating path');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle result image loading
  const handleResultImageLoad = () => {
    setResultImageLoading(false);
  };

  const handleResultImageError = () => {
    setResultImageLoading(false);
    setErrorMessage('Failed to load result image. Please try again.');
  };

  // Update canvas when points change
  useEffect(() => {
    drawCanvas();
  }, [selectedPoints]);

  return (
    <div>
      <div className="api-config" style={{
        position: 'fixed',
        top: '20px',
        left: '20px',
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '10px',
        borderRadius: '4px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
        zIndex: 100
      }}>
        <label htmlFor="apiUrl">API URL:</label>
        <input 
          type="text" 
          id="apiUrl" 
          defaultValue={apiUrl} 
          style={{ width: '200px' }} 
        />
        <button onClick={saveApiUrl}>Save</button>
      </div>
      
      <div className="container" style={{
        display: 'flex',
        gap: '20px',
        padding: '20px',
        maxWidth: '100%',
        flexWrap: 'wrap'
      }}>
        <div className="image-row" style={{
          display: 'flex',
          gap: '20px',
          width: '100%',
          marginBottom: '20px'
        }}>
          <div className="image-container" style={{
            position: 'relative',
            flex: 1,
            minWidth: '300px'
          }}>
            <canvas 
              id="imageCanvas" 
              ref={canvasRef}
              onClick={handleCanvasClick}
              style={{
                width: '100%',
                height: '100%',
                cursor: 'crosshair'
              }}
            />
          </div>
          <div className="result-container" style={{
            flex: 1,
            minWidth: '300px',
            display: showResult ? 'block' : 'none',
            position: 'relative'
          }}>
            {resultImageLoading && (
              <div style={{
                position: 'absolute',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: 'rgba(255, 255, 255, 0.7)',
                zIndex: 5
              }}>
                <div style={{
                  padding: '20px',
                  background: 'white',
                  borderRadius: '4px',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                }}>
                  Loading result image...
                </div>
              </div>
            )}
            <img 
              id="resultImage" 
              src={resultImageUrl} 
              alt="Result"
              onLoad={handleResultImageLoad}
              onError={handleResultImageError}
              style={{
                width: '100%',
                height: 'auto'
              }}
            />
            {videoUrl && !resultImageLoading && (
              <a 
                id="downloadVideo" 
                href={videoUrl} 
                className="download-btn" 
                download="path_animation.mp4"
                style={{
                  backgroundColor: '#28a745',
                  color: 'white',
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  display: 'inline-block',
                  marginTop: '10px'
                }}
              >
                Download Animation
              </a>
            )}
          </div>
        </div>
      </div>
      
      <div className="controls" style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        display: 'flex',
        gap: '10px',
        zIndex: 100
      }}>
        <button 
          onClick={sendPoints} 
          id="sendButton" 
          disabled={selectedPoints.length !== 2 || isLoading}
          style={{
            padding: '10px 20px',
            backgroundColor: selectedPoints.length !== 2 || isLoading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: selectedPoints.length !== 2 || isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? 'Calculating...' : 'Calculate Path'}
        </button>
        <button 
          onClick={clearPoints} 
          className="clear"
          disabled={isLoading}
          style={{
            padding: '10px 20px',
            backgroundColor: isLoading ? '#ccc' : '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          Clear Points
        </button>
      </div>
      
      <div className="points-info" id="pointsInfo" style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '10px',
        borderRadius: '4px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
        zIndex: 100
      }}>
        Selected points: {selectedPoints.length}/2
        {selectedPoints.map((point, index) => (
          <div key={index}>
            Point {index + 1}: ({Math.round(point.x)}, {Math.round(point.y)})
          </div>
        ))}
      </div>
      
      {errorMessage && (
        <div className="error" style={{
          position: 'fixed',
          top: '80px',
          right: '20px',
          color: '#dc3545',
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '10px',
          borderRadius: '4px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
          zIndex: 100
        }}>
          {errorMessage}
        </div>
      )}
      
      {isLoading && (
        <div className="loading" style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '20px',
          borderRadius: '4px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
          zIndex: 200
        }}>
          Calculating path...
        </div>
      )}
    </div>
  );
};

export default Next;