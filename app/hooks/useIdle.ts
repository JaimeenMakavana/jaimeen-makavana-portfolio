"use client";

import { useState, useEffect, useRef } from "react";

interface UseIdleOptions {
  threshold?: number; // Time in milliseconds before considered idle
  onIdle?: () => void;
  onActive?: () => void;
}

export function useIdle(options: UseIdleOptions = {}) {
  const { threshold = 3000, onIdle, onActive } = options;
  const [isIdle, setIsIdle] = useState(false);
  const [idleTime, setIdleTime] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const idleStartTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isIdleRef = useRef(false);

  useEffect(() => {
    // Track idle time progression - only start interval when actually idle
    const startIdleTracking = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      intervalRef.current = setInterval(() => {
        if (isIdleRef.current && idleStartTimeRef.current) {
          const elapsed = Date.now() - idleStartTimeRef.current + threshold;
          setIdleTime(elapsed);
        } else {
          // Stop interval if no longer idle
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      }, 100);
    };

    // Stop interval when not idle
    const stopIdleTracking = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const handleMouseMove = () => {
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // If we were idle, mark as active
      if (isIdleRef.current) {
        setIsIdle(false);
        setIdleTime(0);
        idleStartTimeRef.current = null;
        isIdleRef.current = false;
        stopIdleTracking(); // Stop interval when active
        onActive?.();
      }

      // Set new timeout
      timeoutRef.current = setTimeout(() => {
        setIsIdle(true);
        isIdleRef.current = true;
        idleStartTimeRef.current = Date.now();
        setIdleTime(threshold);
        startIdleTracking(); // Start interval when idle
        onIdle?.();
      }, threshold);
    };

    // Initial timeout
    timeoutRef.current = setTimeout(() => {
      setIsIdle(true);
      isIdleRef.current = true;
      idleStartTimeRef.current = Date.now();
      setIdleTime(threshold);
      startIdleTracking(); // Start interval when idle
      onIdle?.();
    }, threshold);

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [threshold, onIdle, onActive]);

  return { isIdle, idleTime };
}
