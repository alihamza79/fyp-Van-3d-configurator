import React, { useEffect, useMemo, useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RefreshCw, Palette, Droplet, MousePointer2, Layers, Sparkles, Info } from 'lucide-react';
import {
  MATERIAL_PRESETS,
  PRESET_ORDER,
  getPaletteForPreset,
} from '../data/materialPresets';
import { useCustomizePanelStore } from '../store/customizePanelStore';

const TABS = [
  { key: 'material', label: 'Material', icon: Layers },
  { key: 'color', label: 'Color', icon: Droplet },
  { key: 'parts', label: 'Parts', icon: MousePointer2 },
];

const CustomizePanel = ({ embedded = false }) => {
  const open = useCustomizePanelStore((s) => s.open);
  const target = useCustomizePanelStore((s) => s.target);
  const callbacks = useCustomizePanelStore((s) => s.callbacks);
  const closePanel = useCustomizePanelStore((s) => s.closePanel);
  const workspace = useCustomizePanelStore((s) => s.workspace);

  const [tab, setTab] = useState('material');

  const color = callbacks?.getColor?.() ?? '#ffffff';
  const preset = callbacks?.getPreset?.() ?? 'original';
  const palette = useMemo(() => getPaletteForPreset(preset), [preset]);

  // Escape closes the panel in side-panel mode. In workspace mode the
  // workspace itself owns Escape handling, so we skip it here to avoid
  // double-handling.
  useEffect(() => {
    if (!open || embedded) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') closePanel();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, closePanel, embedded]);

  // When the selected part changes, auto-jump to the Material tab so the
  // user immediately sees finish options for the new target.
  useEffect(() => {
    if (!target) return;
    setTab('material');
  }, [target?.kind, target?.productId, target?.instanceId, target?.partName]);

  // IMPORTANT: keep all early returns AFTER every hook call above, otherwise
  // the hook order changes between renders and React crashes the subtree.
  // Skip rendering the standalone-mode panel while the workspace is active
  // (the workspace will render its own embedded instance).
  if (workspace && !embedded) return null;
  if (!open || !target || !callbacks) return null;

  const title = target.kind === 'van'
    ? 'Customize Van'
    : `Customize ${target.productName || 'Product'}`;

  const scopeLabel = target.partName
    ? target.partName
    : target.kind === 'van' ? 'Whole body' : 'Whole product';

  const meshNames = target.kind === 'product' ? (target.meshNames || []) : [];
  const isPartSelected = Boolean(target.partName);

  const handlePresetChange = (key) => {
    callbacks.onPresetChange?.(key);
    // If the user hasn't picked a color for this target yet, seed with the
    // preset's suggested default so the finish looks right out of the box.
    const suggested = MATERIAL_PRESETS[key]?.defaultColor;
    const currentColor = callbacks.getColor?.();
    if (suggested && !currentColor) {
      callbacks.onColorChange?.(suggested);
    }
  };

  // In workspace (embedded) mode, the panel covers the full height below the
  // workspace's 56px top bar and sits above the workspace overlay.
  const containerClass = embedded
    ? 'fixed right-0 top-14 bottom-0 z-[110] w-[340px] bg-white border-l border-gray-200 shadow-2xl flex flex-col'
    : 'fixed right-0 top-16 bottom-0 z-40 w-[340px] bg-white border-l border-gray-200 shadow-2xl flex flex-col';

  return (
    <AnimatePresence>
      <motion.aside
        key="customize-panel"
        initial={{ x: 360, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 360, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 30 }}
        className={containerClass}
      >
        <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#f5c34b]" />
            <span className="text-sm font-semibold text-gray-900">{title}</span>
          </div>
          {!embedded && (
            <button
              onClick={closePanel}
              className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500"
              aria-label="Close panel"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="px-4 py-2.5 border-b border-gray-100 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] text-gray-600">
              <MousePointer2 className="w-3 h-3" />
              <span>Editing</span>
              <span
                className="font-semibold text-gray-900 truncate max-w-[160px]"
                title={scopeLabel}
              >
                {scopeLabel}
              </span>
            </div>
            {isPartSelected && (
              <button
                onClick={() => callbacks.onSelectPart?.(null)}
                className="text-[11px] text-blue-600 hover:underline"
              >
                Whole {target.kind === 'van' ? 'body' : 'product'}
              </button>
            )}
          </div>
          {!embedded && target.kind === 'product' && !isPartSelected && (
            <div className="mt-1.5 flex items-start gap-1.5 text-[10px] text-gray-500 bg-amber-50 border border-amber-200 rounded p-1.5">
              <Info className="w-3 h-3 mt-0.5 text-amber-600 flex-shrink-0" />
              <span>
                Tip: <kbd className="px-1 bg-white border rounded font-mono">Shift</kbd>+click any sub-part of the product to edit just that piece.
              </span>
            </div>
          )}
          {!embedded && target.kind === 'van' && !isPartSelected && (
            <div className="mt-1.5 flex items-start gap-1.5 text-[10px] text-gray-500 bg-amber-50 border border-amber-200 rounded p-1.5">
              <Info className="w-3 h-3 mt-0.5 text-amber-600 flex-shrink-0" />
              <span>Click any panel on the van to edit just that piece.</span>
            </div>
          )}
        </div>

        <div className="flex border-b border-gray-100 bg-white">
          {TABS.map(({ key, label, icon: Icon }) => {
            const disabled = key === 'parts' && (target.kind !== 'product' || meshNames.length === 0);
            if (disabled) return null;
            const active = tab === key;
            return (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex-1 py-2.5 text-xs font-medium inline-flex items-center justify-center gap-1.5 transition-colors ${
                  active
                    ? 'text-gray-900 border-b-2 border-[#f5c34b]'
                    : 'text-gray-500 hover:text-gray-800 border-b-2 border-transparent'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {tab === 'material' && (
            <div className="grid grid-cols-2 gap-2">
              {PRESET_ORDER.map((key) => {
                const p = MATERIAL_PRESETS[key];
                const active = preset === key || (!preset && key === 'original');
                return (
                  <button
                    key={key}
                    onClick={() => handlePresetChange(key)}
                    className={`group relative p-2.5 rounded-lg border-2 text-left transition-all overflow-hidden ${
                      active
                        ? 'border-[#f5c34b] bg-amber-50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-400 bg-white hover:shadow-sm'
                    }`}
                    title={p.description}
                  >
                    <div
                      className="w-full h-14 rounded-md border border-black/10 mb-2"
                      style={{ background: p.swatch }}
                    />
                    <div className="text-xs font-semibold text-gray-900">
                      {p.label}
                    </div>
                    <div className="text-[10px] text-gray-500 leading-tight mt-0.5 line-clamp-2">
                      {p.description}
                    </div>
                    {active && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#f5c34b]" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {tab === 'color' && (
            <div>
              <HexColorPicker
                color={color || '#ffffff'}
                onChange={callbacks.onColorChange}
                style={{ width: '100%', height: 160 }}
              />
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-medium text-gray-600">
                    {preset !== 'original' && MATERIAL_PRESETS[preset]
                      ? `${MATERIAL_PRESETS[preset].label} palette`
                      : 'Suggested colors'}
                  </span>
                </div>
                <div className="grid grid-cols-8 gap-1.5">
                  {palette.map((swatch) => (
                    <button
                      key={swatch}
                      onClick={() => callbacks.onColorChange?.(swatch)}
                      className={`w-full aspect-square rounded border-2 transition-transform hover:scale-110 ${
                        color?.toLowerCase() === swatch.toLowerCase()
                          ? 'border-[#f5c34b] scale-110 shadow-sm'
                          : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: swatch }}
                      aria-label={`Color ${swatch}`}
                      title={swatch}
                    />
                  ))}
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs">
                <span className="text-gray-500">Hex:</span>
                <code className="flex-1 px-2 py-1 bg-gray-50 rounded font-mono">
                  {(color || '#ffffff').toUpperCase()}
                </code>
              </div>
            </div>
          )}

          {tab === 'parts' && target.kind === 'product' && (
            <div className="space-y-1">
              <button
                onClick={() => callbacks.onSelectPart?.(null)}
                className={`w-full text-left px-2.5 py-1.5 text-xs rounded transition-colors ${
                  !target.partName
                    ? 'bg-amber-50 text-gray-900 ring-1 ring-[#f5c34b]'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <span className="font-semibold">Whole product</span>
              </button>
              <div className="pt-1.5 text-[10px] font-medium uppercase tracking-wider text-gray-400 px-2">
                Parts ({meshNames.length})
              </div>
              <div className="max-h-[calc(100vh-420px)] overflow-y-auto">
                {meshNames.map((name) => (
                  <button
                    key={name}
                    onClick={() => callbacks.onSelectPart?.(name)}
                    className={`w-full text-left px-2.5 py-1.5 text-xs rounded transition-colors font-mono truncate ${
                      target.partName === name
                        ? 'bg-amber-50 text-gray-900 ring-1 ring-[#f5c34b]'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                    title={name}
                  >
                    {name}
                  </button>
                ))}
                {meshNames.length === 0 && (
                  <div className="text-xs text-gray-400 text-center py-4">
                    No named sub-parts detected.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <button
            onClick={callbacks.onReset}
            className="inline-flex items-center gap-1 text-xs font-medium text-gray-700 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
            title={isPartSelected ? 'Reset only the selected part' : 'Reset whole target'}
          >
            <RefreshCw className="w-3 h-3" />
            {isPartSelected ? 'Reset part' : 'Reset'}
          </button>
          {callbacks.onResetAll && (
            <button
              onClick={callbacks.onResetAll}
              className="text-xs text-red-600 hover:text-red-800 hover:underline"
              title="Reset all customization (whole + every part)"
            >
              Reset all
            </button>
          )}
          <span className="text-[10px] text-gray-400">
            <kbd className="px-1 py-0.5 bg-white border rounded">Esc</kbd>
          </span>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
};

export default CustomizePanel;
