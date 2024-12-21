'use client';

import { motion } from 'framer-motion';

const gVariants = {
  animate: {
    rotate: [0, 360],
    transition: {
      repeat: Infinity,
      duration: 1,
      ease: 'linear',
    },
  },
};

const LoaderPinwheelIcon = () => {
  return (
    <div className="flex items-center justify-center p-2">
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        animate="animate"
        variants={gVariants}
      >
        <g>
          <path d="M22 12a1 1 0 0 1-10 0 1 1 0 0 0-10 0" />
          <path d="M7 20.7a1 1 0 1 1 5-8.7 1 1 0 1 0 5-8.6" />
          <path d="M7 3.3a1 1 0 1 1 5 8.6 1 1 0 1 0 5 8.6" />
        </g>
        <circle cx="12" cy="12" r="10" />
      </motion.svg>
    </div>
  );
};

export { LoaderPinwheelIcon };
