"use client";

import {
  motion,
  useReducedMotion,
  type MotionProps,
  type Transition,
  type Variants,
} from "framer-motion";
import type { ReactNode } from "react";

export const easeOut = [0.22, 1, 0.36, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

export function useMotionSafe() {
  const prefersReduced = useReducedMotion();
  return {
    prefersReduced: !!prefersReduced,
    transition: (t: Transition = {}): Transition =>
      prefersReduced ? { duration: 0.01 } : t,
    offset: (value: number) => (prefersReduced ? 0 : value),
  };
}

export function PageTransition({ children }: { children: ReactNode }) {
  const { prefersReduced } = useMotionSafe();

  return (
    <motion.div
      initial={prefersReduced ? { opacity: 1 } : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        prefersReduced
          ? { duration: 0.01 }
          : { duration: 0.35, ease: easeOut }
      }
    >
      {children}
    </motion.div>
  );
}

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
} & MotionProps;

export function ScrollReveal({
  children,
  className,
  delay = 0,
  y = 28,
  ...rest
}: ScrollRevealProps) {
  const { prefersReduced, offset } = useMotionSafe();

  return (
    <motion.div
      className={className}
      initial={
        prefersReduced ? { opacity: 1 } : { opacity: 0, y: offset(y) }
      }
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={
        prefersReduced
          ? { duration: 0.01 }
          : { duration: 0.55, delay, ease: easeOut }
      }
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export function Stagger({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { prefersReduced } = useMotionSafe();

  return (
    <motion.div
      className={className}
      variants={prefersReduced ? undefined : staggerContainer}
      initial={prefersReduced ? false : "hidden"}
      whileInView={prefersReduced ? undefined : "visible"}
      viewport={{ once: true, amount: 0.15 }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { prefersReduced } = useMotionSafe();

  return (
    <motion.div
      className={className}
      variants={prefersReduced ? undefined : fadeUp}
      transition={{ duration: 0.45, ease: easeOut }}
    >
      {children}
    </motion.div>
  );
}
