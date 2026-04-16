import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Keyboard, X } from 'lucide-react';

const SHORTCUTS = [
  {
    group: 'Navigation',
    items: [
      ['Change camera view', 'Click "Change view" bottom-right'],
      ['Zoom in / out', 'Scroll wheel or +/- buttons'],
      ['Inner zoom (cinematic)', 'FastForward button'],
      ['Toggle sidebar / navbar', 'Chevron button (top-left)'],
    ],
  },
  {
    group: 'Placing products',
    items: [
      ['Add product to van', 'Click + on product card'],
      ['Move product', 'Drag product in any non-default view'],
      ['Vertical move', 'Hover + ↑ / ↓ (certain products)'],
      ['Open product tools', 'Double-click placed product'],
    ],
  },
  {
    group: 'Customize (NEW)',
    items: [
      ['Open Customize panel', 'Double-click product → Customize'],
      ['Edit just one part of a product', 'Shift + click the sub-mesh'],
      ['Revert to whole product', 'Click "Whole product" in panel'],
      ['Paint the van itself', 'Brush icon in top navbar'],
      ['Pick a van part to paint', 'Click the body part in paint mode'],
      ['Close any panel', 'Esc'],
    ],
  },
  {
    group: 'Environment',
    items: [
      ['Change lighting mood', 'Sun icon in top navbar'],
      ['Day / Sunset / Night / Studio', 'Choose from dropdown'],
    ],
  },
  {
    group: 'Saving',
    items: [
      ['Save current build', 'Save icon in navbar'],
      ['Load saved build', 'Build dropdown'],
      ['Export as preset JSON', 'Preset dropdown → Save preset'],
      ['Take screenshot', 'Camera icon in navbar'],
    ],
  },
  {
    group: 'This help',
    items: [
      ['Show / hide this panel', '? or Shift + /'],
    ],
  },
];

const ShortcutsHelp = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleKey = (e) => {
      const target = e.target;
      const isTyping =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);
      if (isTyping) return;

      if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 left-4 z-20 w-9 h-9 bg-white rounded-full shadow-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
        aria-label="Show keyboard shortcuts"
        title="Shortcuts (?)"
      >
        <Keyboard className="w-4 h-4 text-gray-700" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 20 }}
              transition={{ duration: 0.18 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[82vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Keyboard className="w-5 h-5 text-[#f5c34b]" />
                  <h2 className="text-lg font-semibold text-gray-900">Shortcuts & Tips</h2>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {SHORTCUTS.map((section) => (
                  <div key={section.group}>
                    <h3 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">
                      {section.group}
                    </h3>
                    <ul className="space-y-1.5">
                      {section.items.map(([label, hint]) => (
                        <li
                          key={label}
                          className="flex items-start justify-between gap-3 text-sm"
                        >
                          <span className="text-gray-700">{label}</span>
                          <span className="text-gray-500 text-xs text-right whitespace-nowrap">
                            {hint.split(/(\+|\/)/g).map((part, i) => {
                              const trimmed = part.trim();
                              if (!trimmed || trimmed === '+' || trimmed === '/') {
                                return <span key={i} className="mx-0.5">{part}</span>;
                              }
                              if (/^[A-Za-z0-9↑↓←→?]$|^(Esc|Shift|Ctrl|Alt|Cmd)$/.test(trimmed)) {
                                return (
                                  <kbd
                                    key={i}
                                    className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-[10px] font-mono text-gray-700"
                                  >
                                    {trimmed}
                                  </kbd>
                                );
                              }
                              return <span key={i}>{part}</span>;
                            })}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-[11px] text-gray-500 flex items-center justify-between">
                <span>
                  Press <kbd className="px-1 py-0.5 bg-white border rounded">?</kbd> anywhere to toggle this panel
                </span>
                <span>Van Configurator</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ShortcutsHelp;
