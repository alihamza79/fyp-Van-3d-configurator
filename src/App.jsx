// App.jsx
import { useState } from 'react';
import { FiMenu } from 'react-icons/fi';
import { ZoomIn, ZoomOut, FastForward } from 'lucide-react';
import { motion, animate } from 'framer-motion';
import Scene from './components/Scene';
import Sidebar from './components/Sidebar';
import ViewSelector from './components/ViewSelector';
import Navbar from './components/Navbar';
import VanPaintPanel from './components/VanPaintPanel';
import CustomizePanel from './components/CustomizePanel';
import CustomizeWorkspace from './components/CustomizeWorkspace';
import ShortcutsHelp from './components/ShortcutsHelp';
import { Toaster } from 'react-hot-toast';
import {useProductStore} from './store/productStore';
import { useCustomizePanelStore } from './store/customizePanelStore';

const App = () => {
  const [cameraPosition, setCameraPosition] = useState([5, 2, 5]);
  const [lookAt, setLookAt] = useState([0, 0, 0]);
  const [view, setView] = useState('default');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [toggleState, setToggleState] = useState(0); // 0: all visible, 1: sidebar hidden, 2: both hidden, 3: navbar visible
  const [isViewSelectorOpen, setIsViewSelectorOpen] = useState(false);
  const [fov, setFov] = useState(50); // Default FOV
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isZooming, setIsZooming] = useState(false);
  const [isInnerZooming, setIsInnerZooming] = useState(false);

  const minZoomLevel = 0.2;
  const maxZoomLevel = 4;
  const maxInnerZoomDistance = 20;

  const setCameraConfig = (config) => {
    setCameraPosition(config.cameraPosition);
    setLookAt(config.lookAt);
    setView(config.view);
    setFov(config.fov);
  };

  const handleZoom = (direction) => {
    if (isZooming) return;
    setIsZooming(true);
    
    const targetZoom = direction === 'in' 
      ? Math.max(zoomLevel * 0.9, minZoomLevel)
      : Math.min(zoomLevel * 1.1, maxZoomLevel);

    animate(zoomLevel, targetZoom, {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
      onUpdate: (latest) => setZoomLevel(latest),
      onComplete: () => setIsZooming(false)
    });
  };

  const handleInnerZoom = () => {
    if (isInnerZooming) {
      setIsInnerZooming(false);
      return;
    }
    setIsInnerZooming(true);
    const initialInnerZoomPos = cameraPosition;

    const moveIteration = (startPos) => {
      const [cx, cy, cz] = startPos;
      const dx = lookAt[0] - cx;
      const dy = lookAt[1] - cy;
      const dz = lookAt[2] - cz;
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
      const ndx = dx / distance;
      const ndy = dy / distance;
      const ndz = dz / distance;

      let lastValue = 0;
      animate(0, 1.5, {
        duration: 5,
        ease: 'linear',
        onUpdate: (latest) => {
          const delta = latest - lastValue;
          lastValue = latest;
          setCameraPosition(prev => [prev[0] + delta * ndx, prev[1] + delta * ndy, prev[2] + delta * ndz]);
        },
        onComplete: () => {
          const traveled = Math.sqrt(
            Math.pow(cameraPosition[0] - initialInnerZoomPos[0], 2) +
            Math.pow(cameraPosition[1] - initialInnerZoomPos[1], 2) +
            Math.pow(cameraPosition[2] - initialInnerZoomPos[2], 2)
          );
          if (!isInnerZooming || traveled >= maxInnerZoomDistance) {
            setIsInnerZooming(false);
          } else {
            moveIteration(cameraPosition);
          }
        }
      });
    };

    moveIteration(cameraPosition);
  };

  const handleToggle = () => {
    setToggleState((prev) => (prev + 1) % 4);
    
    // Update sidebar and navbar visibility based on toggle state
    switch ((toggleState + 1) % 4) {
      case 0: // Both visible
        setIsSidebarOpen(true);
        setIsNavbarVisible(true);
        break;
      case 1: // Sidebar hidden
        setIsSidebarOpen(false);
        setIsNavbarVisible(true);
        break;
      case 2: // Both hidden
        setIsSidebarOpen(false);
        setIsNavbarVisible(false);
        break;
      case 3: // Only navbar visible
        setIsSidebarOpen(false);
        setIsNavbarVisible(true);
        break;
    }
  };

  // Retrieve the products from the global product store.
  const products = useProductStore((state) => state.products);

  // When a dedicated customize workspace is active, hide the main scene UI
  // (navbar, sidebar, canvas, zoom, view selector) so the user has the full
  // viewport for picking colors/materials on the selected product. We hide
  // (not unmount) so state like current view/camera/zoom is preserved when
  // the user exits the workspace.
  const workspace = useCustomizePanelStore((s) => s.workspace);

  return (
    <>
      <div
        className="flex h-screen bg-gray-100"
        style={workspace ? { visibility: 'hidden', pointerEvents: 'none' } : undefined}
        aria-hidden={workspace ? 'true' : 'false'}
      >
        <Navbar 
          toggleSidebar={handleToggle}
          isSidebarOpen={isSidebarOpen}
          isNavbarVisible={isNavbarVisible}
          cameraConfig={{ cameraPosition, lookAt, view, fov }}
          setCameraConfig={setCameraConfig}
        />
        <Sidebar isOpen={isSidebarOpen} />
        <div className={`flex-grow relative transition-all duration-300 ${isSidebarOpen ? 'ml-72' : 'ml-0'}`}>
         

          {/* Scene Container */}
          <div className={`w-full h-full transition-all duration-300 ${isSidebarOpen || isViewSelectorOpen ? 'p-4' : 'p-0'}`}>
            <Scene
              products={products.filter(product => product.visible)}
              cameraPosition={cameraPosition}
              lookAt={lookAt}
              view={view}
              fov={fov}
            />
          </div>

          {/* Zoom Controls */}
          <div className="absolute bottom-20 right-4 flex flex-col gap-2 z-20">
            <motion.button 
              onClick={() => handleZoom('in')}
              disabled={isZooming}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={`p-1.5 bg-white rounded-full shadow-md transition-opacity ${
                isZooming ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              aria-label="Zoom In"
            >
              <ZoomIn className="w-5 h-5" />
            </motion.button>
            <motion.button 
              onClick={() => handleZoom('out')}
              disabled={isZooming}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={`p-1.5 bg-white rounded-full shadow-md transition-opacity ${
                isZooming ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              aria-label="Zoom Out"
            >
              <ZoomOut className="w-5 h-5" />
            </motion.button>
            <motion.button 
              onClick={handleInnerZoom}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={`p-1.5 bg-white rounded-full shadow-md transition-opacity ${
                isInnerZooming ? 'bg-green-200' : ''
              }`}
              aria-label="Inner Zoom"
            >
              <FastForward className="w-5 h-5" />
            </motion.button>
          </div>

          {/* View Selector */}
          <ViewSelector
            setCameraPosition={setCameraPosition}
            setLookAt={setLookAt}
            setView={setView}
            setFov={setFov}
            isOpen={isViewSelectorOpen}
            setIsOpen={setIsViewSelectorOpen}
            zoomLevel={zoomLevel}
            setZoomLevel={setZoomLevel}
          />
        </div>
      </div>
      <VanPaintPanel />
      <CustomizePanel />
      <CustomizeWorkspace />
      <ShortcutsHelp />
      <Toaster />
    </>
  );
};

export default App;
