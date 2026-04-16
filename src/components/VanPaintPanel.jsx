import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useVanCustomizationStore } from '../store/vanCustomizationStore';
import MaterialPanel from './MaterialPanel';
import { MATERIAL_PRESETS } from '../data/materialPresets';

const VanPaintPanel = () => {
  const paintMode = useVanCustomizationStore((s) => s.paintMode);
  const selectedPart = useVanCustomizationStore((s) => s.selectedPart);
  const setSelectedPart = useVanCustomizationStore((s) => s.setSelectedPart);
  const customization = useVanCustomizationStore((s) => s.customization);
  const setPaintMode = useVanCustomizationStore((s) => s.setPaintMode);
  const updatePart = useVanCustomizationStore((s) => s.updatePart);
  const resetPart = useVanCustomizationStore((s) => s.resetPart);
  const resetAll = useVanCustomizationStore((s) => s.resetAll);

  const targetKey = selectedPart || '__all__';
  const current = customization[targetKey] || {};

  return (
    <AnimatePresence>
      {paintMode && (
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 40 }}
          transition={{ duration: 0.2 }}
          className="fixed top-20 right-4 z-30"
        >
          <div className="mb-2 px-3 py-2 bg-zinc-900 text-white rounded-lg shadow-lg text-xs inline-flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#f5c34b] animate-pulse" />
            <span>
              {selectedPart
                ? <>Editing part: <code className="bg-zinc-800 px-1 rounded">{selectedPart}</code></>
                : 'Click any van part to select, or edit the whole body'}
            </span>
            <button
              onClick={() => setPaintMode(false)}
              className="ml-2 px-2 py-0.5 bg-zinc-700 hover:bg-zinc-600 rounded text-[10px]"
            >
              Exit paint mode
            </button>
          </div>
          <MaterialPanel
            open
            onClose={() => setPaintMode(false)}
            color={current.color}
            materialPreset={current.materialPreset}
            onColorChange={(color) => updatePart(selectedPart, { color })}
            onPresetChange={(materialPreset) => {
              updatePart(selectedPart, { materialPreset });
              const label = MATERIAL_PRESETS[materialPreset]?.label || materialPreset;
              const scope = selectedPart ? `part "${selectedPart}"` : 'van body';
              toast.success(`Applied ${label} finish to ${scope}`, { duration: 1500 });
            }}
            onReset={() => {
              resetPart(selectedPart);
              toast(selectedPart ? `Reset part "${selectedPart}"` : 'Reset whole body', { icon: '↺', duration: 1400 });
            }}
            onResetAll={() => {
              resetAll();
              setSelectedPart(null);
              toast.success('All van paint cleared', { duration: 1500 });
            }}
            title="Paint Van"
            selectedPartLabel={selectedPart || 'Whole body'}
            canTargetParts
            onClearTarget={() => setSelectedPart(null)}
            partList={[]}
            onSelectPart={setSelectedPart}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VanPaintPanel;
