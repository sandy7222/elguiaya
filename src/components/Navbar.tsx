/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Logo } from './Logo';
import { Menu, X, Shield, MapPin, Sparkles, Anchor, LifeBuoy, Download, ShoppingBag } from 'lucide-react';

interface NavbarProps {
  onScrollTo: (elementId: string) => void;
  onPreRegister: (role: 'pescador' | 'capitan') => void;
}

const DOWNLOAD_PAGE = '/descarga';

export const Navbar: React.FC<NavbarProps> = ({ onScrollTo, onPreRegister }) => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: 'Inicio', target: 'hero-section', icon: Anchor },
    { label: 'Cómo funciona', target: 'how-it-works', icon: LifeBuoy },
    { label: 'Mapa', target: 'interactive-map', icon: MapPin },
    { label: 'Chat El GuIA', target: 'fishing-ai', icon: Sparkles },
    { label: 'Seguridad', target: 'security', icon: Shield },
    { label: 'Tienda', target: '', icon: ShoppingBag, url: '/tienda', deepLink: 'capitanya://tienda' },
  ];

  const handleNavClick = (target: string, url?: string, deepLink?: string) => {
  if (url) {
    if (deepLink && /Android/i.test(navigator.userAgent)) {
      const start = Date.now();
      window.location.href = deepLink;
      setTimeout(() => {
        if (Date.now() - start < 1200) {
          window.location.href = url;
        }
      }, 1000);
    } else {
      window.location.href = url;
    }
    setIsOpen(false);
    return;
  }
  if (!target) return;
  onScrollTo(target);
  setIsOpen(false);
};

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#0b2243]/80 backdrop-blur-md border-b border-slate-800" id="navbar-container">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0 cursor-pointer" onClick={() => handleNavClick('hero-section')} id="navbar-logo">
            <Logo size="md" textColor="text-white" subtitleColor="text-emerald-400" />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6" id="navbar-desktop-menu">
            {navItems.map((item) => (
              <button
                key={item.target}
                onClick={() => handleNavClick(item.target, item.url, (item as any).deepLink)}
                className="text-slate-300 hover:text-emerald-400 font-medium text-sm transition-colors duration-200 cursor-pointer flex items-center gap-1.5"
                id={`nav-link-${item.target}`}
              >
                <item.icon className="w-3.5 h-3.5 opacity-60 text-emerald-400" />
                {item.label}
              </button>
            ))}
          </div>

          {/* CTAs */}
          <div className="hidden md:flex items-center space-x-3" id="navbar-ctas">
            <button
              onClick={() => onPreRegister('pescador')}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
              id="cta-search-trip"
            >
              Buscar un viaje
            </button>
            <a
              href={DOWNLOAD_PAGE}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-900/40 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2 border border-emerald-400/20"
              id="cta-be-captain"
            >
              <Download className="w-4 h-4" />
              Descargá la App
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center" id="navbar-mobile-toggle">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-400 hover:text-white p-2 rounded-md focus:outline-none"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-6 space-y-3" id="navbar-mobile-menu">
          {navItems.map((item) => (
            <button
              key={item.target}
              onClick={() => handleNavClick(item.target, item.url, (item as any).deepLink)}
              className="w-full text-left py-2.5 px-3 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 text-base font-medium transition-all flex items-center gap-3 cursor-pointer"
              id={`mob-nav-${item.target}`}
            >
              <item.icon className="w-5 h-5 text-emerald-400" />
              {item.label}
            </button>
          ))}
          <div className="pt-4 border-t border-slate-800 flex flex-col gap-3">
            <button
              onClick={() => {
                setIsOpen(false);
                onPreRegister('pescador');
              }}
              className="w-full py-3 text-center text-slate-300 hover:text-white border border-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
              id="mob-cta-pescador"
            >
              Buscar un viaje (Pescador)
            </button>
            <a
              href={DOWNLOAD_PAGE}
              onClick={() => setIsOpen(false)}
              className="w-full py-3.5 text-center text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl text-sm font-bold shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 border border-emerald-400/20"
              id="mob-cta-capitan"
            >
              <Download className="w-4 h-4" />
              Descargá la App
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};
