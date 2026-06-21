/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Logo } from './Logo';
import { Mail, Phone } from 'lucide-react';

interface FooterProps {
  onScrollTo: (elementId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onScrollTo }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0b2243] text-slate-400 pt-16 pb-8 border-t border-slate-800" id="footer-container">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12" id="footer-grid">
          
          {/* Brand col (5 cols) */}
          <div className="md:col-span-5 text-left" id="footer-brand-col">
            <div className="cursor-pointer" onClick={() => onScrollTo('hero-section')}>
              <Logo size="md" textColor="text-white" subtitleColor="text-emerald-400" />
            </div>
            
            <p className="text-sm font-light leading-relaxed text-slate-350 max-w-sm mt-6">
              El Guía Ya es la plataforma argentina pionera para la vinculación segura de pescadores y capitanes náuticos regulados. Sostenemos la pasión de la pesca deportiva, el amor sus ríos, sus lagunas y costas con tecnología transparente.
            </p>
            
            <div className="flex gap-4 mt-6 text-slate-400 text-xs" id="footer-socials">
              <span>Instagram</span>
              <span>Facebook</span>
              <span>X (Twitter)</span>
              <span>YouTube</span>
            </div>
          </div>

          {/* Quick links col (3 cols) */}
          <div className="md:col-span-3 text-left" id="footer-links-col">
            <h5 className="text-white font-bold text-sm uppercase tracking-wider mb-4 font-sans">Navegación</h5>
            <div className="flex flex-col gap-2.5 text-xs text-slate-350" id="footer-link-items">
              <button onClick={() => onScrollTo('how-it-works')} className="text-left hover:text-white transition-colors cursor-pointer">
                ¿Cómo funciona?
              </button>
              <button onClick={() => onScrollTo('interactive-map')} className="text-left hover:text-white transition-colors cursor-pointer">
                Ruta Interactiva
              </button>
              <button onClick={() => onScrollTo('fisherman-dashboard-section')} className="text-left hover:text-white transition-colors cursor-pointer">
                Zona Pescadores
              </button>
              <button onClick={() => onScrollTo('captain-dashboard-section')} className="text-left hover:text-white transition-colors cursor-pointer">
                Panel del Capitán
              </button>
              <button onClick={() => onScrollTo('security')} className="text-left hover:text-white transition-colors cursor-pointer">
                Protocolo de Seguridad
              </button>
            </div>
          </div>

          {/* Compliance & Emergency col (4 cols) */}
          <div className="md:col-span-4 text-left" id="footer-compliance-col">
            <h5 className="text-white font-bold text-sm uppercase tracking-wider mb-4 font-sans">Atención al Cliente</h5>

            <div className="space-y-2 text-xs" id="footer-contact-items">
              <div className="flex items-center gap-2 text-slate-350">
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>011-4899 9921</span>
              </div>
              <div className="flex items-center gap-2 text-slate-350">
                <Mail className="w-4 h-4 text-emerald-400" />
                <span>soporte@elguiaya.com</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom row copyrights */}
        <div className="pt-8 border-t border-slate-900/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500" id="footer-copyright-row">
          <p>© 2026 El Guía YA. Todos los derechos reservados. Glew, Buenos Aires, Argentina.</p>
        </div>

      </div>
    </footer>
  );
};
