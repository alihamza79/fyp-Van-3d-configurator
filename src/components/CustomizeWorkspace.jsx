import React, { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF, ContactShadows, Html } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCw, Check, Info, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

import { useCustomizePanelStore } from '../store/customizePanelStore';
import { useBuildStore } from '../store/buildStore';
import { MATERIAL_PRESETS } from '../data/materialPresets';
import {
  applyCustomizationToScene,
  highlightMesh,
  clearHighlight,
} from '../utils/applyCustomization';
import CustomizePanel from './CustomizePanel';

// ---------------------------------------------------------------------------
// Product viewer inside the workspace canvas.
// Owns its own clone of the GLB so edits here don't mutate the cached
// sceneCache used by the main van scene. The same buildStore customization
// is applied live so when the user exits, the van already reflects the
// chosen color/material.
// ---------------------------------------------------------------------------
const WorkspaceProduct = ({
  productId,
  instanceId,
  modelPath,
  autoRotate,
  selectedMeshName,
  setSelectedMeshName,
  onMeshNamesReady,
}) => {
  const { scene } = useGLTF(modelPath);
  const groupRef = useRef();
  const [localScene, setLocalScene] = useState(null);

  const customization = useBuildStore((s) =>
    s.productInstances[productId]?.find((i) => i.id === instanceId)?.customization,
  );

  useEffect(() => {
    if (!scene) return;
    const clone = scene.clone(true);
    const names = [];
    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (Array.isArray(child.material)) {
          child.material = child.material.map((m) => {
            const c = m.clone();
            c.userData = {};
            return c;
          });
        } else if (child.material) {
          child.material = child.material.clone();
          child.material.userData = {};
        }
        if (child.name) names.push(child.name);
      }
    });
    setLocalScene(clone);
    onMeshNamesReady?.(Array.from(new Set(names)));
  }, [scene, onMeshNamesReady]);

  useEffect(() => {
    if (!localScene) return;
    applyCustomizationToScene(localScene, customization || {});
  }, [localScene, customization]);

  useEffect(() => {
    if (!localScene) return;
    if (selectedMeshName) highlightMesh(localScene, selectedMeshName);
    else clearHighlight(localScene);
  }, [localScene, selectedMeshName]);

  useEffect(() => {
    if (!autoRotate || !groupRef.current) return;
    let raf;
    let last = performance.now();
    const tick = (now) => {
      const dt = (now - last) / 1000;
      last = now;
      if (groupRef.current) {
        groupRef.current.rotation.y += dt * 0.4;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [autoRotate]);

  const handleClick = (e) => {
    if (!e.shiftKey) return;
    e.stopPropagation();
    const name = e.object?.name;
    if (name) setSelectedMeshName(name);
  };

  if (!localScene) return null;

  return (
    <group ref={groupRef}>
      <primitive object={localScene} onClick={handleClick} />
    </group>
  );
};

const LoadingOverlay = () => (
  <Html center>
    <div className="flex flex-col items-center gap-2 text-white/80 text-xs">
      <div className="w-6 h-6 border-2 border-white/30 border-t-[#f5c34b] rounded-full animate-spin" />
      <span>Loading product…</span>
    </div>
  </Html>
);

const CustomizeWorkspace = () => {
  const workspace = useCustomizePanelStore((s) => s.workspace);
  const closeWorkspace = useCustomizePanelStore((s) => s.closeWorkspace);
  const openPanel = useCustomizePanelStore((s) => s.openPanel);
  const panelOpen = useCustomizePanelStore((s) => s.open);
  const panelTarget = useCustomizePanelStore((s) => s.target);
  const updateCallbacks = useCustomizePanelStore((s) => s.updateCallbacks);
  const updateTarget = useCustomizePanelStore((s) => s.updateTarget);

  const updateInstanceCustomization = useBuildStore((s) => s.updateInstanceCustomization);
  const resetInstanceCustomization = useBuildStore((s) => s.resetInstanceCustomization);
  const resetAllInstanceCustomization = useBuildStore((s) => s.resetAllInstanceCustomization);

  const [selectedMeshName, setSelectedMeshName] = useState(null);
  const [meshNames, setMeshNames] = useState([]);
  const [autoRotate, setAutoRotate] = useState(false);

  // Reset UI state whenever the user opens a different product.
  useEffect(() => {
    if (!workspace) {
      setSelectedMeshName(null);
      setMeshNames([]);
      setAutoRotate(false);
    }
  }, [workspace]);

  const targetKey = selectedMeshName || null;

  // Wire the side-panel callbacks up whenever the workspace becomes active
  // or when the editing target / meshNames list changes.
  useEffect(() => {
    if (!workspace) return;

    const callbacks = {
      getColor: () => {
        const inst = useBuildStore.getState().productInstances[workspace.productId]?.find(
          (i) => i.id === workspace.instanceId,
        );
        const cz = inst?.customization;
        return targetKey ? cz?.perMesh?.[targetKey]?.color : cz?.color;
      },
      getPreset: () => {
        const inst = useBuildStore.getState().productInstances[workspace.productId]?.find(
          (i) => i.id === workspace.instanceId,
        );
        const cz = inst?.customization;
        return targetKey ? cz?.perMesh?.[targetKey]?.materialPreset : cz?.materialPreset;
      },
      onColorChange: (color) => {
        updateInstanceCustomization(workspace.productId, workspace.instanceId, { color }, targetKey);
      },
      onPresetChange: (materialPreset) => {
        updateInstanceCustomization(workspace.productId, workspace.instanceId, { materialPreset }, targetKey);
        const label = MATERIAL_PRESETS[materialPreset]?.label || materialPreset;
        const scope = targetKey ? `part "${targetKey}"` : 'product';
        toast.success(`Applied ${label} to ${scope}`, { duration: 1400 });
      },
      onReset: () => {
        resetInstanceCustomization(workspace.productId, workspace.instanceId, targetKey);
        toast(targetKey ? `Reset part "${targetKey}"` : 'Reset product', { icon: '↺', duration: 1400 });
      },
      onResetAll: () => {
        resetAllInstanceCustomization(workspace.productId, workspace.instanceId);
        setSelectedMeshName(null);
        toast.success('All customization cleared', { duration: 1400 });
      },
      onSelectPart: (name) => setSelectedMeshName(name || null),
    };

    const samePanel =
      panelOpen &&
      panelTarget?.kind === 'product' &&
      panelTarget.productId === workspace.productId &&
      panelTarget.instanceId === workspace.instanceId;

    if (samePanel) {
      updateCallbacks(callbacks);
      updateTarget({ partName: selectedMeshName, meshNames });
    } else {
      openPanel(
        {
          kind: 'product',
          productId: workspace.productId,
          instanceId: workspace.instanceId,
          partName: selectedMeshName,
          productName: workspace.productName,
          meshNames,
        },
        callbacks,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspace, selectedMeshName, meshNames.length, targetKey]);

  // Esc exits the workspace, R toggles turntable.
  useEffect(() => {
    if (!workspace) return;
    const handler = (e) => {
      if (e.key === 'Escape') closeWorkspace();
      else if (e.key === 'r' || e.key === 'R') setAutoRotate((prev) => !prev);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [workspace, closeWorkspace]);

  return (
    <AnimatePresence>
      {workspace && (
        <motion.div
          key="customize-workspace"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] bg-gradient-to-br from-[#1a1d26] via-[#24272f] to-[#2e3140]"
        >
          {/* Top bar */}
          <div className="absolute top-0 left-0 right-0 h-14 px-5 flex items-center justify-between bg-black/40 backdrop-blur-md border-b border-white/10 z-10">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#f5c34b] animate-pulse" />
              <div>
                <div className="text-white text-sm font-semibold leading-tight">
                  Customize {workspace.productName}
                </div>
                <div className="text-white/50 text-[10px] leading-tight">
                  Isolated workspace — changes apply live to the van
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setAutoRotate((v) => !v)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                  autoRotate
                    ? 'bg-[#f5c34b] text-zinc-900 border-[#f5c34b]'
                    : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                }`}
                title="Toggle turntable (R)"
              >
                <RotateCw className="w-3.5 h-3.5" />
                {autoRotate ? 'Stop' : 'Turntable'}
              </button>
              <button
                onClick={() => {
                  resetAllInstanceCustomization(workspace.productId, workspace.instanceId);
                  setSelectedMeshName(null);
                  toast.success('Reset to original', { duration: 1200 });
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-colors"
                title="Reset everything for this product"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset
              </button>
              <button
                onClick={closeWorkspace}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#f5c34b] text-zinc-900 hover:bg-amber-300 transition-colors shadow-md"
                title="Save & return (Esc)"
              >
                <Check className="w-3.5 h-3.5" />
                Done
              </button>
            </div>
          </div>

          {/* Canvas area */}
          <div
            className="absolute top-14 bottom-0 left-0"
            style={{ right: '340px' }}
          >
            <Canvas
              shadows
              camera={{ position: [2.2, 1.6, 2.2], fov: 45 }}
              gl={{ antialias: true, preserveDrawingBuffer: true }}
            >
              <color attach="background" args={['#20232c']} />
              <ambientLight intensity={0.55} />
              <directionalLight
                position={[5, 8, 4]}
                intensity={1.2}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
                shadow-camera-far={40}
                shadow-camera-left={-8}
                shadow-camera-right={8}
                shadow-camera-top={8}
                shadow-camera-bottom={-8}
              />
              <directionalLight position={[-5, 3, -5]} intensity={0.4} />
              <hemisphereLight args={['#8fa4c8', '#2a2f38', 0.4]} />

              <Suspense fallback={<LoadingOverlay />}>
                <WorkspaceProduct
                  productId={workspace.productId}
                  instanceId={workspace.instanceId}
                  modelPath={workspace.modelPath}
                  autoRotate={autoRotate}
                  selectedMeshName={selectedMeshName}
                  setSelectedMeshName={setSelectedMeshName}
                  onMeshNamesReady={setMeshNames}
                />
                <ContactShadows
                  position={[0, -0.9, 0]}
                  opacity={0.45}
                  scale={10}
                  blur={2.2}
                  far={4}
                />
                <Environment files="/Meadows.hdr" background={false} environmentIntensity={0.85} />
              </Suspense>

              <OrbitControls
                makeDefault
                enablePan
                enableZoom
                enableRotate
                enableDamping
                dampingFactor={0.08}
                minDistance={0.5}
                maxDistance={15}
                maxPolarAngle={Math.PI * 0.95}
              />
            </Canvas>
          </div>

          {/* In-scene hint chip */}
          <div
            className="absolute bottom-5 left-5 bg-black/60 backdrop-blur-sm border border-white/10 rounded-full px-3 py-1.5 text-[11px] text-white/80 inline-flex items-center gap-2 z-10"
            style={{ maxWidth: 'calc(100% - 360px)' }}
          >
            <Info className="w-3 h-3 text-[#f5c34b]" />
            <span>
              Drag to rotate · Scroll to zoom ·{' '}
              <kbd className="px-1 py-0.5 bg-white/10 rounded font-mono">Shift</kbd>
              +click a part ·{' '}
              <kbd className="px-1 py-0.5 bg-white/10 rounded font-mono">Esc</kbd> to exit
            </span>
          </div>

          {/* Selected part chip */}
          {selectedMeshName && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-[#f5c34b] text-zinc-900 rounded-full px-3 py-1.5 text-[11px] font-medium inline-flex items-center gap-2 z-10 shadow-lg">
              Editing part: <code className="font-mono">{selectedMeshName}</code>
              <button
                onClick={() => setSelectedMeshName(null)}
                className="ml-1 p-0.5 rounded-full hover:bg-zinc-900/10"
                aria-label="Clear selection"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Right-docked customize panel (embedded mode). */}
          <CustomizePanel embedded />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CustomizeWorkspace;
