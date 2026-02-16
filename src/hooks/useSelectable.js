// hooks/useSelectable.js
import { useEffect } from 'react';
import useSelectionStore from '../store/selectionStore';
import * as THREE from 'three';

const useSelectable = (object, name) => {
  const { selectedObject, setSelectedObject } = useSelectionStore();
  const isSelected = selectedObject === name;

  useEffect(() => {
    if (object) {
      object.traverse((child) => {
        if (child.isMesh) {
          // Initialize original emissive properties if not already set
          if (!child.userData.originalEmissive) {
            child.userData.originalEmissive = child.material.emissive.clone();
            child.userData.originalEmissiveIntensity = child.material.emissiveIntensity;
          }

          if (isSelected) {
            // Set a very light color for highlighting
            child.material.emissive = new THREE.Color(0xffffff); // Light color
            child.material.emissiveIntensity = 0.5; // Adjust intensity for transparency effect

           
          } else {
            child.material.emissive = child.userData.originalEmissive;
            child.material.emissiveIntensity = child.userData.originalEmissiveIntensity;

           
          }
        }
      });
    }
  }, [object, isSelected]);

  const handleClick = (e) => {
    e.stopPropagation();
    setSelectedObject(isSelected ? null : name); // Toggle selection
  };

  return handleClick;
};

export default useSelectable;
