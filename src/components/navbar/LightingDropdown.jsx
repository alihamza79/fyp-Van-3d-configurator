import React, { useState, useRef } from 'react';
import { Sun, Moon, Sunrise, Lightbulb, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEnvironmentStore } from '../../store/environmentStore';
import { LIGHTING_PRESETS, LIGHTING_PRESET_ORDER } from '../../data/lightingPresets';
import useClickOutside from '../../hooks/useClickOutside';
import { Tooltip } from '../ui/Tooltip';

const ICONS = {
  day: Sun,
  sunset: Sunrise,
  night: Moon,
  studio: Lightbulb,
};

export const LightingDropdown = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = useEnvironmentStore((s) => s.lightingPreset);
  const setLightingPreset = useEnvironmentStore((s) => s.setLightingPreset);

  useClickOutside(ref, () => setOpen(false));

  const Current = ICONS[current] || Sun;

  return (
    <div ref={ref} className="relative">
      <Tooltip content="Lighting">
        <button
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-1 px-2 py-1.5 rounded-full hover:bg-gray-100 transition-colors text-gray-700"
        >
          <Current className="w-5 h-5" />
          <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </Tooltip>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-40"
          >
            <div className="px-3 py-2 text-[10px] font-bold uppercase text-gray-400 border-b border-gray-100">
              Lighting preset
            </div>
            {LIGHTING_PRESET_ORDER.map((key) => {
              const Icon = ICONS[key];
              const active = current === key;
              return (
                <button
                  key={key}
                  onClick={() => {
                    setLightingPreset(key);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                    active ? 'bg-amber-50 text-gray-900' : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{LIGHTING_PRESETS[key].label}</span>
                  {active && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#f5c34b]" />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LightingDropdown;
