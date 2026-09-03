import React from 'react';

export function OrangeMoneyLogo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="100" height="100" rx="20" fill="#FF6600" />
      {/* Orange Money Signature Squares & Typography */}
      <rect x="18" y="22" width="28" height="28" fill="#FFFFFF" rx="4" />
      <rect x="54" y="22" width="28" height="28" fill="#000000" rx="4" />
      <path
        d="M20 68 C 20 60, 32 58, 42 64 C 52 70, 64 68, 70 60"
        stroke="#FFFFFF"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <text
        x="50"
        y="86"
        textAnchor="middle"
        fill="#FFFFFF"
        fontSize="14"
        fontWeight="900"
        fontFamily="sans-serif"
        letterSpacing="0.5"
      >
        ORANGE
      </text>
    </svg>
  );
}

export function WaveLogo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="100" height="100" rx="20" fill="#1DC4FF" />
      {/* Wave Penguin Emblem */}
      <path
        d="M 50 18 C 36 18 28 30 28 46 C 28 62 34 82 50 82 C 66 82 72 62 72 46 C 72 30 64 18 50 18 Z"
        fill="#111827"
      />
      <ellipse cx="50" cy="54" rx="14" ry="20" fill="#FFFFFF" />
      {/* Penguin Eyes */}
      <circle cx="43" cy="34" r="3" fill="#FFFFFF" />
      <circle cx="57" cy="34" r="3" fill="#FFFFFF" />
      <circle cx="43" cy="34" r="1.5" fill="#111827" />
      <circle cx="57" cy="34" r="1.5" fill="#111827" />
      {/* Beak */}
      <path d="M 46 39 L 54 39 L 50 46 Z" fill="#FFB800" />
      {/* Wave Water Splash */}
      <path
        d="M 22 72 Q 35 64 50 72 T 78 72"
        stroke="#FFFFFF"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
