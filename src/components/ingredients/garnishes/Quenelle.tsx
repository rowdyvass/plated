/**
 * Quenelle - Classic French three-sided spoon-shaped garnish
 * Used for butter, mousses, sorbets, and creams
 */

import { IngredientBase, lighten, darken } from '../base';
import { IngredientBaseProps } from '../base/types';

interface QuenelleProps extends IngredientBaseProps {
  /** Base color of the quenelle */
  color?: string;
  /** Type affects texture rendering */
  type?: 'butter' | 'mousse' | 'sorbet' | 'cream';
}

export function Quenelle({
  size,
  rotation,
  scale,
  shadow,
  className,
  color = '#F5E6A3', // Default butter color
  type = 'butter',
}: QuenelleProps) {
  const highlight = lighten(color, 0.25);
  const shadowColor = darken(color, 0.15);

  // Texture opacity varies by type
  const textureOpacity = type === 'mousse' ? 0.1 : type === 'sorbet' ? 0.2 : 0.15;
  const sheenOpacity = type === 'butter' ? 0.5 : type === 'cream' ? 0.4 : 0.3;

  return (
    <IngredientBase
      size={size}
      rotation={rotation}
      scale={scale}
      shadow={shadow}
      className={className}
      baseWidth={56}
      baseHeight={28}
    >
      <svg width="100%" height="100%" viewBox="0 0 56 28" fill="none" preserveAspectRatio="xMidYMid meet">
        <defs>
          {/* Main body gradient */}
          <linearGradient id={`quenelleGrad-${color.replace('#', '')}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={highlight} />
            <stop offset="40%" stopColor={color} />
            <stop offset="100%" stopColor={shadowColor} />
          </linearGradient>

          {/* Top ridge highlight gradient */}
          <linearGradient id={`quenelleRidge-${color.replace('#', '')}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={highlight} stopOpacity="0.8" />
            <stop offset="50%" stopColor={highlight} />
            <stop offset="100%" stopColor={highlight} stopOpacity="0.6" />
          </linearGradient>
        </defs>

        {/* Soft shadow underneath */}
        <path
          d="M 6 20 Q 4 14, 8 10 Q 16 4, 28 4 Q 40 4, 48 10 Q 52 14, 50 20 Q 42 24, 28 24 Q 14 24, 6 20 Z"
          fill={shadowColor}
          opacity="0.2"
          transform="translate(1, 2)"
        />

        {/* Main quenelle body - elongated three-sided form */}
        <path
          d="M 6 20 Q 4 14, 8 10 Q 16 4, 28 4 Q 40 4, 48 10 Q 52 14, 50 20 Q 42 24, 28 24 Q 14 24, 6 20 Z"
          fill={`url(#quenelleGrad-${color.replace('#', '')})`}
        />

        {/* Top ridge - the characteristic quenelle peak */}
        <path
          d="M 10 10 Q 20 5, 28 4 Q 36 5, 46 10"
          fill="none"
          stroke={`url(#quenelleRidge-${color.replace('#', '')})`}
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Secondary highlight on ridge */}
        <path
          d="M 14 9 Q 22 5, 28 5 Q 34 5, 42 9"
          fill="none"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity={sheenOpacity}
        />

        {/* Side shading - left */}
        <path
          d="M 6 20 Q 5 16, 8 12"
          fill="none"
          stroke={shadowColor}
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.25"
        />

        {/* Subtle texture lines for mousse/cream */}
        {(type === 'mousse' || type === 'cream') && (
          <>
            <path d="M 16 12 Q 24 10, 32 12" stroke={shadowColor} strokeWidth="0.3" opacity={textureOpacity} />
            <path d="M 12 16 Q 24 14, 40 16" stroke={shadowColor} strokeWidth="0.3" opacity={textureOpacity} />
          </>
        )}

        {/* Crystalline texture for sorbet */}
        {type === 'sorbet' && (
          <>
            <circle cx="18" cy="12" r="0.8" fill="white" opacity="0.3" />
            <circle cx="28" cy="10" r="0.6" fill="white" opacity="0.25" />
            <circle cx="38" cy="12" r="0.7" fill="white" opacity="0.3" />
            <circle cx="24" cy="16" r="0.5" fill="white" opacity="0.2" />
            <circle cx="32" cy="15" r="0.6" fill="white" opacity="0.25" />
          </>
        )}
      </svg>
    </IngredientBase>
  );
}

/**
 * Pre-configured quenelle colors for common uses
 */
export function ButterQuenelle(props: IngredientBaseProps) {
  return <Quenelle {...props} color="#F5E6A3" type="butter" />;
}

export function CremeFraicheQuenelle(props: IngredientBaseProps) {
  return <Quenelle {...props} color="#FFFEF5" type="cream" />;
}

export function ChocolateMousseQuenelle(props: IngredientBaseProps) {
  return <Quenelle {...props} color="#4A3728" type="mousse" />;
}

export function SorbetQuenelle(props: IngredientBaseProps & { flavor?: 'lemon' | 'raspberry' | 'passion' | 'mango' }) {
  const colors = {
    lemon: '#FFF9C4',
    raspberry: '#E57373',
    passion: '#FFB74D',
    mango: '#FFCC80',
  };
  return <Quenelle {...props} color={colors[props.flavor || 'lemon']} type="sorbet" />;
}
