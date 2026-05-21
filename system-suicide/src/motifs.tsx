import { useMemo, type CSSProperties } from 'react';
import type { HeroIcon } from './types';

let _bladeIdCounter = 0;
export const nextBladeId = (): string => `blade-${++_bladeIdCounter}`;

interface RailProps {
  side?: 'left' | 'right';
}

function RailRazor(_: RailProps) {
  return (
    <svg width="80" height="100%" viewBox="0 0 80 1000" preserveAspectRatio="none" aria-hidden="true">
      <line x1="40" y1="0" x2="40" y2="1000" stroke="var(--line)" strokeWidth="1" />
      {Array.from({ length: 22 }).map((_unused, i) => {
        const y = i * 48 + 20;
        const len = i % 3 === 0 ? 14 : 6;
        return (
          <line
            key={i}
            x1={40 - len / 2}
            y1={y}
            x2={40 + len / 2}
            y2={y}
            stroke={i % 5 === 0 ? 'var(--accent)' : 'var(--fg-3)'}
            strokeWidth="1"
          />
        );
      })}
    </svg>
  );
}

function RailRope({ side }: RailProps) {
  const path = useMemo(() => {
    const pts: string[] = [];
    for (let y = 0; y < 1000; y += 16) {
      const x =
        40 +
        Math.sin(y / 28 + (side === 'right' ? 2 : 0)) * 3.5 +
        Math.sin(y / 7) * 1.2;
      pts.push(`${y === 0 ? 'M' : 'L'}${x.toFixed(2)},${y}`);
    }
    return pts.join(' ');
  }, [side]);
  return (
    <svg width="80" height="100%" viewBox="0 0 80 1000" preserveAspectRatio="none" aria-hidden="true">
      <path d={path} stroke="var(--accent)" strokeWidth="1.5" fill="none" opacity="0.85" />
      {Array.from({ length: 38 }).map((_unused, i) => {
        const y = i * 26 + 8;
        const x = 40 + Math.sin(y / 28) * 3.5;
        const dx = (i % 2 === 0 ? 1 : -1) * (3 + (i % 5));
        return (
          <line
            key={i}
            x1={x}
            y1={y}
            x2={x + dx}
            y2={y + (i % 3) * 1.5 - 1}
            stroke="var(--accent-dim)"
            strokeWidth="0.6"
            opacity="0.7"
          />
        );
      })}
    </svg>
  );
}

function RailX(_: RailProps) {
  return (
    <svg width="80" height="100%" viewBox="0 0 80 1000" preserveAspectRatio="none" aria-hidden="true">
      <line x1="40" y1="0" x2="40" y2="1000" stroke="var(--line)" strokeWidth="1" />
      {Array.from({ length: 16 }).map((_unused, i) => {
        const y = i * 64 + 32;
        const s = 7;
        return (
          <g key={i} stroke="var(--accent)" strokeWidth="1.6">
            <line x1={40 - s} y1={y - s} x2={40 + s} y2={y + s} />
            <line x1={40 + s} y1={y - s} x2={40 - s} y2={y + s} />
          </g>
        );
      })}
    </svg>
  );
}

function RailBarbed(_: RailProps) {
  return (
    <svg width="80" height="100%" viewBox="0 0 80 1000" preserveAspectRatio="none" aria-hidden="true">
      {[0, 1].map((k) => {
        const path: string[] = [];
        for (let y = 0; y < 1000; y += 8) {
          const x = 40 + Math.sin(y / 18 + k * Math.PI) * 4;
          path.push(`${y === 0 ? 'M' : 'L'}${x.toFixed(2)},${y}`);
        }
        return (
          <path key={k} d={path.join(' ')} stroke="var(--accent)" strokeWidth="1.2" fill="none" opacity="0.85" />
        );
      })}
      {Array.from({ length: 12 }).map((_unused, i) => {
        const y = i * 84 + 30;
        return (
          <g key={i} stroke="var(--accent)" strokeWidth="1.4" fill="none">
            <line x1={40 - 14} y1={y - 8} x2={40 + 14} y2={y + 8} />
            <line x1={40 - 14} y1={y + 8} x2={40 + 14} y2={y - 8} />
          </g>
        );
      })}
    </svg>
  );
}

function RailTally(_: RailProps) {
  return (
    <svg width="80" height="100%" viewBox="0 0 80 1000" preserveAspectRatio="none" aria-hidden="true">
      <line x1="40" y1="0" x2="40" y2="1000" stroke="var(--line)" strokeWidth="1" />
      {Array.from({ length: 28 }).map((_unused, i) => {
        const y = i * 36 + 14;
        const inGroup = i % 5;
        if (inGroup < 4) {
          return (
            <line
              key={i}
              x1={40 - 9}
              y1={y}
              x2={40 - 9 + 6}
              y2={y - 22}
              stroke="var(--fg-2)"
              strokeWidth="1.2"
            />
          );
        }
        return (
          <line
            key={i}
            x1={40 - 14}
            y1={y - 18}
            x2={40 + 8}
            y2={y - 4}
            stroke="var(--accent)"
            strokeWidth="1.4"
          />
        );
      })}
    </svg>
  );
}

function RailSystemVert() {
  return (
    <div className="rail-system-vert">
      <div className="rsv-text">SYSTEM</div>
    </div>
  );
}

function RailRopeAnim() {
  return (
    <div className="rail-rope-anim" aria-hidden="true">
      <div className="rope-swing">
        <svg viewBox="0 0 80 2200" preserveAspectRatio="xMidYMin meet">
          <circle cx="40" cy="2" r="2.5" fill="var(--fg-3)" />
          {(() => {
            const pts: string[] = [];
            for (let y = 0; y <= 720; y += 8) {
              const x = 40 + Math.sin(y / 36) * 1.6;
              pts.push(`${y === 0 ? 'M' : 'L'}${x.toFixed(2)},${y}`);
            }
            return <path d={pts.join(' ')} stroke="var(--accent)" strokeWidth="1.8" fill="none" />;
          })()}

          <g transform="translate(40, 720)">
            <path
              d="M -11 0 Q -14 18 -11 36 L 11 36 Q 14 18 11 0 Z"
              fill="oklch(0.16 0.04 25)"
              stroke="var(--accent)"
              strokeWidth="1.6"
            />
            <line x1="-2" y1="0" x2="-2" y2="36" stroke="oklch(0.30 0.10 25)" strokeWidth="1" />
            {Array.from({ length: 8 }).map((_unused, i) => {
              const y = 3 + i * 4;
              return (
                <line
                  key={i}
                  x1="-11"
                  y1={y}
                  x2="11"
                  y2={y + 3.2}
                  stroke="var(--accent)"
                  strokeWidth="1.4"
                />
              );
            })}
            <line x1="-11" y1="8" x2="-20" y2="13" stroke="var(--accent)" strokeWidth="1.6" />
            <line x1="-20" y1="13" x2="-18" y2="18" stroke="var(--accent-dim)" strokeWidth="0.8" />
          </g>

          {(() => {
            const pts: string[] = [];
            for (let y = 756; y <= 2200; y += 12) {
              const x = 40 + Math.sin(y / 48) * 1.4;
              pts.push(`${y === 756 ? 'M' : 'L'}${x.toFixed(2)},${y}`);
            }
            return (
              <path
                d={pts.join(' ')}
                stroke="var(--accent)"
                strokeWidth="1.8"
                fill="none"
                opacity="0.85"
              />
            );
          })()}

          <ellipse cx="40" cy="2050" rx="22" ry="38" fill="none" stroke="var(--accent)" strokeWidth="2" />
        </svg>
      </div>
    </div>
  );
}

const RAIL_MAP: Record<string, (props: RailProps) => JSX.Element> = {
  razor: RailRazor,
  rope: RailRope,
  x: RailX,
  barbed: RailBarbed,
  tally: RailTally,
  system: RailSystemVert,
  'rope-anim': RailRopeAnim,
};

export function Rails({
  left = 'razor',
  right = 'razor',
  enabled = true,
}: {
  left?: string;
  right?: string;
  enabled?: boolean;
}) {
  if (!enabled) return null;
  const L = RAIL_MAP[left] ?? RailRazor;
  const R = RAIL_MAP[right] ?? RailRazor;
  return (
    <div className="rails" aria-hidden="true">
      <div className="rail left">
        <L side="left" />
      </div>
      <div className="rail right">
        <R side="right" />
      </div>
    </div>
  );
}

export function TallyCounter({ count = 47 }: { count?: number }) {
  const groups = Math.floor(count / 5);
  const rest = count % 5;
  return (
    <svg
      viewBox="0 0 480 36"
      preserveAspectRatio="xMinYMid meet"
      aria-hidden="true"
      style={{ width: '100%', height: 36 }}
    >
      {Array.from({ length: groups }).map((_unused, g) => {
        const x0 = g * 40 + 4;
        return (
          <g key={g}>
            {[0, 1, 2, 3].map((k) => (
              <line
                key={k}
                x1={x0 + k * 6}
                y1={4}
                x2={x0 + k * 6 + 3}
                y2={32}
                stroke="var(--fg)"
                strokeWidth="1.4"
              />
            ))}
            <line
              x1={x0 - 2}
              y1={28}
              x2={x0 + 26}
              y2={8}
              stroke="var(--accent)"
              strokeWidth="1.6"
            />
          </g>
        );
      })}
      {Array.from({ length: rest }).map((_unused, k) => {
        const x0 = groups * 40 + 4 + k * 6;
        return (
          <line
            key={'r' + k}
            x1={x0}
            y1={4}
            x2={x0 + 3}
            y2={32}
            stroke="var(--accent)"
            strokeWidth="1.4"
          />
        );
      })}
    </svg>
  );
}

export function BarbedDivider() {
  return (
    <svg
      viewBox="0 0 1200 36"
      preserveAspectRatio="none"
      aria-hidden="true"
      style={{ width: '100%', height: 36 }}
    >
      {[0, 1].map((k) => {
        const path: string[] = [];
        for (let x = 0; x <= 1200; x += 6) {
          const y = 18 + Math.sin(x / 12 + k * Math.PI) * 6;
          path.push(`${x === 0 ? 'M' : 'L'}${x},${y.toFixed(2)}`);
        }
        return (
          <path
            key={k}
            d={path.join(' ')}
            stroke="var(--accent)"
            strokeWidth="1.2"
            fill="none"
            opacity="0.85"
          />
        );
      })}
      {Array.from({ length: 14 }).map((_unused, i) => {
        const x = i * 86 + 28;
        return (
          <g key={i} stroke="var(--accent)" strokeWidth="1.4" fill="none">
            <line x1={x - 11} y1={6} x2={x + 11} y2={30} />
            <line x1={x - 11} y1={30} x2={x + 11} y2={6} />
          </g>
        );
      })}
    </svg>
  );
}

export function RazorMark({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" aria-hidden="true">
      <line x1="9" y1="2" x2="9" y2="16" stroke="var(--accent)" strokeWidth="1.2" />
      <line x1="4" y1="9" x2="14" y2="9" stroke="var(--accent)" strokeWidth="1.2" />
    </svg>
  );
}

export function XMark({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" aria-hidden="true">
      <line x1="3" y1="3" x2="15" y2="15" stroke="var(--accent)" strokeWidth="1.6" />
      <line x1="15" y1="3" x2="3" y2="15" stroke="var(--accent)" strokeWidth="1.6" />
    </svg>
  );
}

interface SvgWrapProps {
  color?: string;
  className?: string;
  style?: CSSProperties;
}

export function RazorBlade({ color = 'var(--accent)', className, style }: SvgWrapProps = {}) {
  const id = useMemo(() => nextBladeId(), []);
  return (
    <svg
      viewBox="0 0 1200 220"
      preserveAspectRatio="xMidYMid meet"
      className={className}
      style={{ display: 'block', ...style }}
      role="img"
      aria-label="razor blade"
    >
      <defs>
        <mask id={id} maskUnits="userSpaceOnUse" x="0" y="0" width="1200" height="220">
          <rect width="1200" height="220" fill="white" />
          <g fill="black">
            <rect x="220" y="100" width="280" height="22" />
            <circle cx="220" cy="111" r="28" />
            <circle cx="500" cy="111" r="28" />
          </g>
          <g fill="black">
            <rect x="700" y="100" width="280" height="22" />
            <circle cx="700" cy="111" r="28" />
            <circle cx="980" cy="111" r="28" />
          </g>
        </mask>
      </defs>

      <path
        d="
          M 60,20
          Q 20,20 20,60
          L 20,160
          Q 20,200 60,200
          L 1140,200
          Q 1180,200 1180,160
          L 1180,60
          Q 1180,20 1140,20
          Z
        "
        fill={color}
        mask={`url(#${id})`}
      />

      <line x1="80" y1="34" x2="1120" y2="34" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
      <line x1="80" y1="186" x2="1120" y2="186" stroke="rgba(0,0,0,0.35)" strokeWidth="1.5" />
    </svg>
  );
}

export function RazorSlash({ color = 'var(--accent)', className, style }: SvgWrapProps = {}) {
  const id = useMemo(() => nextBladeId(), []);
  return (
    <svg
      viewBox="0 0 800 120"
      preserveAspectRatio="xMidYMid meet"
      className={className}
      style={{ display: 'block', width: '100%', height: 'auto', ...style }}
      role="img"
      aria-label="razor cut"
    >
      <defs>
        <mask id={id} maskUnits="userSpaceOnUse" x="0" y="0" width="800" height="120">
          <rect width="800" height="120" fill="white" />
          <g fill="black">
            <rect x="220" y="50" width="360" height="20" />
            <circle cx="220" cy="60" r="22" />
            <circle cx="580" cy="60" r="22" />
          </g>
        </mask>
      </defs>
      <path
        d="M 30,15 Q 10,15 10,40 L 10,80 Q 10,105 30,105 L 770,105 Q 790,105 790,80 L 790,40 Q 790,15 770,15 Z"
        fill={color}
        mask={`url(#${id})`}
      />
    </svg>
  );
}

export function RazorScratch({
  width = 80,
  color = 'var(--accent)',
  style,
}: {
  width?: number;
  color?: string;
  style?: CSSProperties;
} = {}) {
  return (
    <svg
      viewBox="0 0 80 14"
      width={width}
      height={14}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="cut"
      style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
    >
      <line x1="2" y1="7" x2="78" y2="7" stroke={color} strokeWidth="1.5" />
      <line x1="22" y1="2" x2="22" y2="12" stroke={color} strokeWidth="1.2" />
      <line x1="60" y1="2" x2="60" y2="12" stroke={color} strokeWidth="1.2" />
    </svg>
  );
}

export function AmexRazorBlade({ className, style }: { className?: string; style?: CSSProperties } = {}) {
  const id = useMemo(() => nextBladeId(), []);
  const cutMaskId = `${id}-cut`;
  const gradId = `${id}-grad`;
  const innerGradId = `${id}-igrad`;
  const portraitGradId = `${id}-pgrad`;
  return (
    <svg
      viewBox="0 0 1400 500"
      preserveAspectRatio="xMidYMid meet"
      className={className}
      style={{ display: 'block', ...style }}
      role="img"
      aria-label="razor blade — lot 0021 150992 25445"
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="oklch(0.42 0.012 230)" />
          <stop offset="8%" stopColor="oklch(0.30 0.012 230)" />
          <stop offset="42%" stopColor="oklch(0.18 0.010 230)" />
          <stop offset="58%" stopColor="oklch(0.18 0.010 230)" />
          <stop offset="92%" stopColor="oklch(0.28 0.012 230)" />
          <stop offset="100%" stopColor="oklch(0.38 0.012 230)" />
        </linearGradient>
        <linearGradient id={innerGradId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="oklch(0.46 0.012 230)" />
          <stop offset="100%" stopColor="oklch(0.22 0.010 230)" />
        </linearGradient>
        <radialGradient id={portraitGradId} cx="50%" cy="40%" r="65%">
          <stop offset="0%" stopColor="oklch(0.52 0.012 230)" />
          <stop offset="100%" stopColor="oklch(0.22 0.010 230)" />
        </radialGradient>
        <mask id={cutMaskId} maskUnits="userSpaceOnUse" x="0" y="0" width="1400" height="500">
          <rect width="1400" height="500" fill="white" />
          <g fill="black">
            <rect x="305" y="240" width="270" height="20" />
            <circle cx="305" cy="250" r="34" />
            <circle cx="575" cy="250" r="34" />
          </g>
          <g fill="black">
            <rect x="825" y="240" width="270" height="20" />
            <circle cx="825" cy="250" r="34" />
            <circle cx="1095" cy="250" r="34" />
          </g>
        </mask>
      </defs>

      <path
        d="
          M 100 70
          L 120 70 L 120 32 L 250 32 L 250 70
          L 1150 70 L 1150 32 L 1280 32 L 1280 70
          L 1300 70
          Q 1350 70 1350 120
          L 1350 380
          Q 1350 430 1300 430
          L 1280 430 L 1280 468 L 1150 468 L 1150 430
          L 250 430 L 250 468 L 120 468 L 120 430
          L 100 430
          Q 50 430 50 380
          L 50 120
          Q 50 70 100 70
          Z
        "
        fill="oklch(0.66 0.012 230)"
        stroke="none"
      />

      <path
        d="
          M 110 80
          L 130 80 L 130 42 L 240 42 L 240 80
          L 1160 80 L 1160 42 L 1270 42 L 1270 80
          L 1290 80
          Q 1340 80 1340 130
          L 1340 370
          Q 1340 420 1290 420
          L 1270 420 L 1270 458 L 1160 458 L 1160 420
          L 240 420 L 240 458 L 130 458 L 130 420
          L 110 420
          Q 60 420 60 370
          L 60 130
          Q 60 80 110 80
          Z
        "
        fill={`url(#${gradId})`}
        stroke="oklch(0.72 0.012 230)"
        strokeWidth="1.6"
        mask={`url(#${cutMaskId})`}
      />

      <line x1="130" y1="92" x2="1270" y2="92" stroke="rgba(220,232,240,0.50)" strokeWidth="1.6" />
      <line x1="130" y1="408" x2="1270" y2="408" stroke="rgba(0,0,0,0.62)" strokeWidth="1.6" />
      <rect x="82" y="100" width="1236" height="300" fill="none" stroke="oklch(0.60 0.012 230)" strokeWidth="1" rx="6" />
      <rect x="88" y="106" width="1224" height="288" fill="none" stroke="rgba(0,0,0,0.55)" strokeWidth="0.6" rx="4" />
      <line x1="150" y1="100" x2="1250" y2="100" stroke="rgba(220,232,240,0.22)" strokeWidth="0.6" />

      <g fill="none" stroke="oklch(0.78 0.012 230)" strokeWidth="0.9">
        <circle cx="305" cy="250" r="34" />
        <circle cx="575" cy="250" r="34" />
        <line x1="335.5" y1="240" x2="544.5" y2="240" />
        <line x1="335.5" y1="260" x2="544.5" y2="260" />
        <circle cx="825" cy="250" r="34" />
        <circle cx="1095" cy="250" r="34" />
        <line x1="855.5" y1="240" x2="1064.5" y2="240" />
        <line x1="855.5" y1="260" x2="1064.5" y2="260" />
      </g>
      <g fill="none" stroke="rgba(0,0,0,0.72)" strokeWidth="1.6">
        <circle cx="305" cy="250" r="33" />
        <circle cx="575" cy="250" r="33" />
        <circle cx="825" cy="250" r="33" />
        <circle cx="1095" cy="250" r="33" />
      </g>

      <g className="amex-word">
        <text x="700" y="171" textAnchor="middle" fontFamily="Archivo Narrow, Archivo Black, sans-serif" fontWeight="700" fontSize="56" letterSpacing="28" fill="rgba(220,232,240,0.40)">
          YOUR CARD
        </text>
        <text x="700" y="174" textAnchor="middle" fontFamily="Archivo Narrow, Archivo Black, sans-serif" fontWeight="700" fontSize="56" letterSpacing="28" fill="rgba(0,0,0,0.72)">
          YOUR CARD
        </text>
        <text x="700" y="172" textAnchor="middle" fontFamily="Archivo Narrow, Archivo Black, sans-serif" fontWeight="700" fontSize="56" letterSpacing="28" fill="oklch(0.90 0.012 230)">
          YOUR CARD
        </text>
      </g>

      <g transform="translate(700, 250)">
        <ellipse cx="0" cy="0" rx="66" ry="86" fill={`url(#${portraitGradId})`} stroke="oklch(0.62 0.005 60)" strokeWidth="2" />
        <ellipse cx="0" cy="0" rx="62" ry="82" fill="none" stroke="rgba(255,255,255,0.20)" strokeWidth="0.6" />
        <ellipse cx="0" cy="0" rx="56" ry="76" fill="none" stroke="oklch(0.52 0.005 60)" strokeWidth="0.8" />
        <ellipse cx="0" cy="0" rx="50" ry="70" fill="none" stroke="oklch(0.46 0.005 60)" strokeWidth="0.5" strokeDasharray="2 2.5" />
        <defs>
          <path id={`${id}-arc`} d="M -52 4 A 52 70 0 1 1 52 4" />
        </defs>
        <text fontFamily="JetBrains Mono, monospace" fontSize="8" letterSpacing="3" fill="oklch(0.62 0.005 60)">
          <textPath href={`#${id}-arc`} startOffset="50%" textAnchor="middle">
            · PHYSICAL · SYNTHESIS ·
          </textPath>
        </text>
        <g opacity="0.16">
          <path d="M -34 -10 Q -34 -40 0 -40 Q 34 -40 34 -10 L 34 6 L -34 6 Z" fill="oklch(0.62 0.005 60)" />
          <path d="M -10 -42 Q 0 -52 10 -42 Q 0 -36 -10 -42 Z" fill="oklch(0.62 0.005 60)" />
          <line x1="-30" y1="0" x2="-28" y2="22" stroke="oklch(0.62 0.005 60)" strokeWidth="2" />
          <line x1="30" y1="0" x2="28" y2="22" stroke="oklch(0.62 0.005 60)" strokeWidth="2" />
        </g>
        <text x="0" y="22" textAnchor="middle" fontFamily="Georgia, Cormorant Garamond, Times New Roman, serif" fontWeight="700" fontSize="64" letterSpacing="4" fill="rgba(220,232,240,0.40)">
          AX
        </text>
        <text x="0" y="25" textAnchor="middle" fontFamily="Georgia, Cormorant Garamond, Times New Roman, serif" fontWeight="700" fontSize="64" letterSpacing="4" fill="rgba(0,0,0,0.72)">
          AX
        </text>
        <text x="0" y="23" textAnchor="middle" fontFamily="Georgia, Cormorant Garamond, Times New Roman, serif" fontWeight="700" fontSize="64" letterSpacing="4" fill="oklch(0.88 0.012 230)">
          AX
        </text>
        <line x1="-22" y1="44" x2="22" y2="44" stroke="var(--accent)" strokeWidth="1.3" />
      </g>

      <g className="amex-num">
        <text x="700" y="369" textAnchor="middle" fontFamily="JetBrains Mono, ui-monospace, monospace" fontWeight="700" fontSize="42" letterSpacing="9" fill="rgba(220,232,240,0.40)">
          0021 150992 25445
        </text>
        <text x="700" y="372" textAnchor="middle" fontFamily="JetBrains Mono, ui-monospace, monospace" fontWeight="700" fontSize="42" letterSpacing="9" fill="rgba(0,0,0,0.72)">
          0021 150992 25445
        </text>
        <text x="700" y="370" textAnchor="middle" fontFamily="JetBrains Mono, ui-monospace, monospace" fontWeight="700" fontSize="42" letterSpacing="9" fill="oklch(0.90 0.012 230)">
          0021 150992 25445
        </text>
      </g>
    </svg>
  );
}

function HeroIconRazor() {
  const id = useMemo(() => nextBladeId(), []);
  return (
    <svg viewBox="0 0 240 60" aria-label="razor blade">
      <defs>
        <mask id={id}>
          <rect width="100%" height="100%" fill="white" />
          <g fill="black">
            <rect x="36" y="26" width="60" height="8" />
            <circle cx="36" cy="30" r="9" />
            <circle cx="96" cy="30" r="9" />
            <rect x="144" y="26" width="60" height="8" />
            <circle cx="144" cy="30" r="9" />
            <circle cx="204" cy="30" r="9" />
          </g>
        </mask>
      </defs>
      <rect x="6" y="8" width="228" height="44" rx="6" fill="var(--accent)" mask={`url(#${id})`} />
    </svg>
  );
}

function HeroIconShotgun() {
  return (
    <svg viewBox="0 0 320 60" aria-label="shotgun">
      <rect x="6" y="20" width="200" height="5" fill="var(--accent)" />
      <rect x="6" y="33" width="200" height="5" fill="var(--accent)" />
      <rect x="0" y="18" width="8" height="22" fill="var(--accent)" />
      <path d="M 206 14 L 296 6 L 312 50 L 214 56 Z" fill="var(--accent)" />
      <rect x="208" y="40" width="22" height="12" fill="var(--bg)" />
      <path d="M 208 40 Q 208 52 220 52 L 230 52 L 230 48 L 220 48 Q 212 48 212 40 Z" fill="var(--accent)" />
      <line x1="218" y1="40" x2="218" y2="50" stroke="var(--accent)" strokeWidth="2" />
    </svg>
  );
}

function HeroIconCapsule() {
  return (
    <svg viewBox="0 0 240 60" aria-label="capsule">
      <path d="M 30 30 A 30 30 0 0 1 60 0 L 120 0 L 120 60 L 60 60 A 30 30 0 0 1 30 30 Z" fill="var(--accent)" />
      <path d="M 120 0 L 180 0 A 30 30 0 0 1 210 30 A 30 30 0 0 1 180 60 L 120 60 Z" fill="oklch(0.88 0.01 60)" />
      <line x1="120" y1="0" x2="120" y2="60" stroke="var(--bg)" strokeWidth="1.5" />
      <ellipse cx="146" cy="14" rx="14" ry="3" fill="rgba(0,0,0,0.18)" />
    </svg>
  );
}

function HeroIconNoose() {
  return (
    <svg viewBox="0 0 120 140" aria-label="noose">
      <line x1="60" y1="0" x2="60" y2="22" stroke="var(--accent)" strokeWidth="3" />
      <g transform="translate(60, 22)">
        <path d="M -11 0 Q -14 14 -11 28 L 11 28 Q 14 14 11 0 Z" fill="oklch(0.18 0.04 25)" stroke="var(--accent)" strokeWidth="2" />
        <line x1="-2.5" y1="0" x2="-2.5" y2="28" stroke="oklch(0.30 0.10 25)" strokeWidth="1.2" />
        {Array.from({ length: 6 }).map((_unused, i) => {
          const y = 3 + i * 4;
          return <line key={i} x1="-11" y1={y} x2="11" y2={y + 3} stroke="var(--accent)" strokeWidth="1.6" />;
        })}
        <line x1="-11" y1="6" x2="-19" y2="10" stroke="var(--accent)" strokeWidth="2" />
      </g>
      <line x1="60" y1="50" x2="60" y2="60" stroke="var(--accent)" strokeWidth="3" />
      <ellipse cx="60" cy="100" rx="22" ry="32" fill="none" stroke="var(--accent)" strokeWidth="3" />
    </svg>
  );
}

function HeroIconTablets() {
  return (
    <svg viewBox="0 0 240 60" aria-label="tablets">
      {[40, 120, 200].map((cx, i) => (
        <g key={i}>
          <circle cx={cx} cy="30" r="26" fill="var(--accent)" />
          <line x1={cx - 18} y1="30" x2={cx + 18} y2="30" stroke="var(--bg)" strokeWidth="2" />
          <ellipse cx={cx - 8} cy="20" rx="6" ry="2" fill="rgba(255,255,255,0.18)" />
        </g>
      ))}
    </svg>
  );
}

function IconMatch() {
  return (
    <svg viewBox="0 0 60 200" aria-label="match">
      <path d="M 30 0 Q 14 22 30 36 Q 46 22 30 0 Z" fill="var(--accent)" />
      <path d="M 30 6 Q 22 20 30 28 Q 38 20 30 6 Z" fill="oklch(0.92 0.005 60)" opacity="0.45" />
      <ellipse cx="30" cy="42" rx="8" ry="10" fill="var(--accent)" />
      <rect x="27" y="50" width="6" height="148" fill="oklch(0.55 0.04 70)" />
    </svg>
  );
}

function IconKnife() {
  return (
    <svg viewBox="0 0 300 60" aria-label="knife">
      <path d="M 6 30 L 170 14 L 184 30 L 170 46 Z" fill="var(--accent)" />
      <line x1="14" y1="30" x2="160" y2="22" stroke="rgba(255,255,255,0.25)" strokeWidth="1.2" />
      <rect x="180" y="18" width="6" height="24" fill="var(--accent)" />
      <rect x="186" y="22" width="106" height="16" fill="oklch(0.30 0.005 60)" rx="2" />
      <circle cx="210" cy="30" r="2.5" fill="var(--bg)" />
      <circle cx="240" cy="30" r="2.5" fill="var(--bg)" />
      <circle cx="270" cy="30" r="2.5" fill="var(--bg)" />
    </svg>
  );
}

function IconBottle() {
  return (
    <svg viewBox="0 0 100 200" aria-label="bottle">
      <rect x="40" y="0" width="20" height="20" fill="oklch(0.30 0.005 60)" />
      <rect x="42" y="20" width="16" height="38" fill="var(--accent)" />
      <path d="M 42 58 Q 20 76 20 96 L 20 180 Q 20 196 36 196 L 64 196 Q 80 196 80 180 L 80 96 Q 80 76 58 58 Z" fill="var(--accent)" />
      <rect x="28" y="108" width="44" height="52" fill="oklch(0.93 0.005 60)" />
      <line x1="40" y1="124" x2="60" y2="144" stroke="var(--bg)" strokeWidth="2.4" />
      <line x1="60" y1="124" x2="40" y2="144" stroke="var(--bg)" strokeWidth="2.4" />
    </svg>
  );
}

function IconCassette() {
  return (
    <svg viewBox="0 0 300 200" aria-label="cassette tape">
      <rect x="10" y="10" width="280" height="180" rx="6" fill="none" stroke="var(--accent)" strokeWidth="3" />
      {[90, 210].map((cx, i) => (
        <g key={i}>
          <circle cx={cx} cy="92" r="36" fill="none" stroke="var(--accent)" strokeWidth="2" />
          <circle cx={cx} cy="92" r="6" fill="var(--accent)" />
          <line x1={cx} y1="60" x2={cx} y2="72" stroke="var(--accent)" strokeWidth="2.4" />
          <line x1={cx} y1="112" x2={cx} y2="124" stroke="var(--accent)" strokeWidth="2.4" />
          <line x1={cx - 32} y1="92" x2={cx - 20} y2="92" stroke="var(--accent)" strokeWidth="2.4" />
          <line x1={cx + 20} y1="92" x2={cx + 32} y2="92" stroke="var(--accent)" strokeWidth="2.4" />
        </g>
      ))}
      <line x1="126" y1="92" x2="174" y2="92" stroke="var(--accent)" strokeWidth="2" />
      <rect x="64" y="156" width="172" height="20" fill="none" stroke="var(--accent)" strokeWidth="1.6" />
    </svg>
  );
}

function IconHourglass() {
  return (
    <svg viewBox="0 0 100 200" aria-label="hourglass">
      <line x1="18" y1="10" x2="82" y2="10" stroke="var(--accent)" strokeWidth="3" />
      <line x1="18" y1="190" x2="82" y2="190" stroke="var(--accent)" strokeWidth="3" />
      <path d="M 24 12 L 76 12 L 50 100 L 76 188 L 24 188 L 50 100 Z" fill="none" stroke="var(--accent)" strokeWidth="2.5" />
      <path d="M 36 14 L 64 14 L 50 56 Z" fill="var(--accent)" />
      <path d="M 32 186 L 68 186 L 50 138 Z" fill="var(--accent)" opacity="0.85" />
      <line x1="50" y1="92" x2="50" y2="140" stroke="var(--accent)" strokeWidth="1.4" />
    </svg>
  );
}

const HERO_ICON_MAP: Record<HeroIcon, null | (() => JSX.Element)> = {
  none: null,
  amex: AmexRazorBlade,
  razor: HeroIconRazor,
  shotgun: HeroIconShotgun,
  capsule: HeroIconCapsule,
  noose: HeroIconNoose,
  tablets: HeroIconTablets,
  match: IconMatch,
  knife: IconKnife,
  bottle: IconBottle,
  cassette: IconCassette,
  hourglass: IconHourglass,
};

const METHOD_LABELS: Record<HeroIcon, string | null> = {
  none: null,
  amex: null,
  razor: 'M·01 / CUT',
  shotgun: 'M·02 / TRIGGER',
  capsule: 'M·03 / DOSE',
  noose: 'M·04 / SUSPEND',
  tablets: 'M·05 / DECAY',
  match: 'M·06 / IGNITE',
  knife: 'M·07 / SPLICE',
  bottle: 'M·08 / FILL',
  cassette: 'M·09 / WIND',
  hourglass: 'M·10 / DRAIN',
};

export function HeroMark({ icon = 'none' }: { icon?: HeroIcon }) {
  if (icon === 'amex') {
    return (
      <div className="hero-mark hero-mark-line-only">
        <div className="hero-line" />
      </div>
    );
  }

  const C = HERO_ICON_MAP[icon];
  const methodLabel = METHOD_LABELS[icon];
  return (
    <div className="hero-mark">
      {C ? (
        <div className="hero-icon">
          <C />
        </div>
      ) : null}
      <div className="hero-line" />
      {methodLabel ? <div className="hero-method">{methodLabel}</div> : null}
    </div>
  );
}
