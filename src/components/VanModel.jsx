// VanModel.jsx
import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';

import PreLoader from './preLoader';
import Product from './products/Product';
import { useVanCustomizationStore } from '../store/vanCustomizationStore';
import { applyCustomizationToScene, highlightMesh, clearHighlight } from '../utils/applyCustomization';

const VanModel = ({
  products,
  view,
}) => {
  const { scene: vanScene } = useGLTF('/parent_Setting_van/untitled2.glb');
  const vanRef = useRef();

  const paintMode = useVanCustomizationStore((s) => s.paintMode);
  const selectedPart = useVanCustomizationStore((s) => s.selectedPart);
  const vanCustomization = useVanCustomizationStore((s) => s.customization);
  const setSelectedPart = useVanCustomizationStore((s) => s.setSelectedPart);

  const hidePartsByView = {
    default: [],
    innerZoom: [],
    back: ['Porte_1_Carrosserie_0005'],
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
    ],
    roof2: [],
    corner: [
      'Interieur_Interrieur_0184',
      'Interieur_Interrieur_0161',
      'Carrosserie_Carrosserie_0202',
      'Carrosserie_Carrosserie_0277',
      'Interieur_Interrieur_0006',
      'Carrosserie_Carrosserie_0043',
      'Carrosserie_Carrosserie_0063',
      'Carrosserie_Carrosserie_0040',
      'Autre_Autre_0216',
      'Carrosserie_Carrosserie_0257',
      'Carrosserie_Carrosserie_0223',
    ]
  };

  // State to control Initial Loading
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [preloaderProgress, setPreloaderProgress] = useState(0);

  // Ensure each mesh has its own material clone so van edits don't bleed into
  // shared GLTF materials or cause ghost highlights on products.
  useEffect(() => {
    if (!vanScene) return;
    vanScene.traverse((child) => {
      if (!child.isMesh || !child.material) return;
      if (child.userData.__materialCloned) return;
      if (Array.isArray(child.material)) {
        child.material = child.material.map((m) => m.clone());
      } else {
        child.material = child.material.clone();
      }
      child.userData.__materialCloned = true;
    });
  }, [vanScene]);

  // Initial Loading Effect
  useEffect(() => {
    const initialTimer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 4000);

    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 1;
      if (progress > 100) progress = 100;
      setPreloaderProgress(progress);
      if (progress === 100) clearInterval(progressInterval);
    }, 40);

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
            child.visible = true;
          } else {
            const partsToHide = hidePartsByView[view] || [];

            if (partsToHide.includes(partName)) {
              child.visible = false;
            } else if (partName === 'solar_panel' && view !== 'roof2') {
              child.visible = false;
            } else {
              child.visible = true;
            }
          }
        }
      });
    }
  }, [vanScene, view]);

  // Apply van paint customizations whenever they change.
  useEffect(() => {
    if (!vanScene) return;
    // Build an "all" customization by flattening the __all__ key, and per-mesh overrides.
    const all = vanCustomization.__all__ || {};
    const perMesh = { ...vanCustomization };
    delete perMesh.__all__;
    applyCustomizationToScene(vanScene, { ...all, perMesh });
  }, [vanScene, vanCustomization]);

  // Highlight the selected van part while in paint mode.
  useEffect(() => {
    if (!vanScene) return;
    if (paintMode && selectedPart) {
      highlightMesh(vanScene, selectedPart);
    } else {
      clearHighlight(vanScene);
    }
  }, [vanScene, paintMode, selectedPart]);

  const handleVanClick = (event) => {
    if (!paintMode) return;
    event.stopPropagation();
    const name = event.object?.name;
    if (name) setSelectedPart(name);
  };

  if (isInitialLoading) {
    return <PreLoader progress={preloaderProgress} />;
  }

  return (
    <>
      <primitive
        ref={vanRef}
        object={vanScene}
        onClick={handleVanClick}
      />

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
