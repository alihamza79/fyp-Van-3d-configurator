import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const toastVariants = {
  initial: {
    opacity: 0,
    y: 100,
    scale: 0.8,
    filter: 'blur(8px)',
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      type: "spring",
      duration: 0.8,
      bounce: 0.35
    }
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: 20,
    filter: 'blur(8px)',
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

const CustomToast = ({ t, icon: Icon, title, detail }) => {
  const handleDismiss = () => {
    if (t.id) {
      toast.dismiss(t.id);
    }
  };

  return (
    <AnimatePresence>
      {t.visible && (
        <motion.div
          variants={toastVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="max-w-md w-full bg-white shadow-xl rounded-lg pointer-events-auto flex ring-1 ring-black/5 backdrop-blur-sm"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
          }}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-center">
              {Icon && (
                <div className="flex flex-col gap-1">
                  {Icon}
                </div>
              )}
              <motion.div 
                className="ml-4 flex-1"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ 
                  delay: 0.2,
                  type: "spring",
                  stiffness: 200,
                  damping: 20
                }}
              >
                <p className="text-sm font-medium text-gray-900">
                  {title}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {detail}
                </p>
              </motion.div>
            </div>
          </div>
          <div className="flex border-l border-gray-200">
            <motion.button
              whileHover={{ 
                scale: 1.05,
                backgroundColor: "rgba(59, 130, 246, 0.05)" 
              }}
              whileTap={{ scale: 0.98 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 17
              }}
              onClick={handleDismiss}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-blue-600 hover:text-blue-500 focus:outline-none"
            >
              Got it
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const showCustomToast = ({ icon, title, detail, duration = 4000, position = 'bottom-center' }) => {
  return toast.custom(
    (t) => (
      <CustomToast
        t={t}
        icon={icon}
        title={title}
        detail={detail}
      />
    ),
    {
      duration,
      position,
    }
  );
};

export default showCustomToast; 