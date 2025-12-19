import { useState, useEffect } from 'react';
import { Html } from '@react-three/drei';

const LoadingScreen = ({ onLoadingComplete }) => {
  const [loadingText, setLoadingText] = useState('Initializing Environment...');
  
  const loadingTexts = [
    'Sculpting Digital Garage...',
    'Illuminating Scene...',
    'Engaging Physics Engine...',
    'Aligning Camera Optics...',
    'Launching Your Van...'
  ];

  useEffect(() => {
    let currentIndex = 0;
    
    // Change text every 400ms
    const textInterval = setInterval(() => {
      currentIndex = (currentIndex + 1) % loadingTexts.length;
      setLoadingText(loadingTexts[currentIndex]);
    }, 1500);

    // Complete loading after 4 seconds
    const timer = setTimeout(() => {
      clearInterval(textInterval);
      onLoadingComplete();
    }, 30000);

    return () => {
      clearInterval(textInterval);
      clearTimeout(timer);
    };
  }, []);

  return (
    <Html fullscreen>
      <div className="w-full  h-full flex items-center justify-center bg-white">
        <div className="flex flex-col items-center">
          {/* Loader circle */}
          <div className="w-16 h-16 relative">
            <div className="absolute inset-0">
              <div className="w-full h-full rounded-full border-4 border-[#e6e6e6]"></div>
            </div>
            <div className="absolute inset-0">
              <div className="w-full h-full rounded-full border-4 border-t-[#F5C34B] animate-spin"></div>
            </div>
            {/* Center square */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 bg-[#F5C34B] rounded"></div>
            </div>
          </div>
          
          {/* Loading text */}
          <h2 className="mt-4 text-xl font-semibold">Setting up</h2>
          <p className="mt-2 text-sm text-gray-500">{loadingText}</p>
        </div>
      </div>
    </Html>
  );
};

export default LoadingScreen; 