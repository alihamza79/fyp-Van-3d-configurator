// CameraUpdater.jsx
import { useFrame, useThree } from '@react-three/fiber';
import { useSpring } from '@react-spring/three';
import { useRef } from 'react';
import * as THREE from 'three';

const CameraUpdater = ({ cameraPosition, cameraLookAt, fov }) => {
  const { camera } = useThree();

  // Define springs for position, target, and FOV
  const { pos, lookAt: target, fovSpring } = useSpring({
    pos: cameraPosition,
    lookAt: cameraLookAt,
    fovSpring: fov,
    config: { mass: 1, tension: 170, friction: 26 }, // Customize as needed
  });

  // References to store current position, lookAt, and FOV
  const currentPosition = useRef(new THREE.Vector3(...cameraPosition));
  const currentLookAt = useRef(new THREE.Vector3(...cameraLookAt));
  const currentFov = useRef(fov);

  useFrame(() => {
    // Get the current spring values
    const newPos = new THREE.Vector3(...pos.get());
    const newLookAt = new THREE.Vector3(...target.get());
    const newFov = fovSpring.get();

    // Smoothly interpolate to the new position and lookAt
    currentPosition.current.lerp(newPos, 0.1);
    currentLookAt.current.lerp(newLookAt, 0.1);

    // Apply the interpolated position and lookAt to the camera
    camera.position.copy(currentPosition.current);
    camera.lookAt(currentLookAt.current);

    // Update FOV if it has changed
    if (currentFov.current !== newFov) {
      camera.fov = newFov;
      camera.updateProjectionMatrix();
      currentFov.current = newFov;
    }
  });

  return null;
};

export default CameraUpdater;
