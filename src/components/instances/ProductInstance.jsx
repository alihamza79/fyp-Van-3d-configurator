import React, { useState, useEffect } from 'react';
import { a } from '@react-spring/three';
import { motion } from 'framer-motion';
import RotateButton from '../RotateButton';
import BigDot from '../BigDot';
import useInstanceLogic from '../../hooks/useInstanceLogic';
import PreLoader from '../preLoader';
import { showCustomToast } from '../../utils/toast';
import { FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { useCustomizePanelStore } from '../../store/customizePanelStore';
import { useBuildStore } from '../../store/buildStore';

// How much to lift/lower on a single toolbar-button click. The keyboard path
// uses a different step size (see useInstanceLogic.js).
const NUDGE_STEP = 0.05;

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

const ProductInstance = ({ productId, id, initialPosition, view, onCopy, onRemove, modelPath, scale, dimensions, vanBounds, yAxisMove, productName }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasShownToast, setHasShownToast] = useState(false);

  const {
    clonedScene,
    isLoading,
    position,
    setPosition,
    rotationY,
    setRotationY,
    showRotateButton,
    setShowRotateButton,
    showBigDot,
    setIsHovered,
    cabinetRef,
    bind,
    handleDoubleClick,
    handleCloseMenu,
    isAnimationComplete,
    resetAnimation,
    setSelectedMeshName,
    yBounds,
  } = useInstanceLogic(productId, id, modelPath, initialPosition, view, vanBounds, isPlaying, yAxisMove);

  const [yMin, yMax] = yBounds;
  const canNudgeUp = position[1] < yMax - 1e-4;
  const canNudgeDown = position[1] > yMin + 1e-4;

  const nudgeY = (dy) => {
    const next = Math.max(yMin, Math.min(yMax, position[1] + dy));
    if (next === position[1]) return;
    const newPos = [position[0], next, position[2]];
    setPosition(newPos);
    useBuildStore.getState().updateInstancePosition(productId, id, newPos);
  };

  useEffect(() => {
    if (!hasShownToast && view !== 'default') {
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
        title: "Move parts up and down",
        detail: "Hover any part and press ↑ / ↓ (hold Shift for fine steps), or use the ↑↓ buttons in the toolbar.",
        duration: 4500,
      });

      setHasShownToast(true);
    }
  }, [hasShownToast, view]);

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

  // If this instance unmounts (e.g. user hit "Remove") while the customize
  // experience (side panel or workspace) is targeting it, close those so
  // they don't leave a stale target pointing at a deleted instance.
  useEffect(() => {
    return () => {
      const state = useCustomizePanelStore.getState();
      const panelHere = state.open && state.target?.kind === 'product'
        && state.target.productId === productId
        && state.target.instanceId === id;
      const workspaceHere = state.workspace?.productId === productId
        && state.workspace?.instanceId === id;
      if (workspaceHere) state.closeWorkspace();
      else if (panelHere) state.closePanel();
    };
  }, [productId, id]);

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
          productId={productId}
          instanceId={id}
          productName={productName}
          modelPath={modelPath}
          onNudgeUp={() => nudgeY(NUDGE_STEP)}
          onNudgeDown={() => nudgeY(-NUDGE_STEP)}
          canNudgeUp={canNudgeUp}
          canNudgeDown={canNudgeDown}
        />
      )}

    </>
  );
};

export default ProductInstance;
