import React from 'react';

interface AppLogoProps {
  className?: string;
  size?: number;
}

export const AppLogo: React.FC<AppLogoProps> = ({ className = 'w-10 h-10', size = 40 }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      fill="none"
      width={size}
      height={size}
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="ft-grad-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#047857" />
          <stop offset="100%" stopColor="#064e3b" />
        </linearGradient>
        <linearGradient id="ft-grad-accent" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
        <linearGradient id="ft-grad-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      {/* Background squircle */}
      <rect width="48" height="48" rx="12" fill="url(#ft-grad-bg)" />
      <rect
        x="0.75"
        y="0.75"
        width="46.5"
        height="46.5"
        rx="11.25"
        stroke="#34d399"
        strokeOpacity="0.35"
        fill="none"
      />

      {/* Ascending Wealth Growth Bars */}
      <rect x="10" y="27" width="5.5" height="10" rx="2" fill="#10b981" fillOpacity="0.6" />
      <rect x="18" y="20" width="5.5" height="17" rx="2" fill="#10b981" fillOpacity="0.85" />
      <rect x="26" y="14" width="5.5" height="23" rx="2" fill="url(#ft-grad-accent)" />

      {/* Upward Trendline & Dynamic Arrow */}
      <path
        d="M12 25L19 18L26 21L36 11"
        stroke="#ffffff"
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M29 11H36V18"
        stroke="#ffffff"
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Sparkling Gold Coin at the Peak */}
      <circle cx="36" cy="11" r="3.5" fill="url(#ft-grad-gold)" stroke="#064e3b" strokeWidth="1.2" />
    </svg>
  );
};
