// VanModel.jsx
import React, { useRef, useEffect, useState } from 'react';
import { useGLTF } from '@react-three/drei';

import PreLoader from './preLoader'; // Ensure correct casing
import Product from './products/Product'; // Import Product component


const VanModel = ({
  products,
  view,
}) => {
  const { scene: vanScene } = useGLTF('/parent_Setting_van/untitled2.glb');
  const vanRef = useRef();

  const hidePartsByView = {
    default: [],
    innerZoom: [], // All parts visible
    back: ['Porte_1_Carrosserie_0005'], // Hide back doors
    side: [
      'Carrosserie_Carrosserie_0068',
      'Carrosserie_Carrosserie_0049',
      'Carrosserie_Carrosserie_0001',
      'Interieur_Interrieur_0006',
    ],
    top: [
      'Interieur_Interrieur_0184',
      'Interieur_Interrieur_0161',
      'Carrosserie_Carrosserie_0202',
      'Carrosserie_Carrosserie_0277',
      'Interieur_Interrieur_0006',
      'Carrosserie_Carrosserie_0043',
      'Carrosserie_Carrosserie_0063'
      // Add other roof parts as needed
    ],
    roof2: [], // Specific handling for roof2 if needed
    corner:[
      //top
      'Interieur_Interrieur_0184',
      'Interieur_Interrieur_0161',
      'Carrosserie_Carrosserie_0202',
      'Carrosserie_Carrosserie_0277',
      'Interieur_Interrieur_0006',
      'Carrosserie_Carrosserie_0043',
      'Carrosserie_Carrosserie_0063',

      // Left side
      "Carrosserie_Carrosserie_0040",
     'Autre_Autre_0216',
      "Carrosserie_Carrosserie_0257",
     "Carrosserie_Carrosserie_0223",
    

    ]
  };

  // State to control Initial Loading
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [preloaderProgress, setPreloaderProgress] = useState(0);

  // Initial Loading Effect
  useEffect(() => {
    // Timer to end loading after 4 seconds
    const initialTimer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 4000); // 4 seconds

    // Simulate PreLoader progress
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 1;
      if (progress > 100) progress = 100;
      setPreloaderProgress(progress);
      if (progress === 100) clearInterval(progressInterval);
    }, 40); // Increment every 40ms

    // Cleanup timers on unmount
    return () => {
      clearTimeout(initialTimer);
      clearInterval(progressInterval);
    };
  }, []);

  useEffect(() => {
    if (vanScene) {
      vanScene.traverse((child) => {
        if (child.isMesh) {
          const partName = child.name;

          if (view === 'innerZoom') {
            // In 'innerZoom' view, all parts are visible
            child.visible = true;
          } else {
            // Determine parts to hide based on the current view
            const partsToHide = hidePartsByView[view] || [];

            // Hide the part if it's in the hide list
            if (partsToHide.includes(partName)) {
              child.visible = false;
            }
            // Additionally, hide 'solar_panel' unless the view is 'roof2'
            else if (partName === 'solar_panel' && view !== 'roof2') {
              child.visible = false;
            }
            // Otherwise, make the part visible
            else {
              child.visible = true;
            }
          }
        }
      });
    }
  }, [vanScene, view]);

  // Early Return if Initial Loading is True
  if (isInitialLoading) {
    return <PreLoader progress={preloaderProgress} />;
  }

  return (
    <>
      <primitive ref={vanRef} object={vanScene} />

      {products.map(product => {
        return (
          <Product
            key={product.id}
            productId={product.id}
            view={view}
            modelPath={product.modelPath}
            scale={product.scale}
            initialPosition={product.initialPosition}
            dimensions={product.dimensions}
            vanBounds={product.vanBounds}
            yAxisMove={product.yAxisMove}
          />
        );
      })}
    </>
  );
};

export default VanModel;
