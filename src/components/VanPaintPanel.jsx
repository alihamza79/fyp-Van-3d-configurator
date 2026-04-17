import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useVanCustomizationStore } from '../store/vanCustomizationStore';
import { useCustomizePanelStore } from '../store/customizePanelStore';
import { MATERIAL_PRESETS } from '../data/materialPresets';

// Bridge between the van paint flow and the shared right-side CustomizePanel.
// This component no longer renders its own floating panel - it just wires
// up the van customization store into the global panel store when paint
// mode is active.
const VanPaintPanel = () => {
  const paintMode = useVanCustomizationStore((s) => s.paintMode);
  const selectedPart = useVanCustomizationStore((s) => s.selectedPart);
  const setSelectedPart = useVanCustomizationStore((s) => s.setSelectedPart);
  const customization = useVanCustomizationStore((s) => s.customization);
  const setPaintMode = useVanCustomizationStore((s) => s.setPaintMode);
  const updatePart = useVanCustomizationStore((s) => s.updatePart);
  const resetPart = useVanCustomizationStore((s) => s.resetPart);
  const resetAll = useVanCustomizationStore((s) => s.resetAll);

  const panelOpen = useCustomizePanelStore((s) => s.open);
  const openPanel = useCustomizePanelStore((s) => s.openPanel);
  const closePanel = useCustomizePanelStore((s) => s.closePanel);
  const panelTarget = useCustomizePanelStore((s) => s.target);
  const updateCallbacks = useCustomizePanelStore((s) => s.updateCallbacks);

  // Whenever van paint mode toggles (or the selected van part changes),
  // sync the shared customize panel with fresh van-scoped callbacks.
  useEffect(() => {
    if (!paintMode) {
      if (panelTarget?.kind === 'van') closePanel();
      return;
    }

    const key = selectedPart || '__all__';
    const current = customization[key] || {};

    const callbacks = {
      getColor: () => {
        const k = useVanCustomizationStore.getState().selectedPart || '__all__';
        return useVanCustomizationStore.getState().customization[k]?.color;
      },
      getPreset: () => {
        const k = useVanCustomizationStore.getState().selectedPart || '__all__';
        return useVanCustomizationStore.getState().customization[k]?.materialPreset;
      },
      onColorChange: (color) => {
        const target = useVanCustomizationStore.getState().selectedPart;
        updatePart(target, { color });
      },
      onPresetChange: (materialPreset) => {
        const target = useVanCustomizationStore.getState().selectedPart;
        updatePart(target, { materialPreset });
        const label = MATERIAL_PRESETS[materialPreset]?.label || materialPreset;
        const scope = target ? `part "${target}"` : 'van body';
        toast.success(`Applied ${label} finish to ${scope}`, { duration: 1500 });
      },
      onReset: () => {
        const target = useVanCustomizationStore.getState().selectedPart;
        resetPart(target);
        toast(target ? `Reset part "${target}"` : 'Reset whole body', {
          icon: '↺',
          duration: 1400,
        });
      },
      onResetAll: () => {
        resetAll();
        setSelectedPart(null);
        toast.success('All van paint cleared', { duration: 1500 });
      },
      onSelectPart: (partName) => setSelectedPart(partName),
    };

    if (panelOpen && panelTarget?.kind === 'van') {
      updateCallbacks(callbacks);
      useCustomizePanelStore.getState().updateTarget({ partName: selectedPart });
    } else {
      openPanel(
        { kind: 'van', partName: selectedPart, productName: 'Van' },
        callbacks,
      );
    }
    // current is captured via getState() inside callbacks so we only need to
    // re-run this effect when the selection or paint mode changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paintMode, selectedPart, customization]);

  // When the global panel closes (via Esc or its X button) and we're still
  // in van paint mode, exit paint mode so the UI stays in sync.
  useEffect(() => {
    if (paintMode && !panelOpen) {
      setPaintMode(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panelOpen]);

  return (
    <AnimatePresence>
      {paintMode && (
        <motion.div
          key="van-paint-hint"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-30 px-4 py-2 bg-zinc-900/95 text-white rounded-full shadow-lg text-xs inline-flex items-center gap-2"
        >
          <span className="w-2 h-2 rounded-full bg-[#f5c34b] animate-pulse" />
          <span>
            {selectedPart
              ? <>Editing part: <code className="bg-zinc-800 px-1 rounded">{selectedPart}</code></>
              : 'Click a van panel to paint just that piece'}
          </span>
          <button
            onClick={() => setPaintMode(false)}
            className="ml-2 px-2 py-0.5 bg-zinc-700 hover:bg-zinc-600 rounded text-[10px]"
          >
            Exit
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VanPaintPanel;
