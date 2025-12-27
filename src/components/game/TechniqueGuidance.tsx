import { useIsTouchDevice } from '@/hooks';

type GestureType = 'place' | 'swoosh' | 'dot' | 'scatter' | 'drizzle' | 'quenelle' | 'tweeze';

interface TechniqueGuidanceProps {
  gestureType: GestureType;
  isSelected: boolean;
  remainingCount?: number;
}

/**
 * Provides clear, platform-specific guidance for each technique
 */
export function TechniqueGuidance({ gestureType, isSelected, remainingCount }: TechniqueGuidanceProps) {
  const isTouchDevice = useIsTouchDevice();

  const guidance = getGuidance(gestureType, isSelected, isTouchDevice, remainingCount);

  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-text-muted text-xs font-body uppercase tracking-widest">
        {guidance.action}
      </span>
      {guidance.hint && (
        <span className="text-text-muted/70 text-[10px] font-body">
          {guidance.hint}
        </span>
      )}
    </div>
  );
}

interface GuidanceText {
  action: string;
  hint?: string;
}

function getGuidance(
  gestureType: GestureType,
  isSelected: boolean,
  isTouchDevice: boolean,
  remainingCount?: number
): GuidanceText {
  switch (gestureType) {
    case 'place':
      if (isTouchDevice) {
        return {
          action: remainingCount ? `Drag to plate · ${remainingCount} left` : 'Drag to plate',
          hint: 'Hold and drag to the dashed outline',
        };
      }
      return {
        action: remainingCount ? `Drag to plate · ${remainingCount} left` : 'Drag to plate',
        hint: 'Click and drag to the dashed outline',
      };

    case 'swoosh':
      if (!isSelected) {
        return {
          action: isTouchDevice ? 'Tap to select' : 'Click to select',
        };
      }
      if (isTouchDevice) {
        return {
          action: 'Draw swoosh on plate',
          hint: 'Swipe along the curved path',
        };
      }
      return {
        action: 'Draw swoosh on plate',
        hint: 'Click and drag along the curved path',
      };

    case 'dot':
      if (!isSelected) {
        return {
          action: isTouchDevice ? 'Tap to select' : 'Click to select',
        };
      }
      if (isTouchDevice) {
        return {
          action: `Tap plate · ${remainingCount ?? 0} left`,
          hint: 'Tap near each dashed circle',
        };
      }
      return {
        action: `Click plate · ${remainingCount ?? 0} left`,
        hint: 'Click near each dashed circle',
      };

    case 'scatter':
      if (!isSelected) {
        return {
          action: isTouchDevice ? 'Tap to select' : 'Click to select',
        };
      }
      if (isTouchDevice) {
        return {
          action: 'Flick to scatter',
          hint: 'Quick flick gesture into the zone',
        };
      }
      return {
        action: 'Flick to scatter',
        hint: 'Quick click-drag-release into the zone',
      };

    case 'drizzle':
      if (!isSelected) {
        return {
          action: isTouchDevice ? 'Tap to select' : 'Click to select',
        };
      }
      if (isTouchDevice) {
        return {
          action: 'Drizzle on plate',
          hint: 'Trace the thin dashed line smoothly',
        };
      }
      return {
        action: 'Drizzle on plate',
        hint: 'Click and drag along the thin dashed line',
      };

    case 'quenelle':
      if (!isSelected) {
        return {
          action: isTouchDevice ? 'Tap to select' : 'Click to select',
        };
      }
      if (isTouchDevice) {
        return {
          action: 'Shape quenelle',
          hint: 'Arc, pause briefly, then release',
        };
      }
      return {
        action: 'Shape quenelle',
        hint: 'Drag in arc, hold briefly, then release',
      };

    case 'tweeze':
      if (!isSelected) {
        return {
          action: isTouchDevice ? 'Tap to select' : 'Click to select',
        };
      }
      if (isTouchDevice) {
        return {
          action: `Place precisely · ${remainingCount ?? 0} left`,
          hint: 'Hold to grip, drag to crosshair, release',
        };
      }
      return {
        action: `Place precisely · ${remainingCount ?? 0} left`,
        hint: 'Click-hold to grip, drag to crosshair, release',
      };

    default:
      return {
        action: 'Drag to plate',
      };
  }
}

/**
 * Get a short instruction string for the tray (single line)
 */
export function getShortInstruction(
  gestureType: GestureType,
  isSelected: boolean,
  isTouchDevice: boolean,
  remainingCount?: number
): string {
  switch (gestureType) {
    case 'place':
      return remainingCount ? `Drag to plate · ${remainingCount} left` : 'Drag to plate';

    case 'swoosh':
      return isSelected ? 'Draw swoosh' : (isTouchDevice ? 'Tap to select' : 'Click to select');

    case 'dot':
      return isSelected
        ? `${isTouchDevice ? 'Tap' : 'Click'} plate · ${remainingCount ?? 0} left`
        : (isTouchDevice ? 'Tap to select' : 'Click to select');

    case 'scatter':
      return isSelected ? 'Flick to scatter' : (isTouchDevice ? 'Tap to select' : 'Click to select');

    case 'drizzle':
      return isSelected ? 'Trace the line' : (isTouchDevice ? 'Tap to select' : 'Click to select');

    case 'quenelle':
      return isSelected ? 'Arc → pause → release' : (isTouchDevice ? 'Tap to select' : 'Click to select');

    case 'tweeze':
      return isSelected
        ? `Hold → place · ${remainingCount ?? 0} left`
        : (isTouchDevice ? 'Tap to select' : 'Click to select');

    default:
      return 'Drag to plate';
  }
}
