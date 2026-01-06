"use client";
import { useRef, useEffect, useState } from "react";
import { Canvas, useFrame, extend, useThree } from "@react-three/fiber";
import {
  PerspectiveCamera,
  shaderMaterial,
  useTexture,
  Html,
} from "@react-three/drei";
import * as THREE from "three";

const DEFAULT_RADIUS = 9;
const DEFAULT_WIDTH = 12;

// Hook to detect mobile devices
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      // Check user agent
      const userAgent =
        navigator.userAgent || navigator.vendor || (window as any).opera;
      const mobileRegex =
        /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
      const isMobileUserAgent = mobileRegex.test(userAgent.toLowerCase());

      // Check screen width (common mobile breakpoint)
      const isMobileScreen = window.innerWidth <= 768;

      // Check touch support
      const isTouchDevice =
        "ontouchstart" in window || navigator.maxTouchPoints > 0;

      // Consider it mobile if any of these conditions are true
      setIsMobile(isMobileUserAgent || (isMobileScreen && isTouchDevice));
    };

    // Check on mount
    checkMobile();

    // Check on resize
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
}

const CylinderImageMaterial = shaderMaterial(
  {
    uTextures: [],
    uScroll: 0,
    uCount: 5.0,
    uPadding: 0.1, // Adjust this for gap size (0.0 to 1.0)
    uRotateImage: 0.0, // Uniform to control image rotation (0 = normal, 1 = rotated 90deg)
  },
  `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
  `,
  `
  varying vec2 vUv;
  uniform sampler2D uTextures[5];
  uniform float uScroll;
  uniform float uCount;
  uniform float uPadding;
  uniform float uRotateImage;

  void main() {
    // 1. Calculate the wrapped U coordinate for scrolling
    float u = mod(vUv.x + uScroll, 1.0);
    
    // 2. Local space within a segment
    float rawV = fract(u * uCount);
    
    // 3. Create Padding/Space: If the V is in the padding zone, discard or make black
    if (rawV < uPadding || rawV > (1.0 - uPadding)) {
       discard; // This creates the physical gap between images
    }

    // 4. Determine segment index
    float segment = floor(u * uCount);
    
    // 5. UV mapping with optional rotation for vertical images on vertical cylinder
    float remappedV = (rawV - uPadding) / (1.0 - 2.0 * uPadding);
    vec2 normalizedUv;
    
    if (uRotateImage > 0.5) {
      // Rotate image 90 degrees for vertical images on vertical cylinder
      // Map texture X to circumference, texture Y to height
      normalizedUv = vec2(1.0 - remappedV, vUv.y);
    } else {
      // Normal mapping for horizontal cylinder (original behavior)
      normalizedUv = vec2(1.0 - vUv.y, 1.0 - remappedV);
    }
    
    vec4 color;
    if (segment == 0.0) color = texture2D(uTextures[0], normalizedUv);
    else if (segment == 1.0) color = texture2D(uTextures[1], normalizedUv);
    else if (segment == 2.0) color = texture2D(uTextures[2], normalizedUv);
    else if (segment == 3.0) color = texture2D(uTextures[3], normalizedUv);
    else color = texture2D(uTextures[4], normalizedUv);

    gl_FragColor = color;
  }
  `
);

extend({ CylinderImageMaterial });

// Separate shader material for text with flipped X coordinate
const CylinderTextMaterial = shaderMaterial(
  {
    uTextures: [],
    uScroll: 0,
    uCount: 5.0,
    uPadding: 0.1,
    uRotateText: 0.0, // Uniform to control text rotation (0 = normal, 1 = rotated 90deg)
  },
  `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
  `,
  `
  varying vec2 vUv;
  uniform sampler2D uTextures[5];
  uniform float uScroll;
  uniform float uCount;
  uniform float uPadding;
  uniform float uRotateText;

  void main() {
    // 1. Calculate the wrapped U coordinate for scrolling
    float u = mod(vUv.x + uScroll, 1.0);
    
    // 2. Local space within a segment
    float rawV = fract(u * uCount);
    
    // 3. Create Padding/Space: If the V is in the padding zone, discard or make black
    if (rawV < uPadding || rawV > (1.0 - uPadding)) {
       discard;
    }

    // 4. Determine segment index
    float segment = floor(u * uCount);
    
    // 5. UV mapping with optional rotation for horizontal text on vertical cylinder
    float remappedV = (rawV - uPadding) / (1.0 - 2.0 * uPadding);
    vec2 normalizedUv;
    
    if (uRotateText > 0.5) {
      // Rotate text 90 degrees for horizontal text on vertical cylinder
      // For vertical cylinder: texture X maps to circumference, texture Y maps to height
      // Flip X coordinate to read left-to-right: use (1.0 - remappedV) for X
      normalizedUv = vec2(1.0 - remappedV, vUv.y);
    } else {
      // Normal mapping for horizontal cylinder (original behavior)
      normalizedUv = vec2(1.0 - vUv.y, 1.0 - remappedV);
    }
    
    vec4 color;
    if (segment == 0.0) color = texture2D(uTextures[0], normalizedUv);
    else if (segment == 1.0) color = texture2D(uTextures[1], normalizedUv);
    else if (segment == 2.0) color = texture2D(uTextures[2], normalizedUv);
    else if (segment == 3.0) color = texture2D(uTextures[3], normalizedUv);
    else color = texture2D(uTextures[4], normalizedUv);

    gl_FragColor = color;
  }
  `
);

extend({ CylinderTextMaterial });

// Function to create text texture from title
function createTextTexture(text: string): THREE.Texture {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not get canvas context");

  canvas.width = 1200;
  canvas.height = 800;

  // Clear canvas (transparent background)
  context.clearRect(0, 0, canvas.width, canvas.height);

  // Set text style with Playfair Display font
  context.fillStyle = "#d6db70";
  context.font = `bold 120px "Playfair Display", serif`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.letterSpacing = "-2px"; // Reduce letter spacing

  // Draw text
  context.fillText(text, canvas.width / 2, canvas.height / 2);

  // Create texture from canvas
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

interface CustomCylinderProps {
  textureUrls: string[];
  radius?: number;
  width?: number;
  padding?: number;
  scrollSensitivity?: number;
  rotation?: [number, number, number];
  followMouse?: boolean;
  rotateImage?: boolean;
}

function CustomCylinder({
  textureUrls,
  radius = DEFAULT_RADIUS,
  width = DEFAULT_WIDTH,
  padding = 0.05,
  scrollSensitivity = 0.0004,
  rotation = [0, 0, Math.PI / 2.1],
  followMouse = false,
  rotateImage = false,
}: CustomCylinderProps) {
  const materialRef = useRef<any>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const scrollRotation = useRef(0);
  const targetRotation = useRef({
    x: rotation[0],
    y: rotation[1],
    z: rotation[2],
  });
  const currentRotation = useRef({
    x: rotation[0],
    y: rotation[1],
    z: rotation[2],
  });

  const textures = useTexture(textureUrls);
  const textureCount = textureUrls.length;

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      // Sensitivity for vertical flow
      scrollRotation.current += e.deltaY * scrollSensitivity;
    };
    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [scrollSensitivity]);

  useFrame(() => {
    if (materialRef.current) {
      materialRef.current.uScroll = THREE.MathUtils.lerp(
        materialRef.current.uScroll,
        scrollRotation.current,
        0.05
      );
      materialRef.current.uCount = textureCount;
      materialRef.current.uRotateImage = rotateImage ? 1.0 : 0.0;
    }

    // Mouse follow effect with damping
    if (followMouse && meshRef.current) {
      // Calculate target rotation based on mouse position
      // Mouse position is normalized (-1 to 1)
      const mouseInfluence = 0.05; // How much the mouse affects rotation
      targetRotation.current.y =
        rotation[1] + sharedMousePosition.x * mouseInfluence;
      targetRotation.current.x =
        rotation[0] + sharedMousePosition.y * mouseInfluence * 0.5;

      // Smooth interpolation with damping
      const damping = 0.1;
      currentRotation.current.x = THREE.MathUtils.lerp(
        currentRotation.current.x,
        targetRotation.current.x,
        damping
      );
      currentRotation.current.y = THREE.MathUtils.lerp(
        currentRotation.current.y,
        targetRotation.current.y,
        damping
      );

      // Apply rotation to mesh
      meshRef.current.rotation.x = currentRotation.current.x;
      meshRef.current.rotation.y = currentRotation.current.y;
      meshRef.current.rotation.z = currentRotation.current.z;
    }
  });

  return (
    <mesh ref={meshRef} rotation={rotation}>
      <cylinderGeometry args={[radius, radius, width, 100, 1, true]} />
      {/* @ts-ignore */}
      <cylinderImageMaterial
        ref={materialRef}
        uTextures={textures}
        uCount={textureCount}
        uPadding={padding}
        uRotateImage={rotateImage ? 1.0 : 0.0}
        side={THREE.BackSide}
        transparent={true}
      />
    </mesh>
  );
}

interface ImageDescriptionProps {
  title: string;
  radius: number;
  index: number;
  totalImages: number;
  width: number;
}

function TitleCylinder({
  titles,
  projectUrls,
  radius = DEFAULT_RADIUS,
  width = DEFAULT_WIDTH,
  padding = 0.05,
  scrollSensitivity = 0.0004,
  rotation = [0, 0, Math.PI / 2.1],
  rotateText = false,
}: {
  titles: string[];
  projectUrls?: string[];
  radius?: number;
  width?: number;
  padding?: number;
  scrollSensitivity?: number;
  rotation?: [number, number, number];
  rotateText?: boolean;
}) {
  const materialRef = useRef<any>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const scrollRotation = useRef(0);
  const texturesRef = useRef<THREE.Texture[]>([]);
  const { raycaster, camera, gl } = useThree();

  // Create text textures from titles
  useEffect(() => {
    texturesRef.current = titles.map((title) => createTextTexture(title));
    return () => {
      texturesRef.current.forEach((texture) => texture.dispose());
    };
  }, [titles]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      scrollRotation.current += e.deltaY * scrollSensitivity;
    };
    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [scrollSensitivity]);

  useFrame(() => {
    if (materialRef.current && texturesRef.current.length > 0) {
      materialRef.current.uScroll = THREE.MathUtils.lerp(
        materialRef.current.uScroll,
        scrollRotation.current,
        0.05
      );
      materialRef.current.uCount = titles.length;
      materialRef.current.uTextures = texturesRef.current;
      materialRef.current.uRotateText = rotateText ? 1.0 : 0.0; // Set rotation uniform
    }
  });

  // Get unique projects with their URLs
  const uniqueProjects = projectUrls
    ? Array.from(
        new Map(
          titles.map((title, idx) => [
            title,
            { title, url: projectUrls[idx] || "#" },
          ])
        ).values()
      )
    : [];

  // Handle click on mesh to determine which segment was clicked
  const handleClick = (event: any) => {
    if (!meshRef.current || !projectUrls || projectUrls.length === 0) return;

    // Get intersection point
    const intersection = event.intersections[0];
    if (!intersection) return;

    // Get UV coordinates at intersection
    const uv = intersection.uv;
    if (!uv) return;

    // Calculate which segment was clicked based on UV and scroll
    const u = (uv.x + (materialRef.current?.uScroll || 0)) % 1.0;
    const segment = Math.floor(u * titles.length);

    // Get the URL for this segment
    const url = projectUrls[segment];
    if (url && url !== "#") {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <>
      <mesh
        ref={meshRef}
        rotation={rotation}
        onClick={handleClick}
        onPointerOver={() => {
          if (gl.domElement) {
            gl.domElement.style.cursor = "pointer";
          }
        }}
        onPointerOut={() => {
          if (gl.domElement) {
            gl.domElement.style.cursor = "default";
          }
        }}
      >
        <cylinderGeometry args={[radius, radius, width, 100, 1, true]} />
        {/* @ts-ignore */}
        <cylinderTextMaterial
          ref={materialRef}
          uTextures={texturesRef.current}
          uCount={titles.length}
          uPadding={padding}
          uRotateText={rotateText ? 1.0 : 0.0}
          side={THREE.BackSide}
          transparent={true}
        />
      </mesh>
    </>
  );
}

// Shared mouse position for mouse follow effect (accessible by all components)
const sharedMousePosition = { x: 0, y: 0 };

export default function Scene() {
  const isMobile = useIsMobile();
  const imageData = [
    {
      url: isMobile
        ? "/project-images/bookself-sm.png"
        : "/project-images/bookself-lg.png",
      title: "Bookself",
      projectUrl: "https://books-collections-five.vercel.app/",
    },
    {
      url: isMobile
        ? "/project-images/growth-vector-sm.png"
        : "/project-images/growth-vector-lg.png",
      title: "Growth Vector",
      projectUrl: "https://growth-vector.vercel.app/",
    },
    {
      url: isMobile
        ? "/project-images/agent-vis-sm.png"
        : "/project-images/agent-vis-lg.png",
      title: "Agent Vis",
      projectUrl: "https://agent-vis.vercel.app/",
    },
    {
      url: isMobile
        ? "/project-images/bookself-sm.png"
        : "/project-images/bookself-lg.png",
      title: "Bookself",
      projectUrl: "https://books-collections-five.vercel.app/",
    },
    {
      url: isMobile
        ? "/project-images/growth-vector-sm.png"
        : "/project-images/growth-vector-lg.png",
      title: "Growth Vector",
      projectUrl: "https://growth-vector.vercel.app/",
    },
    {
      url: isMobile
        ? "/project-images/agent-vis-sm.png"
        : "/project-images/agent-vis-lg.png",
      title: "Agent Vis",
      projectUrl: "https://agent-vis.vercel.app/",
    },
    {
      url: isMobile
        ? "/project-images/bookself-sm.png"
        : "/project-images/bookself-lg.png",
      title: "Bookself",
      projectUrl: "https://books-collections-five.vercel.app/",
    },
    {
      url: isMobile
        ? "/project-images/growth-vector-sm.png"
        : "/project-images/growth-vector-lg.png",
      title: "Growth Vector",
      projectUrl: "https://growth-vector.vercel.app/",
    },
    {
      url: isMobile
        ? "/project-images/agent-vis-sm.png"
        : "/project-images/agent-vis-lg.png",
      title: "Agent Vis",
      projectUrl: "https://agent-vis.vercel.app/",
    },
  ];

  const textureUrls = imageData.map((img) => img.url);
  const textureTitles = imageData.map((img) => img.title);
  const projectUrls = imageData.map((img) => img.projectUrl);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse position to -1 to 1 range
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1; // Invert Y axis
      sharedMousePosition.x = x;
      sharedMousePosition.y = y;
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        background: "#000",
        overflow: "hidden",
      }}
    >
      <Canvas>
        {isMobile ? (
          <>
            <PerspectiveCamera makeDefault position={[0, 0, 2]} fov={55} />
            {/* First cylinder with default radius - images - follows mouse */}
            <CustomCylinder
              textureUrls={textureUrls}
              radius={15}
              followMouse={true}
              rotation={[0, 0, 0]}
              rotateImage={true}
            />
            {/* Second cylinder with smaller radius - titles - static */}
            <TitleCylinder
              titles={textureTitles}
              projectUrls={projectUrls}
              radius={15 * 0.7}
              rotation={[0, 0, 0]}
              rotateText={true}
            />
          </>
        ) : (
          <>
            <PerspectiveCamera makeDefault position={[0, 0, 2]} fov={55} />
            {/* First cylinder with default radius - images - follows mouse */}
            <CustomCylinder
              textureUrls={textureUrls}
              radius={DEFAULT_RADIUS}
              followMouse={true}
            />
            {/* Second cylinder with smaller radius - titles - static */}
            <TitleCylinder
              titles={textureTitles}
              projectUrls={projectUrls}
              radius={DEFAULT_RADIUS * 0.7}
            />
          </>
        )}
      </Canvas>
    </div>
  );
}
