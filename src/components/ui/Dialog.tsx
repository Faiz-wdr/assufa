import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './CoreUI';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "primary",
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black cursor-pointer"
          />

          {/* Dialog Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="w-full max-w-xs rounded-card bg-white p-5 shadow-lifted border border-neutral-border pointer-events-auto flex flex-col text-left space-y-4"
            >
              <div className="space-y-1.5">
                <h3 className="text-body-lg font-bold text-neutral-textPrimary tracking-tight">
                  {title}
                </h3>
                <p className="text-small text-neutral-textSecondary">
                  {description}
                </p>
              </div>

              <div className="flex space-x-2 pt-1">
                <Button 
                  variant="secondary" 
                  className="flex-1 h-[40px] text-small" 
                  onClick={onClose}
                >
                  {cancelLabel}
                </Button>
                {onConfirm && (
                  <Button 
                    variant={variant === 'danger' ? 'danger' : 'primary'}
                    className="flex-1 h-[40px] text-small" 
                    onClick={() => {
                      onConfirm();
                      onClose();
                    }}
                  >
                    {confirmLabel}
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
