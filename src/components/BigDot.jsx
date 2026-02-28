import React from 'react';
import { Html } from '@react-three/drei';

const BigDot = ({ position, onClick }) => {
  return (
    <Html position={[position[0], position[1] + 0.4, position[2]]} center>
      <div 
        className="relative w-6 h-6 group"
        onClick={onClick}
      >
        <div 
          className="absolute inset-0 rounded-full bg-gray-500 transition-all duration-200 ease-in-out group-hover:shadow-[0_0_2px_1px_rgba(255,255,200,0.2)] group-hover:bg-gray-400"
        />
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white transition-all duration-200 ease-in-out group-hover:w-1.5 group-hover:h-1.5"
        />
      </div>
    </Html>
  );
};

export default BigDot; 