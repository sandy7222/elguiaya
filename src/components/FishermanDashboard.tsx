/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Bid } from '../types';
import { Ship, Search, MessageSquare, ShieldCheck, HelpCircle, User, Star, MapPin, Coffee, Volume2 } from 'lucide-react';

export const FishermanDashboard: React.FC = () => {
  const [selectedSpecies, setSelectedSpecies] = useState<'Dorado' | 'Surubí' | 'Pejerrey' | 'Bogá'>('Dorado');
  const [passengers, setPassengers] = useState<number>(3);
  const [riverZone, setRiverZone] = useState<string>('Paraná Medio (Confluencia)');
  
  // Status states: 'idle' | 'searching' | 'reviewing' | 'received'
  const [searchingState, setSearchingState] = useState<'idle' | 'searching' | 'reviewing' | 'received'>('idle');
  const [activeBids, setActiveBids] = useState<Bid[]>([]);
  const [acceptedBidId, setAcceptedBidId] = useState<string | null>(null);

  const mockIncomingBids: Bid[] = [
    {
      id: 'bid-1',
      captainName: 'Capitán Horacio',
      rating: 4.9,
      avatar: 'H',
      boatName: 'El Cacique del Río',
      model: 'Bermuda Sport 190 + Yamaha 115HP',
      price: 165000,
      durationHours: 8,
      distanceKm: 32,
      included: ['Carnadas vivas premium', 'Equipos de pesca (cañas rotativas)', 'Combustible incluido'],
      status: 'pending'
    },
    {
      id: 'bid-2',
      captainName: 'Guía Raúl "Piraña"',
      rating: 4.8,
      avatar: 'R',
      boatName: 'La Mulita',
      model: 'Tracker Astillero Tech 540 + Mercury 60HP',
      price: 135000,
      durationHours: 6,
      distanceKm: 26,
      included: ['Carnadas vivas de estación', 'Conservadora con hielo y agua', 'Licencia fluvial diaria provisoria'],
      status: 'pending'
    }
  ];

  const handleSearchTrip = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchingState('searching');
    setActiveBids([]);
    setAcceptedBidId(null);
  };

  // State machine simulation triggers
  useEffect(() => {
    if (searchingState === 'searching') {
      const timer = setTimeout(() => {
        setSearchingState('reviewing');
      }, 3000);
      return () => clearTimeout(timer);
    }
    if (searchingState === 'reviewing') {
      const timer = setTimeout(() => {
        setSearchingState('received');
        setActiveBids(mockIncomingBids);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [searchingState]);

  const handleAcceptBid = (bidId: string) => {
    setAcceptedBidId(bidId);
    setActiveBids((prev) =>
      prev.map((b) => (b.id === bidId ? { ...b, status: 'accepted' } : { ...b, status: 'rejected' }))
    );
  };

  return (
    <div className="py-24 bg-[#051221] text-white border-b border-slate-900" id="fisherman-dashboard-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16" id="fish-dash-header">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-semibold rounded-full border border-emerald-500/20 mb-4 uppercase select-none">
            <Ship className="w-3.5 h-3.5" />
            <span>Zona Pescadores</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 text-white">
            Experiencia del Pescador
          </h2>
          <p className="text-slate-300 text-lg font-light leading-relaxed">
            Sin intermediarios ni sorpresas de precios flotantes. Planificá gratis, informá las características de tus acompañantes y esperá que los capitanes te ofrezcan propuestas personalizadas en tiempo real.
          </p>
        </div>

        {/* 50% split window frame layout with custom styling */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-12 min-h-[580px]" id="fish-split-view">
          
          {/* Left panel: Simulated split screen map visualization (50%/6 cols) */}
          <div className="lg:col-span-6 bg-[#040e19] border-r border-slate-800 p-6 flex flex-col justify-between relative" id="split-screen-left">
            
            {/* Visual satellite design backdrop */}
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none select-none z-0" />

            <div className="z-10 text-left">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                  Eco-Sensor Paraná Activo
                </span>
                <span className="text-[10px] text-slate-500">Mareas estables</span>
              </div>

              {/* Vector representation of selected target fishing hotspots */}
              <div className="bg-slate-950 rounded-2xl border border-slate-800/80 p-4 h-64 relative overflow-hidden mb-6 flex items-center justify-center shadow-inner" id="fish-sensormap">
                <svg className="absolute inset-0 w-full h-full opacity-60" viewBox="0 0 400 240">
                  {/* Argentine riverbed path */}
                  <path d="M -20,100 C 150,50 200,180 420,100 L 420,240 L -20,240 Z" fill="#0c1d30" />
                  <path d="M -20,100 C 150,50 200,180 420,100" fill="none" stroke="#22c55e" strokeWidth="3" strokeDasharray="6 4" opacity="0.4" />
                  
                  {/* Selected target zone pin coordinates */}
                  <circle cx="210" cy="110" r="28" fill="#10b981" fillOpacity="0.1" stroke="#10b981" strokeWidth="1" className="animate-pulse" />
                  <circle cx="210" cy="110" r="4" fill="#10b981" />
                  
                  <text x="210" y="95" textAnchor="middle" fill="#22c55e" fontSize="9" fontWeight="bold">Hotspot: {selectedSpecies}</text>
                  <text x="210" y="130" textAnchor="middle" fill="#64748b" fontSize="8">Delta Medio · Estación Prefectura</text>
                </svg>

                {/* Floating GPS card info */}
                <div className="absolute top-4 right-4 bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-left text-[10px]" id="split-gps-overlay">
                  <p className="font-bold text-white mb-0.5">COORD GPS</p>
                  <p className="text-emerald-400">Lat: 32.9602 S</p>
                  <p className="text-emerald-400">Long: 60.6273 W</p>
                </div>
              </div>

              {/* Live status bar carousel */}
              <div className="space-y-3" id="state-carousel-indicators">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Flujo de Cotización de Capitanes</p>
                
                <div className="grid grid-cols-3 gap-2 text-center" id="carousel-states-panel">
                  {/* State 1: Esperando respuesta */}
                  <div className={`p-2.5 rounded-xl border text-[11px] font-bold transition-all ${
                    searchingState === 'searching'
                      ? 'bg-amber-600/10 border-amber-500 text-amber-400 scale-[1.02]'
                      : 'bg-slate-950 border-slate-850 text-slate-500'
                  }`} id="state-searching">
                    ⌛ Esperando
                  </div>

                  {/* State 2: Capitán revisando */}
                  <div className={`p-2.5 rounded-xl border text-[11px] font-bold transition-all ${
                    searchingState === 'reviewing'
                      ? 'bg-sky-600/10 border-sky-500 text-sky-400 scale-[1.02]'
                      : 'bg-slate-950 border-slate-850 text-slate-500'
                  }`} id="state-reviewing">
                    🧐 Calibrando
                  </div>

                  {/* State 3: Cotización recibida */}
                  <div className={`p-2.5 rounded-xl border text-[11px] font-bold transition-all ${
                    searchingState === 'received'
                      ? 'bg-emerald-600/10 border-emerald-500 text-emerald-400 scale-[1.02]'
                      : 'bg-slate-950 border-slate-850 text-slate-500'
                  }`} id="state-received">
                    ✉️ Propuestas listadas
                  </div>
                </div>
              </div>
            </div>

            {/* Simulated river note footprint */}
            <div className="mt-6 border-t border-slate-800/60 pt-4 text-xs text-slate-400 flex items-center gap-2 z-10 text-left" id="river-footnote">
              <span>🌾</span>
              <p>Optimizados para embarcaciones de pescadores deportivos calificados por la Prefectura Naval de Argentina.</p>
            </div>
          </div>

          {/* Right panel: Active Request Form & Response List (50%/6 cols) */}
          <div className="lg:col-span-6 bg-[#040c17] p-6 flex flex-col justify-between text-left" id="split-screen-right">
            
            {/* If IDLE, show form */}
            {searchingState === 'idle' && (
              <div id="fish-idle-form">
                <div className="mb-6">
                  <h4 className="text-xl font-bold text-white mb-2">Solicitar una Embarcación</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Elegí tu puerto de partida, especie buscada y cantidad de acompañantes. Te conectamos gratis en minutos.
                  </p>
                </div>

                <form onSubmit={handleSearchTrip} className="space-y-4" id="fish-request-form">
                  {/* Species targeting */}
                  <div>
                    <label className="block text-xs text-slate-300 font-semibold mb-2">Especie de Pesca a Buscar</label>
                    <div className="grid grid-cols-4 gap-2">
                      {(['Dorado', 'Surubí', 'Pejerrey', 'Bogá'] as const).map((specie) => (
                        <button
                          key={specie}
                          type="button"
                          onClick={() => setSelectedSpecies(specie)}
                          className={`py-2 px-1 text-center font-bold text-[11px] border rounded-lg transition-all cursor-pointer ${
                            selectedSpecies === specie
                              ? 'bg-emerald-600 border-white text-white shadow-lg'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {specie === 'Dorado' ? '🐟 Dorado' : specie === 'Surubí' ? '🦈 Surubí' : specie === 'Pejerrey' ? '🐠 Peje' : '🐡 Boga'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* River zone selecting */}
                  <div>
                    <label className="block text-xs text-slate-300 font-semibold mb-2">Zona de Embarco</label>
                    <select
                      value={riverZone}
                      onChange={(e) => setRiverZone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-3 text-xs text-slate-300 focus:outline-none"
                    >
                      <option>Paraná Medio (Esquina / Goya)</option>
                      <option>Tigre / Delta Superior (Río Luján)</option>
                      <option>Rosario / Victoria (Isla Charigüé)</option>
                      <option>Laguna de Gómez (Junín)</option>
                      <option>Laguna La Salada Grande (Madariaga)</option>
                    </select>
                  </div>

                  {/* Passengers selecting */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-300 font-semibold mb-2">Acompañantes total</label>
                      <select
                        value={passengers}
                        onChange={(e) => setPassengers(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-3 text-xs text-slate-300 focus:outline-none"
                      >
                        <option value={1}>Solo yo (1 pescante)</option>
                        <option value={2}>2 pescadores</option>
                        <option value={3}>3 pescadores</option>
                        <option value={4}>4 pescadores</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-300 font-semibold mb-2">Método de Pesca</label>
                      <select className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-3 text-xs text-slate-300 focus:outline-none">
                        <option>Variada con carnada</option>
                        <option>Trolling / Baitcasting artificial</option>
                        <option>Pesca con mosca (Fly cast)</option>
                        <option>Paseo de avistamiento</option>
                      </select>
                    </div>
                  </div>

                  {/* Submit search */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition-transform hover:scale-[1.01] active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                      id="btn-trigger-search"
                    >
                      <Search className="w-4.5 h-4.5" />
                      Pedir Cotizaciones de Capitanes
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* If SEARCHING / REVIEWING, show loading screen */}
            {(searchingState === 'searching' || searchingState === 'reviewing') && (
              <div className="flex-1 flex flex-col justify-center items-center py-12 text-center" id="search-progress-view">
                <SpinnerWater waveColor={searchingState === 'searching' ? 'border-amber-500' : 'border-sky-500'} />
                
                <h4 className="text-lg font-bold text-white mb-2 mt-6">
                  {searchingState === 'searching' ? 'Esperando Respuesta...' : 'Capitanes de la Zona analizan tu Ruta...'}
                </h4>
                <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                  {searchingState === 'searching' 
                    ? 'Estamos emitiendo tu Itinerario de navegación al radar de los guías locales en el río Paraná.'
                    : 'La lancha "Sandy Borrego" y 2 especialistas están calculando tu bid según la profundidad y carnada viva.'
                  }
                </p>

                <div className="mt-8 bg-slate-950/80 border border-slate-850 p-4 rounded-2xl w-full text-left max-w-xs">
                  <p className="text-[10px] uppercase text-slate-500 font-bold">Datos en firme:</p>
                  <p className="text-xs text-white mt-1">🎯 <strong>Objetivo:</strong> {selectedSpecies}</p>
                  <p className="text-xs text-white">📍 <strong>Partida:</strong> {riverZone}</p>
                </div>
              </div>
            )}

            {/* If RECEIVED bids, show incoming bids list comparison */}
            {searchingState === 'received' && (
              <div className="flex-1 flex flex-col justify-between h-full" id="search-results-received">
                
                {/* Active results title */}
                <div className="mb-4">
                  <h4 className="text-lg font-bold text-white">¡Propuestas Recibidas!</h4>
                  <p className="text-xs text-slate-400">
                    Revisá el equipamiento habilitado y aceptá seguro con Mercado Pago.
                  </p>
                </div>

                {/* Received bids list slider overlay */}
                <div className="space-y-4 max-h-[360px] overflow-y-auto scrollbar-thin pr-1 flex-1" id="received-bids-scroller">
                  {activeBids.map((bid) => {
                    const isAccepted = bid.status === 'accepted';
                    const isRejected = bid.status === 'rejected';

                    return (
                      <div
                        key={bid.id}
                        className={`p-4 rounded-2xl border transition-all text-left relative ${
                          isAccepted
                            ? 'bg-emerald-950/40 border-emerald-500 shadow-xl'
                            : isRejected
                            ? 'bg-slate-950/30 border-slate-900 opacity-45'
                            : 'bg-slate-950 border-slate-800 hover:border-emerald-500/30'
                        }`}
                        id={`fisherman-bid-${bid.id}`}
                      >
                        {/* Rating row */}
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-100 flex items-center justify-center font-bold text-xs border border-emerald-500">
                              {bid.avatar}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-white">{bid.captainName}</p>
                              <p className="text-[10px] text-yellow-400 flex items-center gap-0.5">
                                <Star className="w-3 h-3 fill-yellow-400" />
                                {bid.rating} · Capitán Verificado
                              </p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-[10px] text-slate-400">Precio manual final</p>
                            <p className="text-sm font-extrabold text-emerald-400">${bid.price.toLocaleString('es-AR')}</p>
                          </div>
                        </div>

                        {/* Middle specific boat data */}
                        <div className="my-2.5 p-2 bg-slate-900/60 rounded-xl text-[11px] text-slate-300 space-y-1">
                          <p>⛵ <strong>Embarcación:</strong> {bid.boatName} ({bid.model})</p>
                          <p>⏱️ <strong>Duración:</strong> {bid.durationHours} horas de excursión</p>
                        </div>

                        <div className="text-[10px] text-slate-400 flex flex-wrap gap-x-2.5 gap-y-1 mb-3">
                          {bid.included.map((inc, index) => (
                            <span key={index} className="text-[10px] text-slate-400 inline-block">✓ {inc}</span>
                          ))}
                        </div>

                        {/* Accept Button action state */}
                        {!isAccepted && !isRejected && (
                          <button
                            onClick={() => handleAcceptBid(bid.id)}
                            className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs tracking-wide transition-all cursor-pointer text-center"
                            id={`btn-accept-bid-${bid.id}`}
                          >
                            Aceptar y Reservar con Mercado Pago
                          </button>
                        )}
                        {isAccepted && (
                          <div className="w-full py-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-bold border border-emerald-500 text-center flex items-center justify-center gap-1.5 select-none animate-pulse">
                            <ShieldCheck className="w-4 h-4" />
                            <span>¡Pago asegurado con Mercado Pago!</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Reset button to retry search */}
                <button
                  onClick={() => setSearchingState('idle')}
                  className="mt-4 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer block text-center underline"
                  id="btn-retry-exploration"
                >
                  Volver a configurar itinerario
                </button>

              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};

// Internal wave animation visual indicator
const SpinnerWater: React.FC<{ waveColor: string }> = ({ waveColor }) => {
  return (
    <div className="relative flex items-center justify-center w-20 h-20" id="spinner-waves">
      <div className={`absolute w-full h-full rounded-full border-4 border-t-transparent ${waveColor} animate-spin`} />
      <div className="absolute w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
        <span className="text-xl">🛶</span>
      </div>
    </div>
  );
};
