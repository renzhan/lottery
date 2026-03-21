import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Calculate the interval (ms) for a given deceleration step using easeOutQuad easing.
 *
 * @param step - Current step index (0-based)
 * @param totalSteps - Total number of deceleration steps
 * @param baseSpeed - Base interval in ms
 * @returns Interval in ms, range [baseSpeed, baseSpeed × 4]
 */
export function calculateDecelerationInterval(
  step: number,
  totalSteps: number,
  baseSpeed: number
): number {
  const progress = step / totalSteps;
  const eased = 1 - Math.pow(1 - progress, 2); // easeOutQuad
  return baseSpeed + (baseSpeed * 3) * eased;
}

export interface UseMarqueeOptions {
  totalTiles: number;
  speed: number;              // ms per step
  traversalOrder: number[];   // snake order index array
  skipFlipped: boolean;
  flippedSet: Set<number>;    // set of flipped tile indices
  decelerationSteps?: [number, number]; // [min, max] deceleration steps, default [4, 6]
}

export interface UseMarqueeReturn {
  isRunning: boolean;
  isDecelerating: boolean;
  highlightIndex: number | null;
  selectedIndex: number | null;
  toggle: () => void;
  reset: () => void;
}

export function useMarquee(options: UseMarqueeOptions): UseMarqueeReturn {
  const {
    speed,
    traversalOrder,
    skipFlipped,
    flippedSet,
    decelerationSteps = [4, 6],
  } = options;

  const [isRunning, setIsRunning] = useState(false);
  const [isDecelerating, setIsDecelerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Refs to avoid stale closures in the animation loop
  const lastTimeRef = useRef(0);
  const animIdRef = useRef<number>(0);
  const currentStepRef = useRef(0);
  const isDeceleratingRef = useRef(false);
  const remainingStepsRef = useRef(0);
  const totalDecelerationStepsRef = useRef(0);
  const lastUnflippedStepRef = useRef<number | null>(null);

  // Keep refs in sync with state
  useEffect(() => {
    currentStepRef.current = currentStep;
  }, [currentStep]);

  useEffect(() => {
    isDeceleratingRef.current = isDecelerating;
  }, [isDecelerating]);

  // Find next valid step (not flipped), used to advance
  const findNextStep = useCallback((fromStep: number): number => {
    if (traversalOrder.length === 0) return fromStep;

    let next = (fromStep + 1) % traversalOrder.length;

    if (!skipFlipped) return next;

    const startNext = next;
    while (flippedSet.has(traversalOrder[next])) {
      next = (next + 1) % traversalOrder.length;
      if (next === startNext) break; // all flipped
    }
    return next;
  }, [traversalOrder, skipFlipped, flippedSet]);

  // Normal (constant speed) animation loop
  useEffect(() => {
    if (!isRunning || isDecelerating) return;

    const animate = (timestamp: number) => {
      // If deceleration started mid-frame, stop this loop
      if (isDeceleratingRef.current) return;

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
  }, [isRunning, isDecelerating, speed, findNextStep]);

  // Deceleration animation loop
  useEffect(() => {
    if (!isRunning || !isDecelerating) return;

    const totalSteps = totalDecelerationStepsRef.current;

    const animate = (timestamp: number) => {
      const remaining = remainingStepsRef.current;
      if (remaining <= 0) {
        // Deceleration complete: pick the last unflipped tile on the path
        const finalStep = lastUnflippedStepRef.current ?? currentStepRef.current;
        const finalIndex = traversalOrder[finalStep] ?? null;
        setSelectedIndex(finalIndex);
        setIsDecelerating(false);
        isDeceleratingRef.current = false;
        setIsRunning(false);
        return;
      }

      const stepIndex = totalSteps - remaining; // 0-based step within deceleration
      const currentInterval = calculateDecelerationInterval(stepIndex, totalSteps, speed);

      if (timestamp - lastTimeRef.current >= currentInterval) {
        lastTimeRef.current = timestamp;

        const nextStep = findNextStep(currentStepRef.current);
        currentStepRef.current = nextStep;
        setCurrentStep(nextStep);

        // Track last unflipped tile on the deceleration path
        const tileIndex = traversalOrder[nextStep];
        if (tileIndex !== undefined && !flippedSet.has(tileIndex)) {
          lastUnflippedStepRef.current = nextStep;
        }

        remainingStepsRef.current = remaining - 1;
      }

      animIdRef.current = requestAnimationFrame(animate);
    };

    lastTimeRef.current = 0;
    animIdRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animIdRef.current);
    };
  }, [isRunning, isDecelerating, speed, traversalOrder, findNextStep, flippedSet]);

  const highlightIndex = isRunning ? traversalOrder[currentStep] ?? null : null;

  const toggle = useCallback(() => {
    // During deceleration, ignore toggle calls (prevent interruption)
    if (isDeceleratingRef.current) return;

    setIsRunning(prev => {
      if (prev) {
        // Enter deceleration phase instead of immediately stopping
        const [min, max] = decelerationSteps;
        const steps = Math.floor(Math.random() * (max - min + 1)) + min;
        remainingStepsRef.current = steps;
        totalDecelerationStepsRef.current = steps;

        // Initialize lastUnflippedStep with current position if it's unflipped
        const currentTileIndex = traversalOrder[currentStepRef.current];
        if (currentTileIndex !== undefined && !flippedSet.has(currentTileIndex)) {
          lastUnflippedStepRef.current = currentStepRef.current;
        } else {
          lastUnflippedStepRef.current = null;
        }

        setIsDecelerating(true);
        isDeceleratingRef.current = true;
        return true; // Stay running during deceleration
      } else {
        // Starting: clear previous selection
        setSelectedIndex(null);
        return true;
      }
    });
  }, [traversalOrder, decelerationSteps, flippedSet]);

  const reset = useCallback(() => {
    setSelectedIndex(null);
  }, []);

  return { isRunning, isDecelerating, highlightIndex, selectedIndex, toggle, reset };
}
