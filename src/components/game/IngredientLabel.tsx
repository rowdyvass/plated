import { motion, AnimatePresence } from 'framer-motion';

interface IngredientLabelProps {
  name: string | null;
}

export function IngredientLabel({ name }: IngredientLabelProps) {
  return (
    <AnimatePresence mode="wait">
      {name && (
        <motion.div
          key={name}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 30,
          }}
          className="fixed bottom-[104px] left-4 font-display text-sm text-text-secondary tracking-wide"
        >
          {name}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
