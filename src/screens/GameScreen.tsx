import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Game, type SwooshResult, type DotResult, type ScatterResult, type PlaceResult, type QuenelleResult } from '@/game';
import { IngredientTray, IngredientLabel, GameHeader } from '@/components/game';
import { Toast } from '@/components/ui';
import { TutorialManager, LessonIntro, Demonstration } from '@/components/tutorial';
import { useGameStore } from '@/stores/gameStore';
import { useTutorial, useIsTouchDevice } from '@/hooks';
import { lesson1Butter } from '@/data/dishes/linstitut/lesson1-butter';
import { getLessonByDishId } from '@/data/restaurants/linstitut';
import { audioManager } from '@/audio';
import type { PlacementZone } from '@/game/entities/Ghost';

type TutorialPhase = 'intro' | 'demo' | 'practice' | 'evaluate' | 'complete';

function getToastMessage(zone: PlacementZone): string | null {
  switch (zone) {
    case 'perfect':
      return 'Perfect.';
    case 'great':
      return 'Good.';
    case 'good':
      return 'Acceptable.';
    case 'acceptable':
      return null; // No toast for acceptable
    case 'miss':
      return 'Missed.';
  }
}

function getSwooshToastMessage(result: SwooshResult): string | null {
  if (result.techniqueScore >= 90) return 'Perfect.';
  if (result.techniqueScore >= 70) return 'Good.';
  if (result.techniqueScore >= 50) return 'Acceptable.';
  if (result.success) return null;
  return 'Missed.';
}

function getDotToastMessage(result: DotResult): string | null {
  if (result.techniqueScore >= 90) return 'Perfect.';
  if (result.techniqueScore >= 70) return 'Good.';
  if (result.techniqueScore >= 50) return 'Acceptable.';
  if (result.success) return null;
  return 'Missed.';
}

function getScatterToastMessage(result: ScatterResult): string | null {
  if (result.zone === 'perfect') return 'Perfect.';
  if (result.zone === 'great') return 'Good.';
  if (result.zone === 'good') return 'Acceptable.';
  if (result.zone === 'acceptable') return null;
  return 'Scattered wide!';
}

function getPlaceResultToastMessage(result: PlaceResult): string | null {
  if (result.zone === 'perfect') return 'Perfect.';
  if (result.zone === 'great') return 'Good.';
  if (result.zone === 'good') return 'Acceptable.';
  if (result.zone === 'acceptable') return null;
  return 'Missed.';
}

function getQuenelleToastMessage(result: QuenelleResult): string | null {
  if (result.techniqueScore >= 90) return 'Perfect.';
  if (result.techniqueScore >= 70) return 'Good.';
  if (result.techniqueScore >= 50) return 'Acceptable.';
  if (result.success) return null;
  return 'Missed.';
}

interface DragState {
  x: number;
  y: number;
  visible: boolean;
}

// Track swoosh state separately
interface SwooshState {
  selected: boolean;    // Ingredient tapped and ready to draw
  active: boolean;      // Currently drawing on plate
  ingredientId: string | null;
}

// Track dot state
interface DotState {
  selected: boolean;    // Ingredient tapped and ready to tap dots
  ingredientId: string | null;
  remainingCount: number;
}

// Track scatter state
interface ScatterState {
  selected: boolean;    // Ingredient tapped and ready to flick
  active: boolean;      // Currently flicking
  ingredientId: string | null;
}

// Track drizzle state
interface DrizzleState {
  selected: boolean;    // Ingredient tapped and ready to drizzle
  active: boolean;      // Currently drizzling on plate
  ingredientId: string | null;
}

// Track quenelle state
interface QuenelleState {
  selected: boolean;    // Ingredient tapped and ready for quenelle gesture
  active: boolean;      // Currently performing quenelle gesture on plate
  ingredientId: string | null;
}

// Track multipoint place state (for ingredients with count > 1)
interface MultipointPlaceState {
  active: boolean;
  ingredientId: string | null;
  remainingCount: number;
  totalCount: number;
}

export function GameScreen() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Game | null>(null);
  const activePointerRef = useRef<number | null>(null);
  const dotPlacementInProgressRef = useRef(false);  // Prevent double-firing of dot placement
  const [isLoading, setIsLoading] = useState(true);
  const [dragState, setDragState] = useState<DragState>({ x: 0, y: 0, visible: false });
  const [swooshToast, setSwooshToast] = useState<string | null>(null);
  const [swooshState, setSwooshState] = useState<SwooshState>({ selected: false, active: false, ingredientId: null });
  const [dotState, setDotState] = useState<DotState>({ selected: false, ingredientId: null, remainingCount: 0 });
  const [scatterState, setScatterState] = useState<ScatterState>({ selected: false, active: false, ingredientId: null });
  const [drizzleState, setDrizzleState] = useState<DrizzleState>({ selected: false, active: false, ingredientId: null });
  const [quenelleState, setQuenelleState] = useState<QuenelleState>({ selected: false, active: false, ingredientId: null });
  const [multipointPlaceState, setMultipointPlaceState] = useState<MultipointPlaceState>({ active: false, ingredientId: null, remainingCount: 0, totalCount: 0 });
  const [isOverTarget, setIsOverTarget] = useState(false);

  // Tutorial phase state
  const [tutorialPhase, setTutorialPhase] = useState<TutorialPhase>('intro');

  const {
    currentIngredient,
    currentDish,
    isDragging,
    latestPrecision,
    timerState,
    phase,
    placedElements,
    setCurrentIngredient,
    placeElement,
    setIsDragging,
    recordPrecision,
    clearLatestPrecision,
    startTimer,
    tick,
    startDish,
    setPhase,
    completeDish,
    failDish,
  } = useGameStore();

  // Track if we've shown the time expired toast
  const [timeExpiredToastShown, setTimeExpiredToastShown] = useState(false);

  // Get the dish to use (from store or fallback to lesson1)
  const dish = currentDish || lesson1Butter;

  // Get tutorial settings
  const tutorial = useTutorial(dish.restaurant, dish.id);

  // Touch device detection for drag offset
  const isTouchDevice = useIsTouchDevice();
  // Offset the drag preview up and left so it's visible above the finger
  const touchDragOffset = isTouchDevice ? { x: -30, y: -60 } : { x: 0, y: 0 };

  // Get lesson metadata for intro screen
  const lessonData = useMemo(() => {
    return getLessonByDishId(dish.id);
  }, [dish.id]);

  // Determine the back navigation URL based on restaurant
  const menuUrl = useMemo(() => {
    // Map restaurant IDs to their menu routes
    const restaurantRoutes: Record<string, string> = {
      'linstitut': '/linstitut',
    };
    return restaurantRoutes[dish.restaurant] || '/linstitut';
  }, [dish.restaurant]);

  // Get the gesture type for the current ingredient
  const currentIngredientDef = currentIngredient
    ? dish.ingredients.find(i => i.id === currentIngredient.id)
    : null;
  const currentGestureType: 'place' | 'swoosh' | 'dot' | 'scatter' | 'drizzle' | 'quenelle' | 'tweeze' = currentIngredientDef?.gesture === 'swoosh'
    ? 'swoosh'
    : currentIngredientDef?.gesture === 'dot'
    ? 'dot'
    : currentIngredientDef?.gesture === 'scatter'
    ? 'scatter'
    : currentIngredientDef?.gesture === 'drizzle'
    ? 'drizzle'
    : currentIngredientDef?.gesture === 'quenelle'
    ? 'quenelle'
    : currentIngredientDef?.gesture === 'tweeze'
    ? 'tweeze'
    : 'place';

  // Handle swoosh ingredient selection (tap on tray)
  const handleSwooshSelect = useCallback(() => {
    if (!currentIngredient || timerState === 'expired') return;

    audioManager.play('place_pickup');
    setSwooshState({ selected: true, active: false, ingredientId: currentIngredient.id });
  }, [currentIngredient, timerState]);

  // Handle dot ingredient selection (tap on tray)
  const handleDotSelect = useCallback(() => {
    if (!currentIngredient || !currentIngredientDef || timerState === 'expired') return;

    audioManager.play('place_pickup');
    const count = currentIngredientDef.count ?? 1;
    setDotState({ selected: true, ingredientId: currentIngredient.id, remainingCount: count });
  }, [currentIngredient, currentIngredientDef, timerState]);

  // Handle scatter ingredient selection (tap on tray)
  const handleScatterSelect = useCallback(() => {
    if (!currentIngredient || timerState === 'expired') return;

    audioManager.play('place_pickup');
    setScatterState({ selected: true, active: false, ingredientId: currentIngredient.id });
  }, [currentIngredient, timerState]);

  // Handle drizzle ingredient selection (tap on tray)
  const handleDrizzleSelect = useCallback(() => {
    if (!currentIngredient || timerState === 'expired') return;

    audioManager.play('place_pickup');
    setDrizzleState({ selected: true, active: false, ingredientId: currentIngredient.id });
  }, [currentIngredient, timerState]);

  // Handle quenelle ingredient selection (tap on tray)
  const handleQuenelleSelect = useCallback(() => {
    if (!currentIngredient || timerState === 'expired') return;

    audioManager.play('place_pickup');
    setQuenelleState({ selected: true, active: false, ingredientId: currentIngredient.id });
  }, [currentIngredient, timerState]);

  // Auto-select swoosh ingredients when they become active
  useEffect(() => {
    if (currentIngredientDef?.gesture === 'swoosh' && currentIngredient && !swooshState.selected) {
      setSwooshState({ selected: true, active: false, ingredientId: currentIngredient.id });
    }
  }, [currentIngredient, currentIngredientDef, swooshState.selected]);

  // Auto-select dot ingredients when they become active
  // This allows players to immediately start tapping dots without first tapping the tray
  useEffect(() => {
    if (currentIngredientDef?.gesture === 'dot' && currentIngredient && !dotState.selected) {
      const count = currentIngredientDef.count ?? 1;
      setDotState({ selected: true, ingredientId: currentIngredient.id, remainingCount: count });
    }
  }, [currentIngredient, currentIngredientDef, dotState.selected]);

  // Auto-select scatter ingredients when they become active
  useEffect(() => {
    if (currentIngredientDef?.gesture === 'scatter' && currentIngredient && !scatterState.selected) {
      setScatterState({ selected: true, active: false, ingredientId: currentIngredient.id });
    }
  }, [currentIngredient, currentIngredientDef, scatterState.selected]);

  // Auto-select drizzle ingredients when they become active
  useEffect(() => {
    if (currentIngredientDef?.gesture === 'drizzle' && currentIngredient && !drizzleState.selected) {
      setDrizzleState({ selected: true, active: false, ingredientId: currentIngredient.id });
    }
  }, [currentIngredient, currentIngredientDef, drizzleState.selected]);

  // Auto-select quenelle ingredients when they become active
  useEffect(() => {
    if (currentIngredientDef?.gesture === 'quenelle' && currentIngredient && !quenelleState.selected) {
      setQuenelleState({ selected: true, active: false, ingredientId: currentIngredient.id });
    }
  }, [currentIngredient, currentIngredientDef, quenelleState.selected]);

  // Get toast message - prioritize time expired, then swoosh, then precision
  const getToastMessageToShow = (): string | null => {
    if (timerState === 'expired' && !timeExpiredToastShown) {
      return 'Time.';
    }
    if (swooshToast) {
      return swooshToast;
    }
    if (latestPrecision) {
      return getToastMessage(latestPrecision.zone);
    }
    return null;
  };

  const toastMessage = getToastMessageToShow();

  // Handle toast dismiss
  const handleToastDismiss = useCallback(() => {
    if (timerState === 'expired' && !timeExpiredToastShown) {
      setTimeExpiredToastShown(true);
      failDish('time');
    } else if (swooshToast) {
      setSwooshToast(null);
    } else {
      clearLatestPrecision();
    }
  }, [timerState, timeExpiredToastShown, swooshToast, clearLatestPrecision, failDish]);

  // Navigate to results when phase is complete or failed
  useEffect(() => {
    if (phase === 'complete' || phase === 'failed') {
      const timer = setTimeout(() => {
        navigate('/results');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [phase, navigate]);


  // Tray drag handlers - for place gestures only
  const handleTrayDragStart = useCallback((clientX: number, clientY: number) => {
    if (!currentIngredient || timerState === 'expired') return;

    // Regular place gesture
    setIsDragging(true);
    setDragState({ x: clientX, y: clientY, visible: true });
    audioManager.play('place_pickup');
  }, [currentIngredient, timerState, setIsDragging]);

  const handleTrayDragMove = useCallback((clientX: number, clientY: number) => {
    if (!currentIngredient) return;
    // Regular drag
    setDragState({ x: clientX, y: clientY, visible: true });

    // Check if over target for tutorial hints
    const game = gameRef.current;
    const canvas = containerRef.current?.querySelector('canvas');
    if (game && canvas) {
      const rect = canvas.getBoundingClientRect();
      const canvasX = clientX - rect.left;
      const canvasY = clientY - rect.top;
      setIsOverTarget(game.isPointOverPlate(canvasX, canvasY));
    }
  }, [currentIngredient]);

  const handleTrayDragEnd = useCallback((clientX: number, clientY: number) => {
    if (!currentIngredient || !gameRef.current) {
      setIsDragging(false);
      setDragState(prev => ({ ...prev, visible: false }));
      setIsOverTarget(false);
      return;
    }

    const game = gameRef.current;
    const canvas = containerRef.current?.querySelector('canvas');
    if (!canvas) {
      setIsDragging(false);
      setDragState(prev => ({ ...prev, visible: false }));
      setIsOverTarget(false);
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const canvasX = clientX - rect.left;
    const canvasY = clientY - rect.top;

    // Regular place gesture
    const isOverPlate = game.isPointOverPlate(canvasX, canvasY);
    const platePosition = isOverPlate ? game.getPlateLocalPosition(canvasX, canvasY) : null;

    if (isOverPlate && platePosition) {
      audioManager.play('place_drop');

      // Check if this is a multipoint target (like duck × 3)
      const isMultipoint = game.isMultipointIngredient(currentIngredient.id);

      if (isMultipoint) {
        // Use multipoint placement logic
        const multipointResult = game.placeMultipoint(
          currentIngredient.id,
          platePosition.x,
          platePosition.y
        );

        if (multipointResult) {
          // Show toast
          const toastMsg = getPlaceResultToastMessage(multipointResult);
          if (toastMsg) {
            setSwooshToast(toastMsg);
          }

          // Record precision
          recordPrecision({
            zone: multipointResult.zone,
            score: multipointResult.techniqueScore,
            distance: 0,
            maxDistance: 0,
          });

          // Play feedback sound
          setTimeout(() => {
            switch (multipointResult.zone) {
              case 'perfect':
                audioManager.play('perfect');
                break;
              case 'great':
                audioManager.play('great');
                break;
              case 'good':
                audioManager.play('good');
                break;
              case 'miss':
                audioManager.play('miss');
                break;
            }
          }, 100);

          // Update multipoint state
          setMultipointPlaceState({
            active: multipointResult.remainingCount > 0,
            ingredientId: currentIngredient.id,
            remainingCount: multipointResult.remainingCount,
            totalCount: multipointResult.totalCount ?? currentIngredientDef?.count ?? 1,
          });

          // Only move to next ingredient when all positions are filled
          if (multipointResult.remainingCount === 0) {
            placeElement(currentIngredient.id, platePosition.x, platePosition.y);

            const currentId = currentIngredient.id;
            const next = dish.ingredients.find(i => i.id !== currentId && !placedElements.some(p => p.id === i.id));

            if (next) {
              setCurrentIngredient({ id: next.id, name: next.name });
              game.showGhostForIngredient(next.id);
            } else {
              setCurrentIngredient(null);
              setTimeout(() => {
                completeDish();
              }, 300);
            }

            // Reset multipoint state
            setMultipointPlaceState({ active: false, ingredientId: null, remainingCount: 0, totalCount: 0 });
          }
        }
      } else {
        // Single point placement (original logic)
        const result = game.placeElementWithScoring(
          currentIngredient.id,
          platePosition.x,
          platePosition.y
        );

        if (result) {
          recordPrecision(result.precision);
          placeElement(currentIngredient.id, platePosition.x, platePosition.y);

          setTimeout(() => {
            switch (result.precision.zone) {
              case 'perfect':
                audioManager.play('perfect');
                break;
              case 'great':
                audioManager.play('great');
                break;
              case 'good':
                audioManager.play('good');
                break;
              case 'miss':
                audioManager.play('miss');
                break;
            }
          }, 100);
        } else {
          game.addPlacedElement(currentIngredient.id, platePosition.x, platePosition.y);
          placeElement(currentIngredient.id, platePosition.x, platePosition.y);
        }

        // Move to next ingredient or complete dish
        const currentId = currentIngredient.id;
        const next = dish.ingredients.find(i => i.id !== currentId && !placedElements.some(p => p.id === i.id));

        if (next) {
          setCurrentIngredient({ id: next.id, name: next.name });
          // Show ghost for next ingredient
          game.showGhostForIngredient(next.id);
        } else {
          setCurrentIngredient(null);
          setTimeout(() => {
            completeDish();
          }, 300);
        }
      }
    } else {
      audioManager.play('miss');
    }

    setIsDragging(false);
    setDragState(prev => ({ ...prev, visible: false }));
    setIsOverTarget(false);
  }, [currentIngredient, currentIngredientDef, dish.ingredients, placedElements, placeElement, setCurrentIngredient, setIsDragging, recordPrecision, completeDish]);

  // Canvas pointer handlers for swoosh, dot, scatter, drizzle, and quenelle gestures (draw/tap directly on plate)
  const handleCanvasPointerDown = useCallback((e: React.PointerEvent) => {
    // Check if swoosh, dot, scatter, drizzle, or quenelle is selected
    const isSwooshSelected = swooshState.selected;
    const isDotSelected = dotState.selected;
    const isScatterSelected = scatterState.selected;
    const isDrizzleSelected = drizzleState.selected;
    const isQuenelleSelected = quenelleState.selected;

    if ((!isSwooshSelected && !isDotSelected && !isScatterSelected && !isDrizzleSelected && !isQuenelleSelected) || !currentIngredient || timerState === 'expired') return;
    // Ignore if we're already tracking a pointer
    if (activePointerRef.current !== null) return;

    const game = gameRef.current;
    const canvas = containerRef.current?.querySelector('canvas');
    const container = containerRef.current;
    if (!game || !canvas || !container) return;

    const rect = canvas.getBoundingClientRect();
    const canvasX = e.clientX - rect.left;
    const canvasY = e.clientY - rect.top;

    // Only start if pointer is over the plate
    if (game.isPointOverPlate(canvasX, canvasY)) {
      e.preventDefault();
      e.stopPropagation();

      // Capture pointer on the container element
      container.setPointerCapture(e.pointerId);
      activePointerRef.current = e.pointerId;

      if (isSwooshSelected) {
        game.startSwoosh(currentIngredient.id, {
          x: canvasX,
          y: canvasY,
          timestamp: performance.now(),
          pressure: 0.5,
        });
        setSwooshState(prev => ({ ...prev, active: true }));
      } else if (isScatterSelected) {
        game.startScatter(currentIngredient.id, {
          x: canvasX,
          y: canvasY,
          timestamp: performance.now(),
          pressure: 0.5,
        });
        setScatterState(prev => ({ ...prev, active: true }));
      } else if (isDrizzleSelected) {
        game.startDrizzle(currentIngredient.id, {
          x: canvasX,
          y: canvasY,
          timestamp: performance.now(),
          pressure: 0.5,
        });
        setDrizzleState(prev => ({ ...prev, active: true }));
      } else if (isQuenelleSelected) {
        game.startQuenelle(currentIngredient.id, {
          x: canvasX,
          y: canvasY,
          timestamp: performance.now(),
          pressure: 0.5,
        });
        setQuenelleState(prev => ({ ...prev, active: true }));
      }
      // For dot gestures, we just track the pointer but don't start anything special
    }
  }, [swooshState.selected, dotState.selected, scatterState.selected, drizzleState.selected, quenelleState.selected, currentIngredient, timerState]);

  const handleCanvasPointerMove = useCallback((e: React.PointerEvent) => {
    // Only handle move for the active pointer
    if (activePointerRef.current !== e.pointerId) return;
    if ((!swooshState.active && !scatterState.active && !drizzleState.active && !quenelleState.active) || !currentIngredient) return;

    const game = gameRef.current;
    const canvas = containerRef.current?.querySelector('canvas');
    if (!game || !canvas) return;

    const rect = canvas.getBoundingClientRect();
    const canvasX = e.clientX - rect.left;
    const canvasY = e.clientY - rect.top;

    if (swooshState.active) {
      game.updateSwoosh({
        x: canvasX,
        y: canvasY,
        timestamp: performance.now(),
        pressure: 0.5,
      });
    } else if (scatterState.active) {
      game.updateScatter({
        x: canvasX,
        y: canvasY,
        timestamp: performance.now(),
        pressure: 0.5,
      });
    } else if (drizzleState.active) {
      game.updateDrizzle({
        x: canvasX,
        y: canvasY,
        timestamp: performance.now(),
        pressure: 0.5,
      });
    } else if (quenelleState.active) {
      game.updateQuenelle({
        x: canvasX,
        y: canvasY,
        timestamp: performance.now(),
        pressure: 0.5,
      });
    }
  }, [swooshState.active, scatterState.active, drizzleState.active, quenelleState.active, currentIngredient]);

  const handleCanvasPointerUp = useCallback((e: React.PointerEvent) => {
    const container = containerRef.current;
    const game = gameRef.current;
    const canvas = containerRef.current?.querySelector('canvas');

    // If we have an active pointer, release it
    if (activePointerRef.current !== null && container) {
      try {
        container.releasePointerCapture(activePointerRef.current);
      } catch {
        // Ignore if already released
      }
      activePointerRef.current = null;
    }

    // Handle DOT gesture
    // Guard against double-firing from multiple pointer events (pointerup + lostpointercapture)
    if (dotState.selected && currentIngredient && game && canvas && !dotPlacementInProgressRef.current) {
      dotPlacementInProgressRef.current = true;

      const rect = canvas.getBoundingClientRect();
      const canvasX = e.clientX - rect.left;
      const canvasY = e.clientY - rect.top;

      // Only place dot if over plate
      if (game.isPointOverPlate(canvasX, canvasY)) {
        const platePosition = game.getPlateLocalPosition(canvasX, canvasY);
        if (platePosition) {
          // Place the dot
          const result = game.placeDot(currentIngredient.id, platePosition.x, platePosition.y);

          if (result) {
            // Play dot sound
            audioManager.play('dot_drop');

            // Show toast for dot result
            const toastMsg = getDotToastMessage(result);
            if (toastMsg) {
              setSwooshToast(toastMsg);
            }

            // Play feedback sound
            setTimeout(() => {
              if (result.techniqueScore >= 90) {
                audioManager.play('perfect');
              } else if (result.techniqueScore >= 70) {
                audioManager.play('great');
              } else if (result.techniqueScore >= 50) {
                audioManager.play('good');
              } else {
                audioManager.play('miss');
              }
            }, 100);

            // Record precision
            recordPrecision({
              zone: result.techniqueScore >= 90 ? 'perfect'
                : result.techniqueScore >= 70 ? 'great'
                : result.techniqueScore >= 50 ? 'good'
                : result.success ? 'acceptable' : 'miss',
              score: result.techniqueScore,
              distance: 0,
              maxDistance: 0,
            });

            // Update remaining count
            setDotState(prev => ({ ...prev, remainingCount: result.remainingDots }));

            // If all dots placed, move to next ingredient
            if (result.remainingDots === 0) {
              placeElement(currentIngredient.id, 0, 0);

              const currentId = currentIngredient.id;
              const next = dish.ingredients.find(i => i.id !== currentId && !placedElements.some(p => p.id === i.id));

              if (next) {
                setCurrentIngredient({ id: next.id, name: next.name });
                game.showGhostForIngredient(next.id);
              } else {
                setCurrentIngredient(null);
                setTimeout(() => {
                  completeDish();
                }, 300);
              }

              // Reset dot state
              setDotState({ selected: false, ingredientId: null, remainingCount: 0 });
            }
          }
        }
      }

      // Reset the guard after a short delay to allow next tap
      setTimeout(() => {
        dotPlacementInProgressRef.current = false;
      }, 50);
      return;
    }

    // Handle SCATTER gesture
    if (scatterState.active && currentIngredient && game && canvas) {
      const rect = canvas.getBoundingClientRect();
      const canvasX = e.clientX - rect.left;
      const canvasY = e.clientY - rect.top;

      // End scatter and trigger particles
      const result = game.endScatter({
        x: canvasX,
        y: canvasY,
        timestamp: performance.now(),
        pressure: 0.5,
      });

      if (result) {
        // Play scatter sound
        audioManager.play('dot_drop'); // TODO: add scatter_release sound

        // The actual scoring happens asynchronously when particles settle
        // Set up callback for when scoring is complete
        game.onScatterComplete = (scatterResult: ScatterResult) => {
          // Show toast
          const toastMsg = getScatterToastMessage(scatterResult);
          if (toastMsg) {
            setSwooshToast(toastMsg);
          }

          // Play feedback sound
          setTimeout(() => {
            if (scatterResult.zone === 'perfect') {
              audioManager.play('perfect');
            } else if (scatterResult.zone === 'great') {
              audioManager.play('great');
            } else if (scatterResult.zone === 'good') {
              audioManager.play('good');
            } else {
              audioManager.play('miss');
            }
          }, 100);

          // Record precision
          recordPrecision({
            zone: scatterResult.zone,
            score: scatterResult.techniqueScore,
            distance: 0,
            maxDistance: 0,
          });
        };

        // Mark element as placed
        placeElement(currentIngredient.id, 0, 0);

        // Move to next ingredient or complete dish
        const currentId = currentIngredient.id;
        const next = dish.ingredients.find(i => i.id !== currentId && !placedElements.some(p => p.id === i.id));

        if (next) {
          setCurrentIngredient({ id: next.id, name: next.name });
          game.showGhostForIngredient(next.id);
        } else {
          setCurrentIngredient(null);
          // Wait for scatter to settle before completing
          setTimeout(() => {
            completeDish();
          }, 500);
        }
      }

      // Reset scatter state
      setScatterState({ selected: false, active: false, ingredientId: null });
      return;
    }

    // Handle DRIZZLE gesture
    if (drizzleState.active && currentIngredient && game && canvas) {
      const rect = canvas.getBoundingClientRect();
      const canvasX = e.clientX - rect.left;
      const canvasY = e.clientY - rect.top;

      // End drizzle and get result
      const result = game.endDrizzle({
        x: canvasX,
        y: canvasY,
        timestamp: performance.now(),
        pressure: 0.5,
      });

      if (result) {
        // Show toast for drizzle result
        const toastMsg = getSwooshToastMessage(result); // Reuse swoosh toast logic
        if (toastMsg) {
          setSwooshToast(toastMsg);
        }

        // Play feedback sound
        setTimeout(() => {
          if (result.techniqueScore >= 90) {
            audioManager.play('perfect');
          } else if (result.techniqueScore >= 70) {
            audioManager.play('great');
          } else if (result.techniqueScore >= 50) {
            audioManager.play('good');
          } else {
            audioManager.play('miss');
          }
        }, 100);

        // Record precision
        recordPrecision({
          zone: result.techniqueScore >= 90 ? 'perfect'
            : result.techniqueScore >= 70 ? 'great'
            : result.techniqueScore >= 50 ? 'good'
            : result.success ? 'acceptable' : 'miss',
          score: result.techniqueScore,
          distance: 0,
          maxDistance: 0,
        });

        // Mark element as placed
        placeElement(currentIngredient.id, 0, 0);

        // Move to next ingredient or complete dish
        const currentId = currentIngredient.id;
        const next = dish.ingredients.find(i => i.id !== currentId && !placedElements.some(p => p.id === i.id));

        if (next) {
          setCurrentIngredient({ id: next.id, name: next.name });
          game.showGhostForIngredient(next.id);
        } else {
          setCurrentIngredient(null);
          setTimeout(() => {
            completeDish();
          }, 300);
        }
      }

      // Reset drizzle state
      setDrizzleState({ selected: false, active: false, ingredientId: null });
      return;
    }

    // Handle QUENELLE gesture
    if (quenelleState.active && currentIngredient && game && canvas) {
      const rect = canvas.getBoundingClientRect();
      const canvasX = e.clientX - rect.left;
      const canvasY = e.clientY - rect.top;

      // End quenelle and get result
      const result = game.endQuenelle({
        x: canvasX,
        y: canvasY,
        timestamp: performance.now(),
        pressure: 0.5,
      });

      if (result) {
        // Show toast for quenelle result
        const toastMsg = getQuenelleToastMessage(result);
        if (toastMsg) {
          setSwooshToast(toastMsg);
        }

        // Play feedback sound
        setTimeout(() => {
          if (result.techniqueScore >= 90) {
            audioManager.play('perfect');
          } else if (result.techniqueScore >= 70) {
            audioManager.play('great');
          } else if (result.techniqueScore >= 50) {
            audioManager.play('good');
          } else {
            audioManager.play('miss');
          }
        }, 100);

        // Record precision
        recordPrecision({
          zone: result.techniqueScore >= 90 ? 'perfect'
            : result.techniqueScore >= 70 ? 'great'
            : result.techniqueScore >= 50 ? 'good'
            : result.success ? 'acceptable' : 'miss',
          score: result.techniqueScore,
          distance: 0,
          maxDistance: 0,
        });

        // Mark element as placed
        placeElement(currentIngredient.id, 0, 0);

        // Move to next ingredient or complete dish
        const currentId = currentIngredient.id;
        const next = dish.ingredients.find(i => i.id !== currentId && !placedElements.some(p => p.id === i.id));

        if (next) {
          setCurrentIngredient({ id: next.id, name: next.name });
          game.showGhostForIngredient(next.id);
        } else {
          setCurrentIngredient(null);
          setTimeout(() => {
            completeDish();
          }, 300);
        }
      }

      // Reset quenelle state
      setQuenelleState({ selected: false, active: false, ingredientId: null });
      return;
    }

    // Handle SWOOSH gesture
    if (!swooshState.active || !currentIngredient || !game) {
      // If selected but not active, clicking elsewhere deselects swoosh
      if (swooshState.selected && !swooshState.active) {
        setSwooshState({ selected: false, active: false, ingredientId: null });
      }
      // If scatter is selected but not active, clicking elsewhere deselects
      if (scatterState.selected && !scatterState.active) {
        setScatterState({ selected: false, active: false, ingredientId: null });
      }
      // If drizzle is selected but not active, clicking elsewhere deselects
      if (drizzleState.selected && !drizzleState.active) {
        setDrizzleState({ selected: false, active: false, ingredientId: null });
      }
      // If quenelle is selected but not active, clicking elsewhere deselects
      if (quenelleState.selected && !quenelleState.active) {
        setQuenelleState({ selected: false, active: false, ingredientId: null });
      }
      // Don't deselect dot on off-plate clicks - keep it selected so player can continue tapping
      // Dots stay selected until all are placed
      return;
    }

    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const canvasX = e.clientX - rect.left;
    const canvasY = e.clientY - rect.top;

    // End swoosh and get result
    const result = game.endSwoosh({
      x: canvasX,
      y: canvasY,
      timestamp: performance.now(),
      pressure: 0.5,
    });

    if (result) {
      // Show toast for swoosh result
      const toastMsg = getSwooshToastMessage(result);
      if (toastMsg) {
        setSwooshToast(toastMsg);
      }

      // Play feedback sound
      setTimeout(() => {
        if (result.techniqueScore >= 90) {
          audioManager.play('perfect');
        } else if (result.techniqueScore >= 70) {
          audioManager.play('great');
        } else if (result.techniqueScore >= 50) {
          audioManager.play('good');
        } else {
          audioManager.play('miss');
        }
      }, 100);

      // Record as a precision score (technique score as precision)
      recordPrecision({
        zone: result.techniqueScore >= 90 ? 'perfect'
          : result.techniqueScore >= 70 ? 'great'
          : result.techniqueScore >= 50 ? 'good'
          : result.success ? 'acceptable' : 'miss',
        score: result.techniqueScore,
        distance: 0,
        maxDistance: 0,
      });

      // Mark element as placed
      placeElement(currentIngredient.id, 0, 0);
    }

    // Move to next ingredient or complete dish
    const currentId = currentIngredient.id;
    const next = dish.ingredients.find(i => i.id !== currentId && !placedElements.some(p => p.id === i.id));

    if (next) {
      setCurrentIngredient({ id: next.id, name: next.name });
      // Show ghost for next ingredient
      game.showGhostForIngredient(next.id);
    } else {
      setCurrentIngredient(null);
      // Check if dish complete
      setTimeout(() => {
        completeDish();
      }, 300);
    }

    // Reset swoosh state
    setSwooshState({ selected: false, active: false, ingredientId: null });
  }, [currentIngredient, dish.ingredients, placedElements, placeElement, setCurrentIngredient, recordPrecision, completeDish, swooshState.selected, swooshState.active, dotState.selected, scatterState.selected, scatterState.active, drizzleState.selected, drizzleState.active, quenelleState.selected, quenelleState.active]);

  // Initialize game when ready
  const initGame = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    let mounted = true;
    const game = new Game();
    gameRef.current = game;

    // Hook up the tick callback to update the timer
    game.onTick = (deltaSeconds: number) => {
      tick(deltaSeconds);
    };

    // Pass tutorial mode to game for enhanced ghost highlighting
    game.setTutorialMode(tutorial.enabled);

    // Start the dish in the store
    startDish(dish);

    game.init(container).then(() => {
      if (mounted) {
        // Load the dish
        game.loadDish(dish);
        setIsLoading(false);

        // Brief "ready" phase
        setPhase('ready');
        setTimeout(() => {
          setPhase('playing');
          // Start the timer
          startTimer(dish.maxTime);

          // Show ghost for first ingredient
          if (dish.ingredients[0]) {
            game.showGhostForIngredient(dish.ingredients[0].id);
          }
        }, 1000);
      }
    }).catch((err) => {
      console.error('Failed to initialize game:', err);
    });

    return () => {
      mounted = false;
      game.destroy();
      gameRef.current = null;
    };
  }, [dish, startDish, setPhase, startTimer, tick, tutorial.enabled]);

  // Initialize game based on tutorial phase
  useEffect(() => {
    // Skip intro/demo for non-tutorial restaurants or if already in evaluate
    if (!tutorial.enabled) {
      setTutorialPhase('evaluate');
    }
  }, [tutorial.enabled]);

  // Initialize game when entering play phases
  useEffect(() => {
    if (tutorialPhase === 'practice' || tutorialPhase === 'evaluate') {
      return initGame();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tutorialPhase]);

  // Disable interactions during non-playing phases
  const canInteract = phase === 'playing';

  // Disable canvas pointer events when swoosh, dot, scatter, drizzle, or quenelle is selected so React handlers work
  useEffect(() => {
    const canvas = containerRef.current?.querySelector('canvas');
    if (!canvas) return;

    if (swooshState.selected || dotState.selected || scatterState.selected || drizzleState.selected || quenelleState.selected) {
      canvas.style.pointerEvents = 'none';
    } else {
      canvas.style.pointerEvents = 'auto';
    }

    return () => {
      if (canvas) {
        canvas.style.pointerEvents = 'auto';
      }
    };
  }, [swooshState.selected, dotState.selected, scatterState.selected, drizzleState.selected, quenelleState.selected]);

  // Determine the drag overlay style based on current ingredient
  const getDragOverlayStyle = (): React.CSSProperties => {
    if (!currentIngredient) return {};

    const ingredient = dish.ingredients.find(i => i.id === currentIngredient.id);
    if (!ingredient) return {};

    // Don't show overlay for swoosh, scatter, drizzle, or quenelle gestures (rendered on canvas)
    if (ingredient.gesture === 'swoosh' || ingredient.gesture === 'scatter' || ingredient.gesture === 'drizzle' || ingredient.gesture === 'quenelle') return { display: 'none' };

    // Use shape info for styling
    if (ingredient.shape.type === 'circle') {
      const size = ingredient.shape.diameter;
      return {
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: ingredient.color ? `#${ingredient.color.toString(16).padStart(6, '0')}` : '#fbbf24',
      };
    } else if (ingredient.shape.type === 'roundRect') {
      const { width, height, radius } = ingredient.shape;
      return {
        width,
        height,
        borderRadius: radius,
        backgroundColor: ingredient.color ? `#${ingredient.color.toString(16).padStart(6, '0')}` : '#fbbf24',
      };
    }

    return {
      width: 48,
      height: 48,
      borderRadius: 4,
      backgroundColor: '#fbbf24',
    };
  };

  const dragOverlayStyle = getDragOverlayStyle();

  // Tutorial phase handlers
  const handleIntroComplete = useCallback(() => {
    if (tutorial.showDemonstration) {
      setTutorialPhase('demo');
    } else {
      setTutorialPhase('evaluate');
    }
  }, [tutorial.showDemonstration]);

  const handleDemoComplete = useCallback(() => {
    setTutorialPhase('evaluate');
  }, []);

  const handleDemoSkip = useCallback(() => {
    setTutorialPhase('evaluate');
  }, []);

  // Render intro screen for L'Institut
  if (tutorialPhase === 'intro' && tutorial.showLessonIntro && lessonData) {
    return <LessonIntro lesson={lessonData} onContinue={handleIntroComplete} />;
  }

  // Render demo screen
  if (tutorialPhase === 'demo' && tutorial.showDemonstration) {
    return (
      <Demonstration
        dishId={dish.id}
        onComplete={handleDemoComplete}
        onSkip={handleDemoSkip}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full w-full flex flex-col bg-foundation-100"
    >
      <GameHeader dishName={dish.name} backTo={menuUrl} />

      <div
        ref={containerRef}
        className={`flex-1 w-full relative touch-none ${(swooshState.selected || dotState.selected || scatterState.selected || drizzleState.selected || quenelleState.selected) ? 'cursor-crosshair' : ''}`}
        style={{ touchAction: 'none' }}
        onPointerDown={handleCanvasPointerDown}
        onPointerMove={handleCanvasPointerMove}
        onPointerUp={handleCanvasPointerUp}
        onPointerCancel={handleCanvasPointerUp}
        onLostPointerCapture={handleCanvasPointerUp}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-text-muted">Loading...</span>
          </div>
        )}

        {/* Ready indicator */}
        <AnimatePresence>
          {phase === 'ready' && !isLoading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
            >
              <span className="font-display text-4xl text-text-primary">Ready</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tutorial hints overlay */}
        {tutorial.showHints && canInteract && (
          <TutorialManager
            gesture={currentGestureType}
            phase={tutorialPhase}
            isDragging={isDragging || swooshState.active || scatterState.active || drizzleState.active || quenelleState.active}
            isOverTarget={isOverTarget}
            enabled={tutorial.showHints}
          />
        )}

        {/* Ingredient Label (floats above tray) */}
        <IngredientLabel name={canInteract && currentIngredient ? currentIngredient.name : null} />

        {/* Ingredient Tray */}
        <IngredientTray
          ingredient={canInteract ? currentIngredient : null}
          isDragging={isDragging}
          isSelected={swooshState.selected || dotState.selected || scatterState.selected || drizzleState.selected || quenelleState.selected}
          gestureType={currentGestureType}
          remainingCount={dotState.selected ? dotState.remainingCount : multipointPlaceState.active ? multipointPlaceState.remainingCount : undefined}
          totalCount={dotState.selected ? (currentIngredientDef?.count ?? 1) : multipointPlaceState.active ? multipointPlaceState.totalCount : undefined}
          onDragStart={handleTrayDragStart}
          onDragMove={handleTrayDragMove}
          onDragEnd={handleTrayDragEnd}
          onSelect={currentGestureType === 'quenelle' ? handleQuenelleSelect : currentGestureType === 'drizzle' ? handleDrizzleSelect : currentGestureType === 'scatter' ? handleScatterSelect : currentGestureType === 'dot' ? handleDotSelect : handleSwooshSelect}
        />

        {/* Dragged element overlay */}
        <AnimatePresence>
          {dragState.visible && currentIngredient && dragOverlayStyle.display !== 'none' && (
            <motion.div
              initial={{ opacity: 0.8, scale: 1 }}
              animate={{ opacity: 0.8, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.1 }}
              className="pointer-events-none fixed"
              style={{
                ...dragOverlayStyle,
                left: dragState.x + touchDragOffset.x - (typeof dragOverlayStyle.width === 'number' ? dragOverlayStyle.width / 2 : 24),
                top: dragState.y + touchDragOffset.y - (typeof dragOverlayStyle.height === 'number' ? dragOverlayStyle.height / 2 : 24),
              }}
            />
          )}
        </AnimatePresence>

        {/* Precision/timer feedback toast */}
        <Toast
          message={toastMessage}
          onDismiss={handleToastDismiss}
          duration={1500}
        />
      </div>
    </motion.div>
  );
}
