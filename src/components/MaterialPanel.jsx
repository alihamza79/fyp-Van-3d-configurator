import React, { useEffect, useRef, useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RefreshCw, Palette, Droplet, MousePointer2 } from 'lucide-react';
import { MATERIAL_PRESETS, PRESET_ORDER, DEFAULT_COLOR_PALETTE } from '../data/materialPresets';

const MaterialPanel = ({
  open,
  onClose,
  color,
  materialPreset,
  onColorChange,
  onPresetChange,
  onReset,
  onResetAll,
  title = 'Customize',
  selectedPartLabel = 'Whole product',
  canTargetParts = false,
  onClearTarget,
  partList = [],
  onSelectPart,
}) => {
  const isPartSelected = selectedPartLabel && selectedPartLabel !== 'Whole product' && selectedPartLabel !== 'Whole body';
  const [tab, setTab] = useState('color');
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, y: 10, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.97 }}
          transition={{ duration: 0.18 }}
          className="w-[280px] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-[#f5c34b]" />
              <span className="text-sm font-semibold text-gray-900">{title}</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-gray-100 text-gray-500"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="px-4 pt-3 pb-1 flex items-center justify-between text-[11px] text-gray-600">
            <span className="inline-flex items-center gap-1">
              <MousePointer2 className="w-3 h-3" />
              Editing:
              <span className="font-semibold text-gray-900 ml-1 truncate max-w-[140px]">
                {selectedPartLabel}
              </span>
            </span>
            {canTargetParts && selectedPartLabel !== 'Whole product' && (
              <button
                onClick={onClearTarget}
                className="text-blue-600 hover:underline"
              >
                Whole product
              </button>
            )}
          </div>

          <div className="flex border-b border-gray-100 px-2">
            <button
              onClick={() => setTab('color')}
              className={`flex-1 py-2 text-xs font-medium transition-colors inline-flex items-center justify-center gap-1 ${
                tab === 'color'
                  ? 'text-gray-900 border-b-2 border-[#f5c34b]'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Droplet className="w-3 h-3" /> Color
            </button>
            <button
              onClick={() => setTab('material')}
              className={`flex-1 py-2 text-xs font-medium transition-colors inline-flex items-center justify-center gap-1 ${
                tab === 'material'
                  ? 'text-gray-900 border-b-2 border-[#f5c34b]'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Palette className="w-3 h-3" /> Material
            </button>
            {canTargetParts && partList.length > 0 && (
              <button
                onClick={() => setTab('parts')}
                className={`flex-1 py-2 text-xs font-medium transition-colors ${
                  tab === 'parts'
                    ? 'text-gray-900 border-b-2 border-[#f5c34b]'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                Parts
              </button>
            )}
          </div>

          <div className="p-4">
            {tab === 'color' && (
              <>
                <HexColorPicker
                  color={color || '#ffffff'}
                  onChange={onColorChange}
                  style={{ width: '100%', height: 140 }}
                />
                <div className="mt-3 grid grid-cols-6 gap-1.5">
                  {DEFAULT_COLOR_PALETTE.map((swatch) => (
                    <button
                      key={swatch}
                      onClick={() => onColorChange(swatch)}
                      className={`w-full aspect-square rounded border-2 transition-transform hover:scale-110 ${
                        color?.toLowerCase() === swatch.toLowerCase()
                          ? 'border-[#f5c34b] scale-110'
                          : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: swatch }}
                      aria-label={`Color ${swatch}`}
                    />
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs">
                  <span className="text-gray-500">Hex:</span>
                  <code className="flex-1 px-2 py-1 bg-gray-50 rounded font-mono">
                    {(color || '#ffffff').toUpperCase()}
                  </code>
                </div>
              </>
            )}

            {tab === 'material' && (
              <div className="grid grid-cols-2 gap-2">
                {PRESET_ORDER.map((key) => {
                  const preset = MATERIAL_PRESETS[key];
                  const active = materialPreset === key || (!materialPreset && key === 'original');
                  return (
                    <button
                      key={key}
                      onClick={() => onPresetChange(key)}
                      className={`p-2.5 rounded-lg border-2 text-left transition-all ${
                        active
                          ? 'border-[#f5c34b] bg-amber-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                      title={preset.description}
                    >
                      <div className="text-xs font-semibold text-gray-900">{preset.label}</div>
                      <div className="text-[10px] text-gray-500 leading-tight mt-0.5 line-clamp-2">
                        {preset.description}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {tab === 'parts' && canTargetParts && (
              <div className="max-h-56 overflow-y-auto space-y-1">
                <button
                  onClick={() => onSelectPart(null)}
                  className={`w-full text-left px-2 py-1.5 text-xs rounded transition-colors ${
                    !selectedPartLabel || selectedPartLabel === 'Whole product'
                      ? 'bg-amber-50 text-gray-900'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <span className="font-semibold">Whole product</span>
                </button>
                {partList.map((name) => (
                  <button
                    key={name}
                    onClick={() => onSelectPart(name)}
                    className={`w-full text-left px-2 py-1.5 text-xs rounded transition-colors font-mono truncate ${
                      selectedPartLabel === name
                        ? 'bg-amber-50 text-gray-900'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                    title={name}
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-t border-gray-100 gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={onReset}
                className="inline-flex items-center gap-1 text-xs font-medium text-gray-700 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
                title={isPartSelected ? `Reset only the selected part` : `Reset the whole product`}
              >
                <RefreshCw className="w-3 h-3" />
                {isPartSelected ? 'Reset part' : 'Reset'}
              </button>
              {onResetAll && (
                <button
                  onClick={onResetAll}
                  className="text-xs text-red-600 hover:text-red-800 hover:underline"
                  title="Reset all customization (whole product + every part)"
                >
                  Reset all
                </button>
              )}
            </div>
            <span className="text-[10px] text-gray-400">
              <kbd className="px-1 py-0.5 bg-white border rounded">Esc</kbd>
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MaterialPanel;
