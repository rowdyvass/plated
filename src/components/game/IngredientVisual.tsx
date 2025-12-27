/**
 * IngredientVisual - Unified component for rendering ingredients across all states
 *
 * This component provides consistent visual representation across 4 states:
 * 1. TRAY: Full detailed illustration (master visual)
 * 2. DRAGGING: Solid silhouette in primary color (80% opacity)
 * 3. GHOST: Dashed outline of silhouette (target placement indicator)
 * 4. PLACED: Full detailed illustration (identical to TRAY)
 *
 * All states derive from the same source of truth to ensure visual consistency.
 */

import { useMemo } from 'react';
import { getIngredient } from '@/components/ingredients';
import { getIngredientDefinition } from '@/data/ingredients';
import type { IngredientSize } from '@/components/ingredients/base/types';

export type IngredientState = 'tray' | 'dragging' | 'ghost' | 'placed';

interface IngredientVisualNewProps {
  /** The ingredient ID to render */
  ingredientId: string;
  /** Visual state of the ingredient */
  state: IngredientState;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Rotation in degrees */
  rotation?: number;
  /** Ghost opacity (for ghost state) */
  ghostOpacity?: number;
  /** Additional CSS classes */
  className?: string;
  /** Show drop shadow */
  shadow?: boolean;
}

/** Size multipliers for each variant */
const sizeMultipliers = {
  sm: 0.67,
  md: 1,
  lg: 1.33,
};

/** Map our size to ingredient base sizes */
const sizeToIngredientSize: Record<'sm' | 'md' | 'lg', IngredientSize> = {
  sm: 'preview',
  md: 'plate',
  lg: 'detail',
};

/**
 * New unified IngredientVisual component with 4 visual states
 */
export function IngredientVisualNew({
  ingredientId,
  state,
  size = 'md',
  rotation = 0,
  ghostOpacity = 0.6,
  className = '',
  shadow = true,
}: IngredientVisualNewProps) {
  const definition = getIngredientDefinition(ingredientId);
  const IngredientComponent = getIngredient(ingredientId);

  // Calculate dimensions
  const multiplier = sizeMultipliers[size];
  const width = definition ? definition.dimensions.width * multiplier : 48 * multiplier;
  const height = definition ? definition.dimensions.height * multiplier : 48 * multiplier;

  // Memoize the style object
  const containerStyle = useMemo(() => ({
    width,
    height,
    transform: rotation !== 0 ? `rotate(${rotation}deg)` : undefined,
  }), [width, height, rotation]);

  // If no definition, fall back to basic rendering
  if (!definition) {
    // Fallback for unknown ingredients
    if (IngredientComponent) {
      return (
        <div
          className={`relative inline-flex items-center justify-center ${className}`}
          style={containerStyle}
        >
          <IngredientComponent
            size={sizeToIngredientSize[size]}
            shadow={shadow && (state === 'tray' || state === 'placed')}
          />
        </div>
      );
    }

    return (
      <div
        className={`rounded-xl bg-gradient-to-br from-amber-300 to-amber-500 ${className}`}
        style={containerStyle}
      />
    );
  }

  const { silhouettePath, primaryColor, dimensions } = definition;

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={containerStyle}
    >
      {/* STATE 1 & 4: TRAY & PLACED - Full detailed illustration */}
      {(state === 'tray' || state === 'placed') && IngredientComponent && (
        <IngredientComponent
          size={sizeToIngredientSize[size]}
          shadow={shadow}
        />
      )}

      {/* STATE 2: DRAGGING - Solid silhouette in primary color */}
      {state === 'dragging' && (
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          className="drop-shadow-md"
        >
          <path
            d={silhouettePath}
            fill={primaryColor}
            opacity={0.8}
          />
        </svg>
      )}

      {/* STATE 3: GHOST - Dashed outline of same shape */}
      {state === 'ghost' && (
        <GhostSilhouette
          path={silhouettePath}
          width={width}
          height={height}
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          color={primaryColor}
          opacity={ghostOpacity}
        />
      )}
    </div>
  );
}

/**
 * GhostSilhouette - Renders a dashed outline version of the ingredient
 */
interface GhostSilhouetteProps {
  path: string;
  width: number;
  height: number;
  viewBox: string;
  color: string;
  opacity: number;
}

function GhostSilhouette({ path, width, height, viewBox, color, opacity }: GhostSilhouetteProps) {
  // Convert color to a muted version for the fill
  const fillOpacity = 0.05;
  const accentColor = '#B87333'; // L'Institut copper accent

  return (
    <svg
      width={width}
      height={height}
      viewBox={viewBox}
      className="ghost-silhouette"
    >
      {/* Subtle fill */}
      <path
        d={path}
        fill={color}
        fillOpacity={fillOpacity}
      />
      {/* Dashed stroke outline */}
      <path
        d={path}
        fill="none"
        stroke={accentColor}
        strokeWidth={1.5}
        strokeDasharray="4 3"
        opacity={opacity}
      />
    </svg>
  );
}

/**
 * Utility: Get the ingredient's primary color
 */
export function getIngredientPrimaryColor(ingredientId: string): string {
  const definition = getIngredientDefinition(ingredientId);
  return definition?.primaryColor ?? '#B87333';
}

/**
 * Utility: Get the ingredient's silhouette path
 */
export function getIngredientSilhouette(ingredientId: string): string | null {
  const definition = getIngredientDefinition(ingredientId);
  return definition?.silhouettePath ?? null;
}

/**
 * Utility: Check if an ingredient has a full visual definition
 */
export function hasIngredientVisualDefinition(ingredientId: string): boolean {
  return getIngredientDefinition(ingredientId) !== null;
}

// ============================================================================
// LEGACY: Original IngredientVisual component for backwards compatibility
// This is the original component that uses the simple switch-case approach.
// It will be deprecated in favor of IngredientVisualNew once all dishes
// are verified to work with the new system.
// ============================================================================

interface IngredientVisualProps {
  ingredientId: string;
  size?: number; // Size in pixels (default 56)
  className?: string;
}

export function IngredientVisual({ ingredientId, size = 56, className = '' }: IngredientVisualProps) {
  // Render different visuals based on ingredient ID
  switch (ingredientId) {
    // Lesson 1: Butter Service
    case 'butter-pat':
      return <ButterVisual size={size} className={className} />;

    // Lesson 2: Leek Velouté
    case 'veloute-swoosh':
      return <SauceVisual size={size} color="#E8DCC8" className={className} />;
    case 'creme-fraiche':
      return <QuenelleVisual size={size} color="#FFFEF8" className={className} />;

    // Lesson 3: Tartare Classique
    case 'tartare-mound':
      return <TartareVisual size={size} className={className} />;
    case 'egg-yolk':
      return <EggYolkVisual size={size} className={className} />;
    case 'sauce-dots':
      return <SauceDotsVisual size={size} color="#4A3728" className={className} />;

    // Lesson 4: Spring Pea Salad
    case 'pea-shoots':
      return <PeaShootsVisual size={size} className={className} />;
    case 'peas':
      return <PeasVisual size={size} className={className} />;
    case 'mint-leaves':
      return <MintVisual size={size} className={className} />;
    case 'lemon-oil':
      return <SauceDotsVisual size={size} color="#E8D44D" className={className} />;

    // Lesson 5: Sole Meunière
    case 'brown-butter':
      return <SauceVisual size={size} color="#8B7355" className={className} />;
    case 'sole-fillet':
      return <SoleVisual size={size} className={className} />;
    case 'butter-quenelle':
      return <QuenelleVisual size={size} color="#F5E6A3" className={className} />;
    case 'parsley':
      return <HerbScatterVisual size={size} color="#228B22" className={className} />;

    // Lesson 6: Caprese Moderne
    case 'tomato':
      return <TomatoVisual size={size} className={className} />;
    case 'mozzarella':
      return <MozzarellaVisual size={size} className={className} />;
    case 'basil-oil':
      return <DrizzleVisual size={size} color="#4A7C23" className={className} />;
    case 'balsamic-dots':
      return <SauceDotsVisual size={size} color="#2C1810" className={className} />;

    // Lesson 7: Duck Breast
    case 'jus':
      return <SauceVisual size={size} color="#3D2314" className={className} />;
    case 'duck-slices':
      return <DuckVisual size={size} className={className} />;
    case 'micro-greens':
      return <MicroGreensVisual size={size} className={className} />;
    case 'flowers':
      return <EdibleFlowerVisual size={size} className={className} />;

    default:
      // Fallback - simple colored circle
      return (
        <div
          className={`rounded-xl bg-gradient-to-br from-amber-300 to-amber-500 ${className}`}
          style={{ width: size, height: size }}
        />
      );
  }
}

// Individual ingredient visual components (legacy)

function ButterVisual({ size, className }: { size: number; className: string }) {
  return (
    <div
      className={`relative rounded-lg overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Butter base */}
      <div className="absolute inset-1 rounded-md bg-gradient-to-br from-yellow-200 via-yellow-300 to-yellow-400" />
      {/* Butter shine */}
      <div className="absolute top-2 left-2 w-1/3 h-1/4 bg-white/40 rounded-sm blur-[1px]" />
      {/* Butter texture lines */}
      <div className="absolute bottom-3 left-2 right-2 h-[1px] bg-yellow-500/30" />
      <div className="absolute bottom-5 left-3 right-3 h-[1px] bg-yellow-500/20" />
    </div>
  );
}

function SauceVisual({ size, color, className }: { size: number; color: string; className: string }) {
  return (
    <div
      className={`relative rounded-xl overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-foundation-300/50 rounded-xl" />
      {/* Swoosh shape */}
      <svg viewBox="0 0 56 56" className="absolute inset-0 w-full h-full">
        <path
          d="M 12 35 Q 20 25, 28 28 Q 36 31, 44 24"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          opacity="0.9"
        />
        {/* Highlight */}
        <path
          d="M 12 35 Q 20 25, 28 28 Q 36 31, 44 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.3"
          transform="translate(-1, -1)"
        />
      </svg>
    </div>
  );
}

function QuenelleVisual({ size, color, className }: { size: number; color: string; className: string }) {
  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Quenelle ellipse */}
      <div
        className="absolute rounded-full"
        style={{
          width: size * 0.7,
          height: size * 0.4,
          background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
          boxShadow: `inset 2px 2px 4px rgba(255,255,255,0.4), inset -1px -1px 3px rgba(0,0,0,0.1)`,
          transform: 'rotate(-15deg)',
        }}
      />
    </div>
  );
}

function TartareVisual({ size, className }: { size: number; className: string }) {
  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Tartare mound */}
      <div
        className="rounded-full"
        style={{
          width: size * 0.75,
          height: size * 0.75,
          background: 'linear-gradient(135deg, #A0522D 0%, #8B4513 50%, #6B3410 100%)',
          boxShadow: 'inset 2px 2px 6px rgba(255,255,255,0.2), inset -2px -2px 6px rgba(0,0,0,0.3)',
        }}
      />
      {/* Texture dots */}
      <div className="absolute" style={{ width: size * 0.75, height: size * 0.75 }}>
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-red-900/40"
            style={{
              left: `${25 + Math.random() * 50}%`,
              top: `${25 + Math.random() * 50}%`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function EggYolkVisual({ size, className }: { size: number; className: string }) {
  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Yolk */}
      <div
        className="rounded-full"
        style={{
          width: size * 0.5,
          height: size * 0.5,
          background: 'radial-gradient(circle at 35% 35%, #FFE066 0%, #FFD700 40%, #DAA520 100%)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2), inset 0 0 8px rgba(255,255,255,0.4)',
        }}
      />
    </div>
  );
}

function SauceDotsVisual({ size, color, className }: { size: number; color: string; className: string }) {
  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Multiple dots */}
      <div className="relative" style={{ width: size * 0.7, height: size * 0.7 }}>
        {[
          { x: 20, y: 20 },
          { x: 60, y: 25 },
          { x: 40, y: 55 },
        ].map((pos, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: size * 0.18,
              height: size * 0.18,
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: 'translate(-50%, -50%)',
              background: `radial-gradient(circle at 35% 35%, ${color}ee 0%, ${color} 100%)`,
              boxShadow: 'inset 1px 1px 2px rgba(255,255,255,0.3)',
            }}
          />
        ))}
      </div>
    </div>
  );
}

function PeaShootsVisual({ size, className }: { size: number; className: string }) {
  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 56 56" className="w-full h-full">
        {/* Stems */}
        <path d="M 20 45 Q 22 30, 18 15" fill="none" stroke="#228B22" strokeWidth="1.5" />
        <path d="M 28 45 Q 28 28, 30 12" fill="none" stroke="#228B22" strokeWidth="1.5" />
        <path d="M 36 45 Q 34 32, 38 18" fill="none" stroke="#228B22" strokeWidth="1.5" />
        {/* Leaves */}
        <ellipse cx="16" cy="14" rx="5" ry="3" fill="#32CD32" transform="rotate(-30 16 14)" />
        <ellipse cx="32" cy="11" rx="5" ry="3" fill="#32CD32" transform="rotate(15 32 11)" />
        <ellipse cx="40" cy="17" rx="4" ry="2.5" fill="#32CD32" transform="rotate(-10 40 17)" />
        {/* Tendrils */}
        <path d="M 18 20 Q 14 22, 12 18" fill="none" stroke="#228B22" strokeWidth="0.8" />
        <path d="M 30 18 Q 34 20, 36 15" fill="none" stroke="#228B22" strokeWidth="0.8" />
      </svg>
    </div>
  );
}

function PeasVisual({ size, className }: { size: number; className: string }) {
  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Multiple peas */}
      {[
        { x: 30, y: 25, s: 0.22 },
        { x: 55, y: 35, s: 0.20 },
        { x: 40, y: 50, s: 0.24 },
        { x: 20, y: 45, s: 0.18 },
      ].map((pea, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: size * pea.s,
            height: size * pea.s,
            left: `${pea.x}%`,
            top: `${pea.y}%`,
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle at 35% 35%, #90EE90 0%, #32CD32 50%, #228B22 100%)',
            boxShadow: 'inset 1px 1px 2px rgba(255,255,255,0.5)',
          }}
        />
      ))}
    </div>
  );
}

function MintVisual({ size, className }: { size: number; className: string }) {
  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 56 56" className="w-full h-full">
        {/* Mint leaves */}
        <ellipse cx="28" cy="20" rx="10" ry="7" fill="#3CB371" />
        <ellipse cx="20" cy="32" rx="9" ry="6" fill="#2E8B57" transform="rotate(-25 20 32)" />
        <ellipse cx="36" cy="34" rx="8" ry="5" fill="#3CB371" transform="rotate(20 36 34)" />
        {/* Leaf veins */}
        <path d="M 28 14 L 28 26" stroke="#2E8B57" strokeWidth="0.5" fill="none" />
        <path d="M 16 30 L 24 34" stroke="#228B22" strokeWidth="0.5" fill="none" />
        <path d="M 32 32 L 40 36" stroke="#228B22" strokeWidth="0.5" fill="none" />
      </svg>
    </div>
  );
}

function SoleVisual({ size, className }: { size: number; className: string }) {
  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Fish fillet shape */}
      <div
        className="absolute"
        style={{
          width: size * 0.85,
          height: size * 0.4,
          background: 'linear-gradient(135deg, #F5F5DC 0%, #F0E68C 30%, #DEB887 100%)',
          borderRadius: '30% 60% 60% 30%',
          transform: 'rotate(-5deg)',
          boxShadow: 'inset 2px 2px 6px rgba(255,255,255,0.5), inset -1px -1px 4px rgba(0,0,0,0.1)',
        }}
      />
      {/* Sear marks */}
      <div
        className="absolute w-full h-0.5 bg-amber-700/30"
        style={{ top: '45%', transform: 'rotate(-5deg)' }}
      />
    </div>
  );
}

function HerbScatterVisual({ size, color, className }: { size: number; color: string; className: string }) {
  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Scattered herb pieces */}
      {[
        { x: 25, y: 20, r: 15 },
        { x: 55, y: 28, r: -20 },
        { x: 40, y: 45, r: 30 },
        { x: 20, y: 50, r: -10 },
        { x: 60, y: 55, r: 5 },
      ].map((herb, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            width: size * 0.12,
            height: size * 0.08,
            left: `${herb.x}%`,
            top: `${herb.y}%`,
            backgroundColor: color,
            borderRadius: '40%',
            transform: `translate(-50%, -50%) rotate(${herb.r}deg)`,
            boxShadow: 'inset 1px 0 1px rgba(255,255,255,0.3)',
          }}
        />
      ))}
    </div>
  );
}

function TomatoVisual({ size, className }: { size: number; className: string }) {
  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Tomato slice */}
      <div
        className="rounded-full"
        style={{
          width: size * 0.8,
          height: size * 0.8,
          background: 'radial-gradient(circle at 40% 40%, #FF6347 0%, #E53935 50%, #C62828 100%)',
          boxShadow: 'inset 2px 2px 6px rgba(255,255,255,0.3), inset -2px -2px 4px rgba(0,0,0,0.2)',
        }}
      />
      {/* Seed pattern */}
      <div className="absolute" style={{ width: size * 0.5, height: size * 0.5 }}>
        {[0, 72, 144, 216, 288].map((angle) => (
          <div
            key={angle}
            className="absolute w-1.5 h-0.5 bg-yellow-200/60 rounded-full"
            style={{
              left: '50%',
              top: '50%',
              transform: `rotate(${angle}deg) translateX(${size * 0.15}px)`,
              transformOrigin: 'left center',
            }}
          />
        ))}
      </div>
    </div>
  );
}

function MozzarellaVisual({ size, className }: { size: number; className: string }) {
  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Mozzarella slice */}
      <div
        className="rounded-full"
        style={{
          width: size * 0.75,
          height: size * 0.75,
          background: 'radial-gradient(circle at 35% 35%, #FFFFFF 0%, #FFFDE7 40%, #F5F5DC 100%)',
          boxShadow: 'inset 2px 2px 8px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.1)',
        }}
      />
    </div>
  );
}

function DrizzleVisual({ size, color, className }: { size: number; color: string; className: string }) {
  return (
    <div
      className={`relative rounded-xl overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-foundation-300/50 rounded-xl" />
      {/* Drizzle path */}
      <svg viewBox="0 0 56 56" className="absolute inset-0 w-full h-full">
        <path
          d="M 10 40 Q 18 35, 22 25 Q 26 15, 35 18 Q 44 21, 46 14"
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.85"
        />
        {/* Oil shine */}
        <path
          d="M 10 40 Q 18 35, 22 25 Q 26 15, 35 18 Q 44 21, 46 14"
          fill="none"
          stroke="white"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.4"
          transform="translate(-0.5, -0.5)"
        />
      </svg>
    </div>
  );
}

function DuckVisual({ size, className }: { size: number; className: string }) {
  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Duck slice stack */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="absolute"
          style={{
            width: size * 0.55,
            height: size * 0.3,
            left: `${20 + i * 12}%`,
            top: `${30 + i * 5}%`,
            background: `linear-gradient(135deg, #A0522D ${i * 10}%, #8B4513 50%, #654321 100%)`,
            borderRadius: '4px',
            transform: 'rotate(-5deg)',
            boxShadow: 'inset 1px 1px 3px rgba(255,255,255,0.2)',
            zIndex: 3 - i,
          }}
        />
      ))}
      {/* Fat cap highlights */}
      <div
        className="absolute bg-amber-100/50"
        style={{
          width: size * 0.5,
          height: 3,
          left: '22%',
          top: '32%',
          borderRadius: 2,
          transform: 'rotate(-5deg)',
        }}
      />
    </div>
  );
}

function MicroGreensVisual({ size, className }: { size: number; className: string }) {
  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 56 56" className="w-full h-full">
        {/* Tiny leaves cluster */}
        {[
          { x: 28, y: 28, r: 0 },
          { x: 22, y: 24, r: -30 },
          { x: 34, y: 24, r: 25 },
          { x: 20, y: 32, r: -45 },
          { x: 36, y: 32, r: 40 },
        ].map((leaf, i) => (
          <g key={i} transform={`translate(${leaf.x}, ${leaf.y}) rotate(${leaf.r})`}>
            <ellipse cx="0" cy="-6" rx="3" ry="5" fill="#228B22" opacity="0.9" />
            <line x1="0" y1="0" x2="0" y2="-4" stroke="#1B5E20" strokeWidth="0.5" />
          </g>
        ))}
      </svg>
    </div>
  );
}

function EdibleFlowerVisual({ size, className }: { size: number; className: string }) {
  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 56 56" className="w-full h-full">
        {/* Petals */}
        {[0, 60, 120, 180, 240, 300].map((angle) => (
          <ellipse
            key={angle}
            cx="28"
            cy="20"
            rx="6"
            ry="10"
            fill="#DA70D6"
            opacity="0.8"
            transform={`rotate(${angle} 28 28)`}
          />
        ))}
        {/* Center */}
        <circle cx="28" cy="28" r="5" fill="#FFD700" />
        <circle cx="28" cy="28" r="3" fill="#FFA500" />
      </svg>
    </div>
  );
}
