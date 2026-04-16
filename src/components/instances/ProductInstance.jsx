import React, { useState, useEffect } from 'react';
import { a } from '@react-spring/three';
import { motion, AnimatePresence } from 'framer-motion';
import RotateButton from '../RotateButton';
import BigDot from '../BigDot';
import useInstanceLogic from '../../hooks/useInstanceLogic';
import PreLoader from '../preLoader';
import { showCustomToast } from '../../utils/toast';
import { FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { useBuildStore } from '../../store/buildStore';
import toast from 'react-hot-toast';
import { MATERIAL_PRESETS } from '../../data/materialPresets';

const arrowVariants = {
  animate: {
    y: [0, -3, 3, 0],
    transition: {
      duration: 2.5,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeInOut"
    }
  }
};

const ProductInstance = ({ productId, id, initialPosition, view, onCopy, onRemove, modelPath, scale, dimensions, vanBounds, yAxisMove }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasShownToast, setHasShownToast] = useState(false);

  const {
    clonedScene,
    isLoading,
    position,
    rotationY,
    setRotationY,
    showRotateButton,
    setShowRotateButton,
    showBigDot,
    isHovered,
    setIsHovered,
    cabinetRef,
    bind,
    handleDoubleClick,
    handleCloseMenu,
    isAnimationComplete,
    resetAnimation,
    customization,
    selectedMeshName,
    setSelectedMeshName,
    meshNames,
  } = useInstanceLogic(productId, id, modelPath, initialPosition, view, vanBounds, isPlaying, yAxisMove);

  const updateInstanceCustomization = useBuildStore((s) => s.updateInstanceCustomization);
  const resetInstanceCustomization = useBuildStore((s) => s.resetInstanceCustomization);
  const resetAllInstanceCustomization = useBuildStore((s) => s.resetAllInstanceCustomization);

  useEffect(() => {
    if (yAxisMove && !hasShownToast && view !== 'default') {
      const VerticalArrows = (
        <div>
          <motion.div variants={arrowVariants} animate="animate">
            <FiArrowUp className="text-blue-500 text-lg" />
          </motion.div>
          <motion.div variants={arrowVariants} animate="animate" style={{ animationDelay: "0.2s" }}>
            <FiArrowDown className="text-blue-500 text-lg" />
          </motion.div>
        </div>
      );

      showCustomToast({
        icon: VerticalArrows,
        title: "Vertical Movement Enabled for this Product",
        detail: "Use Up/Down arrow keys while hovering to adjust height",
        duration: 4000
      });

      setHasShownToast(true);
    }
  }, [yAxisMove, hasShownToast, view]);

  const handlePlayAnimation = () => {
    setIsPlaying((prevIsPlaying) => !prevIsPlaying);
  };

  // Shift+click on a specific sub-mesh targets it for color/material edits.
  const handleMeshClick = (event) => {
    if (view === 'default') return;
    if (!event.shiftKey) return;
    event.stopPropagation();
    const name = event.object?.name;
    if (name) {
      setSelectedMeshName(name);
      setShowRotateButton(true);
    }
  };

  // Apply color/material either to the targeted sub-mesh or the whole product.
  const targetKey = selectedMeshName || null;
  const currentColor = targetKey
    ? customization?.perMesh?.[targetKey]?.color
    : customization?.color;
  const currentPreset = targetKey
    ? customization?.perMesh?.[targetKey]?.materialPreset
    : customization?.materialPreset;

  const handleColorChange = (color) => {
    updateInstanceCustomization(productId, id, { color }, targetKey);
  };
  const handlePresetChange = (materialPreset) => {
    updateInstanceCustomization(productId, id, { materialPreset }, targetKey);
    const label = MATERIAL_PRESETS[materialPreset]?.label || materialPreset;
    const scope = targetKey ? `part "${targetKey}"` : 'product';
    toast.success(`Applied ${label} finish to ${scope}`, { duration: 1500 });
  };
  const handleResetCustomization = () => {
    resetInstanceCustomization(productId, id, targetKey);
    toast(targetKey ? `Reset part "${targetKey}"` : 'Reset whole product', { icon: '↺', duration: 1400 });
  };
  const handleResetAllCustomization = () => {
    resetAllInstanceCustomization(productId, id);
    setSelectedMeshName(null);
    toast.success('All customization cleared for this product', { duration: 1500 });
  };

  if (isLoading) {
    return (
      <PreLoader
        progress={100}
        vanDimensions={dimensions}
        position={initialPosition}
      />
    );
  }

  return (
    <>
      <a.primitive
        ref={cabinetRef}
        object={clonedScene}
        position-x={position[0]}
        position-y={position[1]}
        position-z={position[2]}
        rotation={[0, (rotationY * Math.PI) / 180, 0]}
        scale={scale}
        onDoubleClick={handleDoubleClick}
        onClick={handleMeshClick}
        onPointerOver={() => setIsHovered(true)}
        onPointerOut={() => setIsHovered(false)}
        {...(view !== 'default' ? bind() : {})}
      />
      {showBigDot && (
        <BigDot position={position} onClick={() => setShowRotateButton(true)} />
      )}
      {showRotateButton && view !== 'default' && (
        <RotateButton
          position={position}
          rotationY={rotationY}
          setRotationY={setRotationY}
          onCopy={() => onCopy(id, position)}
          onRemove={() => onRemove(id)}
          onClose={handleCloseMenu}
          onPlayAnimation={handlePlayAnimation}
          isAnimationComplete={isAnimationComplete}
          resetAnimation={resetAnimation}
          color={currentColor}
          materialPreset={currentPreset}
          onColorChange={handleColorChange}
          onPresetChange={handlePresetChange}
          onResetCustomization={handleResetCustomization}
          onResetAllCustomization={handleResetAllCustomization}
          selectedMeshName={selectedMeshName}
          onClearMeshTarget={() => setSelectedMeshName(null)}
          meshNames={meshNames}
          onSelectMesh={setSelectedMeshName}
        />
      )}

    </>
  );
};

export default ProductInstance;
