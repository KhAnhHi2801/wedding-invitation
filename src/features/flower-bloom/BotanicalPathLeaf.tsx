import React, { memo } from 'react';

interface BotanicalPathLeafProps {
  id: string;
  nodeX: number;
  nodeY: number;
  unfurlProgress: number; // 0 to 1, begins strictly when stem tip passes nodeY
  pathD: string;          // Leaf blade contour starting at node (0, 0)
  veinD?: string;         // Midrib vein path starting at (0, 0)
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  maxReach?: number;      // Maximum length in pixels from node to tip
  uncurlAngle?: number;   // Angle in degrees that the leaf uncurls away from stem axis
}

/**
 * BotanicalPathLeaf (Mobile-Optimized):
 * Uses direct node-anchored hardware-accelerated transforms without heavy SVG clipPath masks.
 * Ensures 60-120 FPS buttery-smooth performance on iPhone and Android mobile browsers.
 */
export const BotanicalPathLeaf: React.FC<BotanicalPathLeafProps> = memo(({
  nodeX,
  nodeY,
  unfurlProgress,
  pathD,
  veinD,
  fill,
  stroke = 'none',
  strokeWidth = 0.8,
  uncurlAngle = 8,
}) => {
  if (unfurlProgress <= 0.003) return null;

  const p = Math.min(1, Math.max(0, unfurlProgress));
  // Smooth cubic ease-out
  const eased = 1 - Math.pow(1 - p, 3);

  // Longitudinal expansion along the leaf axis strictly from node (0,0)
  const lengthScale = 0.08 + eased * 0.92;
  const widthScale = 0.05 + Math.pow(eased, 1.4) * 0.95;
  const currentAngle = (1 - eased) * uncurlAngle;

  return (
    <g
      transform={`translate(${nodeX}, ${nodeY})`}
      style={{
        transform: `translate(${nodeX}px, ${nodeY}px) rotate(${currentAngle}deg) scale(${lengthScale}, ${widthScale})`,
        transformOrigin: '0px 0px',
        willChange: 'transform',
      }}
    >
      {/* Leaf Blade Lamina */}
      <path
        d={pathD}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        style={{ shapeRendering: 'geometricPrecision' }}
      />

      {/* Midrib Vein drawing from stem node to apex via strokeDashoffset */}
      {veinD && (
        <path
          d={veinD}
          stroke={stroke !== 'none' ? stroke : '#5C6D53'}
          strokeWidth={1}
          fill="none"
          pathLength="100"
          strokeDasharray="100"
          strokeDashoffset={100 * (1 - eased)}
          opacity={0.65}
        />
      )}
    </g>
  );
});

BotanicalPathLeaf.displayName = 'BotanicalPathLeaf';
