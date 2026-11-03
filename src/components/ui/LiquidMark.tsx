"use client";

export function LiquidMark({ size = 96, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={className}
      aria-label="N Space"
      style={{ filter: "drop-shadow(0 18px 34px rgba(10,80,200,0.28))" }}
    >
      <defs>
        <linearGradient id="lm-body" x1="10" y1="0" x2="110" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#5AC8FA" />
          <stop offset="0.5" stopColor="#0A84FF" />
          <stop offset="1" stopColor="#5E5CE6" />
        </linearGradient>
        <linearGradient id="lm-gloss" x1="20" y1="6" x2="90" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="lm-neon" x1="0" y1="120" x2="120" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#BF5AF2" stopOpacity="0.9" />
          <stop offset="1" stopColor="#64D2FF" stopOpacity="0.4" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="112" height="112" rx="30" fill="url(#lm-body)" />
      <rect x="4" y="4" width="112" height="112" rx="30" fill="url(#lm-neon)" opacity="0.35" />
      <path d="M26 88V34h11l22 32V34h11v54H59L37 56v32H26z" fill="#ffffff" opacity="0.96" />
      <path d="M4 44c0-22 18-40 40-40h32c-30 8-52 26-72 64V44z" fill="url(#lm-gloss)" />
      <rect x="4" y="4" width="112" height="112" rx="30" fill="none" stroke="#ffffff" strokeOpacity="0.5" strokeWidth="1.5" />
    </svg>
  );
}

export default LiquidMark;
