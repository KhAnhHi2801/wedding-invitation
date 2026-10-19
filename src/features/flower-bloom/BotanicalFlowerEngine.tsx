import React, { memo, type AnimationEvent, type CSSProperties } from 'react';
import type { FlowerDefinition, GrowthStage } from '../../types/flower';
import {
  BabyBreathRenderer,
  PeonyRenderer,
  DaisyRenderer,
  TulipRenderer,
  SunflowerRenderer,
  LavenderRenderer,
  RoseRenderer,
  CallaLilyRenderer,
  LotusRenderer,
  CherryBlossomRenderer,
  OrchidRenderer,
  CarnationRenderer,
  HydrangeaRenderer,
  MagnoliaRenderer,
  CosmosRenderer,
} from './FlowerSpeciesRenderers';
import './bloom.css';

interface BotanicalFlowerEngineProps {
  flower: FlowerDefinition;
  stage: GrowthStage;
  /** Tiến trình liên tục 0 đến 1 (hạt, nảy mầm, thân, nụ, nở) */
  progress: number;
  /** Bật quầng sáng hoàn tất sau khi hoạt ảnh nở kết thúc, không bật ở hoa xem trước */
  bloomed?: boolean;
  /** Gọi khi hiệu ứng quầng sáng hoàn tất */
  onGlowComplete?: () => void;
  /** Máy yếu: bỏ hạt phấn và chuyển động đung đưa */
  lite?: boolean;
  /** Tắt hạt trong chậu (lúc hạt còn đang rơi từ trên xuống) */
  showSeed?: boolean;
}

const POLLEN = [
  { cx: 180, cy: 120, r: 1.8, dur: 4.2, delay: 0 },
  { cx: 220, cy: 140, r: 1.4, dur: 5.1, delay: 1.2 },
  { cx: 160, cy: 170, r: 1.6, dur: 4.8, delay: 2.1 },
  { cx: 240, cy: 110, r: 1.2, dur: 3.9, delay: 0.8 },
  { cx: 200, cy: 90, r: 2.0, dur: 5.5, delay: 1.7 },
];

/**
 * Engine vẽ một bông hoa mọc theo tiến trình 0 đến 1 (SVG, từ prototype "gieo một lời chúc").
 * Điều chỉnh cho điện thoại so với prototype:
 * - Chia hai lớp SVG: lớp hoa (đung đưa) và lớp đất/hạt (đứng yên). Đung đưa là transform trên thẻ HTML bọc ngoài
 *   nên được GPU xử lý, không phải vẽ lại bông hoa mỗi khung hình như khi animate thẻ <g> trong SVG.
 * - Quầng sáng là gradient tĩnh, không dùng filter blur.
 * - Không có will-change cố định.
 */
export const BotanicalFlowerEngine: React.FC<BotanicalFlowerEngineProps> = memo(({ flower, stage, progress, bloomed = false, onGlowComplete, lite = false, showSeed = true }) => {
  const props = { stage, progress, def: flower };

  const renderSpeciesContent = () => {
    switch (flower.id) {
      case 'baby-breath':
        return <BabyBreathRenderer {...props} />;
      case 'peony':
        return <PeonyRenderer {...props} />;
      case 'daisy':
        return <DaisyRenderer {...props} />;
      case 'tulip':
        return <TulipRenderer {...props} />;
      case 'sunflower':
        return <SunflowerRenderer {...props} />;
      case 'lavender':
        return <LavenderRenderer {...props} />;
      case 'rose':
        return <RoseRenderer {...props} />;
      case 'calla-lily':
        return <CallaLilyRenderer {...props} />;
      case 'lotus':
        return <LotusRenderer {...props} />;
      case 'cherry-blossom':
        return <CherryBlossomRenderer {...props} />;
      case 'orchid':
        return <OrchidRenderer {...props} />;
      case 'carnation':
        return <CarnationRenderer {...props} />;
      case 'hydrangea':
        return <HydrangeaRenderer {...props} />;
      case 'magnolia':
        return <MagnoliaRenderer {...props} />;
      case 'cosmos':
        return <CosmosRenderer {...props} />;
      default:
        return <TulipRenderer {...props} />;
    }
  };

  const isCompleted = progress >= 0.96;
  const isBloom = progress >= 0.55;
  const isGerminating = progress > 0.02 && progress < 0.22;
  const isSeed = progress <= 0.08 && showSeed;

  const glow = {
    '--glow-a': flower.id === 'baby-breath' ? 'rgba(255, 255, 255, 0.95)' : flower.palette.primary,
    '--glow-b': flower.id === 'baby-breath' ? 'rgba(235, 240, 232, 0.5)' : flower.palette.secondary,
  } as CSSProperties;

  return (
    <div className={`bloom${bloomed ? ' bloom--complete' : ''}`} style={glow}>
      <div
        className="bloom__glow"
        onAnimationEnd={(event: AnimationEvent<HTMLDivElement>) => {
          if (
            event.target === event.currentTarget &&
            event.animationName === 'bloom-glow'
          ) {
            onGlowComplete?.();
          }
        }}
      />

      {/* Chậu, phần sau: miệng chậu và mặt đất. Nằm dưới lớp hoa để thân hoa mọc ra từ đất */}
      <svg viewBox="0 0 400 560" className="bloom__layer" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <defs>
          <radialGradient id="potSoilGrad" cx="50%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#7A5C45" />
            <stop offset="100%" stopColor="#4A3426" />
          </radialGradient>
        </defs>
        <ellipse cx="200" cy="553" rx="88" ry="6" fill="#3B2A22" opacity="0.14" />
        <ellipse cx="200" cy="436" rx="78" ry="11" fill="#EADCC8" stroke="#CDB594" strokeWidth="1.2" />
        <ellipse cx="200" cy="437" rx="68" ry="8.5" fill="url(#potSoilGrad)" />
        <ellipse cx="178" cy="438" rx="3" ry="1.4" fill="#5B4331" opacity="0.8" />
        <ellipse cx="222" cy="439" rx="3.5" ry="1.5" fill="#33241A" opacity="0.7" />
        <ellipse cx="203" cy="441" rx="2" ry="1" fill="#A98B6F" opacity="0.5" />
      </svg>

      {/* Lớp hoa: chỉ lớp này đung đưa khi đã nở xong */}
      <div className={isCompleted && !lite ? 'bloom__sway' : 'bloom__still'}>
        <svg
          viewBox="0 0 400 560"
          className="bloom__layer"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={`${flower.name} (${flower.englishName})`}
          shapeRendering="geometricPrecision"
        >
          <defs>
            <radialGradient id="daisyCenterGrad" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#FCE788" />
              <stop offset="60%" stopColor="#E9BA38" />
              <stop offset="100%" stopColor="#C48E18" />
            </radialGradient>

            <linearGradient id="tulipPetalGrad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor={flower.palette.secondary} />
              <stop offset="60%" stopColor={flower.palette.primary} />
              <stop offset="100%" stopColor={flower.palette.accent} />
            </linearGradient>

            <linearGradient id="magnoliaGrad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor={flower.palette.accent} />
              <stop offset="30%" stopColor={flower.palette.secondary} />
              <stop offset="100%" stopColor={flower.palette.primary} />
            </linearGradient>
          </defs>

          {/* Hạt phấn bay khi hoa nở (bỏ trên máy yếu) */}
          {isBloom && !lite && (
            <g className="pollen-particles" pointerEvents="none">
              {POLLEN.map((p, i) => (
                <circle
                  key={i}
                  cx={p.cx}
                  cy={p.cy}
                  r={p.r}
                  fill={flower.id === 'baby-breath' ? '#FFFFFF' : flower.palette.accent}
                  opacity="0.6"
                  className="bloom__pollen"
                  style={{ animationDuration: `${p.dur}s`, animationDelay: `${p.delay}s` }}
                />
              ))}
            </g>
          )}

          {renderSpeciesContent()}
        </svg>
      </div>

      {/* Lớp đất, hạt, mầm: nằm trên cùng và không đung đưa */}
      <svg viewBox="0 0 400 560" className="bloom__layer bloom__ground" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <defs>
          <linearGradient id="potBodyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#E2D2BC" />
            <stop offset="35%" stopColor="#FBF5EC" />
            <stop offset="100%" stopColor="#D9C6AC" />
          </linearGradient>
        </defs>

        <g id="pot-front">
          {/* Thân chậu gốm kem cao, thon dần xuống chân; mép trên là đường cong gờ phía trước */}
          <path
            d="M 122 436 Q 200 458 278 436 L 264 524 C 262 541 252 550 236 551 L 164 551 C 148 550 138 541 136 524 Z"
            fill="url(#potBodyGrad)"
            stroke="#CDB594"
            strokeWidth="1.2"
          />
          <path d="M 122 436 Q 200 458 278 436" fill="none" stroke="#FFFFFF" strokeWidth="1.4" opacity="0.7" />
          {/* Dải vàng và đường đỏ rượu mảnh quanh thân chậu, nhắc lại viền vàng của sổ lưu bút */}
          <path d="M 128 470 Q 200 491 272 470" fill="none" stroke="#C9A24A" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M 129 477 Q 200 498 271 477" fill="none" stroke="#8B2F30" strokeWidth="1" strokeLinecap="round" opacity="0.75" />
          {/* Trái tim nhỏ giữa thân chậu */}
          <path
            d="M 200 523 C 187 514 185 505 191 502 C 195 500 199 502 200 506 C 201 502 205 500 209 502 C 215 505 213 514 200 523 Z"
            fill="#8B2F30"
            opacity="0.85"
          />
          {/* Ánh sáng nhẹ bên trái thân chậu */}
          <path d="M 146 453 Q 151 493 158 535" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity="0.35" />
        </g>

          {/* Hạt nằm trong đất: nhịp đập đặt ở thẻ g bên trong để không đè lên transform định vị bằng thuộc tính */}
          {isSeed && (
            <g transform="translate(200, 432)">
              <g className="bloom__seed">
                <ellipse cx="0" cy="0" rx="7" ry="9.5" fill="#4E3626" stroke="#6B4B35" strokeWidth="1.2" transform="rotate(-15)" />
                <path d="M -1 -7 C 2 -2, 2 3, 0 7" stroke="#8A674D" strokeWidth="1" fill="none" />
                <circle cx="-2" cy="-3" r="1.5" fill="#C49B76" opacity="0.5" />
              </g>
            </g>
          )}

          {/* Mầm nhú lên */}
          {isGerminating && (
            <g transform="translate(200, 430)">
              <g opacity={Math.max(0, 1 - (progress - 0.02) * 8)}>
                <path d="M -2 2 C -7 -1, -7 8, -2 7 Z" fill="#4E3626" />
                <path d="M 2 2 C 7 -1, 7 8, 2 7 Z" fill="#4E3626" />
              </g>

              {(() => {
                const sproutProg = Math.min(1, (progress - 0.02) / 0.12);
                return (
                  <>
                    <path
                      d={`M 0 0 C -2 ${-15 * sproutProg}, ${-6 + sproutProg * 6} ${-30 * sproutProg}, 0 ${-42 * sproutProg}`}
                      stroke={flower.palette.stem}
                      strokeWidth="3.2"
                      strokeLinecap="round"
                      fill="none"
                    />
                    {sproutProg > 0.4 && (
                      <g
                        transform={`translate(0, ${-42 * sproutProg})`}
                        style={{
                          transform: `translate(0px, ${-42 * sproutProg}px) scale(${sproutProg})`,
                          opacity: Math.max(0, 1 - (progress - 0.14) * 10),
                        }}
                      >
                        <ellipse cx="-5" cy="-2" rx="5" ry="3.2" fill={flower.palette.leafHighlight} stroke={flower.palette.stem} strokeWidth="0.5" transform="rotate(-25)" />
                        <ellipse cx="5" cy="-2" rx="5" ry="3.2" fill={flower.palette.leaf} stroke={flower.palette.stem} strokeWidth="0.5" transform="rotate(25)" />
                      </g>
                    )}
                  </>
                );
              })()}
            </g>
          )}
      </svg>
    </div>
  );
});

BotanicalFlowerEngine.displayName = 'BotanicalFlowerEngine';
