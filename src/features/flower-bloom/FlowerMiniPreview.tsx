import React, { memo } from 'react';
import type { FlowerDefinition } from '../../types/flower';

interface FlowerMiniPreviewProps {
  flower: FlowerDefinition;
  isSelected?: boolean;
}

export const FlowerMiniPreview: React.FC<FlowerMiniPreviewProps> = memo(({ flower }) => {
  const p = flower.palette;

  const renderIcon = () => {
    switch (flower.id) {
      case 'baby-breath':
        return (
          <g>
            <path d="M 24 38 L 24 22 M 24 25 L 14 15 M 24 22 L 34 14 M 14 15 L 8 12 M 14 15 L 16 8 M 34 14 L 38 8 M 34 14 L 41 15 M 24 16 L 24 8 M 20 18 L 18 11 M 28 18 L 30 11" stroke={p.stem} strokeWidth="1.4" strokeLinecap="round" />
            <circle cx="8" cy="12" r="2.6" fill="#FFFFFF" stroke="#D3CBC0" strokeWidth="0.5" />
            <circle cx="16" cy="8" r="2.8" fill="#FFFFFF" stroke="#D3CBC0" strokeWidth="0.5" />
            <circle cx="24" cy="8" r="3.0" fill="#FFFFFF" stroke="#D3CBC0" strokeWidth="0.5" />
            <circle cx="18" cy="11" r="2.5" fill="#FFFFFF" stroke="#D3CBC0" strokeWidth="0.5" />
            <circle cx="30" cy="11" r="2.5" fill="#FFFFFF" stroke="#D3CBC0" strokeWidth="0.5" />
            <circle cx="38" cy="8" r="2.8" fill="#FFFFFF" stroke="#D3CBC0" strokeWidth="0.5" />
            <circle cx="41" cy="15" r="2.6" fill="#FFFFFF" stroke="#D3CBC0" strokeWidth="0.5" />
            <circle cx="14" cy="15" r="2.2" fill="#FFFFFF" stroke="#D3CBC0" strokeWidth="0.5" />
            <circle cx="34" cy="14" r="2.2" fill="#FFFFFF" stroke="#D3CBC0" strokeWidth="0.5" />
          </g>
        );

      case 'peony':
        return (
          <g>
            <path d="M 24 40 L 24 28" stroke={p.stem} strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="24" cy="20" r="14" fill={p.secondary} />
            <circle cx="24" cy="20" r="10" fill={p.primary} />
            <circle cx="24" cy="20" r="6" fill={p.accent} />
            <circle cx="24" cy="20" r="2.5" fill={p.center} />
          </g>
        );

      case 'daisy':
        return (
          <g>
            <path d="M 24 40 L 24 24" stroke={p.stem} strokeWidth="2" strokeLinecap="round" />
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((ang, i) => (
              <ellipse
                key={i}
                cx="24"
                cy="14"
                rx="2"
                ry="7.5"
                fill={p.primary}
                stroke="#DDD6C9"
                strokeWidth="0.4"
                transform={`rotate(${ang} 24 22)`}
              />
            ))}
            <circle cx="24" cy="22" r="5" fill={p.center} stroke="#B68B1E" strokeWidth="0.6" />
          </g>
        );

      case 'tulip':
        return (
          <g>
            <path d="M 24 40 L 24 25" stroke={p.stem} strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 18 36 C 14 30, 15 22, 19 18" stroke={p.leaf} strokeWidth="2" fill="none" />
            <path d="M 24 28 C 15 25, 12 12, 18 8 C 22 14, 24 24, 24 28 Z" fill={p.primary} />
            <path d="M 24 28 C 33 25, 36 12, 30 8 C 26 14, 24 24, 24 28 Z" fill={p.primary} />
            <path d="M 24 28 C 19 22, 20 10, 24 6 C 28 10, 29 22, 24 28 Z" fill={p.secondary} />
          </g>
        );

      case 'sunflower':
        return (
          <g>
            <path d="M 24 40 L 24 25" stroke={p.stem} strokeWidth="3" strokeLinecap="round" />
            {[0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180, 202.5, 225, 247.5, 270, 292.5, 315, 337.5].map((ang, i) => (
              <path
                key={i}
                d="M 24 22 L 23 12 L 25 12 Z"
                fill={p.primary}
                stroke={p.secondary}
                strokeWidth="0.4"
                transform={`rotate(${ang} 24 22)`}
              />
            ))}
            <circle cx="24" cy="22" r="7.5" fill={p.center} stroke="#2D1C10" strokeWidth="0.8" />
            <circle cx="24" cy="22" r="3.5" fill="#C4932D" opacity="0.6" />
          </g>
        );

      case 'lavender':
        return (
          <g>
            <path d="M 24 40 L 24 10" stroke={p.stem} strokeWidth="2" strokeLinecap="round" />
            {[26, 22, 18, 14, 10].map((ly, i) => (
              <g key={i}>
                <ellipse cx="20" cy={ly} rx="3" ry="2" fill={p.primary} />
                <ellipse cx="28" cy={ly} rx="3" ry="2" fill={p.secondary} />
                <ellipse cx="24" cy={ly - 1} rx="2.5" ry="2" fill={p.accent} />
              </g>
            ))}
          </g>
        );

      case 'rose':
        return (
          <g>
            <path d="M 24 40 L 24 26" stroke={p.stem} strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="24" cy="20" r="13" fill={p.primary} />
            <path d="M 14 18 C 16 11, 32 11, 34 18 C 30 29, 18 29, 14 18 Z" fill={p.secondary} />
            <path d="M 19 18 C 21 14, 27 14, 29 18 C 27 23, 21 23, 19 18 Z" fill={p.accent} />
            <circle cx="24" cy="19" r="2.5" fill={p.center} />
          </g>
        );

      case 'calla-lily':
        return (
          <g>
            <path d="M 24 40 L 24 26" stroke={p.stem} strokeWidth="2.5" strokeLinecap="round" />
            {/* Spadix */}
            <line x1="24" y1="22" x2="24" y2="10" stroke={p.center} strokeWidth="2.5" strokeLinecap="round" />
            {/* Funnel spathe */}
            <path
              d="M 24 28 C 14 24, 12 12, 17 6 C 22 1, 29 4, 32 14 C 30 25, 24 28, 24 28 Z"
              fill={p.primary}
              stroke={p.secondary}
              strokeWidth="0.8"
            />
          </g>
        );

      case 'lotus':
        return (
          <g>
            <path d="M 24 40 L 24 26" stroke={p.stem} strokeWidth="2.5" strokeLinecap="round" />
            {/* Outer pink pointed petals */}
            <path d="M 24 26 C 14 24, 10 16, 11 12 C 16 16, 21 22, 24 26 Z" fill={p.primary} />
            <path d="M 24 26 C 34 24, 38 16, 37 12 C 32 16, 27 22, 24 26 Z" fill={p.primary} />
            <path d="M 24 26 C 18 20, 16 12, 20 8 C 23 14, 24 22, 24 26 Z" fill={p.secondary} />
            <path d="M 24 26 C 30 20, 32 12, 28 8 C 25 14, 24 22, 24 26 Z" fill={p.secondary} />
            <path d="M 24 26 C 21 18, 22 10, 24 5 C 26 10, 27 18, 24 26 Z" fill={p.accent} />
          </g>
        );

      case 'cherry-blossom':
        return (
          <g>
            <path d="M 24 40 L 24 24" stroke={p.stem} strokeWidth="2" strokeLinecap="round" />
            {[0, 72, 144, 216, 288].map((ang, i) => (
              <path
                key={i}
                d="M 24 20 C 20 14, 19 8, 22 6 C 23 7, 24 8, 25 7 C 28 8, 27 14, 24 20 Z"
                fill={p.primary}
                stroke={p.secondary}
                strokeWidth="0.5"
                transform={`rotate(${ang} 24 20)`}
              />
            ))}
            <circle cx="24" cy="20" r="2.5" fill={p.center} />
          </g>
        );

      case 'orchid':
        return (
          <g>
            <path d="M 24 40 L 24 25" stroke={p.stem} strokeWidth="2" strokeLinecap="round" />
            {/* Dorsal sepal */}
            <ellipse cx="24" cy="11" rx="4" ry="7" fill={p.primary} stroke={p.secondary} strokeWidth="0.5" />
            {/* Lateral petals (wings) */}
            <ellipse cx="14" cy="19" rx="8" ry="5" fill={p.primary} stroke={p.secondary} strokeWidth="0.5" />
            <ellipse cx="34" cy="19" rx="8" ry="5" fill={p.primary} stroke={p.secondary} strokeWidth="0.5" />
            {/* Labellum */}
            <path d="M 24 20 C 21 24, 21 28, 24 29 C 27 28, 27 24, 24 20 Z" fill={p.center} />
          </g>
        );

      case 'carnation':
        return (
          <g>
            <path d="M 24 40 L 24 26" stroke={p.stem} strokeWidth="2.5" strokeLinecap="round" />
            {/* Calyx */}
            <polygon points="21,26 27,26 26,32 22,32" fill={p.bud} />
            {/* Ruffled petals */}
            <circle cx="24" cy="19" r="12" fill={p.primary} />
            <circle cx="24" cy="19" r="8" fill={p.secondary} />
            <circle cx="24" cy="19" r="4" fill={p.accent} />
          </g>
        );

      case 'hydrangea':
        return (
          <g>
            <path d="M 24 40 L 24 26" stroke={p.stem} strokeWidth="2.5" strokeLinecap="round" />
            {/* Dome circle */}
            <circle cx="24" cy="19" r="13" fill={p.primary} />
            {/* Mini florets */}
            {[
              { x: 19, y: 15 },
              { x: 29, y: 15 },
              { x: 24, y: 12 },
              { x: 18, y: 22 },
              { x: 30, y: 22 },
              { x: 24, y: 21 },
            ].map((pt, i) => (
              <circle key={i} cx={pt.x} cy={pt.y} r="3" fill={p.accent} stroke={p.secondary} strokeWidth="0.4" />
            ))}
          </g>
        );

      case 'magnolia':
        return (
          <g>
            <path d="M 24 40 L 24 24" stroke={p.stem} strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 24 26 C 16 22, 13 10, 18 5 C 22 11, 24 20, 24 26 Z" fill={p.primary} />
            <path d="M 24 26 C 32 22, 35 10, 30 5 C 26 11, 24 20, 24 26 Z" fill={p.primary} />
            <path d="M 24 26 C 20 18, 20 8, 24 3 C 28 8, 28 18, 24 26 Z" fill={p.secondary} />
          </g>
        );

      case 'cosmos':
        return (
          <g>
            <path d="M 24 40 L 24 24" stroke={p.stem} strokeWidth="2" strokeLinecap="round" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((ang, i) => (
              <ellipse
                key={i}
                cx="24"
                cy="14"
                rx="3.2"
                ry="7.5"
                fill={p.primary}
                stroke={p.accent}
                strokeWidth="0.4"
                transform={`rotate(${ang} 24 22)`}
              />
            ))}
            <circle cx="24" cy="22" r="4.2" fill={p.center} stroke="#9F7312" strokeWidth="0.5" />
          </g>
        );

      default:
        return <circle cx="24" cy="20" r="10" fill={p.primary} />;
    }
  };

  return (
    <svg viewBox="0 0 48 48" className="bloom__mini" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">
      {renderIcon()}
    </svg>
  );
});

FlowerMiniPreview.displayName = 'FlowerMiniPreview';
