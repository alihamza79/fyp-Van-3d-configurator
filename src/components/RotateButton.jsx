import { FiRotateCcw } from 'react-icons/fi'; // Import the rotate icon
import { Html } from '@react-three/drei';
import React, { useRef, useState } from 'react';
import { ShoppingBag, Replace, Grid, Copy, Trash, Play } from 'lucide-react'; // Import Play icon
import useClickOutside from '../hooks/useClickOutside'; // Import the custom hook
import DiscreteSlider from './DiscreteSlider'; // Import the DiscreteSlider component

const RotateButton = ({ position, rotationY, setRotationY, onCopy, onRemove, onClose, onPlayAnimation, isAnimationComplete, resetAnimation }) => {
  const buttonRef = useRef(null); // Create a ref for the button container
  const [isSliderVisible, setIsSliderVisible] = useState(false); // State to control slider visibility

  useClickOutside(buttonRef, onClose); // Use the custom hook to detect clicks outside

  const tools = [
    { icon: ShoppingBag, label: 'Add' },
    { 
      icon: FiRotateCcw, // Use the rotate icon
      label: 'Rotate',
      onClick: () => setIsSliderVisible((prev) => !prev), // Toggle slider visibility
    },
    { icon: Replace, label: 'Replace' },
    { icon: Grid, label: 'Goes with' },
    { icon: Copy, label: 'Make copy', onClick: onCopy },
    { 
      icon: Play, 
      label: isAnimationComplete ? 'Reset' : 'Open', // Change label based on animation state
      onClick: isAnimationComplete ? resetAnimation : onPlayAnimation, // Use resetAnimation if animation is complete
    },
    { icon: Trash, label: 'Remove', onClick: onRemove },
  ];

  return (
    <Html position={[position[0], position[1] + 0.5, position[2]]} center>
      <div ref={buttonRef} className="bg-zinc-900 rounded-full px-4 py-1 inline-flex items-center gap-3 relative">
        {tools.map((tool, index) => {
          const Icon = tool.icon;
          return (
            <React.Fragment key={tool.label}>
              <div 
                className="flex flex-col items-center gap-0.5 text-gray-300 hover:text-white transition-colors relative"
                onClick={tool.onClick}
              >
                <button
                  aria-label={tool.label}
                >
                  <Icon size={16} />
                </button>
                <span className="text-[10px]">{tool.label}</span>
                {/* Show slider when Rotate tool is active */}
                {tool.label === 'Rotate' && isSliderVisible && (
                  <div 
                    className="absolute pl-44 bottom-full mb-2"
                    onMouseEnter={() => setIsSliderVisible(true)}
                    onMouseLeave={() => setIsSliderVisible(false)}
                  >
                    <DiscreteSlider
                      value={rotationY}
                      onChange={(event, newValue) => {
                        setRotationY(newValue);
                      }}
                      aria-label="Rotation Angle"
                      min={-180}
                      max={180}
                      step={1}
                    />
                  </div>
                )}
              </div>
              {index < tools.length - 1 && (
                <div className="w-px h-6 bg-zinc-700" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </Html>
  );
};

export default RotateButton;
