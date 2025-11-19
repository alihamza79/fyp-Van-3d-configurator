import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tooltip } from './Tooltip';

const RippleEffect = () => (
  <motion.span
    initial={{ scale: 0, opacity: 0.35 }}
    animate={{ scale: 2, opacity: 0 }}
    transition={{ duration: 0.5 }}
    className="absolute inset-0 rounded-full bg-[#F5C34B]"
  />
);

export const IconButton = ({ icon: Icon, onClick, tooltip }) => {
  const [isRippling, setIsRippling] = useState(false);

  const handleClick = (e) => {
    setIsRippling(true);
    onClick?.(e);
    setTimeout(() => setIsRippling(false), 500);
  };

  return (
    <Tooltip content={tooltip}>
      <button 
        onClick={handleClick} 
        className="p-2 rounded-full hover:bg-[#F5C34B]/10 hover:ring-1 hover:ring-[#F5C34B] relative transition-all duration-200 overflow-hidden"
      >
        {isRippling && <RippleEffect />}
        <Icon className="h-5 w-5 text-gray-700 relative z-10" />
      </button>
    </Tooltip>
  );
}; 