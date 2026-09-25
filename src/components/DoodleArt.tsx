import React from 'react';

export const HandDrawnHeart: React.FC<{ className?: string; filled?: boolean }> = ({
  className = 'w-5 h-5 text-[#D86C8E]',
  filled = false,
}) => (
  <svg
    viewBox="0 0 32 32"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M16 26.5C16 26.5 5.5 19.2 5.5 11.4C5.5 7.5 8.6 5 11.8 5C13.9 5 15.3 6.2 16 7.8C16.7 6.2 18.1 5 20.2 5C23.4 5 26.5 7.5 26.5 11.4C26.5 19.2 16 26.5 16 26.5Z" />
  </svg>
);

export const SparkleFourPoint: React.FC<{ className?: string }> = ({
  className = 'w-6 h-6 text-[#E58AA7]',
}) => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M16 3C16.8 10.5 21.5 15.2 29 16C21.5 16.8 16.8 21.5 16 29C15.2 21.5 10.5 16.8 3 16C10.5 15.2 15.2 10.5 16 3Z" />
  </svg>
);

export const CuteCameraDoodle: React.FC<{ className?: string }> = ({
  className = 'w-8 h-8 text-[#C85A7C]',
}) => (
  <svg
    viewBox="0 0 40 36"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <rect x="4" y="9" width="32" height="23" rx="5" />
    <path d="M13 9L15.2 5.2C15.6 4.5 16.4 4 17.2 4H22.8C23.6 4 24.4 4.5 24.8 5.2L27 9" />
    <circle cx="20" cy="20.5" r="6" />
    <circle cx="20" cy="20.5" r="2.3" />
    <circle cx="29.5" cy="14.5" r="1.3" fill="currentColor" />
  </svg>
);

export const SatinBowDoodle: React.FC<{ className?: string }> = ({
  className = 'w-16 h-12',
}) => (
  <svg
    viewBox="0 0 80 56"
    fill="none"
    className={className}
    aria-hidden="true"
  >
    {/* Left loop */}
    <path
      d="M38 24C29 12 12 7 8 15C4 23 18 32 38 26Z"
      fill="#F9C5D5"
      stroke="#D97293"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    {/* Right loop */}
    <path
      d="M42 24C51 12 68 7 72 15C76 23 62 32 42 26Z"
      fill="#F9C5D5"
      stroke="#D97293"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    {/* Left ribbon tail */}
    <path
      d="M37 27C30 35 20 43 12 49C16 49 20 48 22 52C28 45 34 36 39 28"
      fill="#F7B3C8"
      stroke="#D97293"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Right ribbon tail */}
    <path
      d="M43 27C50 36 58 44 65 51C67 47 70 47 73 47C64 40 53 33 41 28"
      fill="#F7B3C8"
      stroke="#D97293"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Center knot */}
    <ellipse
      cx="40"
      cy="25.5"
      rx="4.5"
      ry="5"
      fill="#F49DB8"
      stroke="#D97293"
      strokeWidth="2"
    />
  </svg>
);

export const DaisyFlowerDoodle: React.FC<{ className?: string }> = ({
  className = 'w-6 h-6 text-[#9B6B82]',
}) => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <circle cx="16" cy="16" r="3.2" fill="#FAD6A5" />
    <path d="M16 12.8C14 8 18 8 16 12.8Z" fill="#FFF5F8" />
    <ellipse cx="16" cy="8.5" rx="2.6" ry="4.2" fill="#FFF8FA" />
    <ellipse cx="16" cy="23.5" rx="2.6" ry="4.2" fill="#FFF8FA" />
    <ellipse cx="8.5" cy="16" rx="4.2" ry="2.6" fill="#FFF8FA" />
    <ellipse cx="23.5" cy="16" rx="4.2" ry="2.6" fill="#FFF8FA" />
    <ellipse
      cx="10.7"
      cy="10.7"
      rx="2.5"
      ry="4"
      transform="rotate(-45 10.7 10.7)"
      fill="#FFF8FA"
    />
    <ellipse
      cx="21.3"
      cy="21.3"
      rx="2.5"
      ry="4"
      transform="rotate(-45 21.3 21.3)"
      fill="#FFF8FA"
    />
    <ellipse
      cx="21.3"
      cy="10.7"
      rx="2.5"
      ry="4"
      transform="rotate(45 21.3 10.7)"
      fill="#FFF8FA"
    />
    <ellipse
      cx="10.7"
      cy="21.3"
      rx="2.5"
      ry="4"
      transform="rotate(45 10.7 21.3)"
      fill="#FFF8FA"
    />
    <circle cx="16" cy="16" r="3.2" fill="#FBE094" />
  </svg>
);

export const IphoneHeartReactionBubble: React.FC<{ className?: string }> = ({
  className = 'w-11 h-10',
}) => (
  <div
    className={`inline-flex items-center justify-center relative select-none ${className}`}
    aria-hidden="true"
  >
    <svg viewBox="0 0 48 44" fill="none" className="w-full h-full drop-shadow-sm">
      <rect
        x="4"
        y="4"
        width="40"
        height="31"
        rx="10"
        transform="rotate(10 24 19)"
        fill="#E47497"
      />
      <path
        d="M18 33L13 40L24 35"
        fill="#E47497"
      />
      <path
        d="M24.5 26.5C24.5 26.5 17.5 21.2 18.2 16.2C18.6 13.7 20.8 12.4 22.8 12.7C24.1 12.9 25 13.8 25.4 14.9C26.1 13.9 27.2 13.3 28.5 13.5C30.5 13.8 32.2 15.6 31.8 18.1C31.1 23.1 24.5 26.5 24.5 26.5Z"
        fill="#FFF9FB"
      />
    </svg>
  </div>
);

export const OverlappingPolaroidsDoodle: React.FC<{ className?: string }> = ({
  className = 'w-28 h-32',
}) => (
  <svg viewBox="0 0 120 130" fill="none" className={className} aria-hidden="true">
    {/* Back polaroid */}
    <g transform="rotate(14 68 62)">
      <rect
        x="34"
        y="14"
        width="68"
        height="84"
        rx="3"
        fill="#FDF7F9"
        stroke="#C599A8"
        strokeWidth="1.5"
      />
      <rect
        x="40"
        y="20"
        width="56"
        height="56"
        fill="#E5D4DC"
        stroke="#C599A8"
        strokeWidth="1"
      />
    </g>
    {/* Front polaroid */}
    <g transform="rotate(6 52 66)">
      <rect
        x="16"
        y="18"
        width="68"
        height="84"
        rx="3"
        fill="#FFFDFD"
        stroke="#B88999"
        strokeWidth="1.5"
      />
      <rect
        x="22"
        y="24"
        width="56"
        height="56"
        fill="#DECBD4"
        stroke="#B88999"
        strokeWidth="1"
      />
    </g>
  </svg>
);

export const PaperclipSilver: React.FC<{ className?: string }> = ({
  className = 'w-7 h-12',
}) => (
  <svg viewBox="0 0 32 56" fill="none" className={className} aria-hidden="true">
    <path
      d="M21 14V38C21 43.5 16.5 48 11 48C5.5 48 1 43.5 1 38V12C1 5.4 6.4 0 13 0C19.6 0 25 5.4 25 12V36C25 39.9 21.9 43 18 43C14.1 43 11 39.9 11 36V15"
      stroke="#B39EA6"
      strokeWidth="2.6"
      strokeLinecap="round"
    />
    <path
      d="M21 14V38C21 43.5 16.5 48 11 48C5.5 48 1 43.5 1 38V12C1 5.4 6.4 0 13 0C19.6 0 25 5.4 25 12V36C25 39.9 21.9 43 18 43C14.1 43 11 39.9 11 36V15"
      stroke="#E6DCE0"
      strokeWidth="1"
      strokeLinecap="round"
    />
  </svg>
);

export const BabysBreathSprig: React.FC<{ className?: string }> = ({
  className = 'w-16 h-20',
}) => (
  <svg viewBox="0 0 64 80" fill="none" className={className} aria-hidden="true">
    <path
      d="M32 76C32 58 28 40 18 22M32 66C38 50 45 36 50 20M30 52C24 44 16 38 12 32M35 46C40 38 46 34 52 30"
      stroke="#8F9779"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    {/* Tiny white & blush blossoms */}
    {[
      [18, 20],
      [12, 30],
      [24, 28],
      [32, 18],
      [48, 18],
      [53, 28],
      [40, 26],
      [28, 36],
      [42, 38],
      [16, 42],
    ].map(([cx, cy], idx) => (
      <g key={idx}>
        <circle cx={cx} cy={cy} r="4.2" fill="#FFFDFD" stroke="#EED6DF" strokeWidth="1" />
        <circle cx={cx} cy={cy} r="1.4" fill="#F5C6D6" />
      </g>
    ))}
  </svg>
);
