import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseMarqueeOptions {
  totalTiles: number;
  speed: number;              // ms per step
  traversalOrder: number[];   // snake order index array
  skipFlipped: boolean;
  flippedSet: Set<number>;    // set of flipped tile indices
}

export interface UseMarqueeReturn {
  isRunning: boolean;
  highlightIndex: number | null;
  selectedIndex: number | null;
  toggle: () => void;
  reset: () => void;
}

export function useMarquee(options: UseMarqueeOptions): UseMarqueeReturn {
  const { speed, traversalOrder, skipFlipped, flippedSet } = options;

  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Refs to avoid stale closures in the animation loop
  const lastTimeRef = useRef(0);
  const animIdRef = useRef<number>(0);
  const currentStepRef = useRef(0);

  // Keep currentStepRef in sync with state
  useEffect(() => {
    currentStepRef.current = currentStep;
  }, [currentStep]);

  useEffect(() => {
    if (!isRunning) return;

    // Find next valid step (not flipped), used to advance
    const findNextStep = (fromStep: number): number => {
      if (traversalOrder.length === 0) return fromStep;

      let next = (fromStep + 1) % traversalOrder.length;

      if (!skipFlipped) return next;

      const startNext = next;
      while (flippedSet.has(traversalOrder[next])) {
        next = (next + 1) % traversalOrder.length;
        if (next === startNext) break; // all flipped
      }
      return next;
    };

    const animate = (timestamp: number) => {
      if (timestamp - lastTimeRef.current >= speed) {
        lastTimeRef.current = timestamp;
        const nextStep = findNextStep(currentStepRef.current);
        currentStepRef.current = nextStep;
        setCurrentStep(nextStep);
      }
      animIdRef.current = requestAnimationFrame(animate);
    };

    lastTimeRef.current = 0;
    animIdRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animIdRef.current);
    };
  }, [isRunning, speed, traversalOrder, skipFlipped, flippedSet]);

  const highlightIndex = isRunning ? traversalOrder[currentStep] ?? null : null;

  const toggle = useCallback(() => {
    setIsRunning(prev => {
      if (prev) {
        // Stopping: record the currently highlighted tile as selected
        setSelectedIndex(traversalOrder[currentStepRef.current] ?? null);
        return false;
      } else {
        // Starting: clear previous selection
        setSelectedIndex(null);
        return true;
      }
    });
  }, [traversalOrder]);

  const reset = useCallback(() => {
    setSelectedIndex(null);
  }, []);

  return { isRunning, highlightIndex, selectedIndex, toggle, reset };
}
