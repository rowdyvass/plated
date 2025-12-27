import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

type ToastVariant = 'default' | 'success' | 'warning' | 'info';

interface ToastProps {
  message: string | null;
  onDismiss: () => void;
  duration?: number;
  variant?: ToastVariant;
}

const toastVariants = {
  initial: { opacity: 0, y: 10, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -5, scale: 0.98 },
};

const variantStyles: Record<ToastVariant, string> = {
  default: 'bg-foundation-100/95 border-foundation-300',
  success: 'bg-foundation-100/95 border-state-success/30',
  warning: 'bg-foundation-100/95 border-state-warning/30',
  info: 'bg-foundation-100/95 border-accent-primary/30',
};

export function Toast({
  message,
  onDismiss,
  duration = 1500,
  variant = 'default',
}: ToastProps) {
  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      onDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, [message, duration, onDismiss]);

  return (
    <AnimatePresence mode="wait">
      {message && (
        <motion.div
          key={message}
          variants={toastVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 30,
          }}
          className="fixed left-1/2 bottom-1/3 -translate-x-1/2 z-50"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <motion.div
            className={`px-5 py-3 rounded-lg border backdrop-blur-sm shadow-lg min-w-[120px] max-w-[280px] text-center ${variantStyles[variant]}`}
            initial={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' }}
            animate={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}
          >
            <span className="font-display text-base italic text-text-secondary">
              {message}
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Toast manager for queuing multiple toasts
 */
interface ToastItem {
  id: string;
  message: string;
  variant?: ToastVariant;
}

interface ToastQueueProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
  duration?: number;
  maxVisible?: number;
}

export function ToastQueue({
  toasts,
  onDismiss,
  duration = 1500,
  maxVisible = 2,
}: ToastQueueProps) {
  const visibleToasts = toasts.slice(0, maxVisible);

  return (
    <div className="fixed left-1/2 bottom-1/3 -translate-x-1/2 z-50 flex flex-col gap-2">
      <AnimatePresence mode="popLayout">
        {visibleToasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            variants={toastVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 30,
              layout: { duration: 0.2 },
            }}
          >
            <ToastItem
              message={toast.message}
              variant={toast.variant}
              duration={duration}
              onDismiss={() => onDismiss(toast.id)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({
  message,
  variant = 'default',
  duration,
  onDismiss,
}: {
  message: string;
  variant?: ToastVariant;
  duration: number;
  onDismiss: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  return (
    <div
      className={`px-5 py-3 rounded-lg border backdrop-blur-sm shadow-lg min-w-[120px] max-w-[280px] text-center ${variantStyles[variant]}`}
    >
      <span className="font-display text-base italic text-text-secondary">
        {message}
      </span>
    </div>
  );
}
