import React, { useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useProductStore } from '../../store/productStore';

export const PriceTag = () => {
  const total = useProductStore((state) => state.getTotalPrice());
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => latest.toFixed(2));
  
  useEffect(() => {
    const animation = animate(count, total, {
      duration: 0.8,
      ease: "easeOut"
    });
    return animation.stop;
  }, [total]);

  return (
    <motion.div 
      className="bg-black text-white px-4 py-2 rounded-full flex items-center gap-2"
      initial={{ scale: 1 }}
      animate={{ scale: [1, 1.1, 1] }}
      transition={{ duration: 0.3 }}
      key={total}
    >
      <span className="text-sm">$</span>
      <motion.span className="font-medium">{rounded}</motion.span>
    </motion.div>
  );
}; 