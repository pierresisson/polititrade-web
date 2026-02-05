"use client";

import {
  LazyMotion,
  domAnimation,
  m,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { createContext, useContext, type ReactNode } from "react";

// Timing constants - premium, subtle feel
const DURATION = {
  fast: 0.18,
  normal: 0.28,
  slow: 0.35,
} as const;

const EASE = [0.16, 1, 0.3, 1] as const;

// Reduced motion context
const ReducedMotionContext = createContext(false);

export function useIsReducedMotion() {
  return useContext(ReducedMotionContext);
}

// LazyMotion wrapper for the LP
export function MotionProvider({ children }: { children: ReactNode }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <LazyMotion features={domAnimation}>
      <ReducedMotionContext.Provider value={prefersReducedMotion ?? false}>
        {children}
      </ReducedMotionContext.Provider>
    </LazyMotion>
  );
}

// Reusable variants
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.normal, ease: EASE },
  },
};

export const fadeUpReduced: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: DURATION.normal },
  },
};

export const fadeLeft: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: DURATION.normal, ease: EASE },
  },
};

export const fadeLeftReduced: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: DURATION.normal },
  },
};

export const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

export const staggerFast = {
  visible: {
    transition: {
      staggerChildren: 0.04,
    },
  },
};

// Reveal component for whileInView animations
interface RevealProps {
  children: ReactNode;
  className?: string;
  variants?: Variants;
  delay?: number;
  as?: "div" | "section" | "article" | "li" | "tr";
}

export function Reveal({
  children,
  className,
  variants,
  delay = 0,
  as = "div",
}: RevealProps) {
  const prefersReducedMotion = useIsReducedMotion();
  const Component = m[as];

  const resolvedVariants = prefersReducedMotion
    ? fadeUpReduced
    : variants || fadeUp;

  return (
    <Component
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={resolvedVariants}
      transition={delay > 0 ? { delay } : undefined}
    >
      {children}
    </Component>
  );
}

// Stagger container component
interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  fast?: boolean;
  as?: "div" | "ul" | "ol" | "tbody";
}

export function StaggerContainer({
  children,
  className,
  fast = false,
  as = "div",
}: StaggerContainerProps) {
  const Component = m[as];

  return (
    <Component
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={fast ? staggerFast : stagger}
    >
      {children}
    </Component>
  );
}

// Stagger item component
interface StaggerItemProps {
  children: ReactNode;
  className?: string;
  as?: "div" | "li" | "tr";
}

export function StaggerItem({ children, className, as = "div" }: StaggerItemProps) {
  const prefersReducedMotion = useIsReducedMotion();
  const Component = m[as];

  return (
    <Component
      className={className}
      variants={prefersReducedMotion ? fadeUpReduced : fadeUp}
    >
      {children}
    </Component>
  );
}

// Press animation for buttons
export const pressAnimation = {
  whileTap: { scale: 0.98 },
  transition: { duration: DURATION.fast },
};

// Hover card animation (subtle elevation)
export const hoverCardAnimation = {
  whileHover: { y: -2 },
  transition: { duration: DURATION.fast, ease: EASE },
};

// Export motion primitive for direct use
export { m };
