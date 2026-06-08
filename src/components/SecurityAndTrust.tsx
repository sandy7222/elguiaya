/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, Anchor, HeartPulse, LifeBuoy, Heart, AlertOctagon } from 'lucide-react';

export const SecurityAndTrust: React.FC = () => {
  const safetyCards = [
    {
      icon: Anchor,
      title: 'Matrículas de Embarcaciones',
      desc: 'Todas las lanchas y trackers adheridos deben tener matrícula al día registrada ante la Dirección de Policía de Seguridad de la Navegación.',
      badge: 'Inspeccionado'
    },
    {
      icon: LifeBuoy,
      title: 'Timoneles Oficiales',
      desc: 'Verificamos que cada Capitán cuente con su carnet del Cuerpo de Timoneles y Guías vigente emitido por Prefectura Naval.',
      badge: 'Habilitado'
    },
    {
      icon: HeartPulse,
      title: 'Seguros contra Terceros',
      desc: 'Cada travesía goza de cobertura integral de responsabilidad civil náutica activa para la tripulación.',
      badge: 'Sancor Seguros'
    }
  ];

  return (
    <div className="py-24 bg-[#030d17] border-b border-slate-900" id="security">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16" id="sec-header">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 text-white">
            Seguridad Náutica de Primer Nivel
          </h2>
          <p className="text-slate-300 text-lg font-light leading-relaxed">
            La pesca deportiva en el Paraná debe ser emocionante, pero antes que nada, segura. Establecemos rígidos estándares de verificación fiscal y marítima para garantizar tranquilidad a bordo.
          </p>
        </div>

        {/* Badges alignment grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16" id="sec-grid">
          {safetyCards.map((card, i) => {
            const CardIcon = card.icon;
            return (
              <div
                key={i}
                className="relative group p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/30 transition-all duration-300 text-left select-none"
                id={`sec-card-${i}`}
              >
                <div className="p-3 bg-slate-950 rounded-xl inline-block text-emerald-400 border border-slate-800 mb-5 relative">
                  <CardIcon className="w-6 h-6" />
                </div>
                
                <h3 className="text-base font-bold text-white mb-2">{card.title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed mb-4">{card.desc}</p>
                
                <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full font-bold uppercase">
                  {card.badge}
                </span>
              </div>
            );
          })}
        </div>

        {/* Emergency instructions / Prefectura Naval block */}
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 text-left flex flex-col lg:flex-row items-center justify-between gap-8" id="prefecture-alliance">
          <div className="flex items-start gap-4" id="prefecture-info">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center flex-shrink-0">
              <AlertOctagon className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <p className="text-xs uppercase text-slate-400 tracking-wider font-bold">ALINEADO CON PREFECTURA NAVAL ARGENTINA</p>
              <h4 className="text-xl font-bold text-white mt-1">Primeros Auxilios y Resguardo Colectivo</h4>
              <p className="text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Todas las embarcaciones registradas en El Guía Ya están obligadas a portar chalecos salvavidas reflectantes para cada tripulante (normatividad SOLAS), bengalas vigentes de helimaris, botiquín tipo "A" y radio VHF abierta en Canal 16 permanente.
              </p>
            </div>
          </div>

          <div className="flex gap-4 w-full lg:w-auto" id="sec-hotlines">
            <div className="flex-1 lg:flex-none py-3.5 px-6 rounded-2xl bg-slate-950 border border-slate-850 flex flex-col select-none">
              <span className="text-[9px] text-slate-500 font-bold uppercase leading-none">Canal de Emergencias PNA</span>
              <span className="text-lg font-bold text-rose-500 mt-1">VHF Canal 16</span>
            </div>
            <div className="flex-1 lg:flex-none py-3.5 px-6 rounded-2xl bg-slate-950 border border-slate-850 flex flex-col select-none">
              <span className="text-[9px] text-slate-500 font-bold uppercase leading-none">Emergencias Médicas Río</span>
              <span className="text-lg font-bold text-emerald-500 mt-1">Línea 106</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
