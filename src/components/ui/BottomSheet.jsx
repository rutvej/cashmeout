import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BottomSheet = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl max-h-[85vh] flex flex-col"
          >
            <div className="p-4 border-b border-gray-100 flex-shrink-0">
              <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
              {title && <h2 className="text-xl font-bold text-center text-text-primary">{title}</h2>}
            </div>
            <div className="p-4 overflow-y-auto flex-grow">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default BottomSheet;
