import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { CSS2DRenderer, CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";

const MoonScene = () => {
  const navigate = useNavigate();
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const labelRendererRef = useRef<CSS2DRenderer>();
  const moonRef = useRef<THREE.Mesh>();
  const controlsRef = useRef<OrbitControls>();
  const textureURL =
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/17271/lroc_color_poles_1k.jpg";
  const displacementURL =
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/17271/ldem_3_8bit.jpg";
  const worldURL =
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/17271/hipp8_s.jpg";
  
  const [showTooltip, setShowTooltip] = useState(true);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup with adjusted FOV for more realistic perspective
    const camera = new THREE.PerspectiveCamera(
      60, // Reduced FOV for more natural view
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 7; // Moved camera back slightly
    cameraRef.current = camera;

    // Enhanced renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      logarithmicDepthBuffer: true, // Better depth perception
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Performance optimization
    renderer.toneMapping = THREE.ACESFilmicToneMapping; // More realistic lighting
    renderer.toneMappingExposure = 1.2; // Increased exposure for brighter appearance
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // CSS2D Renderer for HTML tooltip
    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0px';
    labelRenderer.domElement.style.pointerEvents = 'none';
    mountRef.current.appendChild(labelRenderer.domElement);
    labelRendererRef.current = labelRenderer;

    // Improved controls setup
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 5;
    controls.maxDistance = 15;
    controls.enablePan = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    controlsRef.current = controls;

    // Enhanced lighting setup for whiter appearance
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4); // Increased ambient light
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 4); // Increased intensity
    sunLight.position.set(5, 3, 5);
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 2); // Added fill light
    fillLight.position.set(-5, 0, -5);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 1); // Brightened rim light
    rimLight.position.set(0, -5, 0);
    scene.add(rimLight);

    // Moon setup with new textures
    const moonGeometry = new THREE.SphereGeometry(2, 64, 64);
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(textureURL);
    const displacementMap = textureLoader.load(displacementURL);
    const worldTexture = textureLoader.load(worldURL);

    const moonMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      map: texture,
      displacementMap: displacementMap,
      displacementScale: 0.06,
      bumpMap: displacementMap,
      bumpScale: 0.04,
      reflectivity: 0,
      shininess: 0,
    });

    const moon = new THREE.Mesh(moonGeometry, moonMaterial);
    scene.add(moon);
    moonRef.current = moon;

    // Create futuristic tooltip box
    const tooltipDiv = document.createElement('div');
    tooltipDiv.className = 'tooltip';
    tooltipDiv.innerHTML = 'Double Click on Moon';
    tooltipDiv.style.backgroundColor = 'rgba(0, 50, 100, 0.8)';
    tooltipDiv.style.color = 'rgb(120, 220, 255)';
    tooltipDiv.style.padding = '10px 15px';
    tooltipDiv.style.borderRadius = '10px';
    tooltipDiv.style.fontFamily = 'Arial, sans-serif';
    tooltipDiv.style.fontSize = '14px';
    tooltipDiv.style.fontWeight = 'bold';
    tooltipDiv.style.boxShadow = '0 0 15px rgba(0, 180, 255, 0.7)';
    tooltipDiv.style.border = '1px solid rgba(100, 200, 255, 0.5)';
    tooltipDiv.style.backdropFilter = 'blur(5px)';
    tooltipDiv.style.textShadow = '0 0 5px rgba(0, 200, 255, 0.7)';
    tooltipDiv.style.textAlign = 'center';
    tooltipDiv.style.minWidth = '180px';
    tooltipDiv.style.letterSpacing = '1px';
    tooltipDiv.style.textTransform = 'uppercase';
    tooltipDiv.style.transition = 'opacity 0.3s ease';

    const tooltipObject = new CSS2DObject(tooltipDiv);
    // Position tooltip above the moon
    tooltipObject.position.set(0, 3, 0); // y = 3 positions it above the moon
    moon.add(tooltipObject);

    // FIXED: Properly distributed stars in all directions
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.025,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
    });

    const starVertices = [];
    for (let i = 0; i < 15000; i++) {
      // Generate random points on a sphere to create stars all around
      const radius = 100;
      const theta = Math.random() * Math.PI * 2; // Random angle around the sphere
      const phi = Math.acos(2 * Math.random() - 1); // Random angle from top to bottom
      
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
      
      starVertices.push(x, y, z);
    }

    starGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(starVertices, 3)
    );

    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      if (controlsRef.current) {
        controlsRef.current.update();
      }

      if (moonRef.current) {
        moonRef.current.rotation.y += 0.0005;
        
        // Make tooltip always face the camera
        tooltipObject.quaternion.copy(camera.quaternion);
      }

      // Render both the 3D scene and the CSS2D labels
      renderer.render(scene, camera);
      labelRenderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current || !labelRendererRef.current) return;

      const width = window.innerWidth;
      const height = window.innerHeight;

      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      
      rendererRef.current.setSize(width, height);
      labelRendererRef.current.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
        mountRef.current.removeChild(labelRenderer.domElement);
      }
      scene.clear();
    };
  }, []);

  return (
    <div
      onDoubleClick={() => {
        navigate("/next");
      }}
      ref={mountRef}
      className="hover:cursor-pointer w-full h-screen"
    />
  );
};

export default MoonScene;