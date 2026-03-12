import React, { useState, useRef } from 'react';
import { Upload, Trash2, Clock, Save, FolderOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconButton } from '../ui/IconButton';
import useClickOutside from '../../hooks/useClickOutside';

export const BuildDropdown = ({ builds, onLoad, onDelete }) => {
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

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <IconButton 
        icon={FolderOpen} 
        tooltip="Saved Builds"
        onClick={toggleDropdown}
        className={isOpen ? 'bg-gray-100' : ''}
      />

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={dropdownVariants}
            className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-30 overflow-hidden"
          >
            <div className="p-2 border-b border-gray-200 bg-gray-50">
              <div className="px-3 py-2">
                <h3 className="text-sm font-medium text-gray-900">Saved Builds</h3>
                <p className="text-xs text-gray-500">Load or manage your saved configurations</p>
              </div>
            </div>

            <div className="max-h-[300px] overflow-y-auto">
              {builds.length === 0 ? (
                <div className="p-8 text-center">
                  <Save className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm font-medium text-gray-900">No saved builds</p>
                  <p className="mt-1 text-xs text-gray-500">Save your first build to see it here</p>
                </div>
              ) : (
                <div className="p-1">
                  {builds.map((build) => (
                    <motion.div 
                      key={build.timestamp}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group flex items-center justify-between p-2 hover:bg-gray-50 
                               rounded-md cursor-pointer transition-colors duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-md bg-blue-50 group-hover:bg-blue-100 
                                    transition-colors duration-200">
                          <Save className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-700">
                            {build.title}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(build.timestamp)}
                          </div>
                        </div>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onLoad(build);
                            setIsOpen(false);
                          }}
                          className="p-1.5 rounded-md hover:bg-blue-50 text-gray-400 
                                   hover:text-blue-600 transition-colors duration-200"
                        >
                          <Upload className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(build.timestamp);
                          }}
                          className="p-1.5 rounded-md hover:bg-red-50 text-gray-400 
                                   hover:text-red-600 transition-colors duration-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
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