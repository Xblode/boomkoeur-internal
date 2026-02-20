import { Variants } from 'framer-motion';

/**
 * Animations prédéfinies pour Framer Motion
 */

// Fade In
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.5 }
  },
};

// Fade In Up
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  },
};

// Fade In Down
export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  },
};

// Fade In Left
export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.5 }
  },
};

// Fade In Right
export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.5 }
  },
};

// Scale In
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.4 }
  },
};

// Slide In Bottom
export const slideInBottom: Variants = {
  hidden: { y: '100%' },
  visible: { 
    y: 0,
    transition: { type: 'spring', damping: 20, stiffness: 100 }
  },
};

// Slide In Top
export const slideInTop: Variants = {
  hidden: { y: '-100%' },
  visible: { 
    y: 0,
    transition: { type: 'spring', damping: 20, stiffness: 100 }
  },
};

// Stagger Children (pour animer des listes)
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Item pour stagger
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  },
};

// Rotation
export const rotate: Variants = {
  hidden: { opacity: 0, rotate: -180 },
  visible: { 
    opacity: 1, 
    rotate: 0,
    transition: { duration: 0.6 }
  },
};

// Bounce
export const bounce = {
  y: [0, -10, 0],
  transition: {
    duration: 0.6,
    repeat: Infinity,
    repeatType: 'loop' as const,
  },
};

// Pulse
export const pulse = {
  scale: [1, 1.05, 1],
  transition: {
    duration: 1,
    repeat: Infinity,
    repeatType: 'loop' as const,
  },
};

// Shake
export const shake = {
  x: [0, -10, 10, -10, 10, 0],
  transition: {
    duration: 0.5,
  },
};

/**
 * Configuration de transition par défaut
 */
export const defaultTransition = {
  duration: 0.5,
  ease: 'easeInOut',
};

/**
 * Transition spring
 */
export const springTransition = {
  type: 'spring',
  damping: 20,
  stiffness: 100,
};

/**
 * Configuration pour le scroll reveal
 */
export const scrollReveal = {
  initial: 'hidden',
  whileInView: 'visible',
  viewport: { once: true, amount: 0.3 },
};
