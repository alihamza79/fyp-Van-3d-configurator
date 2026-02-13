// hooks/useHighlightOnDrag.js
import { useEffect } from 'react';
import * as THREE from 'three';

const useHighlightOnDrag = (object, isDragging) => { // Default to yellow
  useEffect(() => {
    if (object) {
      // Traverse and update emissive properties
      object.traverse((child) => {
        if (child.isMesh) {
          // Initialize original emissive properties if not already set
          if (!child.userData.originalEmissive) {
            child.userData.originalEmissive = child.material.emissive.clone();
            child.userData.originalEmissiveIntensity = child.material.emissiveIntensity;
          }

          if (isDragging) {
            // Set a very light color for highlighting
            child.material.emissive = new THREE.Color(0xffffff); // Light color
            child.material.emissiveIntensity = 0.2; // Adjust intensity for transparency effect

          } else {
            // Reset emissive properties
            child.material.emissive = child.userData.originalEmissive;
            child.material.emissiveIntensity = child.userData.originalEmissiveIntensity;
          }
        }
      });

      
    }

    // Cleanup function to ensure wireframe is removed when component unmounts or when isDragging changes
    return () => {
      if (object) {
        object.traverse((child) => {
          if (child.isMesh && child.userData.wireframe) {
            child.remove(child.userData.wireframe);
            delete child.userData.wireframe;
          }
        });
      }
    };
  }, [object, isDragging]);
};

export default useHighlightOnDrag;
