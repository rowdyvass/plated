import type { ReactNode } from 'react';
import type { DishDefinition } from '@/types/dishes';

interface DishPreviewProps {
  dish: DishDefinition;
  size?: number;
}

/**
 * Convert a hex number to CSS color string
 */
function hexToColor(hex: number | undefined, fallback: string): string {
  if (hex === undefined) return fallback;
  return `#${hex.toString(16).padStart(6, '0')}`;
}

/**
 * Renders a stylized SVG preview of a dish's target plating
 * Uses the dish definition to show ingredient placements
 */
export function DishPreview({ dish, size = 80 }: DishPreviewProps) {
  const center = size / 2;
  const plateRadius = size * 0.42;
  const rimWidth = size * 0.03;

  // Map ingredients by ID for quick lookup
  const ingredientMap = new Map(
    dish.ingredients.map((ing) => [ing.id, ing])
  );

  // Render elements for each target
  const renderTargetElements = () => {
    const elements: ReactNode[] = [];

    dish.targets.forEach((target, index) => {
      const ingredient = ingredientMap.get(target.ingredientId);
      if (!ingredient) return;

      const color = hexToColor(ingredient.color, '#8C8C8C');

      // Calculate position (normalized -1 to 1 -> actual pixels)
      const getPosition = (pos: { x: number; y: number }) => ({
        x: center + pos.x * plateRadius * 0.85,
        y: center + pos.y * plateRadius * 0.85,
      });

      if ('type' in target) {
        switch (target.type) {
          case 'point': {
            const pos = getPosition(target.position);
            const shape = ingredient.shape;

            if (shape.type === 'circle') {
              const r = (shape.diameter / 120) * plateRadius * 0.4;
              elements.push(
                <circle
                  key={`${target.id}-${index}`}
                  cx={pos.x}
                  cy={pos.y}
                  r={Math.max(r, 3)}
                  fill={color}
                  opacity={0.7}
                />
              );
            } else if (shape.type === 'roundRect') {
              const w = (shape.width / 120) * plateRadius * 0.5;
              const h = (shape.height / 120) * plateRadius * 0.5;
              elements.push(
                <rect
                  key={`${target.id}-${index}`}
                  x={pos.x - w / 2}
                  y={pos.y - h / 2}
                  width={Math.max(w, 4)}
                  height={Math.max(h, 3)}
                  rx={2}
                  fill={color}
                  opacity={0.7}
                  transform={`rotate(${target.rotation || 0} ${pos.x} ${pos.y})`}
                />
              );
            }
            break;
          }

          case 'multipoint': {
            target.positions.forEach((position, i) => {
              const pos = getPosition(position);
              const shape = ingredient.shape;
              const r = shape.type === 'circle'
                ? (shape.diameter / 120) * plateRadius * 0.3
                : 2;
              elements.push(
                <circle
                  key={`${target.id}-${index}-${i}`}
                  cx={pos.x}
                  cy={pos.y}
                  r={Math.max(r, 2)}
                  fill={color}
                  opacity={0.7}
                />
              );
            });
            break;
          }

          case 'path':
          case 'drizzle': {
            if (target.path && target.path.length >= 2) {
              const pathPoints = target.path.map((p) => getPosition(p));
              const pathD = pathPoints
                .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
                .join(' ');
              elements.push(
                <path
                  key={`${target.id}-${index}`}
                  d={pathD}
                  stroke={color}
                  strokeWidth={target.type === 'drizzle' ? 1.5 : 3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  opacity={0.6}
                />
              );
            }
            break;
          }

          case 'zone': {
            const zoneCenter = getPosition(target.zone.center);
            const zoneRadius = target.zone.radius * plateRadius * 0.6;
            // Render scattered dots in zone
            const dotCount = Math.min(target.idealCount || 5, 8);
            for (let i = 0; i < dotCount; i++) {
              const angle = (i / dotCount) * Math.PI * 2 + Math.random() * 0.5;
              const dist = zoneRadius * (0.3 + Math.random() * 0.6);
              elements.push(
                <circle
                  key={`${target.id}-${index}-scatter-${i}`}
                  cx={zoneCenter.x + Math.cos(angle) * dist}
                  cy={zoneCenter.y + Math.sin(angle) * dist}
                  r={1.5}
                  fill={color}
                  opacity={0.6}
                />
              );
            }
            break;
          }

          case 'quenelle': {
            const pos = getPosition(target.position);
            // Draw elongated oval shape for quenelle
            elements.push(
              <ellipse
                key={`${target.id}-${index}`}
                cx={pos.x}
                cy={pos.y}
                rx={plateRadius * 0.15}
                ry={plateRadius * 0.06}
                fill={color}
                opacity={0.7}
                transform={`rotate(${target.rotation || 0} ${pos.x} ${pos.y})`}
              />
            );
            break;
          }

          case 'tweeze': {
            const pos = getPosition(target.position);
            elements.push(
              <circle
                key={`${target.id}-${index}`}
                cx={pos.x}
                cy={pos.y}
                r={2}
                fill={color}
                opacity={0.7}
              />
            );
            break;
          }

          case 'dust': {
            // Render a subtle dusting pattern
            const dustCount = 12;
            const bounds = target.zone.bounds;
            for (let i = 0; i < dustCount; i++) {
              const x = center + (bounds.x + Math.random() * bounds.width) * plateRadius * 0.8;
              const y = center + (bounds.y + Math.random() * bounds.height) * plateRadius * 0.8;
              elements.push(
                <circle
                  key={`${target.id}-${index}-dust-${i}`}
                  cx={x}
                  cy={y}
                  r={0.8}
                  fill={color}
                  opacity={0.3}
                />
              );
            }
            break;
          }
        }
      } else {
        // Legacy point target
        const pos = getPosition(target.position);
        const shape = ingredient.shape;

        if (shape.type === 'circle') {
          const r = (shape.diameter / 120) * plateRadius * 0.4;
          elements.push(
            <circle
              key={`${target.id}-${index}`}
              cx={pos.x}
              cy={pos.y}
              r={Math.max(r, 3)}
              fill={color}
              opacity={0.7}
            />
          );
        } else if (shape.type === 'roundRect') {
          const w = (shape.width / 120) * plateRadius * 0.5;
          const h = (shape.height / 120) * plateRadius * 0.5;
          elements.push(
            <rect
              key={`${target.id}-${index}`}
              x={pos.x - w / 2}
              y={pos.y - h / 2}
              width={Math.max(w, 4)}
              height={Math.max(h, 3)}
              rx={2}
              fill={color}
              opacity={0.7}
              transform={`rotate(${target.rotation || 0} ${pos.x} ${pos.y})`}
            />
          );
        }
      }
    });

    return elements;
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="mx-auto"
      aria-hidden="true"
    >
      {/* Plate shadow */}
      <ellipse
        cx={center + 2}
        cy={center + 3}
        rx={plateRadius}
        ry={plateRadius * 0.2}
        fill="#D4C9BB"
        opacity={0.3}
      />

      {/* Plate rim */}
      <circle
        cx={center}
        cy={center}
        r={plateRadius}
        fill="#F8F4EC"
        stroke="#E8E0D5"
        strokeWidth={rimWidth}
      />

      {/* Plate inner surface */}
      <circle
        cx={center}
        cy={center}
        r={plateRadius - rimWidth * 2}
        fill="#FEFEFA"
      />

      {/* Subtle plate highlight */}
      <ellipse
        cx={center - plateRadius * 0.25}
        cy={center - plateRadius * 0.25}
        rx={plateRadius * 0.15}
        ry={plateRadius * 0.08}
        fill="white"
        opacity={0.4}
      />

      {/* Render dish elements */}
      {renderTargetElements()}
    </svg>
  );
}
