/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  textColor?: string;
  subtitleColor?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  customSize?: number;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  showText = true,
  textColor = 'text-slate-900 dark:text-white',
  subtitleColor = 'text-slate-500 dark:text-emerald-400',
  size = 'md',
  customSize = 48,
}) => {
  let pixelSize = 51.5;
  if (size === 'sm') pixelSize = 38.5;
  if (size === 'md') pixelSize = 51.5;
  if (size === 'lg') pixelSize = 68.5;
  if (size === 'xl') pixelSize = 128.5;
  if (size === 'custom') pixelSize = Math.round(customSize * 1.07);

  return (
    <div className={`flex items-center gap-3 ${className}`} id="elguiaya-brand-logo">
      {/* Circle with custom green sailboat line */}
      <svg
        width={pixelSize}
        height={pixelSize}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-emerald-600 dark:text-emerald-500 transition-transform duration-300 hover:rotate-6 flex-shrink-0"
        id="logo-svg-element"
      >
        {/* Outer Circular Boundary */}
        <circle
          cx="50"
          cy="50"
          r="42.5"
          stroke="currentColor"
          strokeWidth="6.5"
          strokeLinecap="round"
        />
        {/* Sailboat Mast (Vertical line) */}
        <line
          x1="50"
          y1="22.5"
          x2="50"
          y2="64"
          stroke="currentColor"
          strokeWidth="6.5"
          strokeLinecap="round"
        />
        {/* Hull (Boat bottom, perfectly proportioned curves matching the reference) */}
        <path
          d="M 27 64 C 27 64 29.5 73 35 73 H 65 C 70.5 73 73 62 73 62 Q 50 66.5 27 64 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="6.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* Left Sail: smaller, beautifully concave/curved inward sail */}
        <path
          d="M 50 23.5 C 48 34 43 46.5 31 58 H 50 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="6.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* Right Sail: larger, convex-outward sail */}
        <path
          d="M 50 23.5 C 59.5 29 68.5 42.5 68.5 58 H 50 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="6.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>

      {showText && (
        <div className="flex flex-col select-none" id="logo-text-area">
          <span className={`text-xl font-bold tracking-tight ${textColor}`}>
            El Guía<span className="text-emerald-600 dark:text-emerald-500"> Ya</span>
          </span>
          <span className={`text-[10px] font-medium leading-none ${subtitleColor}`}>
            Tu mejor amigo de pesca
          </span>
        </div>
      )}
    </div>
  );
};
