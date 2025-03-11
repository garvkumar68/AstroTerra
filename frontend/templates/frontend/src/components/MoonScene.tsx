import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const MoonScene = () => {
  const navigate = useNavigate();
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const moonRef = useRef<THREE.Mesh>();
  const controlsRef = useRef<OrbitControls>();
  const textureURL =
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/17271/lroc_color_poles_1k.jpg";
  const displacementURL =
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/17271/ldem_3_8bit.jpg";
  const worldURL =
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/17271/hipp8_s.jpg";
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

    // Enhanced stars setup
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
      const x = (Math.random() - 0.5) * 2000;
      const y = (Math.random() - 0.5) * 2000;
      const z = -Math.random() * 2000;
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
      }

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;

      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      mountRef.current?.removeChild(renderer.domElement);
      scene.clear();
    };
  }, []);

  return (
    <div
      onDoubleClick={() => {
        window.location.href = "https://huggingface.co/spaces/garv68/moon";
      }}
      ref={mountRef}
      className="hover:cursor-pointer w-full h-screen"
    />
  );
};

export default MoonScene;
