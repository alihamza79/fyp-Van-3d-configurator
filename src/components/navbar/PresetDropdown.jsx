import React, { useState, useRef } from 'react';
import { ChevronDown, Save, Bookmark, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useClickOutside from '../../hooks/useClickOutside';

const PresetDropdown = ({ presets, onLoad, onSave }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useClickOutside(dropdownRef, () => setIsOpen(false));

  const toggleDropdown = () => setIsOpen(!isOpen);

  const dropdownVariants = {
    hidden: { 
      opacity: 0,
      y: -10,
      scale: 0.95
    },
    visible: { 
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: {
        duration: 0.15,
        ease: "easeIn"
      }
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="flex items-center gap-2.5 border border-gray-300 rounded-lg px-4 py-2.5 
                 hover:bg-gray-50 transition-colors duration-200 
                 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent
                 active:bg-gray-100"
      >
        <Bookmark className="h-4 w-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">Presets</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={dropdownVariants}
            className="absolute right-0 mt-3 w-[420px] bg-white rounded-xl shadow-lg border border-gray-200 z-30 overflow-hidden"
          >
            <div className="p-3 border-b border-gray-200 bg-gray-50/80">
              <button 
                onClick={() => { onSave(); setIsOpen(false); }} 
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 
                         hover:bg-yellow-50 rounded-lg transition-all duration-200
                         hover:shadow-sm active:bg-yellow-100"
              >
                <Save className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Save Current as Preset</span>
              </button>
            </div>

            <div className="max-h-[460px] overflow-y-auto p-3">
              {presets.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                    <Bookmark className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">No presets available</p>
                  <p className="mt-1 text-xs text-gray-500">Save your first preset to see it here</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {presets.map((preset) => (
                    <motion.div 
                      key={preset.timestamp}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group relative rounded-xl overflow-hidden cursor-pointer 
                               hover:ring-2 hover:ring-yellow-400 transition-all duration-200
                               shadow-sm hover:shadow-md"
                      onClick={() => { onLoad(preset); setIsOpen(false); }}
                    >
                      {/* Preview Image */}
                      <div className="aspect-[3/2] bg-gray-100 overflow-hidden">
                        <img 
                          src={preset.previewImage || '/default-preset-preview.jpg'} 
                          alt={preset.title}
                          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      {/* Overlay with Title */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent 
                                    opacity-0 group-hover:opacity-100 transition-all duration-200">
                        <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-between">
                          <span className="text-sm font-medium text-white truncate pr-2">
                            {preset.title}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Add delete handler here if needed
                            }}
                            className="p-1.5 rounded-full bg-black/40 hover:bg-red-500/90 
                                     text-white/80 hover:text-white transition-all duration-200
                                     hover:shadow-lg"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PresetDropdown; 