import { useMemo, useState, useEffect, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';  // Importing Three.js for animation control
import useDraggable from './useDraggable';
import useHighlightOnDrag from './useHighlightOnDrag';
import useClickOutside from './useClickOutside';
import { useFrame } from '@react-three/fiber';
import { useBuildStore } from '../store/buildStore'; // Import the buildStore
import { applyCustomizationToScene, highlightMesh, clearHighlight } from '../utils/applyCustomization';

// Global cache for processed GLTF scenes keyed by gltfPath
const sceneCache = {};

// Sensible default Y range for furniture inside the van interior.
// - Floor-standing items originate at y = -0.8, so -0.9 prevents them from
//   sinking below the floor while still allowing a small tolerance.
// - Solar panel (roof) sits at y = 1.27 and vent at y = 1.15, so 1.3 is a
//   good ceiling cap. Individual products can override either bound by
//   adding { y: [min, max] } to their vanBounds entry in productConfig.js.
const DEFAULT_Y_BOUNDS = [-0.9, 1.3];

const resolveYBounds = (bounds) => {
  const y = bounds?.y;
  if (Array.isArray(y) && y.length === 2) return y;
  return DEFAULT_Y_BOUNDS;
};

const useInstanceLogic = (productId, instanceId, gltfPath, initialPosition, view, vanBounds, isPlaying, yAxisMove = false) => {
  const { scene, animations, loading } = useGLTF(gltfPath, true, true);
  const mixer = useRef();
  const [position, setPosition] = useState(initialPosition);
  const [rotationY, setRotationY] = useState(() => {
    const instance = useBuildStore.getState().productInstances[productId]?.find(inst => inst.id === instanceId);
    return instance?.rotation ?? 0;
  });
  const [showRotateButton, setShowRotateButton] = useState(false);
  const [showBigDot, setShowBigDot] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const cabinetRef = useRef();
  const [clonedScene, setClonedScene] = useState(null);
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);
  const [selectedMeshName, setSelectedMeshName] = useState(null);
  const [meshNames, setMeshNames] = useState([]);

  // Subscribe to the live customization for this instance so changes re-apply.
  const customization = useBuildStore((state) =>
    state.productInstances[productId]?.find((inst) => inst.id === instanceId)?.customization
  );

  const { bind, isDragging } = useDraggable(
    position,
    vanBounds,
    (newX, newZ) => {
      const newPos = [newX, position[1], newZ];
      setPosition(newPos);
      // Update the position in the store
      useBuildStore.getState().updateInstancePosition(productId, instanceId, newPos);
    },
    { enabled: view !== 'default' }
  );

  useHighlightOnDrag(clonedScene, isDragging);

  useEffect(() => {
    setShowBigDot(!isDragging);
  }, [isDragging]);

  useClickOutside(cabinetRef, () => {
    setShowBigDot(true);
  });

  useEffect(() => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      if (isDragging) {
        canvas.classList.add('dragging');
      } else if (isHovered && view !== 'default') {
        canvas.classList.add('draggable');
      } else {
        canvas.classList.remove('dragging', 'draggable');
      }
    }
  }, [isHovered, isDragging, view]);

  // Animation setup and scene cloning with caching
  useEffect(() => {
    if (scene && !loading) {
      let baseClone;
      // Check if we have a cached processed scene for this gltfPath
      if (sceneCache[gltfPath]) {
        baseClone = sceneCache[gltfPath];
      } else {
        // Clone the entire scene and process each mesh
        baseClone = scene.clone();
        baseClone.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            // Clone material for each mesh to avoid shared material references on first load
            if (Array.isArray(child.material)) {
              child.material = child.material.map(material => material.clone());
            } else if (child.material) {
              child.material = child.material.clone();
            }
          }
        });
        // Cache the processed scene
        sceneCache[gltfPath] = baseClone;
      }
      // For each instance, perform a new clone from the cached template  
      const instanceClone = baseClone.clone();
      // NEW: ensure each instance gets its own material copies by re‑cloning them.
      const names = [];
      instanceClone.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material = child.material.clone();
          // Clear snapshot caches carried over from the clone so per-instance edits
          // are taken from the fresh clone's actual state.
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => { m.userData = {}; });
          } else {
            child.material.userData = {};
          }
          if (child.name) names.push(child.name);
        }
      });
      setMeshNames(Array.from(new Set(names)));
      setClonedScene(instanceClone);

      mixer.current = new THREE.AnimationMixer(instanceClone);
      animations.forEach((clip) => {
        const action = mixer.current.clipAction(clip);
        action.paused = true; // Initialize actions without playing them
      });
    }
  }, [scene, loading, animations, gltfPath]);

  // Update animation on every frame
  useFrame((state, delta) => {
    if (mixer.current) {
      mixer.current.update(delta);
    }
  });

  useEffect(() => {
    if (isPlaying && mixer.current) {
      animations.forEach((clip) => {
        const action = mixer.current.clipAction(clip);
        action.paused = false; // Unpause and play action
        action.reset();
        action.setLoop(THREE.LoopOnce, 0); // Play animation once
        action.clampWhenFinished = true; // Stop at the last frame
        setIsAnimationComplete(true);
        action.play();
        action.onFinished = () => {
          setIsPlaying(false); // Reset isPlaying when finished
        };
      });
    }
  }, [isPlaying, animations]);

  // Keyboard control for Y-axis (vertical) movement. Previously this was
  // gated on a per-product `yAxisMove` flag which made most furniture
  // impossible to lift off the floor. Now every instance listens when it's
  // either hovered OR has its toolbar open — so once you click a bed and the
  // toolbar appears, the arrow keys keep working even if the mouse drifts
  // onto the toolbar itself or empty space.
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!isHovered && !showRotateButton) return;
      if (view === 'default') return;
      if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;

      const target = event.target;
      const isTyping =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);
      if (isTyping) return;

      event.preventDefault();
      const moveAmount = event.shiftKey ? 0.01 : 0.05;
      const dy = event.key === 'ArrowUp' ? moveAmount : -moveAmount;
      const [yMin, yMax] = resolveYBounds(vanBounds);
      const nextY = Math.max(yMin, Math.min(yMax, position[1] + dy));
      if (nextY === position[1]) return; // At a boundary already.
      const newPos = [position[0], nextY, position[2]];
      setPosition(newPos);
      useBuildStore.getState().updateInstancePosition(productId, instanceId, newPos);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isHovered, showRotateButton, view, position, productId, instanceId, vanBounds]);

  const resetAnimation = () => {
    if (mixer.current) {
      animations.forEach((clip) => {
        const action = mixer.current.clipAction(clip);
        action.reset();
        action.paused = true;
      });
      setIsAnimationComplete(false);
    }
  };

  useEffect(() => {
    useBuildStore.getState().updateInstanceRotation(productId, instanceId, rotationY);
  }, [rotationY, productId, instanceId]);

  // Re-apply the live customization (color + material preset + per-mesh overrides)
  // whenever it changes in the store or the cloned scene becomes available.
  useEffect(() => {
    if (!clonedScene) return;
    applyCustomizationToScene(clonedScene, customization || {});
  }, [clonedScene, customization]);

  // Highlight the currently-targeted sub-mesh (if any).
  useEffect(() => {
    if (!clonedScene) return;
    if (selectedMeshName) {
      highlightMesh(clonedScene, selectedMeshName);
    } else {
      clearHighlight(clonedScene);
    }
  }, [clonedScene, selectedMeshName]);

  return {
    clonedScene,
    position,
    setPosition,
    rotationY,
    setRotationY,
    showRotateButton,
    setShowRotateButton,
    showBigDot,
    setShowBigDot,
    isHovered,
    setIsHovered,
    cabinetRef,
    bind,
    handleDoubleClick: () => {
      if (view !== 'default') {
        setShowRotateButton(true);
      }
    },
    handleCloseMenu: () => {
      setShowRotateButton(false);
      setSelectedMeshName(null);
    },
    isLoading: loading || !clonedScene,
    isAnimationComplete,
    resetAnimation,
    customization,
    selectedMeshName,
    setSelectedMeshName,
    yBounds: resolveYBounds(vanBounds),
    meshNames,
  };
};

export default useInstanceLogic;
