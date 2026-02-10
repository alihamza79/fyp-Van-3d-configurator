// hooks/useDraggable.js
// At the top of the file, add a global drag lock variable
let activeDraggable = null;

import { useRef, useState } from 'react';
import { useGesture } from '@use-gesture/react';
import { useSpring } from '@react-spring/three';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

const useDraggable = (initialPosition, bounds, onChange, options = {}) => {
  const { camera } = useThree();
  const [{ x, z }, api] = useSpring(() => ({
    x: initialPosition[0],
    z: initialPosition[2],
    config: { mass: 1, tension: 400, friction: 40 },
    onChange: (result) => {
      if (onChange) {
        onChange(result.value.x, result.value.z);
      }
    },
  }));

  const base = useRef([initialPosition[0], initialPosition[2]]);
  const [isDragging, setIsDragging] = useState(false);
  const instanceId = useRef(Math.random());

  const bind = useGesture({
    onDrag: ({ active, movement: [mx, my], last }) => {
      if (active) {
        // If another draggable is active, skip dragging
        if (activeDraggable !== null && activeDraggable !== instanceId.current) {
          return;
        }
        // If none is active, claim the lock
        if (activeDraggable === null) {
          activeDraggable = instanceId.current;
        }

        setIsDragging(true);
        const sensitivity = 0.01;
        let delta = new THREE.Vector3();

        if (options.view === 'top') {
          // For top view, directly map horizontal and vertical movements
          delta.set(-mx * sensitivity, 0, -my * sensitivity);
        } else {
          // Calculate forward and right vectors from the camera's perspective
          const forward = new THREE.Vector3();
          camera.getWorldDirection(forward);
          forward.projectOnPlane(new THREE.Vector3(0, 1, 0)).normalize();

          const right = new THREE.Vector3();
          right.crossVectors(forward, camera.up).normalize();

          const movementRight = right.clone().multiplyScalar(mx * sensitivity);
          const movementForward = forward.clone().multiplyScalar(-my * sensitivity);
          delta.copy(movementRight.add(movementForward));
        }

        // Compute new positions using the base position
        let newPosX = base.current[0] + delta.x;
        let newPosZ = base.current[1] + delta.z;

        // Clamp the positions within the specified bounds
        newPosX = Math.max(bounds.x[0], Math.min(bounds.x[1], newPosX));
        newPosZ = Math.max(bounds.z[0], Math.min(bounds.z[1], newPosZ));

        // Update the spring with the new positions
        api.start({ x: newPosX, z: newPosZ });
      }

      if (!active) {
        // Only release the lock if this instance held it
        if (activeDraggable === instanceId.current) {
          activeDraggable = null;
        }
        setIsDragging(false);
        if (last) {
          // Update the base position when the drag ends
          base.current = [x.get(), z.get()];
        }
      }
    },
  });

  return {
    bind,
    position: { x, z },
    isDragging,
  };
};

export default useDraggable;
