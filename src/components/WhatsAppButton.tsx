/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

const WHATSAPP_NUMBER = '5491171548464';
const DEFAULT_MESSAGE = '¡Hola! Quiero más información sobre El Guía Ya.';

const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

const WhatsAppIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.71.45 3.38 1.3 4.85L2.05 22l5.36-1.4a9.9 9.9 0 0 0 4.63 1.18h.01c5.46 0 9.9-4.45 9.9-9.91C21.95 6.45 17.5 2 12.04 2Zm5.8 14.1c-.24.68-1.4 1.32-1.93 1.4-.5.08-1.12.11-1.8-.11-.42-.13-.95-.31-1.64-.6-2.88-1.24-4.76-4.15-4.9-4.34-.14-.19-1.17-1.55-1.17-2.96 0-1.4.73-2.09 1-2.38.26-.28.57-.35.76-.35.19 0 .38 0 .55.01.18.01.41-.07.64.49.24.57.81 1.98.88 2.12.07.15.11.32.02.51-.09.19-.14.31-.28.48-.14.17-.29.37-.42.5-.14.14-.28.29-.12.57.16.28.71 1.17 1.52 1.9 1.05.94 1.93 1.23 2.21 1.37.28.14.44.12.6-.07.17-.19.71-.83.9-1.11.19-.28.38-.24.63-.14.26.09 1.63.77 1.91.91.28.14.47.21.54.33.07.12.07.68-.17 1.36Z" />
  </svg>
);

export const WhatsAppButton: React.FC = () => {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 left-6 z-50 group flex items-center gap-3 cursor-pointer"
      id="whatsapp-float-button"
      title="Hablar por WhatsApp"
    >
      {/* Tooltip label on hover (desktop) */}
      <div className="hidden md:block bg-slate-900 border border-slate-800 text-emerald-400 font-extrabold text-[11px] px-3 py-1.5 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 select-none order-1">
        ¡Hablanos por WhatsApp!
      </div>

      <div className="relative hover:scale-110 active:scale-95 transition-all duration-300 order-0">
        {/* Active signal ping indicator */}
        <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-slate-950 animate-ping z-20" />
        <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-slate-950 z-20" title="En línea" />

        <div className="w-16 h-16 rounded-full bg-[#25D366] flex items-center justify-center shadow-2xl shadow-black/40 border border-white/10">
          <WhatsAppIcon className="w-8 h-8 text-white" />
        </div>
      </div>
    </a>
  );
};
