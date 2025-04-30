import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react'; // Example icon, replace with your app logo

interface BootAnimationProps {
  onAnimationComplete: () => void;
}

const BootAnimation: React.FC<BootAnimationProps> = ({ onAnimationComplete }) => {
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Simulate a minimum display time for the animation
    const timer = setTimeout(() => {
      setIsComplete(true);
    }, 2000); // Display for 2 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background"
      initial={{ opacity: 1 }}
      animate={{ opacity: isComplete ? 0 : 1 }}
      transition={{ duration: 0.5, delay: isComplete ? 0.5 : 0 }}
      onAnimationComplete={() => {
        if (isComplete) {
          onAnimationComplete();
        }
      }}
    >
      {/* Replace with your app's logo or desired animation */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0, rotate: -180 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ duration: 1, ease: 'easeOut' }}
      >
        <Sparkles size={64} className="text-primary" /> {/* Example Icon */}
      </motion.div>
    </motion.div>
  );
};

export default BootAnimation;
