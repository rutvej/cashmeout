/**
 * Framer Motion animation presets — CRED-inspired physics & choreography.
 * Import these into screen components for consistent, dramatic motion.
 */

// ─── Page Transitions ───
export const pageTransition = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
};

export const pageSlideUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -30 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
};

// ─── Stagger Containers ───
export const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
};

export const staggerFast = {
  animate: {
    transition: { staggerChildren: 0.04, delayChildren: 0.05 },
  },
};

// ─── Child Animations ───
export const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
};

export const fadeInRight = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.5 },
};

// ─── Scale Animations ───
export const scaleIn = {
  initial: { opacity: 0, scale: 0.85 },
  animate: { opacity: 1, scale: 1 },
  transition: { type: 'spring', stiffness: 200, damping: 20 },
};

export const popIn = {
  initial: { opacity: 0, scale: 0.5 },
  animate: { opacity: 1, scale: 1 },
  transition: { type: 'spring', stiffness: 300, damping: 15 },
};

// ─── Interactive Gestures ───
export const springPress = {
  whileTap: { scale: 0.96 },
  whileHover: { scale: 1.02 },
  transition: { type: 'spring', stiffness: 400, damping: 30 },
};

export const hardPress = {
  whileTap: { scale: 0.98, y: 2 },
  transition: { type: 'spring', stiffness: 500, damping: 25 },
};

// ─── Modal & Overlay ───
export const backdropFade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 },
};

export const sheetSlideUp = {
  initial: { opacity: 0, y: '100%' },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: '100%' },
  transition: { type: 'spring', stiffness: 300, damping: 30 },
};

// ─── Counter Roll (for animated numbers) ───
export const counterRoll = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: 'easeOut' },
};
