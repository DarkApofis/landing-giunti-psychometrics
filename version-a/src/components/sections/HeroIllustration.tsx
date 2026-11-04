import { cn } from '@/lib/cn';

// Decorative "score report": a normal distribution with a highlighted percentile.
// Pure SVG, colours from tokens, computed at build time (Server Component).
const BARS = 13;
const BAR_STEP = 26;
const BAR_WIDTH = 16;
const BASELINE = 300;
const MAX_HEIGHT = 150;
const ORIGIN_X = 70;
const HIGHLIGHT = 9;

const gaussian = (i: number) => Math.exp(-((i - (BARS - 1) / 2) ** 2) / (2 * 2.6 ** 2));

const bars = Array.from({ length: BARS }, (_, i) => {
  const height = Math.round(16 + gaussian(i) * MAX_HEIGHT);
  return { x: ORIGIN_X + i * BAR_STEP, y: BASELINE - height, height };
});

const curve = Array.from({ length: 61 }, (_, k) => {
  const i = (k / 60) * (BARS - 1);
  const x = ORIGIN_X + BAR_WIDTH / 2 + i * BAR_STEP;
  const y = BASELINE - 24 - gaussian(i) * MAX_HEIGHT;
  return `${k === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
}).join(' ');

const highlightX = ORIGIN_X + HIGHLIGHT * BAR_STEP + BAR_WIDTH / 2;

export function HeroIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 480 400"
      className={cn('h-auto w-full max-w-lg', className)}
      aria-hidden="true"
      focusable="false"
    >
      {/* back card */}
      <rect
        x="70"
        y="28"
        width="370"
        height="300"
        rx="18"
        fill="var(--color-white)"
        opacity="0.1"
        transform="rotate(-4 255 178)"
      />
      {/* front card */}
      <rect x="40" y="56" width="390" height="290" rx="18" fill="var(--color-surface)" />
      <circle cx="74" cy="92" r="12" fill="var(--color-primary-subtle)" />
      <rect x="96" y="84" width="120" height="8" rx="4" fill="var(--color-primary)" />
      <rect x="96" y="98" width="80" height="6" rx="3" fill="var(--color-border)" />

      {bars.map((bar, i) => (
        <rect
          key={bar.x}
          x={bar.x}
          y={bar.y}
          width={BAR_WIDTH}
          height={bar.height}
          rx="4"
          fill={i === HIGHLIGHT ? 'var(--color-accent)' : 'var(--color-primary-subtle)'}
        />
      ))}
      <path
        d={curve}
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line
        x1={highlightX}
        x2={highlightX}
        y1="120"
        y2={BASELINE}
        stroke="var(--color-ink-muted)"
        strokeWidth="1.5"
        strokeDasharray="4 4"
      />
      <line x1="60" x2="410" y1={BASELINE + 1} y2={BASELINE + 1} stroke="var(--color-border)" />

      {/* floating percentile badge */}
      <g transform="translate(316 14)">
        <rect width="150" height="68" rx="14" fill="var(--color-surface)" />
        <rect width="150" height="68" rx="14" fill="none" stroke="var(--color-border)" />
        <text
          x="18"
          y="28"
          fill="var(--color-ink-muted)"
          fontSize="13"
          fontFamily="var(--font-sans)"
        >
          Percentile
        </text>
        <text
          x="18"
          y="54"
          fill="var(--color-ink)"
          fontSize="24"
          fontWeight="700"
          fontFamily="var(--font-display)"
        >
          84°
        </text>
      </g>

      {/* floating "report ready" chip */}
      <g transform="translate(8 322)">
        <rect width="176" height="56" rx="14" fill="var(--color-surface)" />
        <rect width="176" height="56" rx="14" fill="none" stroke="var(--color-border)" />
        <circle cx="30" cy="28" r="14" fill="var(--color-success-subtle)" />
        <path
          d="M23 28.5l5 5 9-10"
          fill="none"
          stroke="var(--color-success)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <text
          x="54"
          y="33"
          fill="var(--color-ink)"
          fontSize="15"
          fontWeight="600"
          fontFamily="var(--font-display)"
        >
          Report pronto
        </text>
      </g>
    </svg>
  );
}
