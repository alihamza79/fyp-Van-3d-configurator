import { FiRotateCcw } from 'react-icons/fi';
import { Html } from '@react-three/drei';
import React, { useRef, useState } from 'react';
import { ShoppingBag, Replace, Grid, Copy, Trash, Play, Palette } from 'lucide-react';
import useClickOutside from '../hooks/useClickOutside';
import DiscreteSlider from './DiscreteSlider';
import { useCustomizePanelStore } from '../store/customizePanelStore';

const RotateButton = ({
  position,
  rotationY,
  setRotationY,
  onCopy,
  onRemove,
  onClose,
  onPlayAnimation,
  isAnimationComplete,
  resetAnimation,
  productId,
  instanceId,
  productName,
  modelPath,
}) => {
  const buttonRef = useRef(null);
  const [isSliderVisible, setIsSliderVisible] = useState(false);

  const workspace = useCustomizePanelStore((s) => s.workspace);
  const openWorkspace = useCustomizePanelStore((s) => s.openWorkspace);

  const isThisWorkspace =
    workspace?.productId === productId && workspace?.instanceId === instanceId;

  useClickOutside(buttonRef, () => {
    // While this product's dedicated workspace is open the toolbar isn't
    // rendered anyway, but guard just in case React batches a late close.
    if (isThisWorkspace) return;
    onClose();
  });

  const handleCustomizeClick = () => {
    openWorkspace({
      kind: 'product',
      productId,
      instanceId,
      productName: productName || 'Product',
      modelPath,
    });
  };

  const tools = [
    { icon: ShoppingBag, label: 'Add' },
    {
      icon: FiRotateCcw,
      label: 'Rotate',
      onClick: () => setIsSliderVisible((prev) => !prev),
    },
    {
      icon: Palette,
      label: 'Customize',
      featured: true,
      onClick: handleCustomizeClick,
    },
    { icon: Replace, label: 'Replace' },
    { icon: Grid, label: 'Goes with' },
    { icon: Copy, label: 'Make copy', onClick: onCopy },
    {
      icon: Play,
      label: isAnimationComplete ? 'Reset' : 'Open',
      onClick: isAnimationComplete ? resetAnimation : onPlayAnimation,
    },
    { icon: Trash, label: 'Remove', onClick: onRemove },
  ];

  // While the dedicated customize workspace is open for this product, the
  // entire main scene (including this toolbar) is unmounted by App.jsx, so
  // no explicit early return is needed here. Still, keep it as a belt-and-
  // suspenders guard for any transition frame where both may overlap.
  if (isThisWorkspace) return null;

  return (
    <Html position={[position[0], position[1] + 0.5, position[2]]} center>
      <div ref={buttonRef} className="relative inline-block">
        <div className="bg-zinc-900 rounded-full px-4 py-1 inline-flex items-center gap-3">
          {tools.map((tool, index) => {
            const Icon = tool.icon;
            const isActive =
              (tool.label === 'Rotate' && isSliderVisible);
            return (
              <React.Fragment key={tool.label}>
                <div
                  className={`flex flex-col items-center gap-0.5 transition-colors relative cursor-pointer ${
                    isActive
                      ? 'text-[#f5c34b]'
                      : tool.featured
                      ? 'text-[#f5c34b] hover:text-amber-300'
                      : 'text-gray-300 hover:text-white'
                  }`}
                  onClick={tool.onClick}
                >
                  <button aria-label={tool.label}>
                    <Icon size={16} />
                  </button>
                  <span className="text-[10px]">{tool.label}</span>
                  {tool.featured && !isActive && (
                    <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-[#f5c34b] animate-pulse" />
                  )}
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
                {index < tools.length - 1 && <div className="w-px h-6 bg-zinc-700" />}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </Html>
  );
};

export default RotateButton;
