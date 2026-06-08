/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Compass, Ship, Smartphone, PlaneTakeoff, ShieldCheck, MapPin } from 'lucide-react';

export const ProjectPhases: React.FC = () => {
  const roadmapPhases = [
    {
      phase: 'FASE 1',
      title: 'Mínimo Producto Viable (MVP)',
      status: 'En curso / Registro Abierto',
      statusClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      desc: 'Lanzamiento controlado en la zona náutica del Delta de Tigre, San Fernando y San Isidro. Registro inicial de capitanes e integraciones de mapas.',
      icon: MapPin,
    },
    {
      phase: 'FASE 2',
      title: 'Expansión Nacional',
      status: 'Q3 - Q4 2026',
      statusClass: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
      desc: 'Inclusión de cuencas de pesca deportiva premium: Esquina, Goya, Paso de la Patria (Corrientes), Victoria (Entre Ríos) y lagunas bonaerenses principales.',
      icon: Ship,
    },
    {
      phase: 'FASE 3',
      title: 'Ecosistema Náutico',
      status: 'Q1 2027',
      statusClass: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      desc: 'Integración vertical con cabañas fluviales asociadas, venta física de carnada viva certificada, alquiler de cañas y licencias de pesca con descuento.',
      icon: Compass,
    },
    {
      phase: 'FASE 4',
      title: 'Aplicación Móvil Nativa',
      status: 'Q2 2027',
      statusClass: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      desc: 'Diseño e implementación de apps nativas en Flutter para Android e iOS. Notificaciones satelitales push y rastreo GPS sin conexión móvil activa.',
      icon: Smartphone,
    },
    {
      phase: 'FASE 5',
      title: 'Faro Internacional',
      status: 'Q4 2027',
      statusClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      desc: 'Aterrizaje en las cuencas de Uruguay (Salto Grande), Paraguay (Encarnación) y sur de Brasil. Consolidación como la plataforma líder en pesca de América del Sur.',
      icon: PlaneTakeoff,
    },
  ];

  return (
    <div className="py-24 bg-[#05111d] border-b border-slate-900" id="phases-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-20" id="phases-header">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-500/10 text-sky-400 text-xs font-semibold rounded-full border border-sky-500/20 mb-4 uppercase">
            <Compass className="w-4 h-4 text-emerald-400" />
            <span>Plan de Navegación</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 text-white">
            Fases de Desarrollo del Proyecto
          </h2>
          <p className="text-slate-300 text-lg font-light leading-relaxed">
            Nuestra hoja de ruta es clara y progresiva. Nos asentamos con solidez sobre zonas locales para garantizar una tracción segura antes de expandir nuestro radio de acción nacional e internacional.
          </p>
        </div>

        {/* Timeline roadmap layout construct */}
        <div className="max-w-4xl mx-auto" id="timeline-construct">
          
          <div className="relative" id="timeline-wrapper">
            {/* Vertical middle/left line bridge */}
            <div className="absolute left-6 md:left-1/2 top-4 bottom-4 w-0.5 bg-slate-800 pointer-events-none" id="timeline-bridge" />

            {/* Render Timeline items */}
            <div className="space-y-12" id="timeline-items">
              {roadmapPhases.map((road, i) => {
                const RoadIcon = road.icon;
                const isEven = i % 2 === 0;

                return (
                  <div
                    key={i}
                    className={`relative flex flex-col md:flex-row items-stretch select-none ${
                      isEven ? 'md:flex-row-reverse' : ''
                    }`}
                    id={`roadmap-item-${i}`}
                  >
                    
                    {/* Icon Timeline circle node */}
                    <div className="absolute left-6 md:left-1/2 -translate-x-[11px] md:-translate-x-1/2 top-1.5 w-6 h-6 rounded-full bg-[#05111d] border-2 border-emerald-500 flex items-center justify-center z-10 shadow shadow-emerald-500/40">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    </div>

                    {/* Left or Right blank helper item for desktop timeline symmetry */}
                    <div className="hidden md:block md:w-1/2 text-left" />

                    {/* Content card box */}
                    <div className="w-full md:w-1/2 pl-12 md:pl-0 md:px-8 text-left" id={`roadmap-card-${i}`}>
                      <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 hover:border-emerald-500/30 transition-all duration-300 shadow-lg">
                        
                        {/* Top labels */}
                        <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
                          <span className="text-xs bg-emerald-500/10 text-emerald-400 font-extrabold px-3 py-1 rounded-full border border-emerald-500/20 font-mono">
                            {road.phase}
                          </span>
                          
                          <span className={`text-[10px] uppercase font-bold border px-2.5 py-1 rounded-full ${road.statusClass}`}>
                            {road.status}
                          </span>
                        </div>

                        {/* Title & Desc */}
                        <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                          <RoadIcon className="w-5 h-5 text-emerald-500" />
                          {road.title}
                        </h4>
                        <p className="text-slate-400 text-sm leading-relaxed">
                          {road.desc}
                        </p>

                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom badge marker */}
          <div className="mt-14 p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-center max-w-xl mx-auto text-xs text-slate-300 leading-snug flex items-center justify-center gap-2 relative z-10" id="phases-footnote">
            <span className="text-emerald-400 font-bold">🚀 2026/2027 Goals:</span>
            <span>Aspiramos a sostener más de 50.000 navegantes pescadores activos bajo el sello El Guía Ya.</span>
          </div>

        </div>

      </div>
    </div>
  );
};
