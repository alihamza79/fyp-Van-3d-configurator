// src/components/PreLoader.jsx
import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const PreLoader = ({ progress, vanDimensions = { width: 2, height: 2, depth: 5 }, position }) => {
  const boxRef = useRef();
  const fillBoxRef = useRef();

  // Create gradient texture once
  const textureRef = useRef();
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    const gradient = context.createLinearGradient(0, 0, 0, 256);
    gradient.addColorStop(0, '#F5F5F5');
    gradient.addColorStop(1, '#E0E0E0');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 256, 256);
    textureRef.current = new THREE.CanvasTexture(canvas);
  }, []);

  // Animation loop - only animate fill level
  useFrame((state, delta) => {
    if (fillBoxRef.current) {
      // Update only the fill box height smoothly based on progress
      fillBoxRef.current.scale.y = progress / 100;
    }
  });

  return (
    <group position={position}>
      {/* Outer Box (Wireframe) */}
      <lineSegments ref={boxRef}>
        <edgesGeometry args={[new THREE.BoxGeometry(vanDimensions.width, vanDimensions.height, vanDimensions.depth)]} />
        <lineBasicMaterial color={0xCCCCCC} linewidth={2} transparent opacity={0.8} />
      </lineSegments>

      {/* Inner Box (Fill) */}
      <mesh ref={fillBoxRef} castShadow receiveShadow>
        <boxGeometry args={[
          vanDimensions.width * 0.98,
          vanDimensions.height * 0.98,
          vanDimensions.depth * 0.98
        ]} />
        <meshPhysicalMaterial
          map={textureRef.current}
          transparent
          opacity={0.9}
          metalness={0.2}
          roughness={0.1}
          clearcoat={0.5}
          clearcoatRoughness={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Lighting Setup */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={0.5} castShadow />
      <pointLight position={[2, 2, 2]} intensity={0.8} distance={10} />
      <pointLight position={[-2, -2, -2]} intensity={0.8} distance={10} />
    </group>
  );
};

export default PreLoader;
