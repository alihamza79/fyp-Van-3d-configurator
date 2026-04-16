import React, { useState, useEffect } from 'react';
import { ChevronLeft, Camera, Save, ShoppingCart, X, Brush } from 'lucide-react';
import { motion } from 'framer-motion';
import { useProductStore } from '../store/productStore';
import { useBuildStore } from '../store/buildStore';
import { useVanCustomizationStore } from '../store/vanCustomizationStore';
import toast from 'react-hot-toast';
import { IconButton } from './ui/IconButton';
import { Tooltip } from './ui/Tooltip';
import { PriceTag } from './navbar/PriceTag';
import { BuildDropdown } from './navbar/BuildDropdown';
import PresetDropdown from './navbar/PresetDropdown';
import { LightingDropdown } from './navbar/LightingDropdown';
import { saveAs } from 'file-saver';

import presetsData from '../data/presets.json';

const springConfig = {
  type: "spring",
  stiffness: 100,
  damping: 20,
  duration: 0.8
};

// Utility function to capture and save canvas snapshot
const captureCanvasSnapshot = async (fileName, onSuccess, onError) => {
  const canvas = document.querySelector('canvas');
  if (!canvas) {
    toast.error('Canvas not found for snapshot capture.');
    onError?.();
    return;
  }

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        saveAs(blob, fileName);
        toast.success(onSuccess || 'Snapshot saved successfully!');
        resolve(true);
      } else {
        toast.error('Failed to capture snapshot.');
        onError?.();
        resolve(false);
      }
    }, 'image/png');
  });
};

// Utility function to load build data
const loadBuildData = (data, setCameraConfig) => {
  setCameraConfig(data.cameraConfig);
  useProductStore.getState().setVanProducts(data.vanProducts);
  data.vanProducts.forEach(product => 
    useProductStore.getState().setProductVisibility(product.id, true)
  );
  useBuildStore.getState().setLoadedProductInstances(data.productInstances);
};

const Navbar = ({ toggleSidebar, isSidebarOpen, isNavbarVisible, cameraConfig, setCameraConfig }) => {
  const [title, setTitle] = useState('Untitled Design');
  const [isEditing, setIsEditing] = useState(false);
  const [savedBuilds, setSavedBuilds] = useState([]);
  const [presets, setPresets] = useState(presetsData);

  const vanProducts = useProductStore(state => state.vanProducts);
  const productInstances = useBuildStore(state => state.productInstances);
  const quantity = useProductStore((state) => state.vanProducts.length);
  const paintMode = useVanCustomizationStore((state) => state.paintMode);
  const setPaintMode = useVanCustomizationStore((state) => state.setPaintMode);

  useEffect(() => {
    loadSavedBuilds();
  }, []);

  const loadSavedBuilds = () => {
    const builds = JSON.parse(localStorage.getItem('builds') || '[]');
    setSavedBuilds(builds.sort((a, b) => b.timestamp - a.timestamp));
  };

  const handleSaveBuild = () => {
    const buildData = {
      title,
      timestamp: Date.now(),
      data: { cameraConfig, vanProducts, productInstances }
    };

    const existingBuilds = JSON.parse(localStorage.getItem('builds') || '[]');
    const updatedBuilds = [buildData, ...existingBuilds];
    localStorage.setItem('builds', JSON.stringify(updatedBuilds));
    setSavedBuilds(updatedBuilds);
    toast.success("Build saved successfully!");
  };

  const handleLoadBuild = (build) => {
    loadBuildData(build.data, setCameraConfig);
    setTitle(build.title);
    toast.success("Build loaded successfully!");
  };

  const handleDeleteBuild = (timestamp) => {
    const updatedBuilds = savedBuilds.filter(build => build.timestamp !== timestamp);
    localStorage.setItem('builds', JSON.stringify(updatedBuilds));
    setSavedBuilds(updatedBuilds);
    toast.success("Build deleted successfully!");
  };

  const handleLoadPreset = (preset) => {
    loadBuildData(preset.data, setCameraConfig);
    setTitle(preset.title);
    toast.success("Preset loaded successfully!");
  };

  const handleSavePreset = async () => {
    const presetData = {
      title,
      timestamp: Date.now(),
      data: { cameraConfig, vanProducts, productInstances }
    };
    const updatedPresets = [presetData, ...presets];
    setPresets(updatedPresets);

    // Download JSON preset
    const json = JSON.stringify(updatedPresets, null, 2);
    const jsonBlob = new Blob([json], { type: 'application/json;charset=utf-8' });
    saveAs(jsonBlob, 'preset.json');

    // Capture and save snapshot
    await captureCanvasSnapshot(
      'preset.png',
      'Preset and snapshot saved and downloaded successfully!'
    );
  };

  const handleTakeSnapshot = async () => {
    const fileName = `${title.toLowerCase().replace(/\s+/g, '-')}.png`;
    await captureCanvasSnapshot(fileName);
  };

  return (
    <>
      <motion.div 
        className="w-full h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 fixed top-0 left-0 z-20"
        animate={{ 
          y: isNavbarVisible ? 0 : -64,
          opacity: isNavbarVisible ? 1 : 0
        }}
        transition={springConfig}
      >
        <div className="flex items-center gap-6">
          <img src="/Logo/logo.svg" alt="IKEA" className="h-8 w-auto" />
          <motion.div 
            className="flex items-center gap-2"
            animate={{ paddingLeft: isSidebarOpen ? '10rem' : '1rem' }}
            transition={springConfig}
          >
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onFocus={() => setIsEditing(true)}
              onBlur={() => setIsEditing(false)}
              className={`text-gray-900 font-medium bg-transparent border-b ml-10 ${
                isEditing ? 'border-gray-400' : 'border-transparent'
              } focus:outline-none transition-colors duration-300`}
            />
          </motion.div>
        </div>

        <div className="flex items-center gap-4">
          <Tooltip content={paintMode ? 'Exit Paint Mode' : 'Paint Van Exterior'}>
            <button
              onClick={() => setPaintMode(!paintMode)}
              className={`p-1.5 rounded-full transition-colors ${
                paintMode
                  ? 'bg-[#f5c34b] text-gray-900 shadow-sm'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
              aria-label="Paint Van"
            >
              <Brush className="w-5 h-5" />
            </button>
          </Tooltip>
          <LightingDropdown />
          <IconButton icon={Camera} onClick={handleTakeSnapshot} tooltip="Take Screenshot" />
          <IconButton icon={Save} onClick={handleSaveBuild} tooltip="Save Current Build" />
          
          <BuildDropdown 
            builds={savedBuilds}
            onLoad={handleLoadBuild}
            onDelete={handleDeleteBuild}
          />
          <PresetDropdown 
            presets={presets} 
            onLoad={handleLoadPreset} 
            onSave={handleSavePreset}
          />
          <div className="relative">
            <IconButton icon={ShoppingCart} tooltip="Shopping Cart" />
            {quantity > 0 && (
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 bg-red-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
                {quantity}
              </div>
            )}
          </div>
          <PriceTag />
          <IconButton icon={X} tooltip="Close Editor" />
        </div>
      </motion.div>

      {/* Single toggle button for all states */}
      <motion.div
        className="fixed z-30"
        animate={{ 
          left: !isNavbarVisible ? "1rem" : isSidebarOpen ? "17rem" : "9rem",
          top: isNavbarVisible ? "0.75rem" : "1rem",
        }}
        transition={springConfig}
      >
        <motion.button 
          onClick={toggleSidebar} 
          className="flex items-center justify-center h-10 w-10 rounded-full hover:bg-[#F5C34B] border-2 border-gray-100 bg-white shadow-md"
          animate={{ 
            rotate: 
              // Step 1: Sidebar is open, Navbar is open - Left arrow (0)
              (isNavbarVisible && isSidebarOpen) ? 0 :
              // Step 2: Sidebar is closed, Navbar is open - Up arrow (-90)
              (isNavbarVisible && !isSidebarOpen) ? 90 :
              // Step 3: Both are closed - Down arrow (90)
              (!isNavbarVisible && !isSidebarOpen) ? 180 :
              // Step 4: Showing Sidebar - Right arrow (180)
              180,
            scale: 1
          }}
          whileHover={{ scale: 1.05 }}
          transition={springConfig}
        >
          <ChevronLeft className="h-6 w-6 text-gray-700" />
        </motion.button>
      </motion.div>
    </>
  );
};

export default Navbar;