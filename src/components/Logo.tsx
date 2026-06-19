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
      <img
        src="/logo-mark.svg"
        width={pixelSize}
        height={pixelSize}
        alt="El Guía Ya"
        className="transition-transform duration-300 hover:rotate-6 flex-shrink-0"
        id="logo-svg-element"
        style={{ objectFit: 'contain' }}
      />

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
