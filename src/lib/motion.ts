// ───────────────────────────────────────────────────────────
// Shared Motion (Framer Motion 12) animation variants — from spec.
// ───────────────────────────────────────────────────────────
import type { Variants, Transition } from "motion/react";

export const EASE_OUT_EXPO: Transition["ease"] = [0.16, 1, 0.3, 1];

export const fadeUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export const slideInLeft: Variants = {
  initial: { opacity: 0, x: -40 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.8, ease: EASE_OUT_EXPO } },
};

export const pulse: Variants = {
  animate: {
    opacity: [1, 0.6, 1],
    transition: { duration: 2, repeat: Infinity },
  },
};

export const conditionReveal: Variants = {
  initial: { opacity: 0, y: 10, scale: 0.95 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export const pathDraw: Variants = {
  initial: { pathLength: 0, opacity: 0 },
  animate: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 1.2, ease: "easeInOut" },
  },
};

/** Container that staggers its children (used for cascading lists). */
export const staggerContainer = (stagger = 0.1, delayChildren = 0): Variants => ({
  initial: {},
  animate: {
    transition: { staggerChildren: stagger, delayChildren },
  },
});

export const modalScale: Variants = {
  initial: { scale: 0.95, opacity: 0 },
  animate: { scale: 1, opacity: 1, transition: { duration: 0.25, ease: "easeOut" } },
  exit: { scale: 0.95, opacity: 0, transition: { duration: 0.2 } },
};

export const bottomSheet: Variants = {
  initial: { y: "100%" },
  animate: { y: 0, transition: { duration: 0.4, ease: EASE_OUT_EXPO } },
  exit: { y: "100%", transition: { duration: 0.3, ease: "easeIn" } },
};
