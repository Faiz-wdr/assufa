import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black cursor-pointer"
          />

          {/* Bottom Sheet Modal Container */}
          <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center pointer-events-none">
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 350 }}
              className="w-full max-w-md bg-white rounded-t-sheet shadow-sheet overflow-hidden pointer-events-auto flex flex-col max-h-[85vh] pb-safe-bottom"
            >
              {/* Drag Handle Top Bar */}
              <div className="flex justify-center py-2.5">
                <div className="w-12 h-1 bg-neutral-border rounded-full" />
              </div>

              {/* Drawer Title & Close Control */}
              <div className="flex items-center justify-between px-5 pb-3">
                <h3 className="text-h3 font-bold text-neutral-textPrimary tracking-tight">
                  {title || ''}
                </h3>
                <button
                  onClick={onClose}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-bg text-neutral-textSecondary hover:text-neutral-textPrimary transition-colors focus:outline-none"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Scrollable Form/List Content */}
              <div className="flex-1 overflow-y-auto px-5 pb-6 text-left">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
