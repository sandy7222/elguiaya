/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { RoutePoint } from '../types';
import { Map, MapPin, Navigation, Info, RefreshCw, Compass } from 'lucide-react';

interface Landmark {
  id: string;
  name: string;
  x: number;
  y: number;
  desc: string;
}

export const InteractiveMap: React.FC = () => {
  // Pre-configured premium landmarks on Delta & Paraná regions
  const landmarks: Landmark[] = [
    { id: '1', name: 'Zarate - Puente Delta', x: 120, y: 150, desc: 'Zona profunda de dorados y bogas' },
    { id: '2', name: 'Rosario - Isla Invernada', x: 280, y: 80, desc: 'Ideal para artificiales y trolling de surubí' },
    { id: '3', name: 'Victoria - Canal Escondido', x: 410, y: 120, desc: 'Arroyos densos con pique activo de tarariras' },
    { id: '4', name: 'San Pedro - Vuelta de Obligado', x: 580, y: 190, desc: 'Pesca variada de río y excelentes costas' },
    { id: '5', name: 'Tigre - Bajos del Temor', x: 740, y: 220, desc: 'Navegación tranquila, pejerrey en invierno' },
    { id: '6', name: 'Laguna de Chascomús', x: 880, y: 280, desc: 'La cuna del pejerrey y deportes de vela' },
  ];

  const [selectedPoints, setSelectedPoints] = useState<Landmark[]>([landmarks[0], landmarks[2]]);
  const [activeHover, setActiveHover] = useState<Landmark | null>(null);

  const handleSelectPoint = (point: Landmark) => {
    // If already selected, remove it. Otherwise add or cycle.
    if (selectedPoints.find((p) => p.id === point.id)) {
      if (selectedPoints.length > 1) {
        setSelectedPoints(selectedPoints.filter((p) => p.id !== point.id));
      }
    } else {
      if (selectedPoints.length >= 3) {
        setSelectedPoints([selectedPoints[1], selectedPoints[2], point]);
      } else {
        setSelectedPoints([...selectedPoints, point]);
      }
    }
  };

  const handleReset = () => {
    setSelectedPoints([landmarks[0], landmarks[2]]);
  };

  // Compute mock distance & hours based on euclidean coordinates
  const calculateMetrics = () => {
    let distance = 0;
    for (let i = 0; i < selectedPoints.length - 1; i++) {
      const p1 = selectedPoints[i];
      const p2 = selectedPoints[i + 1];
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      distance += Math.sqrt(dx * dx + dy * dy);
    }
    // Scale distance to real feel (kms)
    const distanceKm = Math.round(distance * 0.18 + 12);
    // Speed constant of average motorboat (e.g. 24 km/hour average factoring fishing pauses)
    const hours = Number((distanceKm / 20).toFixed(1));
    return { distanceKm, hours };
  };

  const { distanceKm, hours } = calculateMetrics();

  return (
    <div className="py-24 bg-slate-950 text-white relative border-b border-slate-900" id="interactive-map">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16" id="map-header">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-semibold rounded-full border border-emerald-500/20 mb-4 uppercase select-none">
            <Compass className="w-3.5 h-3.5" />
            <span>Simulador Náutico</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 text-white">
            Planificá tu Ruta de Pesca
          </h2>
          <p className="text-slate-300 text-lg font-light leading-relaxed">
            Hacé clic en los puertos y parajes calientes de pesca de Argentina para simular la ruta de tu futura lancha. El sistema mide itinerarios y tiempo al instante sin inventar precios fijos. Es 100% transparente.
          </p>
        </div>

        {/* Workspace layout split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch" id="map-grid">
          
          {/* Map canvas view (8 cols) */}
          <div className="lg:col-span-8 bg-slate-900/60 rounded-3xl p-4 border border-slate-800 relative flex flex-col min-h-[400px] overflow-hidden" id="map-panel">
            
            {/* Top map menu */}
            <div className="flex items-center justify-between mb-4 z-20 px-2" id="map-panel-header">
              <div className="flex items-center gap-2 text-slate-300 text-xs">
                <Map className="w-4 h-4 text-emerald-400" />
                <span>Régimen Hidrológico: <strong>Estable (Prefectura Naval)</strong></span>
              </div>
              <button
                onClick={handleReset}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700 pointer-events-auto"
                id="btn-reset-route"
              >
                <RefreshCw className="w-3 h-3" />
                Reiniciar Trazado
              </button>
            </div>

            {/* Vector Map Canvas */}
            <div className="relative flex-1 bg-[#091523] rounded-2xl min-h-[300px] border border-slate-800 flex items-center justify-center p-1" id="vector-canvas-container">
              
              {/* Decorative Compass Rose */}
              <div className="absolute top-6 right-6 opacity-20 pointer-events-none select-none" id="compass-rose">
                <svg className="w-16 h-16 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,2L14.5,9H22L16,13.5L18.5,21L12,16.5L5.5,21L8,13.5L2,9H9.5L12,2Z" />
                </svg>
              </div>

              {/* Water grid overlays */}
              <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-30 select-none pointer-events-none" />

              {/* Simulated Argentine River Flow Lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1000 400" preserveAspectRatio="none">
                {/* Paraná River Deep Channel */}
                <path
                  d="M 50,180 C 250,50 450,300 650,150 C 780,50 900,100 950,220"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="6"
                  strokeOpacity="0.25"
                  strokeLinecap="round"
                  strokeDasharray="10 5"
                />
                
                {/* Shallow Arroyos / Wetland systems */}
                <path
                  d="M 120,150 Q 280,80 410,120 T 580,190 T 740,220 T 880,280"
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="8"
                  strokeOpacity="0.4"
                  strokeLinecap="round"
                />

                {/* Drawn active routes path highlight */}
                {selectedPoints.length > 1 && (
                  <path
                    d={`M ${selectedPoints.map((p) => `${p.x},${p.y}`).join(' L ')}`}
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="animate-pulse"
                  />
                )}
              </svg>

              {/* Render clickable landmarks as Pins */}
              {landmarks.map((landmark) => {
                const isSelected = selectedPoints.some((p) => p.id === landmark.id);
                const order = selectedPoints.findIndex((p) => p.id === landmark.id);

                return (
                  <button
                    key={landmark.id}
                    onClick={() => handleSelectPoint(landmark)}
                    onMouseEnter={() => setActiveHover(landmark)}
                    onMouseLeave={() => setActiveHover(null)}
                    style={{
                      position: 'absolute',
                      left: `${landmark.x / 10}%`,
                      top: `${landmark.y / 4}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    className={`group absolute z-30 flex flex-col items-center cursor-pointer p-1 focus:outline-none transition-transform duration-200 hover:scale-110`}
                    id={`landmark-pin-${landmark.id}`}
                  >
                    {/* Pulsing indicator */}
                    <div className="relative flex items-center justify-center">
                      {isSelected && (
                        <div className="absolute w-8 h-8 rounded-full bg-emerald-500/30 animate-ping" />
                      )}
                      
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 shadow-lg transition-colors ${
                        isSelected
                          ? 'bg-emerald-500 border-white text-slate-900 font-bold text-xs'
                          : 'bg-slate-900 border-slate-700 text-slate-300 group-hover:border-emerald-400 group-hover:text-emerald-400'
                      }`}>
                        {isSelected ? (
                          order + 1
                        ) : (
                          <MapPin className="w-3.5 h-3.5" />
                        )}
                      </div>
                    </div>

                    {/* Pop-up labels */}
                    <div className="mt-1 px-2 py-0.5 rounded bg-slate-900/90 border border-slate-800 text-[10px] font-semibold text-slate-200 group-hover:text-emerald-400 truncate max-w-[120px] transition-colors select-none">
                      {landmark.name}
                    </div>
                  </button>
                );
              })}

              {/* Hover informational detail layer */}
              {activeHover && (
                <div className="absolute bottom-4 left-4 bg-slate-900/95 border border-slate-800 px-4 py-2 text-left rounded-xl max-w-xs z-50 pointer-events-none shadow-xl select-none" id="hover-landmark-tooltip">
                  <p className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-emerald-400" />
                    {activeHover.name}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                    {activeHover.desc}
                  </p>
                </div>
              )}

            </div>

            {/* Note legend */}
            <p className="text-[11px] text-slate-400 text-left mt-3 px-1 leading-snug">
              💡 <strong>¿Cómo usar?</strong> Hacé clic en 2 o más hitos para diagramar un itinerario de viaje. Podés agregar hasta 3 puntos secuenciales.
            </p>
          </div>

          {/* Calculator Info sidebar panel (4 cols) */}
          <div className="lg:col-span-4 bg-slate-900 rounded-3xl p-6 border border-slate-800 flex flex-col justify-between text-left" id="calculator-panel">
            <div>
              <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                <Navigation className="w-5 h-5 text-emerald-400" />
                Resumen de Travesía
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-6 border-b border-slate-850 pb-4">
                El recorrido medido sobre el cauce seguro del Delta argentino sirve para disparar las ofertas manuales de nuestros capitanes regulados.
              </p>

              {/* Coordinates list */}
              <div className="space-y-4 mb-6" id="selected-points-flow">
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Itinerario Náutico</p>
                
                {selectedPoints.map((point, index) => (
                  <div key={point.id} className="flex gap-3 items-start relative select-none">
                    {/* Circle timeline */}
                    <div className="flex flex-col items-center">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                        {index + 1}
                      </div>
                      {index < selectedPoints.length - 1 && (
                        <div className="w-0.5 h-10 bg-slate-800 mt-1" />
                      )}
                    </div>
                    {/* Info */}
                    <div className="text-left mt-0.5">
                      <p className="text-xs font-semibold text-white">{point.name}</p>
                      <p className="text-[10px] text-slate-400">{point.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live computed specifications block */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 mb-6" id="computed-metrics">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-left select-none">
                  <p className="text-[10px] uppercase text-slate-400 tracking-wider">Distancia</p>
                  <p className="text-2xl font-bold text-emerald-400">{distanceKm} km</p>
                </div>
                <div className="text-left select-none">
                  <p className="text-[10px] uppercase text-slate-400 tracking-wider">Est. Navegación</p>
                  <p className="text-2xl font-bold text-sky-400">{hours} hs</p>
                </div>
              </div>
              
              <div className="pt-3 border-t border-slate-850 text-[10px] text-slate-400 flex items-center gap-1.5 mt-3">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span>Velocidad crucero estándar: 22 nudos</span>
              </div>
            </div>

            {/* Price-vanguard warnings */}
            <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-850/60 text-xs text-slate-300 leading-snug" id="no-pricing-disclaimer">
              🛡️ <strong>Sin Tarifas Clavadas:</strong> Fomentamos el libre mercado de los guías. No imponemos precios artificiales automaticos. Vos enviás la ruta y cada Capitán te cotiza manualmente considerando carnadas e insumos.
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
