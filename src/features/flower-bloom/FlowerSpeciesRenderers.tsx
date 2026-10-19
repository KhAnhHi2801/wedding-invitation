import React from 'react';
import type { FlowerDefinition, GrowthStage } from '../../types/flower';
import { BotanicalPathLeaf } from './BotanicalPathLeaf';

interface SpeciesProps {
  stage: GrowthStage;
  progress: number; // continuous 0 to 1
  def: FlowerDefinition;
}

const clamp = (val: number, min = 0, max = 1) => Math.max(min, Math.min(max, val));
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Universal Acropetal Botanical Progress Helper:
 * Ensures strictly sequential growth from the ground up:
 * A node at nodeY can ONLY activate after the growing stem tip reaches that exact height.
 * Because lower nodes (larger Y) are reached first, lower leaves/branches always emerge before upper ones.
 */
const getNodeProgress = (
  progress: number,
  nodeY: number,
  receptacleY = 170,
  stemStartT = 0.10,
  stemDuration = 0.38
) => {
  const groundY = 430;
  const fractionAlongStem = clamp((groundY - nodeY) / (groundY - receptacleY));
  const reachTime = stemStartT + fractionAlongStem * stemDuration;
  if (progress <= reachTime) return 0;
  const unfurlT = (progress - reachTime) / 0.18;
  return easeOutCubic(clamp(unfurlT));
};

// =============================================================
// 1. HOA BABY (Baby's Breath - Gypsophila paniculata)
// PURE WHITE florets, dense fluffy cloud (72 florets),
// strictly sequential bottom-to-top branch growth
// =============================================================
export const BabyBreathRenderer: React.FC<SpeciesProps> = ({ progress, def }) => {
  // 1. Trunk grows from ground y=430 to Tier 1 junction y=330
  const trunkP = easeOutCubic(clamp((progress - 0.10) / 0.18));
  // 2. Tier 1 Lower Branches (Junction y = 330)
  const tier1P = easeOutCubic(clamp((progress - 0.22) / 0.18));
  // 3. Trunk continues to Tier 2 junction y = 260
  const trunkMidP = easeOutCubic(clamp((progress - 0.26) / 0.16));
  // 4. Tier 2 Mid Branches (Junction y = 260)
  const tier2P = easeOutCubic(clamp((progress - 0.34) / 0.18));
  // 5. Trunk continues to Tier 3 junction y = 190
  const trunkHighP = easeOutCubic(clamp((progress - 0.38) / 0.16));
  // 6. Tier 3 Upper Branches (Junction y = 190)
  const tier3P = easeOutCubic(clamp((progress - 0.44) / 0.18));
  // 7. Apex Canopy Twigs (y = 190 up to y = 60)
  const apexP = easeOutCubic(clamp((progress - 0.50) / 0.18));

  // 72 Dense White Floret Endpoints strictly categorized by tier (bottom to top)
  const tier1Florets = [
    { x: 100, y: 280, s: 0.95 },
    { x: 130, y: 265, s: 1.0 },
    { x: 75, y: 250, s: 0.9 },
    { x: 115, y: 240, s: 0.95 },
    { x: 155, y: 250, s: 0.9 },
    { x: 270, y: 265, s: 1.0 },
    { x: 300, y: 280, s: 0.95 },
    { x: 245, y: 250, s: 0.9 },
    { x: 285, y: 240, s: 0.95 },
    { x: 325, y: 250, s: 0.9 },
    { x: 95, y: 225, s: 0.85 },
    { x: 140, y: 220, s: 0.9 },
    { x: 260, y: 220, s: 0.9 },
    { x: 305, y: 225, s: 0.85 },
  ];

  const tier2Florets = [
    { x: 80, y: 195, s: 0.9 },
    { x: 110, y: 185, s: 1.0 },
    { x: 140, y: 190, s: 1.0 },
    { x: 170, y: 200, s: 0.95 },
    { x: 230, y: 200, s: 0.95 },
    { x: 260, y: 190, s: 1.0 },
    { x: 290, y: 185, s: 1.0 },
    { x: 320, y: 195, s: 0.9 },
    { x: 65, y: 170, s: 0.85 },
    { x: 95, y: 165, s: 0.95 },
    { x: 125, y: 160, s: 1.05 },
    { x: 155, y: 165, s: 1.0 },
    { x: 245, y: 165, s: 1.0 },
    { x: 275, y: 160, s: 1.05 },
    { x: 305, y: 165, s: 0.95 },
    { x: 335, y: 170, s: 0.85 },
    { x: 185, y: 175, s: 0.95 },
    { x: 215, y: 175, s: 0.95 },
  ];

  const tier3Florets = [
    { x: 90, y: 135, s: 0.9 },
    { x: 115, y: 125, s: 1.0 },
    { x: 140, y: 120, s: 1.05 },
    { x: 165, y: 130, s: 1.0 },
    { x: 190, y: 140, s: 1.1 },
    { x: 210, y: 140, s: 1.1 },
    { x: 235, y: 130, s: 1.0 },
    { x: 260, y: 120, s: 1.05 },
    { x: 285, y: 125, s: 1.0 },
    { x: 310, y: 135, s: 0.9 },
    { x: 105, y: 105, s: 0.9 },
    { x: 130, y: 100, s: 1.0 },
    { x: 155, y: 95, s: 1.05 },
    { x: 180, y: 105, s: 1.0 },
    { x: 220, y: 105, s: 1.0 },
    { x: 245, y: 95, s: 1.05 },
    { x: 270, y: 100, s: 1.0 },
    { x: 295, y: 105, s: 0.9 },
  ];

  const apexFlorets = [
    { x: 140, y: 75, s: 0.95 },
    { x: 160, y: 65, s: 1.05 },
    { x: 180, y: 55, s: 1.1 },
    { x: 200, y: 48, s: 1.15 },
    { x: 220, y: 55, s: 1.1 },
    { x: 240, y: 65, s: 1.05 },
    { x: 260, y: 75, s: 0.95 },
    { x: 120, y: 80, s: 0.85 },
    { x: 280, y: 80, s: 0.85 },
    { x: 170, y: 80, s: 1.0 },
    { x: 190, y: 70, s: 1.05 },
    { x: 210, y: 70, s: 1.05 },
    { x: 230, y: 80, s: 1.0 },
    { x: 200, y: 85, s: 1.0 },
    { x: 150, y: 90, s: 0.9 },
    { x: 250, y: 90, s: 0.9 },
    { x: 185, y: 40, s: 0.95 },
    { x: 215, y: 40, s: 0.95 },
    { x: 200, y: 32, s: 1.0 },
    { x: 170, y: 48, s: 0.9 },
    { x: 230, y: 48, s: 0.9 },
    { x: 190, y: 115, s: 0.95 },
  ];

  if (progress < 0.10) return null;

  // Render individual pure white floret
  const renderFloret = (pt: { x: number; y: number; s: number }, key: string, floretProg: number, budProg: number) => {
    if (budProg <= 0) return null;
    return (
      <g key={key} transform={`translate(${pt.x}, ${pt.y})`}>
        {/* Calyx & Bud */}
        {floretProg < 0.4 && (
          <circle
            r={2.4 * pt.s * budProg}
            fill="#E2E8DE"
            stroke={def.palette.stem}
            strokeWidth="0.5"
            opacity={clamp(1 - floretProg * 2.5)}
          />
        )}

        {/* PURE SNOW WHITE 5-Petal Flower */}
        {floretProg > 0 && (
          <g
            style={{
              transform: `scale(${pt.s * (0.35 + floretProg * 0.65)})`,
              transformOrigin: '0px 0px',
              opacity: clamp(floretProg * 2.5),
            }}
          >
            {[0, 72, 144, 216, 288].map((angle, pi) => (
              <ellipse
                key={pi}
                cx="0"
                cy={-4.5}
                rx="2.4"
                ry="4.0"
                fill="#FFFFFF"
                stroke="#DDD7CC"
                strokeWidth="0.38"
                transform={`rotate(${angle})`}
              />
            ))}
            {/* Delicate ivory gold stamen center */}
            <circle r="1.3" fill="#EADE9E" stroke="#C4B87A" strokeWidth="0.3" />
          </g>
        )}
      </g>
    );
  };

  return (
    <g className="flower-baby-breath">
      {/* 1. Main Base Trunk growing upward from soil to Tier 1 */}
      <path
        d="M 200 430 C 199 390, 201 360, 200 330"
        stroke={def.palette.stem}
        strokeWidth="3.2"
        strokeLinecap="round"
        fill="none"
        pathLength="100"
        strokeDasharray="100"
        strokeDashoffset={100 * (1 - trunkP)}
      />

      {/* 2. Tier 1 Lower Branches (Junction y = 330) */}
      {tier1P > 0 && (
        <g stroke={def.palette.stem} strokeLinecap="round" fill="none">
          {/* Main lateral branches */}
          <path
            d="M 200 330 C 165 310, 130 285, 105 260"
            strokeWidth="2.0"
            pathLength="100"
            strokeDasharray="100"
            strokeDashoffset={100 * (1 - tier1P)}
          />
          <path
            d="M 200 330 C 235 310, 270 285, 295 260"
            strokeWidth="2.0"
            pathLength="100"
            strokeDasharray="100"
            strokeDashoffset={100 * (1 - tier1P)}
          />
          {/* Sub-twigs */}
          {tier1P > 0.45 && (
            <g strokeWidth="1.2">
              <path d="M 105 260 C 90 248, 80 238, 75 250" />
              <path d="M 105 260 C 115 245, 125 235, 130 265" />
              <path d="M 140 290 C 120 270, 105 250, 95 225" />
              <path d="M 140 290 C 150 265, 155 240, 140 220" />
              <path d="M 295 260 C 310 248, 320 238, 325 250" />
              <path d="M 295 260 C 285 245, 275 235, 270 265" />
              <path d="M 260 290 C 280 270, 295 250, 305 225" />
              <path d="M 260 290 C 250 265, 245 240, 260 220" />
            </g>
          )}
        </g>
      )}

      {/* 3. Trunk continuation from y = 330 to y = 260 */}
      {trunkMidP > 0 && (
        <path
          d="M 200 330 C 199 305, 201 285, 200 260"
          stroke={def.palette.stem}
          strokeWidth="2.7"
          strokeLinecap="round"
          fill="none"
          pathLength="100"
          strokeDasharray="100"
          strokeDashoffset={100 * (1 - trunkMidP)}
        />
      )}

      {/* 4. Tier 2 Mid Branches (Junction y = 260) */}
      {tier2P > 0 && (
        <g stroke={def.palette.stem} strokeLinecap="round" fill="none">
          <path
            d="M 200 260 C 160 235, 120 210, 95 180"
            strokeWidth="1.8"
            pathLength="100"
            strokeDasharray="100"
            strokeDashoffset={100 * (1 - tier2P)}
          />
          <path
            d="M 200 260 C 240 235, 280 210, 305 180"
            strokeWidth="1.8"
            pathLength="100"
            strokeDasharray="100"
            strokeDashoffset={100 * (1 - tier2P)}
          />
          {tier2P > 0.45 && (
            <g strokeWidth="1.1">
              <path d="M 95 180 C 80 185, 70 180, 65 170" />
              <path d="M 95 180 C 110 170, 120 165, 125 160" />
              <path d="M 140 220 C 120 195, 105 175, 95 165" />
              <path d="M 140 220 C 150 190, 155 175, 155 165" />
              <path d="M 305 180 C 320 185, 330 180, 335 170" />
              <path d="M 305 180 C 290 170, 280 165, 275 160" />
              <path d="M 260 220 C 280 195, 295 175, 305 165" />
              <path d="M 260 220 C 250 190, 245 175, 245 165" />
              <path d="M 200 230 C 190 200, 185 185, 185 175" />
              <path d="M 200 230 C 210 200, 215 185, 215 175" />
            </g>
          )}
        </g>
      )}

      {/* 5. Trunk continuation from y = 260 to y = 190 */}
      {trunkHighP > 0 && (
        <path
          d="M 200 260 C 199 235, 201 210, 200 190"
          stroke={def.palette.stem}
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
          pathLength="100"
          strokeDasharray="100"
          strokeDashoffset={100 * (1 - trunkHighP)}
        />
      )}

      {/* 6. Tier 3 Upper Branches (Junction y = 190) */}
      {tier3P > 0 && (
        <g stroke={def.palette.stem} strokeLinecap="round" fill="none">
          <path
            d="M 200 190 C 165 160, 135 140, 110 115"
            strokeWidth="1.5"
            pathLength="100"
            strokeDasharray="100"
            strokeDashoffset={100 * (1 - tier3P)}
          />
          <path
            d="M 200 190 C 235 160, 265 140, 290 115"
            strokeWidth="1.5"
            pathLength="100"
            strokeDasharray="100"
            strokeDashoffset={100 * (1 - tier3P)}
          />
          {tier3P > 0.45 && (
            <g strokeWidth="1.0">
              <path d="M 110 115 C 98 125, 92 130, 90 135" />
              <path d="M 110 115 C 125 110, 135 105, 140 100" />
              <path d="M 155 145 C 145 130, 138 115, 130 100" />
              <path d="M 155 145 C 165 125, 172 110, 180 105" />
              <path d="M 290 115 C 302 125, 308 130, 310 135" />
              <path d="M 290 115 C 275 110, 265 105, 260 100" />
              <path d="M 245 145 C 255 130, 262 115, 270 100" />
              <path d="M 245 145 C 235 125, 228 110, 220 105" />
            </g>
          )}
        </g>
      )}

      {/* 7. Apex Twigs (Highest canopy y = 190 to 40) */}
      {apexP > 0 && (
        <g stroke={def.palette.stem} strokeWidth="1.1" strokeLinecap="round" fill="none">
          <path d="M 200 190 C 199 150, 200 100, 200 50" pathLength="100" strokeDasharray="100" strokeDashoffset={100 * (1 - apexP)} />
          <path d="M 200 150 C 180 120, 165 95, 160 65" pathLength="100" strokeDasharray="100" strokeDashoffset={100 * (1 - apexP)} />
          <path d="M 200 150 C 220 120, 235 95, 240 65" pathLength="100" strokeDasharray="100" strokeDashoffset={100 * (1 - apexP)} />
          <path d="M 200 110 C 185 85, 180 65, 180 55" pathLength="100" strokeDasharray="100" strokeDashoffset={100 * (1 - apexP)} />
          <path d="M 200 110 C 215 85, 220 65, 220 55" pathLength="100" strokeDasharray="100" strokeDashoffset={100 * (1 - apexP)} />
          <path d="M 160 85 C 145 80, 130 78, 120 80" />
          <path d="M 240 85 C 255 80, 270 78, 280 80" />
          <path d="M 200 75 C 195 55, 190 45, 185 40" />
          <path d="M 200 75 C 205 55, 210 45, 215 40" />
        </g>
      )}

      {/* 8. Sequential Florets blooming strictly from lower tiers up to apex */}
      {/* Tier 1 Florets (Lowest, bloom earliest) */}
      {progress >= 0.28 &&
        tier1Florets.map((pt, i) => {
          const budP = clamp((progress - 0.28) / 0.15);
          const floretP = easeOutCubic(clamp((progress - 0.44 - (i % 4) * 0.03) / 0.35));
          return renderFloret(pt, `t1-${i}`, floretP, budP);
        })}

      {/* Tier 2 Florets (Mid-lower) */}
      {progress >= 0.36 &&
        tier2Florets.map((pt, i) => {
          const budP = clamp((progress - 0.36) / 0.15);
          const floretP = easeOutCubic(clamp((progress - 0.50 - (i % 4) * 0.03) / 0.35));
          return renderFloret(pt, `t2-${i}`, floretP, budP);
        })}

      {/* Tier 3 Florets (Mid-upper) */}
      {progress >= 0.44 &&
        tier3Florets.map((pt, i) => {
          const budP = clamp((progress - 0.44) / 0.15);
          const floretP = easeOutCubic(clamp((progress - 0.56 - (i % 4) * 0.03) / 0.35));
          return renderFloret(pt, `t3-${i}`, floretP, budP);
        })}

      {/* Apex Canopy Florets (Highest, bloom last into full glory) */}
      {progress >= 0.50 &&
        apexFlorets.map((pt, i) => {
          const budP = clamp((progress - 0.50) / 0.15);
          const floretP = easeOutCubic(clamp((progress - 0.62 - (i % 4) * 0.03) / 0.35));
          return renderFloret(pt, `ap-${i}`, floretP, budP);
        })}
    </g>
  );
};

// =============================================================
// 2. HOA MẪU ĐƠN (Peony - Paeonia lactiflora)
// 5 dense ruffled concentric layers, 32+ petals, golden center
// =============================================================
export const PeonyRenderer: React.FC<SpeciesProps> = ({ progress, def }) => {
  const stemP = easeOutCubic(clamp((progress - 0.1) / 0.35));
  const leaf1P = getNodeProgress(progress, 340, 160);
  const leaf2P = getNodeProgress(progress, 270, 160);
  const budP = easeOutCubic(clamp((progress - 0.38) / 0.22));
  const bloomP = easeOutCubic(clamp((progress - 0.52) / 0.45));

  if (progress < 0.1) return null;

  return (
    <g className="flower-peony">
      {/* Sturdy curved main stem */}
      <path
        d="M 200 430 C 196 350, 203 260, 200 160"
        stroke={def.palette.stem}
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
        pathLength="100"
        strokeDasharray="100"
        strokeDashoffset={100 * (1 - stemP)}
      />

      {/* Lower Leaf (Node y = 340) */}
      <BotanicalPathLeaf
        id="peony-l1"
        nodeX={197}
        nodeY={340}
        unfurlProgress={leaf1P}
        pathD="M 0 0 C -45 -18, -80 0, -95 24 C -65 32, -25 22, 0 8 Z M -40 2 C -55 -15, -75 -15, -88 -6 C -75 8, -50 15, -40 2 Z"
        veinD="M 0 0 L -80 18"
        fill={def.palette.leaf}
        stroke={def.palette.stem}
        strokeWidth={1}
        maxReach={100}
        uncurlAngle={-8}
      />

      {/* Upper Leaf (Node y = 270) */}
      <BotanicalPathLeaf
        id="peony-l2"
        nodeX={203}
        nodeY={270}
        unfurlProgress={leaf2P}
        pathD="M 0 0 C 45 -18, 80 0, 95 24 C 65 32, 25 22, 0 8 Z M 40 2 C 55 -15, 75 -15, 88 -6 C 75 8, 50 15, 40 2 Z"
        veinD="M 0 0 L 80 18"
        fill={def.palette.leafHighlight}
        stroke={def.palette.stem}
        strokeWidth={1}
        maxReach={100}
        uncurlAngle={8}
      />

      {/* Receptacle & Sepal cup */}
      {stemP > 0.85 && (
        <g fill={def.palette.leaf} stroke={def.palette.stem} strokeWidth="0.8">
          <ellipse cx="200" cy="162" rx="16" ry="6" />
          <path d="M 186 162 C 172 170, 165 185, 168 195 C 178 185, 185 172, 192 165 Z" />
          <path d="M 214 162 C 228 170, 235 185, 232 195 C 222 185, 215 172, 208 165 Z" />
        </g>
      )}

      {/* Bud to Lush 5-Layer Bloom */}
      {budP > 0 && (
        <g transform="translate(200, 145)">
          {/* Swelling spherical bud */}
          {bloomP < 0.35 && (
            <g opacity={1 - bloomP * 2.8}>
              <circle r={28 * budP} fill={def.palette.bud} stroke={def.palette.accent} strokeWidth="1.2" />
              <path d="M -16 6 Q 0 -22 16 6" fill={def.palette.secondary} opacity="0.8" />
              <path d="M -10 -12 Q 0 -26 10 -12" fill={def.palette.primary} />
            </g>
          )}

          {/* 5 Concentric Dense Ruffled Petal Layers */}
          {bloomP > 0.05 && (
            <g
              style={{
                transform: `scale(${0.38 + bloomP * 0.62})`,
                transformOrigin: '0px 0px',
                opacity: clamp(bloomP * 2.5),
              }}
            >
              {/* Layer 1: Outer Guard Petals (10 large wavy petals) */}
              {[0, 36, 72, 108, 144, 180, 216, 252, 288, 324].map((ang, i) => (
                <path
                  key={`l1-${i}`}
                  d="M 0 0 C -36 -28, -52 -65, -28 -82 C -8 -75, 8 -75, 28 -82 C 52 -65, 36 -28, 0 0 Z"
                  fill={def.palette.secondary}
                  stroke={def.palette.accent}
                  strokeWidth="0.8"
                  transform={`rotate(${ang + 18}) scale(${0.7 + bloomP * 0.3})`}
                  opacity="0.95"
                />
              ))}

              {/* Layer 2: Mid-Outer Petals (10 ruffled petals) */}
              {bloomP > 0.15 && (
                <g opacity={clamp((bloomP - 0.15) / 0.4)}>
                  {[18, 54, 90, 126, 162, 198, 234, 270, 306, 342].map((ang, i) => (
                    <path
                      key={`l2-${i}`}
                      d="M 0 0 C -28 -22, -42 -52, -20 -68 C -5 -60, 5 -60, 20 -68 C 42 -52, 28 -22, 0 0 Z"
                      fill={def.palette.primary}
                      stroke={def.palette.secondary}
                      strokeWidth="0.7"
                      transform={`rotate(${ang}) scale(${0.65 + bloomP * 0.35})`}
                    />
                  ))}
                </g>
              )}

              {/* Layer 3: Mid-Inner Cup Petals (8 ruffled petals) */}
              {bloomP > 0.3 && (
                <g opacity={clamp((bloomP - 0.3) / 0.4)}>
                  {[0, 45, 90, 135, 180, 225, 270, 315].map((ang, i) => (
                    <path
                      key={`l3-${i}`}
                      d="M 0 0 C -22 -16, -32 -40, -15 -52 C -4 -46, 4 -46, 15 -52 C 32 -40, 22 -16, 0 0 Z"
                      fill={def.palette.primary}
                      stroke={def.palette.accent}
                      strokeWidth="0.6"
                      transform={`rotate(${ang + 22}) scale(${0.6 + bloomP * 0.4})`}
                    />
                  ))}
                </g>
              )}

              {/* Layer 4: Inner Heart Ruffles (8 crinkled petals) */}
              {bloomP > 0.45 && (
                <g opacity={clamp((bloomP - 0.45) / 0.4)}>
                  {[22, 67, 112, 157, 202, 247, 292, 337].map((ang, i) => (
                    <path
                      key={`l4-${i}`}
                      d="M 0 0 C -15 -10, -22 -28, -10 -36 C -2 -32, 2 -32, 10 -36 C 22 -28, 15 -10, 0 0 Z"
                      fill={def.palette.secondary}
                      stroke={def.palette.accent}
                      strokeWidth="0.5"
                      transform={`rotate(${ang}) scale(${0.55 + bloomP * 0.45})`}
                    />
                  ))}
                </g>
              )}

              {/* Layer 5: Golden Stamen Crown & Crinkled Core */}
              {bloomP > 0.55 && (
                <g opacity={clamp((bloomP - 0.55) / 0.35)}>
                  {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((ang, i) => (
                    <g key={`st-${i}`} transform={`rotate(${ang})`}>
                      <line x1="0" y1="0" x2="0" y2="-18" stroke={def.palette.center} strokeWidth="1" />
                      <circle cx="0" cy="-18" r="1.8" fill="#F0CF65" stroke="#C49B28" strokeWidth="0.4" />
                    </g>
                  ))}
                  <ellipse cx="0" cy="0" rx="9" ry="8" fill={def.palette.accent} />
                  <ellipse cx="0" cy="0" rx="5" ry="4" fill={def.palette.center} />
                </g>
              )}
            </g>
          )}
        </g>
      )}
    </g>
  );
};

// =============================================================
// 3. HOA CÚC HỌA MI (Daisy - Bellis perennis)
// 32 dense white ray florets, stippled amber-gold seed disk
// =============================================================
export const DaisyRenderer: React.FC<SpeciesProps> = ({ progress, def }) => {
  const stemP = easeOutCubic(clamp((progress - 0.1) / 0.35));
  const leaf1P = getNodeProgress(progress, 360, 170);
  const leaf2P = getNodeProgress(progress, 315, 170);
  const leaf3P = getNodeProgress(progress, 265, 170);
  const budP = easeOutCubic(clamp((progress - 0.38) / 0.22));
  const bloomP = easeOutCubic(clamp((progress - 0.52) / 0.45));

  // 32 dense ray petals
  const angles = Array.from({ length: 32 }, (_, i) => (360 / 32) * i);

  if (progress < 0.1) return null;

  return (
    <g className="flower-daisy">
      <path
        d="M 200 430 C 204 360, 194 280, 200 170"
        stroke={def.palette.stem}
        strokeWidth="3.4"
        strokeLinecap="round"
        fill="none"
        pathLength="100"
        strokeDasharray="100"
        strokeDashoffset={100 * (1 - stemP)}
      />

      <BotanicalPathLeaf
        id="daisy-l1"
        nodeX={199}
        nodeY={360}
        unfurlProgress={leaf1P}
        pathD="M 0 0 C -22 -12, -40 -8, -52 -14 C -40 -20, -20 -16, 0 0 Z"
        veinD="M 0 0 L -45 -14"
        fill={def.palette.leaf}
        maxReach={55}
        uncurlAngle={-10}
      />

      <BotanicalPathLeaf
        id="daisy-l2"
        nodeX={201}
        nodeY={315}
        unfurlProgress={leaf2P}
        pathD="M 0 0 C 22 -12, 40 -8, 52 -14 C 40 -20, 20 -16, 0 0 Z"
        veinD="M 0 0 L 45 -14"
        fill={def.palette.leaf}
        maxReach={55}
        uncurlAngle={10}
      />

      <BotanicalPathLeaf
        id="daisy-l3"
        nodeX={199}
        nodeY={265}
        unfurlProgress={leaf3P}
        pathD="M 0 0 C -18 -10, -32 -6, -42 -10 C -32 -16, -16 -14, 0 0 Z"
        veinD="M 0 0 L -36 -10"
        fill={def.palette.leafHighlight}
        maxReach={45}
        uncurlAngle={-8}
      />

      {budP > 0 && (
        <g transform="translate(200, 170)">
          {bloomP < 0.35 && (
            <g opacity={1 - bloomP * 2.8}>
              <path
                d="M -10 8 C -12 0, 0 -14, 0 -14 C 0 -14, 12 0, 10 8 Z"
                fill={def.palette.bud}
                stroke={def.palette.stem}
                strokeWidth="1"
              />
              <path d="M -5 -10 L 0 -18 L 5 -10 Z" fill={def.palette.primary} stroke={def.palette.secondary} strokeWidth="0.5" />
            </g>
          )}

          {bloomP > 0.05 && (
            <g opacity={clamp(bloomP * 2.5)}>
              {/* 32 Dense Ray Petals */}
              {angles.map((ang, i) => {
                const petalLength = 50 + (i % 2) * 3;
                return (
                  <g key={i} transform={`rotate(${ang})`}>
                    <path
                      d={`M 0 0 C -2.8 ${-petalLength * 0.3}, -3.6 ${-petalLength * 0.8}, 0 ${-petalLength} C 3.6 ${-petalLength * 0.8}, 2.8 ${-petalLength * 0.3}, 0 0 Z`}
                      fill={i % 2 === 0 ? '#FFFFFF' : '#F9F8F4'}
                      stroke="#DDD6C8"
                      strokeWidth="0.35"
                      style={{
                        transform: `scaleY(${0.25 + bloomP * 0.75}) scaleX(${0.5 + bloomP * 0.5})`,
                        transformOrigin: '0px 0px',
                      }}
                    />
                    <line x1="0" y1="-6" x2="0" y2={-petalLength * 0.8 * bloomP} stroke="#E5DEC9" strokeWidth="0.35" opacity={bloomP} />
                  </g>
                );
              })}

              {/* Rich Golden Seed Disk Center */}
              <circle
                r={16 * (0.45 + bloomP * 0.55)}
                fill="url(#daisyCenterGrad)"
                stroke="#B88A1A"
                strokeWidth="0.8"
              />
              {bloomP > 0.5 && (
                <g opacity={clamp((bloomP - 0.5) / 0.4)}>
                  {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, di) => (
                    <circle key={di} cx={6.5 * Math.cos((deg * Math.PI) / 180)} cy={6.5 * Math.sin((deg * Math.PI) / 180)} r="1.4" fill="#D99B18" />
                  ))}
                  {[22, 67, 112, 157, 202, 247, 292, 337].map((deg, di) => (
                    <circle key={di} cx={11.5 * Math.cos((deg * Math.PI) / 180)} cy={11.5 * Math.sin((deg * Math.PI) / 180)} r="1.2" fill="#C68910" />
                  ))}
                </g>
              )}
            </g>
          )}
        </g>
      )}
    </g>
  );
};

// =============================================================
// 4. HOA TULIP (Tulip - Tulipa gesneriana)
// Stately upright chalice cup with clasping leaves
// =============================================================
export const TulipRenderer: React.FC<SpeciesProps> = ({ progress, def }) => {
  const stemP = easeOutCubic(clamp((progress - 0.1) / 0.35));
  const leaf1P = getNodeProgress(progress, 425, 165);
  const leaf2P = getNodeProgress(progress, 395, 165);
  const budP = easeOutCubic(clamp((progress - 0.38) / 0.22));
  const bloomP = easeOutCubic(clamp((progress - 0.52) / 0.45));

  if (progress < 0.1) return null;

  return (
    <g className="flower-tulip">
      <path
        d="M 200 430 C 197 350, 202 250, 200 165"
        stroke={def.palette.stem}
        strokeWidth="4.8"
        strokeLinecap="round"
        fill="none"
        pathLength="100"
        strokeDasharray="100"
        strokeDashoffset={100 * (1 - stemP)}
      />

      <BotanicalPathLeaf
        id="tulip-l1"
        nodeX={200}
        nodeY={425}
        unfurlProgress={leaf1P}
        pathD="M 0 0 C -38 -45, -65 -140, -45 -225 C -30 -160, -12 -80, 0 -25 Z"
        veinD="M 0 0 C -25 -70, -40 -150, -45 -225"
        fill={def.palette.leaf}
        stroke={def.palette.stem}
        strokeWidth={0.8}
        maxReach={230}
        uncurlAngle={-8}
      />

      <BotanicalPathLeaf
        id="tulip-l2"
        nodeX={200}
        nodeY={395}
        unfurlProgress={leaf2P}
        pathD="M 0 0 C 35 -40, 58 -130, 42 -205 C 28 -145, 12 -70, 0 -25 Z"
        veinD="M 0 0 C 22 -65, 36 -135, 42 -205"
        fill={def.palette.leafHighlight}
        stroke={def.palette.stem}
        strokeWidth={0.8}
        maxReach={210}
        uncurlAngle={8}
      />

      {budP > 0 && (
        <g transform="translate(200, 165)">
          {bloomP < 0.35 && (
            <g opacity={1 - bloomP * 2.8}>
              <path
                d="M 0 10 C -18 5, -22 -35, 0 -60 C 22 -35, 18 5, 0 10 Z"
                fill={def.palette.bud}
                stroke={def.palette.accent}
                strokeWidth="1.2"
                style={{ transform: `scale(${budP})`, transformOrigin: '0 10px' }}
              />
            </g>
          )}

          {bloomP > 0.05 && (
            <g
              style={{
                transform: `scale(${0.38 + bloomP * 0.62})`,
                transformOrigin: '0px 10px',
                opacity: clamp(bloomP * 2.5),
              }}
            >
              <path
                d="M 0 5 C -25 -10, -32 -60, -10 -75 C 5 -65, 20 -35, 0 5 Z"
                fill={def.palette.secondary}
                stroke={def.palette.accent}
                strokeWidth="0.8"
                style={{ transform: `rotate(${-14 * bloomP}deg)`, transformOrigin: '0px 5px' }}
              />
              <path
                d="M 0 5 C 25 -10, 32 -60, 10 -75 C -5 -65, -20 -35, 0 5 Z"
                fill={def.palette.secondary}
                stroke={def.palette.accent}
                strokeWidth="0.8"
                style={{ transform: `rotate(${14 * bloomP}deg)`, transformOrigin: '0px 5px' }}
              />
              <path
                d="M 0 5 C -18 -15, -20 -65, 0 -80 C 20 -65, 18 -15, 0 5 Z"
                fill={def.palette.accent}
                stroke={def.palette.secondary}
                strokeWidth="0.8"
              />
              <g opacity={bloomP}>
                <line x1="0" y1="0" x2="0" y2="-38" stroke={def.palette.center} strokeWidth="3" />
                <polygon points="-4,-38 0,-44 4,-38" fill={def.palette.center} />
              </g>
              <path
                d="M 0 8 C -30 0, -42 -45, -22 -68 C -5 -55, -2 -25, 0 8 Z"
                fill={def.palette.primary}
                stroke={def.palette.secondary}
                strokeWidth="0.8"
                style={{ transform: `rotate(${-22 * bloomP}deg)`, transformOrigin: '0px 8px' }}
              />
              <path
                d="M 0 8 C 30 0, 42 -45, 22 -68 C 5 -55, 2 -25, 0 8 Z"
                fill={def.palette.primary}
                stroke={def.palette.secondary}
                strokeWidth="0.8"
                style={{ transform: `rotate(${22 * bloomP}deg)`, transformOrigin: '0px 8px' }}
              />
              <path
                d="M 0 10 C -22 -10, -25 -55, 0 -72 C 25 -55, 22 -10, 0 10 Z"
                fill="url(#tulipPetalGrad)"
                stroke={def.palette.accent}
                strokeWidth="0.9"
              />
            </g>
          )}
        </g>
      )}
    </g>
  );
};

// =============================================================
// 5. HOA HƯỚNG DƯƠNG (Sunflower - Helianthus annuus)
// 36 double-row golden ray petals, rich Fibonacci seed disk
// =============================================================
export const SunflowerRenderer: React.FC<SpeciesProps> = ({ progress, def }) => {
  const stemP = easeOutCubic(clamp((progress - 0.1) / 0.35));
  const leaf1P = getNodeProgress(progress, 360, 165);
  const leaf2P = getNodeProgress(progress, 305, 165);
  const leaf3P = getNodeProgress(progress, 245, 165);
  const budP = easeOutCubic(clamp((progress - 0.38) / 0.22));
  const bloomP = easeOutCubic(clamp((progress - 0.52) / 0.45));

  const petalsOuter = Array.from({ length: 18 }, (_, i) => i * 20);
  const petalsInner = Array.from({ length: 18 }, (_, i) => i * 20 + 10);

  if (progress < 0.1) return null;

  return (
    <g className="flower-sunflower">
      <path
        d="M 200 430 C 196 340, 204 250, 200 165"
        stroke={def.palette.stem}
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
        pathLength="100"
        strokeDasharray="100"
        strokeDashoffset={100 * (1 - stemP)}
      />

      <BotanicalPathLeaf
        id="sun-l1"
        nodeX={197}
        nodeY={360}
        unfurlProgress={leaf1P}
        pathD="M 0 0 C -45 -15, -80 0, -95 28 C -70 42, -28 30, 0 10 Z"
        veinD="M 0 0 L -80 20"
        fill={def.palette.leaf}
        stroke={def.palette.stem}
        strokeWidth={1.2}
        maxReach={100}
        uncurlAngle={-10}
      />

      <BotanicalPathLeaf
        id="sun-l2"
        nodeX={203}
        nodeY={305}
        unfurlProgress={leaf2P}
        pathD="M 0 0 C 45 -15, 80 0, 95 28 C 70 42, 28 30, 0 10 Z"
        veinD="M 0 0 L 80 20"
        fill={def.palette.leafHighlight}
        stroke={def.palette.stem}
        strokeWidth={1.2}
        maxReach={100}
        uncurlAngle={10}
      />

      <BotanicalPathLeaf
        id="sun-l3"
        nodeX={198}
        nodeY={245}
        unfurlProgress={leaf3P}
        pathD="M 0 0 C -38 -12, -68 0, -82 22 C -60 35, -24 24, 0 8 Z"
        veinD="M 0 0 L -68 16"
        fill={def.palette.leaf}
        stroke={def.palette.stem}
        strokeWidth={1}
        maxReach={85}
        uncurlAngle={-8}
      />

      {budP > 0 && (
        <g transform="translate(200, 165)">
          {bloomP < 0.35 && (
            <g opacity={1 - bloomP * 2.8}>
              <circle r={32 * budP} fill={def.palette.bud} stroke={def.palette.stem} strokeWidth="1.5" />
            </g>
          )}

          {bloomP > 0.05 && (
            <g opacity={clamp(bloomP * 2.5)}>
              {/* Outer 18 Ray Petals */}
              {petalsOuter.map((ang, i) => (
                <g key={`out-${i}`} transform={`rotate(${ang})`}>
                  <path
                    d="M 0 0 C -6.5 -25, -9 -55, 0 -76 C 9 -55, 6.5 -25, 0 0 Z"
                    fill={def.palette.primary}
                    stroke={def.palette.accent}
                    strokeWidth="0.5"
                    style={{
                      transform: `scaleY(${0.35 + bloomP * 0.65})`,
                      transformOrigin: '0px 0px',
                    }}
                  />
                </g>
              ))}

              {/* Inner 18 Ray Petals (Offset) */}
              {petalsInner.map((ang, i) => (
                <g key={`in-${i}`} transform={`rotate(${ang})`}>
                  <path
                    d="M 0 0 C -5.8 -22, -8 -50, 0 -68 C 8 -50, 5.8 -22, 0 0 Z"
                    fill={def.palette.secondary}
                    stroke={def.palette.accent}
                    strokeWidth="0.5"
                    style={{
                      transform: `scaleY(${0.35 + bloomP * 0.65})`,
                      transformOrigin: '0px 0px',
                    }}
                  />
                </g>
              ))}

              {/* Textured Seed Disk */}
              <circle r={34 * (0.45 + bloomP * 0.55)} fill={def.palette.center} stroke="#543820" strokeWidth="1.5" />
              {bloomP > 0.4 && (
                <g opacity={clamp((bloomP - 0.4) / 0.5)}>
                  {[10, 19, 28].map((rad, ri) => (
                    <circle key={ri} r={rad} fill="none" stroke="#68472B" strokeWidth="1.4" strokeDasharray="3 3" />
                  ))}
                  <circle r="5" fill="#C49129" />
                </g>
              )}
            </g>
          )}
        </g>
      )}
    </g>
  );
};

// =============================================================
// 6. HOA LAVENDER (Lavender - Lavandula angustifolia)
// 9 compact whorls blooming sequentially from the bottom tier upward
// =============================================================
export const LavenderRenderer: React.FC<SpeciesProps> = ({ progress, def }) => {
  const stemP = easeOutCubic(clamp((progress - 0.1) / 0.38));
  const bloomP = easeOutCubic(clamp((progress - 0.45) / 0.5));

  // 9 dense whorl tiers from bottom (y=280) to top (y=110)
  const tiers = [
    { y: 280, count: 8, d: 0.05 },
    { y: 258, count: 8, d: 0.16 },
    { y: 236, count: 8, d: 0.28 },
    { y: 214, count: 7, d: 0.40 },
    { y: 192, count: 7, d: 0.52 },
    { y: 170, count: 6, d: 0.64 },
    { y: 150, count: 6, d: 0.74 },
    { y: 130, count: 5, d: 0.84 },
    { y: 112, count: 4, d: 0.94 },
  ];

  if (progress < 0.1) return null;

  return (
    <g className="flower-lavender">
      <path
        d="M 200 430 C 199 350, 201 220, 200 105"
        stroke={def.palette.stem}
        strokeWidth="3.2"
        strokeLinecap="round"
        fill="none"
        pathLength="100"
        strokeDasharray="100"
        strokeDashoffset={100 * (1 - stemP)}
      />

      {[390, 365, 340, 315].map((ly, i) => {
        const leafP = getNodeProgress(progress, ly, 105, 0.1, 0.4);
        if (leafP <= 0) return null;
        return (
          <g key={i}>
            <BotanicalPathLeaf
              id={`lav-l-${i}`}
              nodeX={199}
              nodeY={ly}
              unfurlProgress={leafP}
              pathD="M 0 0 C -25 -12, -45 -18, -55 -22"
              fill="none"
              stroke={def.palette.leaf}
              strokeWidth={2.4}
              maxReach={60}
            />
            <BotanicalPathLeaf
              id={`lav-r-${i}`}
              nodeX={201}
              nodeY={ly}
              unfurlProgress={leafP}
              pathD="M 0 0 C 25 -12, 45 -18, 55 -22"
              fill="none"
              stroke={def.palette.leaf}
              strokeWidth={2.4}
              maxReach={60}
            />
          </g>
        );
      })}

      {/* Sequential blooming upward from bottom whorl to top spire */}
      {stemP > 0.5 &&
        tiers.map((t, ti) => {
          const tierBloom = easeOutCubic(clamp((bloomP - t.d) / (1 - t.d || 0.1)));
          const floretAngles = [-65, -45, -25, 0, 25, 45, 65].slice(0, t.count);

          if (tierBloom <= 0) return null;

          return (
            <g key={ti} transform={`translate(200, ${t.y})`}>
              {floretAngles.map((ang, fi) => (
                <g
                  key={fi}
                  transform={`rotate(${ang})`}
                  style={{
                    transform: `rotate(${ang}deg) scale(${0.35 + tierBloom * 0.65})`,
                    transformOrigin: '0px 0px',
                    opacity: clamp(tierBloom * 2),
                  }}
                >
                  <path
                    d="M 0 0 C -4 -8, -6 -17, 0 -21 C 6 -17, 4 -8, 0 0 Z"
                    fill={fi % 2 === 0 ? def.palette.primary : def.palette.secondary}
                    stroke={def.palette.accent}
                    strokeWidth="0.5"
                  />
                  <ellipse cx="0" cy="-21" rx="3.6" ry="2.6" fill={def.palette.accent} />
                  <circle cx="0" cy="-14" r="1.3" fill={def.palette.center} />
                </g>
              ))}
            </g>
          );
        })}
    </g>
  );
};

// =============================================================
// 7. HOA HỒNG (Rose - Rosa damascena)
// 6 concentric spiraling petal whorls, reflexed outer petals
// =============================================================
export const RoseRenderer: React.FC<SpeciesProps> = ({ progress, def }) => {
  const stemP = easeOutCubic(clamp((progress - 0.1) / 0.35));
  const leaf1P = getNodeProgress(progress, 345, 170);
  const leaf2P = getNodeProgress(progress, 265, 170);
  const budP = easeOutCubic(clamp((progress - 0.38) / 0.22));
  const bloomP = easeOutCubic(clamp((progress - 0.52) / 0.45));

  if (progress < 0.1) return null;

  return (
    <g className="flower-rose">
      <path
        d="M 200 430 C 193 360, 206 270, 200 170"
        stroke={def.palette.stem}
        strokeWidth="4.6"
        strokeLinecap="round"
        fill="none"
        pathLength="100"
        strokeDasharray="100"
        strokeDashoffset={100 * (1 - stemP)}
      />

      {stemP > 0.4 && (
        <>
          <path d="M 197 385 Q 186 389 191 380 Z" fill={def.palette.stem} />
          <path d="M 203 315 Q 214 319 209 310 Z" fill={def.palette.stem} />
        </>
      )}

      <BotanicalPathLeaf
        id="rose-l1"
        nodeX={196}
        nodeY={345}
        unfurlProgress={leaf1P}
        pathD="M 0 0 C -25 -15, -45 0, -58 -10 C -45 -22, -22 -18, 0 0 Z M -20 -6 C -32 -25, -45 -28, -55 -32 C -45 -38, -30 -28, -20 -6 Z M -20 -2 C -28 15, -42 22, -50 25 C -44 12, -30 5, -20 -2 Z"
        veinD="M 0 0 L -50 -10"
        fill={def.palette.leaf}
        stroke={def.palette.stem}
        strokeWidth={0.8}
        maxReach={65}
        uncurlAngle={-10}
      />

      <BotanicalPathLeaf
        id="rose-l2"
        nodeX={204}
        nodeY={265}
        unfurlProgress={leaf2P}
        pathD="M 0 0 C 25 -15, 45 0, 58 -10 C 45 -22, 22 -18, 0 0 Z M 20 -6 C 32 -25, 45 -28, 55 -32 C 45 -38, 30 -28, 20 -6 Z"
        veinD="M 0 0 L 50 -10"
        fill={def.palette.leafHighlight}
        stroke={def.palette.stem}
        strokeWidth={0.8}
        maxReach={65}
        uncurlAngle={10}
      />

      {stemP > 0.85 && (
        <g fill={def.palette.leaf} stroke={def.palette.stem} strokeWidth="0.8">
          <path d="M 194 172 C 172 178, 160 195, 155 208 C 168 195, 182 184, 194 172 Z" />
          <path d="M 206 172 C 228 178, 240 195, 245 208 C 232 195, 218 184, 206 172 Z" />
        </g>
      )}

      {budP > 0 && (
        <g transform="translate(200, 155)">
          {bloomP < 0.35 && (
            <g opacity={1 - bloomP * 2.8}>
              <path
                d="M 0 15 C -20 5, -18 -30, 0 -50 C 18 -30, 20 5, 0 15 Z"
                fill={def.palette.bud}
                stroke={def.palette.accent}
                strokeWidth="1.2"
                style={{ transform: `scale(${budP})`, transformOrigin: '0 15px' }}
              />
            </g>
          )}

          {bloomP > 0.05 && (
            <g
              style={{
                transform: `scale(${0.38 + bloomP * 0.62})`,
                transformOrigin: '0px 0px',
                opacity: clamp(bloomP * 2.5),
              }}
            >
              {/* Outer Guard Petals (5 large cupped petals) */}
              {[0, 72, 144, 216, 288].map((ang, i) => (
                <path
                  key={`r-out-${i}`}
                  d="M 0 10 C -34 0, -48 -45, -24 -68 C -6 -60, 6 -60, 24 -68 C 48 -45, 34 0, 0 10 Z"
                  fill={def.palette.secondary}
                  stroke={def.palette.accent}
                  strokeWidth="0.8"
                  transform={`rotate(${ang})`}
                  style={{ transform: `rotate(${ang + 10 * bloomP}deg)` }}
                />
              ))}

              {/* Mid Layer Petals (5 offset petals) */}
              {bloomP > 0.2 && (
                <g opacity={clamp((bloomP - 0.2) / 0.4)}>
                  {[36, 108, 180, 252, 324].map((ang, i) => (
                    <path
                      key={`r-mid-${i}`}
                      d="M 0 8 C -26 -2, -38 -38, -18 -55 C -4 -48, 4 -48, 18 -55 C 38 -38, 26 -2, 0 8 Z"
                      fill={def.palette.primary}
                      stroke={def.palette.secondary}
                      strokeWidth="0.7"
                      transform={`rotate(${ang}) scale(0.85)`}
                    />
                  ))}
                </g>
              )}

              {/* Inner Cup & Spiral Heart */}
              {bloomP > 0.35 && (
                <g opacity={clamp((bloomP - 0.35) / 0.4)}>
                  <path d="M -16 0 C -22 -20, 0 -35, 14 -22 C 22 -6, 0 6, -16 0 Z" fill={def.palette.accent} opacity="0.9" />
                  <path d="M 12 -4 C 18 -22, -4 -32, -12 -18 C -18 -4, -2 4, 12 -4 Z" fill={def.palette.secondary} />
                  <path d="M -8 -8 C -12 -22, 6 -24, 8 -14 C 10 -4, -2 -2, -8 -8 Z" fill={def.palette.accent} />
                  <path
                    d="M 0 -12 C 4 -16, 8 -12, 6 -8 C 4 -4, 0 -4, -2 -8 C -4 -12, 0 -16, 4 -16"
                    stroke={def.palette.primary}
                    strokeWidth="1.2"
                    fill="none"
                  />
                </g>
              )}
            </g>
          )}
        </g>
      )}
    </g>
  );
};

// =============================================================
// 8. HOA RUM (Calla Lily - Zantedeschia aethiopica)
// Sculptural spathe funnel, golden spadix column
// =============================================================
export const CallaLilyRenderer: React.FC<SpeciesProps> = ({ progress, def }) => {
  const stemP = easeOutCubic(clamp((progress - 0.1) / 0.35));
  const leaf1P = getNodeProgress(progress, 410, 170);
  const leaf2P = getNodeProgress(progress, 380, 170);
  const budP = easeOutCubic(clamp((progress - 0.38) / 0.22));
  const bloomP = easeOutCubic(clamp((progress - 0.52) / 0.45));

  if (progress < 0.1) return null;

  return (
    <g className="flower-calla-lily">
      <path
        d="M 200 430 C 192 340, 208 250, 200 170"
        stroke={def.palette.stem}
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
        pathLength="100"
        strokeDasharray="100"
        strokeDashoffset={100 * (1 - stemP)}
      />

      <BotanicalPathLeaf
        id="calla-l1"
        nodeX={200}
        nodeY={410}
        unfurlProgress={leaf1P}
        pathD="M 0 0 C -42 -35, -75 -115, -60 -185 C -45 -130, -18 -65, 0 -18 Z"
        veinD="M 0 0 C -30 -60, -50 -125, -60 -185"
        fill={def.palette.leaf}
        stroke={def.palette.stem}
        strokeWidth={1}
        maxReach={190}
        uncurlAngle={-10}
      />

      <BotanicalPathLeaf
        id="calla-l2"
        nodeX={200}
        nodeY={380}
        unfurlProgress={leaf2P}
        pathD="M 0 0 C 40 -35, 70 -115, 55 -180 C 42 -125, 18 -65, 0 -18 Z"
        veinD="M 0 0 C 28 -60, 48 -120, 55 -180"
        fill={def.palette.leafHighlight}
        stroke={def.palette.stem}
        strokeWidth={1}
        maxReach={185}
        uncurlAngle={10}
      />

      {budP > 0 && (
        <g transform="translate(200, 170)">
          {bloomP < 0.35 && (
            <g opacity={1 - bloomP * 2.8}>
              <path
                d="M 0 10 C -12 0, -14 -40, 0 -70 C 14 -40, 12 0, 0 10 Z"
                fill={def.palette.bud}
                stroke={def.palette.stem}
                strokeWidth="1.2"
                style={{ transform: `scale(${budP})`, transformOrigin: '0 10px' }}
              />
            </g>
          )}

          {bloomP > 0.05 && (
            <g
              style={{
                transform: `scale(${0.38 + bloomP * 0.62})`,
                transformOrigin: '0px 10px',
                opacity: clamp(bloomP * 2.5),
              }}
            >
              <path
                d="M 0 8 C -25 -5, -45 -45, -30 -75 C -15 -60, -5 -35, 0 8 Z"
                fill={def.palette.secondary}
                stroke={def.palette.accent}
                strokeWidth="0.8"
              />
              <g opacity={bloomP}>
                <line x1="0" y1="0" x2="3" y2="-52" stroke={def.palette.center} strokeWidth="4.5" strokeLinecap="round" />
                <polygon points="1,-52 3,-58 5,-52" fill={def.palette.center} />
              </g>
              <path
                d="M 0 8 C -35 0, -52 -55, -20 -85 C 10 -72, 35 -40, 0 8 Z"
                fill={def.palette.primary}
                stroke={def.palette.secondary}
                strokeWidth="0.8"
                style={{ transform: `rotate(${-10 * bloomP}deg)`, transformOrigin: '0px 8px' }}
              />
              <path
                d="M 0 8 C 30 0, 48 -50, 15 -80 C -5 -65, -25 -35, 0 8 Z"
                fill={def.palette.secondary}
                stroke={def.palette.accent}
                strokeWidth="0.8"
                style={{ transform: `rotate(${10 * bloomP}deg)`, transformOrigin: '0px 8px' }}
              />
              <path
                d="M 0 10 C -22 -10, -26 -65, -8 -82 C 12 -65, 20 -25, 0 10 Z"
                fill={def.palette.primary}
                stroke={def.palette.accent}
                strokeWidth="0.9"
              />
            </g>
          )}
        </g>
      )}
    </g>
  );
};

// =============================================================
// 9. HOA SEN (Lotus - Nelumbo nucifera)
// Radial pointed petals unfolding with central seed pod
// =============================================================
export const LotusRenderer: React.FC<SpeciesProps> = ({ progress, def }) => {
  const stemP = easeOutCubic(clamp((progress - 0.1) / 0.35));
  const leaf1P = easeOutCubic(clamp((progress - 0.18) / 0.22));
  const leaf2P = easeOutCubic(clamp((progress - 0.26) / 0.22));
  const budP = easeOutCubic(clamp((progress - 0.38) / 0.22));
  const bloomP = easeOutCubic(clamp((progress - 0.52) / 0.45));

  if (progress < 0.1) return null;

  return (
    <g className="flower-lotus">
      <path
        d="M 200 430 C 202 340, 198 250, 200 160"
        stroke={def.palette.stem}
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
        pathLength="100"
        strokeDasharray="100"
        strokeDashoffset={100 * (1 - stemP)}
      />

      {leaf1P > 0 && (
        <g transform="translate(130, 390)">
          <g style={{ transform: `scale(${leaf1P})`, transformOrigin: '70px 40px' }}>
            <ellipse cx="0" cy="0" rx="65" ry="22" fill={def.palette.leaf} stroke={def.palette.stem} strokeWidth="1" />
            <circle r="3" fill={def.palette.stem} />
          </g>
        </g>
      )}

      {leaf2P > 0 && (
        <g transform="translate(270, 375)">
          <g style={{ transform: `scale(${leaf2P})`, transformOrigin: '-70px 55px' }}>
            <ellipse cx="0" cy="0" rx="55" ry="18" fill={def.palette.leafHighlight} stroke={def.palette.stem} strokeWidth="1" />
            <circle r="3" fill={def.palette.stem} />
          </g>
        </g>
      )}

      {budP > 0 && (
        <g transform="translate(200, 160)">
          {bloomP < 0.35 && (
            <g opacity={1 - bloomP * 2.8}>
              <path
                d="M 0 15 C -20 5, -22 -35, 0 -65 C 22 -35, 20 5, 0 15 Z"
                fill={def.palette.bud}
                stroke={def.palette.accent}
                strokeWidth="1.2"
                style={{ transform: `scale(${budP})`, transformOrigin: '0 15px' }}
              />
            </g>
          )}

          {bloomP > 0.05 && (
            <g
              style={{
                transform: `scale(${0.38 + bloomP * 0.62})`,
                transformOrigin: '0px 10px',
                opacity: clamp(bloomP * 2.5),
              }}
            >
              {[-75, -50, -25, 0, 25, 50, 75].map((rot, i) => (
                <path
                  key={i}
                  d="M 0 5 C -15 -10, -18 -45, 0 -68 C 18 -45, 15 -10, 0 5 Z"
                  fill={def.palette.primary}
                  stroke={def.palette.secondary}
                  strokeWidth="0.8"
                  transform={`rotate(${rot * bloomP})`}
                />
              ))}

              {bloomP > 0.3 && (
                <g opacity={clamp((bloomP - 0.3) / 0.5)}>
                  {[-40, -15, 15, 40].map((rot, i) => (
                    <path
                      key={i}
                      d="M 0 8 C -14 -8, -16 -40, 0 -58 C 16 -40, 14 -8, 0 8 Z"
                      fill={def.palette.accent}
                      stroke={def.palette.secondary}
                      strokeWidth="0.7"
                      transform={`rotate(${rot * bloomP})`}
                    />
                  ))}
                </g>
              )}

              {bloomP > 0.45 && (
                <g opacity={clamp((bloomP - 0.45) / 0.4)}>
                  <path d="M -16 -10 L 16 -10 L 10 10 L -10 10 Z" fill={def.palette.center} stroke="#6F883E" strokeWidth="1" />
                  <ellipse cx="0" cy="-10" rx="16" ry="6" fill="#A8C96B" stroke="#6F883E" strokeWidth="0.8" />
                  {[-10, -5, 0, 5, 10].map((hx, i) => (
                    <circle key={i} cx={hx} cy={-10} r="1.5" fill="#4B6024" />
                  ))}
                </g>
              )}
            </g>
          )}
        </g>
      )}
    </g>
  );
};

// =============================================================
// 10. HOA ANH ĐÀO (Cherry Blossom - Prunus serrulata)
// Lower branch grows FIRST -> Upper branch grows SECOND -> Apex
// Blossoms bloom sequentially strictly adhering to branch growth
// =============================================================
export const CherryBlossomRenderer: React.FC<SpeciesProps> = ({ progress, def }) => {
  const stemP = easeOutCubic(clamp((progress - 0.1) / 0.35));
  // Lower branch at y = 260
  const lowerBranchP = getNodeProgress(progress, 260, 160, 0.10, 0.35);
  // Upper branch at y = 195
  const upperBranchP = getNodeProgress(progress, 195, 160, 0.10, 0.35);
  const apexP = easeOutCubic(clamp((progress - 0.40) / 0.20));
  const bloomP = easeOutCubic(clamp((progress - 0.52) / 0.45));

  if (progress < 0.1) return null;

  const renderSingleBlossom = (x: number, y: number, scaleVal: number, rotOffset: number, floretProgress: number) => {
    if (floretProgress <= 0) return null;
    return (
      <g
        transform={`translate(${x}, ${y})`}
        style={{
          transform: `translate(${x}px, ${y}px) scale(${scaleVal * (0.38 + floretProgress * 0.62)})`,
          transformOrigin: '0px 0px',
          opacity: clamp(floretProgress * 2.5),
        }}
      >
        {[0, 72, 144, 216, 288].map((ang, i) => (
          <path
            key={i}
            d="M 0 0 C -15 -18, -18 -42, -5 -48 C -2 -46, 0 -42, 2 -46 C 18 -42, 15 -18, 0 0 Z"
            fill={def.palette.primary}
            stroke={def.palette.secondary}
            strokeWidth="0.6"
            transform={`rotate(${ang + rotOffset})`}
          />
        ))}
        <circle r="4.5" fill={def.palette.center} />
        {[0, 36, 72, 108, 144, 180, 216, 252, 288, 324].map((stAng, si) => (
          <g key={si} transform={`rotate(${stAng})`}>
            <line x1="0" y1="0" x2="0" y2="-15" stroke={def.palette.center} strokeWidth="0.8" />
            <circle cx="0" cy="-15" r="1.3" fill="#E8B83A" />
          </g>
        ))}
      </g>
    );
  };

  return (
    <g className="flower-cherry-blossom">
      {/* Main Wood Stem */}
      <path
        d="M 200 430 C 190 350, 215 270, 195 160"
        stroke={def.palette.stem}
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
        pathLength="100"
        strokeDasharray="100"
        strokeDashoffset={100 * (1 - stemP)}
      />

      {/* 1. LOWER branch at y = 260 grows out FIRST */}
      {lowerBranchP > 0 && (
        <g stroke={def.palette.stem} strokeLinecap="round" fill="none">
          <path
            d="M 205 260 C 235 235, 265 215, 285 190"
            strokeWidth="3.6"
            pathLength="100"
            strokeDasharray="100"
            strokeDashoffset={100 * (1 - lowerBranchP)}
          />
          {lowerBranchP > 0.5 && (
            <path
              d="M 260 215 C 285 210, 305 205, 320 200"
              strokeWidth="2.2"
              pathLength="100"
              strokeDasharray="100"
              strokeDashoffset={100 * (1 - lowerBranchP)}
            />
          )}
        </g>
      )}

      {/* 2. UPPER branch at y = 195 grows out SECOND */}
      {upperBranchP > 0 && (
        <path
          d="M 197 195 C 170 175, 150 155, 135 140"
          stroke={def.palette.stem}
          strokeWidth="2.8"
          strokeLinecap="round"
          fill="none"
          pathLength="100"
          strokeDasharray="100"
          strokeDashoffset={100 * (1 - upperBranchP)}
        />
      )}

      {/* Foliage on lower branch */}
      {lowerBranchP > 0.4 && (
        <BotanicalPathLeaf
          id="cherry-l1"
          nodeX={190}
          nodeY={290}
          unfurlProgress={lowerBranchP}
          pathD="M 0 0 C -25 -10, -40 0, -50 -5 C -35 -15, -15 -10, 0 0 Z"
          fill={def.palette.leaf}
          maxReach={55}
          uncurlAngle={-8}
        />
      )}

      {/* Blossoms bloom strictly in branch progression: */}
      {/* Lower branch blossoms (bloom first) */}
      {lowerBranchP > 0.6 && (
        <>
          {renderSingleBlossom(285, 190, 0.85, 18, easeOutCubic(clamp((bloomP - 0.05) / 0.85)))}
          {lowerBranchP > 0.85 && renderSingleBlossom(320, 200, 0.70, -25, easeOutCubic(clamp((bloomP - 0.15) / 0.8)))}
        </>
      )}

      {/* Upper branch blossom (blooms second) */}
      {upperBranchP > 0.6 && (
        renderSingleBlossom(135, 140, 0.75, -20, easeOutCubic(clamp((bloomP - 0.2) / 0.8)))
      )}

      {/* Apex Blossom (blooms after stem apex is established) */}
      {apexP > 0.6 && (
        renderSingleBlossom(195, 155, 1.0, 0, bloomP)
      )}
    </g>
  );
};

// =============================================================
// 11. HOA LAN (Orchid - Phalaenopsis aphrodite)
// Asymmetric butterfly petals with prominent 3-lobed labellum
// =============================================================
export const OrchidRenderer: React.FC<SpeciesProps> = ({ progress, def }) => {
  const stemP = easeOutCubic(clamp((progress - 0.1) / 0.35));
  const leaf1P = getNodeProgress(progress, 425, 160);
  const leaf2P = getNodeProgress(progress, 420, 160);
  const budP = easeOutCubic(clamp((progress - 0.38) / 0.22));
  const bloomP = easeOutCubic(clamp((progress - 0.52) / 0.45));

  if (progress < 0.1) return null;

  return (
    <g className="flower-orchid">
      <path
        d="M 200 420 C 195 320, 185 240, 200 160"
        stroke={def.palette.stem}
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
        pathLength="100"
        strokeDasharray="100"
        strokeDashoffset={100 * (1 - stemP)}
      />

      <BotanicalPathLeaf
        id="orchid-l1"
        nodeX={200}
        nodeY={425}
        unfurlProgress={leaf1P}
        pathD="M 0 0 C -60 -15, -110 -10, -125 0 C -95 10, -40 10, 0 0 Z"
        fill={def.palette.leaf}
        stroke={def.palette.stem}
        strokeWidth={1.2}
        maxReach={130}
        uncurlAngle={-5}
      />

      <BotanicalPathLeaf
        id="orchid-l2"
        nodeX={200}
        nodeY={420}
        unfurlProgress={leaf2P}
        pathD="M 0 0 C 60 -15, 110 -10, 125 0 C 95 10, 40 10, 0 0 Z"
        fill={def.palette.leafHighlight}
        stroke={def.palette.stem}
        strokeWidth={1.2}
        maxReach={130}
        uncurlAngle={5}
      />

      {budP > 0 && (
        <g transform="translate(200, 160)">
          {bloomP < 0.35 && (
            <g opacity={1 - bloomP * 2.8}>
              <ellipse cx="0" cy="0" rx="14" ry="20" fill={def.palette.bud} stroke={def.palette.accent} strokeWidth="1" />
            </g>
          )}

          {bloomP > 0.05 && (
            <g
              style={{
                transform: `scale(${0.38 + bloomP * 0.62})`,
                transformOrigin: '0px 0px',
                opacity: clamp(bloomP * 2.5),
              }}
            >
              {/* Dorsal and Lateral Sepals */}
              <path d="M 0 0 C -18 -20, -22 -55, 0 -75 C 22 -55, 18 -20, 0 0 Z" fill={def.palette.secondary} stroke={def.palette.primary} strokeWidth="0.8" />
              <path d="M 0 0 C -35 15, -65 30, -75 10 C -70 -12, -35 -15, 0 0 Z" fill={def.palette.secondary} stroke={def.palette.primary} strokeWidth="0.8" />
              <path d="M 0 0 C 35 15, 65 30, 75 10 C 70 -12, 35 -15, 0 0 Z" fill={def.palette.secondary} stroke={def.palette.primary} strokeWidth="0.8" />

              {/* Broad Lateral Petals (Butterfly wings) */}
              <path d="M 0 0 C -45 -10, -75 -40, -60 -65 C -35 -70, -15 -45, 0 0 Z" fill={def.palette.primary} stroke={def.palette.secondary} strokeWidth="0.8" />
              <path d="M 0 0 C 45 -10, 75 -40, 60 -65 C 35 -70, 15 -45, 0 0 Z" fill={def.palette.primary} stroke={def.palette.secondary} strokeWidth="0.8" />

              {/* Distinctive Labellum (Lip) */}
              <path d="M 0 -10 C -20 5, -25 25, 0 35 C 25 25, 20 5, 0 -10 Z" fill={def.palette.accent} stroke={def.palette.primary} strokeWidth="0.8" />
              <circle cx="0" cy="0" r="5" fill={def.palette.center} />
            </g>
          )}
        </g>
      )}
    </g>
  );
};

// =============================================================
// 12. HOA CẨM CHƯỚNG (Carnation - Dianthus caryophyllus)
// Dense ruffled petal layers with jagged serrated frills inside calyx
// =============================================================
export const CarnationRenderer: React.FC<SpeciesProps> = ({ progress, def }) => {
  const stemP = easeOutCubic(clamp((progress - 0.1) / 0.35));
  const leaf1P = getNodeProgress(progress, 380, 165);
  const leaf2P = getNodeProgress(progress, 325, 165);
  const leaf3P = getNodeProgress(progress, 260, 165);
  const budP = easeOutCubic(clamp((progress - 0.38) / 0.22));
  const bloomP = easeOutCubic(clamp((progress - 0.52) / 0.45));

  if (progress < 0.1) return null;

  return (
    <g className="flower-carnation">
      <path
        d="M 200 430 C 197 340, 203 260, 200 165"
        stroke={def.palette.stem}
        strokeWidth="3.6"
        strokeLinecap="round"
        fill="none"
        pathLength="100"
        strokeDasharray="100"
        strokeDashoffset={100 * (1 - stemP)}
      />

      {[
        { y: 380, p: leaf1P },
        { y: 325, p: leaf2P },
        { y: 260, p: leaf3P },
      ].map((node, i) => (
        <g key={i}>
          <BotanicalPathLeaf
            id={`carn-l-${i}`}
            nodeX={198}
            nodeY={node.y}
            unfurlProgress={node.p}
            pathD="M 0 0 C -25 -10, -50 -14, -65 -16"
            fill="none"
            stroke={def.palette.leaf}
            strokeWidth={1.8}
            maxReach={70}
          />
          <BotanicalPathLeaf
            id={`carn-r-${i}`}
            nodeX={202}
            nodeY={node.y}
            unfurlProgress={node.p}
            pathD="M 0 0 C 25 -10, 50 -14, 65 -16"
            fill="none"
            stroke={def.palette.leaf}
            strokeWidth={1.8}
            maxReach={70}
          />
        </g>
      ))}

      {/* Tubular Green Calyx */}
      {stemP > 0.85 && (
        <g fill={def.palette.leaf} stroke={def.palette.stem} strokeWidth="1">
          <path d="M 190 165 L 188 185 L 212 185 L 210 165 Z" />
          <polygon points="188,165 194,155 198,165" fill={def.palette.leafHighlight} />
          <polygon points="196,165 200,152 204,165" fill={def.palette.leafHighlight} />
          <polygon points="202,165 206,155 212,165" fill={def.palette.leafHighlight} />
        </g>
      )}

      {/* Dense Frilly Ruffled Petals */}
      {budP > 0 && (
        <g transform="translate(200, 155)">
          {bloomP < 0.35 && (
            <g opacity={1 - bloomP * 2.8}>
              <path d="M -8 0 Q 0 -12 8 0" stroke={def.palette.accent} strokeWidth="1.5" fill={def.palette.primary} />
            </g>
          )}

          {bloomP > 0.05 && (
            <g
              style={{
                transform: `scale(${0.38 + bloomP * 0.62})`,
                transformOrigin: '0px 0px',
                opacity: clamp(bloomP * 2.5),
              }}
            >
              {/* Outer serrated petals */}
              {[-70, -45, -20, 0, 20, 45, 70, 95].map((rot, i) => (
                <path
                  key={`c-out-${i}`}
                  d="M 0 0 L -18 -30 L -14 -35 L -10 -32 L -6 -38 L -2 -34 L 2 -40 L 6 -35 L 10 -39 L 14 -33 L 18 -30 Z"
                  fill={def.palette.primary}
                  stroke={def.palette.secondary}
                  strokeWidth="0.6"
                  transform={`rotate(${rot * bloomP})`}
                />
              ))}

              {/* Mid dense ruffled layer */}
              {bloomP > 0.25 && (
                <g opacity={clamp((bloomP - 0.25) / 0.5)}>
                  {[-55, -30, -5, 15, 40, 65, 120, -120].map((rot, i) => (
                    <path
                      key={`c-mid-${i}`}
                      d="M 0 0 L -14 -22 L -11 -26 L -8 -23 L -4 -28 L 0 -25 L 4 -30 L 8 -26 L 11 -29 L 14 -22 Z"
                      fill={i % 2 === 0 ? def.palette.secondary : def.palette.accent}
                      stroke={def.palette.primary}
                      strokeWidth="0.5"
                      transform={`rotate(${rot}) scale(0.85)`}
                    />
                  ))}
                </g>
              )}

              {/* Inner core frills */}
              {bloomP > 0.45 && (
                <g opacity={clamp((bloomP - 0.45) / 0.4)}>
                  {[-35, 0, 35].map((rot, i) => (
                    <path
                      key={`c-in-${i}`}
                      d="M 0 0 L -8 -15 L -5 -18 L 0 -16 L 5 -20 L 8 -15 Z"
                      fill={def.palette.accent}
                      stroke={def.palette.center}
                      strokeWidth="0.5"
                      transform={`rotate(${rot}) scale(0.7)`}
                    />
                  ))}
                </g>
              )}
            </g>
          )}
        </g>
      )}
    </g>
  );
};

// =============================================================
// 13. HOA CẨM TÚ CẦU (Hydrangea - Hydrangea macrophylla)
// Dense lush spherical mophead dome with 64 overlapping florets
// =============================================================
export const HydrangeaRenderer: React.FC<SpeciesProps> = ({ progress, def }) => {
  const stemP = easeOutCubic(clamp((progress - 0.1) / 0.35));
  const leaf1P = getNodeProgress(progress, 320, 200);
  const leaf2P = getNodeProgress(progress, 260, 200);
  const budP = easeOutCubic(clamp((progress - 0.38) / 0.22));
  const bloomP = easeOutCubic(clamp((progress - 0.52) / 0.45));

  // 64 Dense florets distributed across core, mid-sphere, and outer rim
  const florets = [
    // Core dome
    { x: 0, y: 0, d: 0.08, s: 1.15 },
    { x: -16, y: -10, d: 0.12, s: 1.1 },
    { x: 16, y: -10, d: 0.14, s: 1.1 },
    { x: -14, y: 14, d: 0.16, s: 1.05 },
    { x: 14, y: 14, d: 0.18, s: 1.05 },
    { x: 0, y: -20, d: 0.20, s: 1.1 },
    { x: 0, y: 22, d: 0.22, s: 1.05 },

    // Mid-inner ring
    { x: -32, y: -22, d: 0.26, s: 1.0 },
    { x: 32, y: -22, d: 0.28, s: 1.0 },
    { x: -38, y: 0, d: 0.30, s: 1.0 },
    { x: 38, y: 0, d: 0.32, s: 1.0 },
    { x: -30, y: 22, d: 0.34, s: 0.98 },
    { x: 30, y: 22, d: 0.36, s: 0.98 },
    { x: -20, y: -34, d: 0.38, s: 0.98 },
    { x: 20, y: -34, d: 0.40, s: 0.98 },
    { x: -18, y: 36, d: 0.42, s: 0.95 },
    { x: 18, y: 36, d: 0.44, s: 0.95 },

    // Mid-outer ring
    { x: 0, y: -48, d: 0.46, s: 0.95 },
    { x: -38, y: -38, d: 0.48, s: 0.92 },
    { x: 38, y: -38, d: 0.50, s: 0.92 },
    { x: -52, y: -18, d: 0.52, s: 0.92 },
    { x: 52, y: -18, d: 0.54, s: 0.92 },
    { x: -58, y: 5, d: 0.56, s: 0.90 },
    { x: 58, y: 5, d: 0.58, s: 0.90 },
    { x: -50, y: 24, d: 0.60, s: 0.90 },
    { x: 50, y: 24, d: 0.62, s: 0.90 },
    { x: -36, y: 42, d: 0.64, s: 0.88 },
    { x: 36, y: 42, d: 0.66, s: 0.88 },
    { x: 0, y: 52, d: 0.68, s: 0.88 },
    { x: -20, y: 48, d: 0.70, s: 0.88 },
    { x: 20, y: 48, d: 0.72, s: 0.88 },

    // Outer spherical fullness
    { x: -26, y: -52, d: 0.74, s: 0.85 },
    { x: 26, y: -52, d: 0.76, s: 0.85 },
    { x: -52, y: -38, d: 0.78, s: 0.85 },
    { x: 52, y: -38, d: 0.80, s: 0.85 },
    { x: -68, y: -10, d: 0.82, s: 0.82 },
    { x: 68, y: -10, d: 0.84, s: 0.82 },
    { x: -68, y: 16, d: 0.86, s: 0.82 },
    { x: 68, y: 16, d: 0.88, s: 0.82 },
    { x: -52, y: 38, d: 0.90, s: 0.82 },
    { x: 52, y: 38, d: 0.92, s: 0.82 },
    { x: 0, y: -34, d: 0.50, s: 1.0 },
    { x: -16, y: -18, d: 0.35, s: 1.0 },
    { x: 16, y: -18, d: 0.37, s: 1.0 },
  ];

  if (progress < 0.1) return null;

  return (
    <g className="flower-hydrangea">
      <path
        d="M 200 430 C 197 350, 202 260, 200 200"
        stroke={def.palette.stem}
        strokeWidth="5.5"
        strokeLinecap="round"
        fill="none"
        pathLength="100"
        strokeDasharray="100"
        strokeDashoffset={100 * (1 - stemP)}
      />

      <BotanicalPathLeaf
        id="hydra-l1"
        nodeX={197}
        nodeY={320}
        unfurlProgress={leaf1P}
        pathD="M 0 0 C -55 -28, -100 0, -115 32 C -78 48, -25 36, 0 10 Z"
        veinD="M 0 0 L -90 22"
        fill={def.palette.leaf}
        stroke={def.palette.stem}
        strokeWidth={1.2}
        maxReach={120}
        uncurlAngle={-10}
      />

      <BotanicalPathLeaf
        id="hydra-l2"
        nodeX={203}
        nodeY={260}
        unfurlProgress={leaf2P}
        pathD="M 0 0 C 55 -28, 100 0, 115 32 C 78 48, 25 36, 0 10 Z"
        veinD="M 0 0 L 90 22"
        fill={def.palette.leafHighlight}
        stroke={def.palette.stem}
        strokeWidth={1.2}
        maxReach={120}
        uncurlAngle={10}
      />

      {budP > 0 && (
        <g transform="translate(200, 150)">
          {bloomP < 0.35 && (
            <g opacity={1 - bloomP * 2.8}>
              <circle r={36 * budP} fill={def.palette.bud} stroke={def.palette.stem} strokeWidth="1.5" />
            </g>
          )}

          {bloomP > 0.05 && (
            <g>
              {florets.map((fl, fi) => {
                const itemBloom = easeOutCubic(clamp((bloomP - fl.d) / (1 - fl.d || 0.1)));
                if (itemBloom <= 0) return null;

                return (
                  <g
                    key={fi}
                    transform={`translate(${fl.x}, ${fl.y})`}
                    style={{
                      transform: `translate(${fl.x}px, ${fl.y}px) scale(${fl.s * (0.35 + itemBloom * 0.65)})`,
                      opacity: clamp(itemBloom * 2),
                    }}
                  >
                    {[0, 90, 180, 270].map((rot, si) => (
                      <ellipse
                        key={si}
                        cx="0"
                        cy="-9.5"
                        rx="7"
                        ry="9"
                        fill={fi % 3 === 0 ? def.palette.accent : fi % 2 === 0 ? def.palette.primary : def.palette.secondary}
                        stroke={def.palette.primary}
                        strokeWidth="0.45"
                        transform={`rotate(${rot})`}
                      />
                    ))}
                    <circle r="1.8" fill={def.palette.center} />
                  </g>
                );
              })}
            </g>
          )}
        </g>
      )}
    </g>
  );
};

// =============================================================
// 14. HOA MỘC LAN (Magnolia - Magnolia soulangeana)
// Sculptural thick petals with delicate gradient shading
// =============================================================
export const MagnoliaRenderer: React.FC<SpeciesProps> = ({ progress, def }) => {
  const stemP = easeOutCubic(clamp((progress - 0.1) / 0.35));
  const leaf1P = getNodeProgress(progress, 320, 170);
  const leaf2P = getNodeProgress(progress, 250, 170);
  const budP = easeOutCubic(clamp((progress - 0.38) / 0.22));
  const bloomP = easeOutCubic(clamp((progress - 0.52) / 0.45));

  if (progress < 0.1) return null;

  return (
    <g className="flower-magnolia">
      <path
        d="M 200 430 C 190 340, 215 250, 198 170"
        stroke={def.palette.stem}
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
        pathLength="100"
        strokeDasharray="100"
        strokeDashoffset={100 * (1 - stemP)}
      />

      <BotanicalPathLeaf
        id="mag-l1"
        nodeX={193}
        nodeY={320}
        unfurlProgress={leaf1P}
        pathD="M 0 0 C -35 -22, -62 -6, -78 12 C -52 28, -20 16, 0 5 Z"
        veinD="M 0 0 L -70 12"
        fill={def.palette.leaf}
        maxReach={85}
        uncurlAngle={-8}
      />

      <BotanicalPathLeaf
        id="mag-l2"
        nodeX={205}
        nodeY={250}
        unfurlProgress={leaf2P}
        pathD="M 0 0 C 38 -22, 65 -6, 80 12 C 54 28, 22 16, 0 5 Z"
        veinD="M 0 0 L 72 12"
        fill={def.palette.leafHighlight}
        maxReach={85}
        uncurlAngle={8}
      />

      {budP > 0 && (
        <g transform="translate(198, 160)">
          {bloomP < 0.35 && (
            <g opacity={1 - bloomP * 2.8}>
              <path
                d="M 0 15 C -15 5, -18 -35, 0 -65 C 18 -35, 15 5, 0 15 Z"
                fill={def.palette.bud}
                stroke={def.palette.stem}
                strokeWidth="1.2"
                style={{ transform: `scale(${budP})`, transformOrigin: '0 15px' }}
              />
            </g>
          )}

          {bloomP > 0.05 && (
            <g
              style={{
                transform: `scale(${0.38 + bloomP * 0.62})`,
                transformOrigin: '0px 10px',
                opacity: clamp(bloomP * 2.5),
              }}
            >
              <path
                d="M 0 10 C -34 0, -52 -50, -30 -78 C -10 -62, -6 -28, 0 10 Z"
                fill={def.palette.primary}
                stroke={def.palette.secondary}
                strokeWidth="0.8"
                style={{ transform: `rotate(${-26 * bloomP}deg)`, transformOrigin: '0px 10px' }}
              />
              <path
                d="M 0 10 C 34 0, 52 -50, 30 -78 C 10 -62, 6 -28, 0 10 Z"
                fill={def.palette.primary}
                stroke={def.palette.secondary}
                strokeWidth="0.8"
                style={{ transform: `rotate(${26 * bloomP}deg)`, transformOrigin: '0px 10px' }}
              />
              <path
                d="M 0 10 C -22 -10, -25 -65, 0 -88 C 25 -65, 22 -10, 0 10 Z"
                fill={def.palette.secondary}
                stroke={def.palette.accent}
                strokeWidth="0.8"
              />

              <g opacity={bloomP}>
                <polygon points="-6,0 0,-32 6,0" fill={def.palette.center} />
              </g>

              <path
                d="M 0 12 C -24 -8, -28 -55, -9 -72 C 6 -60, 12 -28, 0 12 Z"
                fill={def.palette.primary}
                stroke={def.palette.secondary}
                strokeWidth="0.7"
                style={{ transform: `rotate(${-12 * bloomP}deg)`, transformOrigin: '0px 12px' }}
              />
              <path
                d="M 0 12 C 24 -8, 28 -55, 9 -72 C -6 -60, -12 -28, 0 12 Z"
                fill={def.palette.primary}
                stroke={def.palette.secondary}
                strokeWidth="0.7"
                style={{ transform: `rotate(${12 * bloomP}deg)`, transformOrigin: '0px 12px' }}
              />
              <path
                d="M 0 14 C -20 -10, -22 -52, 0 -74 C 22 -52, 20 -10, 0 14 Z"
                fill="url(#magnoliaGrad)"
                stroke={def.palette.accent}
                strokeWidth="0.9"
              />
            </g>
          )}
        </g>
      )}
    </g>
  );
};

// =============================================================
// 15. HOA CÁNH BƯỚM (Cosmos - Cosmos bipinnatus)
// 8 wide fluted notched petals, feathery foliage
// =============================================================
export const CosmosRenderer: React.FC<SpeciesProps> = ({ progress, def }) => {
  const stemP = easeOutCubic(clamp((progress - 0.1) / 0.35));
  const leaf1P = getNodeProgress(progress, 360, 165);
  const leaf2P = getNodeProgress(progress, 310, 165);
  const leaf3P = getNodeProgress(progress, 260, 165);
  const budP = easeOutCubic(clamp((progress - 0.4) / 0.2));
  const bloomP = easeOutCubic(clamp((progress - 0.52) / 0.45));

  const angles = [0, 45, 90, 135, 180, 225, 270, 315];

  if (progress < 0.1) return null;

  return (
    <g className="flower-cosmos">
      <path
        d="M 200 430 C 205 340, 192 250, 200 165"
        stroke={def.palette.stem}
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
        pathLength="100"
        strokeDasharray="100"
        strokeDashoffset={100 * (1 - stemP)}
      />

      <BotanicalPathLeaf
        id="cos-l1"
        nodeX={198}
        nodeY={360}
        unfurlProgress={leaf1P}
        pathD="M 0 0 C -20 -10, -42 -15, -60 -20 M -26 -8 L -38 -28 M -42 -15 L -52 8 M -15 -5 L -22 10"
        fill="none"
        stroke={def.palette.leaf}
        strokeWidth={1.1}
        maxReach={65}
      />

      <BotanicalPathLeaf
        id="cos-l2"
        nodeX={202}
        nodeY={310}
        unfurlProgress={leaf2P}
        pathD="M 0 0 C 20 -10, 42 -15, 60 -20 M 26 -8 L 38 -28 M 42 -15 L 52 8 M 15 -5 L 22 10"
        fill="none"
        stroke={def.palette.leaf}
        strokeWidth={1.1}
        maxReach={65}
      />

      <BotanicalPathLeaf
        id="cos-l3"
        nodeX={198}
        nodeY={260}
        unfurlProgress={leaf3P}
        pathD="M 0 0 C -18 -8, -35 -12, -48 -15 M -20 -6 L -28 -20"
        fill="none"
        stroke={def.palette.leaf}
        strokeWidth={1.1}
        maxReach={50}
      />

      {budP > 0 && (
        <g transform="translate(200, 165)">
          {bloomP < 0.35 && (
            <g opacity={1 - bloomP * 2.8}>
              <circle r={12 * budP} fill={def.palette.bud} stroke={def.palette.stem} strokeWidth="1" />
            </g>
          )}

          {bloomP > 0.05 && (
            <g
              style={{
                transform: `scale(${0.38 + bloomP * 0.62})`,
                transformOrigin: '0px 0px',
                opacity: clamp(bloomP * 2.5),
              }}
            >
              {angles.map((ang, i) => (
                <g key={i} transform={`rotate(${ang})`}>
                  <path
                    d="M 0 0 C -8 -20, -16 -45, -12 -62 C -7 -68, -2 -65, 0 -68 C 2 -65, 7 -68, 12 -62 C 16 -45, 8 -20, 0 0 Z"
                    fill={i % 2 === 0 ? def.palette.primary : def.palette.secondary}
                    stroke={def.palette.accent}
                    strokeWidth="0.5"
                    style={{
                      transform: `scaleY(${0.3 + bloomP * 0.7}) scaleX(${0.5 + bloomP * 0.5})`,
                      transformOrigin: '0px 0px',
                    }}
                  />
                  <line x1="-3" y1="-12" x2="-5" y2="-55" stroke={def.palette.accent} strokeWidth="0.4" opacity="0.6" />
                  <line x1="0" y1="-10" x2="0" y2="-60" stroke={def.palette.accent} strokeWidth="0.4" opacity="0.6" />
                  <line x1="3" y1="-12" x2="5" y2="-55" stroke={def.palette.accent} strokeWidth="0.4" opacity="0.6" />
                </g>
              ))}

              <circle r={14 * (0.5 + bloomP * 0.5)} fill={def.palette.center} stroke="#B28512" strokeWidth="0.8" />
              {bloomP > 0.4 && (
                <g opacity={clamp((bloomP - 0.4) / 0.5)}>
                  {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, di) => (
                    <circle key={di} cx={6 * Math.cos((deg * Math.PI) / 180)} cy={6 * Math.sin((deg * Math.PI) / 180)} r="1.3" fill="#F7DA6D" />
                  ))}
                </g>
              )}
            </g>
          )}
        </g>
      )}
    </g>
  );
};
