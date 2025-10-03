import { useState, useEffect, useCallback } from 'react';
import { Tour } from '../types';
import { TOUR_CONSTANTS, STORAGE_KEYS } from '../constants';

interface UseTourReturn {
  currentTour: Tour | null;
  isTourActive: boolean;
  startTour: (tourId: string) => void;
  completeTour: (tourId: string) => void;
  isTourCompleted: (tourId: string) => boolean;
  skipTour: (tourId: string) => void;
  resetTour: (tourId: string) => void;
}

export const useTour = (): UseTourReturn => {
  const [currentTour, setCurrentTour] = useState<Tour | null>(null);
  const [isTourActive, setIsTourActive] = useState(false);

  const startTour = useCallback((tourId: string) => {
    const tourConfig = TOUR_CONSTANTS.TOURS[tourId as keyof typeof TOUR_CONSTANTS.TOURS];
    if (!tourConfig) return;

    const tour: Tour = {
      id: tourConfig.id,
      name: tourConfig.name,
      steps: [], // Steps would be defined based on tour type
    };

    setCurrentTour(tour);
    setIsTourActive(true);
  }, []);

  const completeTour = useCallback((tourId: string) => {
    setCurrentTour(null);
    setIsTourActive(false);
    localStorage.setItem(`${STORAGE_KEYS.TOUR_COMPLETED}-${tourId}`, 'true');
  }, []);

  const skipTour = useCallback((tourId: string) => {
    completeTour(tourId);
  }, [completeTour]);

  const resetTour = useCallback((tourId: string) => {
    localStorage.removeItem(`${STORAGE_KEYS.TOUR_COMPLETED}-${tourId}`);
  }, []);

  const isTourCompleted = useCallback((tourId: string): boolean => {
    return localStorage.getItem(`${STORAGE_KEYS.TOUR_COMPLETED}-${tourId}`) === 'true';
  }, []);

  // Auto-start tour for new users
  useEffect(() => {
    const isOnboardingCompleted = localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
    if (!isOnboardingCompleted && !isTourCompleted('onboarding')) {
      startTour('onboarding');
    }
  }, [startTour, isTourCompleted]);

  return {
    currentTour,
    isTourActive,
    startTour,
    completeTour,
    skipTour,
    resetTour,
    isTourCompleted,
  };
};
