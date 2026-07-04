/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Anchor, ShieldCheck, Map, Users, ChevronRight, Download } from 'lucide-react';

interface HeroProps {
  onPreRegister: (role: 'pescador' | 'capitan') => void;
  onExploreMap: () => void;
}

const DOWNLOAD_PAGE = '/descarga';

export const Hero: React.FC<HeroProps> = ({ onPreRegister, onExploreMap }) => {
  return (
    <div className="relative min-h-screen bg-[#0b2243] text-white pt-24 pb-16 flex items-center overflow-hidden" id="hero-section">
      
      {/* 🌊 Ultra-Slow Cinematic Animation waves for background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-45" id="cinematic-river-bg">
        <svg className="absolute w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 800" preserveAspectRatio="none">
          <defs>
            <linearGradient id="riverGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.12" />
              <stop offset="50%" stopColor="#10b981" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#020617" stopOpacity="0.8" />
            </linearGradient>
            <style>{`
              @keyframes waveSlow {
                0% { transform: translateY(0px) scaleY(1); }
                50% { transform: translateY(-15px) scaleY(1.04); }
                100% { transform: translateY(0px) scaleY(1); }
              }
              @keyframes waveSlower {
                0% { transform: translateX(0px) translateY(0px); }
                50% { transform: translateX(-25px) translateY(10px); }
                100% { transform: translateX(0px) translateY(0px); }
              }
              .wave-path-1 { animation: waveSlow 14s ease-in-out infinite; }
              .wave-path-2 { animation: waveSlower 20s ease-in-out infinite; }
            `}</style>
          </defs>
          
          {/* Animated Wave layer 1 */}
          <path
            className="wave-path-1"
            d="M0,280 C320,380 480,180 800,320 C1120,460 1280,300 1440,360 L1440,800 L0,800 Z"
            fill="url(#riverGradient)"
          />
          {/* Animated Wave layer 2 */}
          <path
            className="wave-path-2"
            d="M0,420 C240,460 480,320 720,440 C960,560 1200,380 1440,460 L1440,800 L0,800 Z"
            fill="#0f2b3e"
            opacity="0.25"
          />
        </svg>

        {/* Ambient lighting glows (Simulating delta sunrise flare) */}
        <div className="absolute top-[20%] left-[10%] w-[350px] h-[350px] rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute bottom-[10%] right-[15%] w-[450px] h-[450px] rounded-full bg-sky-500/10 blur-[150px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full" id="hero-content">
        <div className="grid md:grid-cols-12 gap-12 items-center" id="hero-grid">
          
          {/* Left Column: Premium Brand Pitch */}
          <div className="md:col-span-7 flex flex-col items-start text-left" id="hero-text-container">
            {/* Tagline */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-wide mb-6 animate-pulse" id="hero-tag">
              <Anchor className="w-3.5 h-3.5" />
              <span>EL FUTURO DE LA PESCA DEPORTIVA EN ARGENTINA</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 leading-[1.1] font-sans" id="hero-headline">
              Encontrá tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-500 to-sky-400">Guía YA</span> en minutos
            </h1>

            {/* Subtext */}
            <p className="text-slate-300 text-lg sm:text-xl font-light mb-8 max-w-xl leading-relaxed" id="hero-subtext">
              Conectamos pescadores con capitanes y embarcaciones reguladas para vivir experiencias seguras de pesca deportiva y navegación en el Paraná y lagunas argentinas.
            </p>

            {/* CTA Selectors */}
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-10" id="hero-ctas-panel">
              <button
                onClick={() => onPreRegister('pescador')}
                className="px-8 py-4 bg-slate-800/80 hover:bg-slate-700/80 text-white font-bold rounded-xl border border-slate-700 shadow-md transform transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer text-base"
                id="hero-btn-pescador"
              >
                <span>Buscar un viaje</span>
                <ChevronRight className="w-5 h-5 text-emerald-400" />
              </button>
              
              <a
                href={DOWNLOAD_PAGE}
                className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-950/50 hover:shadow-emerald-700/40 transform transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer text-base border border-emerald-400/20 animate-pulse"
                id="hero-btn-capitan"
              >
                <span>Descargá la App</span>
                <Download className="w-5 h-5 text-white" />
              </a>
            </div>

            {/* Quality badges */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-800/80 w-full max-w-lg" id="hero-badges">
              <div className="flex flex-col select-none" id="badge-verificados">
                <span className="text-2xl font-bold text-white flex items-center gap-1">
                  150+
                  <ShieldCheck className="w-4 h-4 text-emerald-400 inline" />
                </span>
                <span className="text-xs text-slate-400 font-medium">Guías Regulados</span>
              </div>
              <div className="flex flex-col select-none" id="badge-zonas">
                <span className="text-2xl font-bold text-white flex items-center gap-1">
                  Delta
                  <Map className="w-4 h-4 text-emerald-400 inline" />
                </span>
                <span className="text-xs text-slate-400 font-medium font-sans">Y Lagunas Argentinas</span>
              </div>
              <div className="flex flex-col select-none" id="badge-comunidad">
                <span className="text-2xl font-bold text-white flex items-center gap-1">
                  100%
                  <Users className="w-4 h-4 text-emerald-400 inline" />
                </span>
                <span className="text-xs text-slate-400 font-medium">Seguro Náutico</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Smartphone Mockup */}
          <div className="md:col-span-5 flex justify-center relative" id="hero-mockup-container">
            {/* Glow ring behind phone */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-emerald-500/20 blur-[100px] pointer-events-none" />
            
            {/* iPhone Frame wrapper */}
            <div className="relative mx-auto w-[280px] h-[570px] sm:w-[300px] sm:h-[610px] bg-slate-900 rounded-[48px] p-3 shadow-2xl shadow-emerald-950/80 border-4 border-slate-700/80 flex flex-col justify-between overflow-hidden" id="phone-frame">
              
              {/* Dynamic island / camera notch */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-30 flex items-center justify-center p-1" id="iphone-island">
                <div className="w-2 h-2 bg-slate-900 rounded-full ml-auto mr-1" />
              </div>

              {/* In-app Simulator Screen */}
              <div className="relative w-full h-full bg-[#0b1e3a] rounded-[38px] overflow-hidden flex flex-col justify-between p-4 z-20 border border-slate-800" id="phone-screen">
                
                {/* Header bar */}
                <div className="flex justify-between items-center pt-5 pb-3 px-2 border-b border-slate-800/80" id="sim-header">
                  <div className="flex items-center gap-1.5" id="sim-logo">
                    <img src="/logo-mark.jpg" alt="" className="w-7 h-7 flex-shrink-0 rounded-full" style={{ objectFit: 'contain' }} />
                    <span className="text-xs font-bold font-sans tracking-wide">El Guía Ya</span>
                  </div>
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" title="Señal Activa" />
                </div>

                {/* Simulated content scroll */}
                <div className="flex-1 py-3 px-1 space-y-4 overflow-y-auto scrollbar-none text-left" id="sim-content">
                  
                  {/* Floating Notification */}
                  <div className="bg-slate-900/90 border border-emerald-500/30 p-2.5 rounded-xl flex items-center gap-2.5 shadow-md" id="sim-alert">
                    <div className="bg-emerald-500/20 p-1.5 rounded-lg text-emerald-400">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 leading-none">Tu Capitán está en viaje</p>
                      <p className="text-xs font-semibold text-white mt-0.5">Capt. Raúl - Bermuda Pro</p>
                    </div>
                  </div>

                  {/* Simulated Map card */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden relative h-36 flex items-end shadow-inner" id="sim-map-card">
                    {/* Simulated river graphic representing Paraná delta */}
                    <div className="absolute inset-0 bg-[#0b1e3a]/40 pointer-events-none z-10" />
                    <svg className="absolute inset-0 w-full h-full bg-sky-950" viewBox="0 0 200 150">
                      {/* River paths */}
                      <path d="M 0,40 Q 50,80 110,30 T 200,80" fill="none" stroke="#0ea5e9" strokeWidth="18" strokeLinecap="round" opacity="0.6" />
                      <path d="M 20,110 Q 90,80 150,120" fill="none" stroke="#22c55e" strokeWidth="8" strokeLinecap="round" opacity="0.4" />
                      {/* Captain Pin */}
                      <circle cx="110" cy="30" r="5" fill="#f43f5e" />
                      {/* Radar signal pulse */}
                      <circle cx="110" cy="30" r="12" fill="none" stroke="#f43f5e" strokeWidth="1" className="animate-ping" />
                      {/* Boat text */}
                      <text x="120" y="32" fill="#fff" fontSize="8" fontWeight="bold">Lancha Sandy</text>
                    </svg>
                    
                    <div className="relative z-10 w-full p-2.5 bg-slate-900/95 border-t border-slate-800 flex justify-between items-center">
                      <div>
                        <p className="text-[9px] text-slate-400 uppercase tracking-widest">Zona Náutica</p>
                        <p className="text-[11px] font-bold text-white">Delta - Río Paraná, Arg</p>
                      </div>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-semibold">9.4 km</span>
                    </div>
                  </div>

                  {/* Species Carousel */}
                  <div className="space-y-1.5" id="sim-species">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider pl-1">Especies Activas hoy</p>
                    <div className="flex gap-2" id="sim-carousel">
                      <div className="bg-emerald-500/10 border border-emerald-500/30 py-1.5 px-3 rounded-full flex items-center gap-1 flex-shrink-0">
                        <span className="text-[11px] font-bold text-emerald-400">🐟 Dorado</span>
                      </div>
                      <div className="bg-slate-900 border border-slate-800 py-1.5 px-3 rounded-full flex items-center gap-1 flex-shrink-0">
                        <span className="text-[11px] font-semibold text-slate-300">🦈 Surubí</span>
                      </div>
                      <div className="bg-slate-900 border border-slate-800 py-1.5 px-3 rounded-full flex items-center gap-1 flex-shrink-0">
                        <span className="text-[11px] font-semibold text-slate-300">🐠 Pejerrey</span>
                      </div>
                    </div>
                  </div>

                  {/* Live ratings */}
                  <div className="bg-slate-900 p-2.5 rounded-xl flex justify-between items-center border border-slate-800/80" id="sim-guide-card">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-800 border border-emerald-500 flex items-center justify-center font-bold text-xs">
                        H
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Guía Hugo B.</p>
                        <p className="text-[9px] text-emerald-400">⭐ 4.9 · 128 Expediciones</p>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-1 bg-emerald-600 rounded-lg font-bold">RESERVAR</span>
                  </div>
                </div>

                {/* Bottom button navigation bar */}
                <div className="pt-2 px-1 border-t border-slate-800/80 flex justify-around text-slate-400 text-[10px]" id="sim-bottom-nav">
                  <div className="flex flex-col items-center gap-0.5 text-emerald-400">
                    <Anchor className="w-4 h-4" />
                    <span>Zarpas</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5" onClick={onExploreMap}>
                    <Map className="w-4 h-4 hover:text-emerald-400 transition-colors" />
                    <span>Mapa</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5">
                    <Users className="w-4 h-4" />
                    <span>Perfil</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Float decoration details (Argentine fishing vibe) */}
            <div className="absolute -bottom-6 -left-6 bg-slate-900/90 border border-slate-700/80 p-3.5 rounded-2xl hidden lg:flex items-center gap-3 backdrop-blur shadow-2xl z-25 max-w-[200px] select-none text-left" id="float-vibe-pago">
              <div className="w-10 h-10 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center flex-shrink-0">
                💳
              </div>
              <div>
                <p className="text-xs font-bold text-slate-100">Mercado Pago</p>
                <p className="text-[9px] text-slate-300">Pago seguro garantizado con dinero retenido</p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
