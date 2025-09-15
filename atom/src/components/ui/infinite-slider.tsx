'use client';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useRef } from 'react';

type InfiniteSliderProps = {
  children: React.ReactNode;
  gap?: number;
  duration?: number;
  direction?: 'horizontal' | 'vertical';
  reverse?: boolean;
  className?: string;
};

export function InfiniteSlider({
  children,
  gap = 16,
  duration = 30,
  direction = 'horizontal',
  reverse = false,
  className,
}: InfiniteSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className={cn('overflow-hidden', className)} ref={containerRef}>
      <motion.div
        className='flex w-max'
        style={{
          gap: `${gap}px`,
          flexDirection: direction === 'horizontal' ? 'row' : 'column',
        }}
        animate={{
          x: direction === 'horizontal' ? (reverse ? [0, '-50%'] : ['-50%', 0]) : 0,
          y: direction === 'vertical' ? (reverse ? [0, '-50%'] : ['-50%', 0]) : 0,
        }}
        transition={{
          duration: duration,
          ease: 'linear',
          repeat: Infinity,
          repeatType: 'loop',
        }}
      >
        {children}
        {children}
      </motion.div>
    </div>
  );
}
