/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Anchor, ShieldCheck, HelpCircle, LayoutGrid, Calendar, Wallet, FileCheck, Phone, Check, Bell, AlertTriangle } from 'lucide-react';

export const CaptainDashboard: React.FC = () => {
  const [cotizacionPrecio, setCotizacionPrecio] = useState<number>(180000);
  const [incluyeCarnada, setIncluyeCarnada] = useState<boolean>(true);
  const [incluyeAsado, setIncluyeAsado] = useState<boolean>(false);
  const [incluyeBebidas, setIncluyeBebidas] = useState<boolean>(true);
  const [statusText, setStatusText] = useState<'idle' | 'sending' | 'sent'>('idle');

  const alerts = [
    { id: 'a1', hiker: 'Sebastian B.', route: 'Tigre -> Bajos del Temor', passengers: 3, date: 'Sáb 13/06' },
  ];

  const handleSendQuote = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusText('sending');
    setTimeout(() => {
      setStatusText('sent');
    }, 1500);
  };

  const currentDocs = [
    { name: 'Licencia de Timonel (PNA)', status: 'Vigente', class: 'bg-emerald-500/10 text-emerald-400' },
    { name: 'Matrícula de Embarcación', status: 'Habilitada', class: 'bg-emerald-500/10 text-emerald-400' },
    { name: 'Seguro de Responsabilidad Civil', status: 'Vence en 12 días', class: 'bg-amber-500/10 text-amber-400' },
    { name: 'Elementos de Seguridad', status: 'Verificado', class: 'bg-emerald-500/10 text-emerald-400' },
  ];

  const [sosActive, setSosActive] = useState(false);

  return (
    <div className="py-24 bg-[#030d1a] border-b border-slate-900" id="captain-dashboard-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="max-w-3xl mx-auto text-center mb-16" id="cap-dash-header">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-500/10 text-sky-400 text-xs font-semibold rounded-full border border-sky-500/20 mb-4 uppercase">
            <Anchor className="w-3.5 h-3.5" />
            <span>Perfil Profesional</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 text-white">
            Panel de Control del Capitán
          </h2>
          <p className="text-slate-300 text-lg font-light leading-relaxed">
            Diseñamos un cockpit naval intuitivo y robusto. Los capitanes tienen acceso completo a solicitudes locales, cotizaciones detalladas y herramientas de seguridad integradas con Prefectura Naval.
          </p>
        </div>

        {/* Dashboard Frame Mockup */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch" id="cap-dash-body">
          
          {/* Main Workspace Left Side: Active Bids & Form (7 cols) */}
          <div className="lg:col-span-7 bg-slate-900 rounded-3xl p-6 border border-slate-800 flex flex-col justify-between" id="cap-workspace">
            
            <div id="cap-current-alert">
              <div className="flex justify-between items-center border-b border-slate-840 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Solicitud Activa Recibida</h4>
                </div>
                <span className="text-xs bg-slate-800 border border-slate-700 text-slate-400 px-2 py-1 rounded">Rosario Delta</span>
              </div>

              {/* Passenger Request Highlight */}
              {alerts.map((al) => (
                <div key={al.id} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="text-left">
                    <p className="text-xs text-slate-500 uppercase tracking-widest leading-none">Pescador Solicitante</p>
                    <p className="text-lg font-bold text-white mt-1">{al.hiker}</p>
                    <p className="text-xs text-emerald-400 mt-1">🌿 Busca pescar Dorados en bajíos</p>
                  </div>
                  
                  <div className="text-left space-y-1">
                    <p className="text-xs text-slate-400"><strong>Trayecto:</strong> {al.route}</p>
                    <p className="text-xs text-slate-400"><strong>Pasajeros:</strong> {al.passengers} pescadores</p>
                    <p className="text-xs text-slate-400"><strong>Fecha sugerida:</strong> {al.date} (Todo el día)</p>
                  </div>
                </div>
              ))}

              {/* Form Quote Setup */}
              <form onSubmit={handleSendQuote} className="space-y-5" id="cap-quote-form">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide text-left">Armar mi Propuesta de Viaje</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="text-left">
                    <label className="block text-xs text-slate-400 font-semibold mb-2">Valor Total Estimado ($ ARS)</label>
                    <input
                      type="number"
                      value={cotizacionPrecio}
                      onChange={(e) => setCotizacionPrecio(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
                    />
                  </div>
                  <div className="text-left">
                    <label className="block text-xs text-slate-400 font-semibold mb-2">Duración Combinada</label>
                    <select className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-4 py-3 text-sm text-slate-300 focus:outline-none">
                      <option>Media Jornada (5 horas)</option>
                      <option>Jornada Completa (9 horas)</option>
                      <option>Doble Turno c/ Acampe overnight</option>
                    </select>
                  </div>
                </div>

                {/* Checklist options */}
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setIncluyeCarnada(!incluyeCarnada)}
                    className={`py-2 px-3 border rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      incluyeCarnada
                        ? 'bg-sky-500/10 border-sky-500 text-sky-400'
                        : 'bg-slate-950 border-slate-800 text-slate-500'
                    }`}
                  >
                    🥩 Carnada Viva
                  </button>
                  <button
                    type="button"
                    onClick={() => setIncluyeAsado(!incluyeAsado)}
                    className={`py-2 px-3 border rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      incluyeAsado
                        ? 'bg-sky-500/10 border-sky-500 text-sky-400'
                        : 'bg-slate-950 border-slate-800 text-slate-500'
                    }`}
                  >
                    🔥 Almuerzo/Asado
                  </button>
                  <button
                    type="button"
                    onClick={() => setIncluyeBebidas(!incluyeBebidas)}
                    className={`py-2 px-3 border rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      incluyeBebidas
                        ? 'bg-sky-500/10 border-sky-500 text-sky-400'
                        : 'bg-slate-950 border-slate-800 text-slate-500'
                    }`}
                  >
                    🍺 Bebidas e Hielo
                  </button>
                </div>

                {/* Send Button */}
                <div className="pt-2">
                  {statusText === 'idle' && (
                    <button
                      type="submit"
                      className="w-full py-4 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl shadow-lg transition-transform hover:scale-[1.01] active:scale-95 cursor-pointer"
                    >
                      Enviar Cotización Manual
                    </button>
                  )}
                  {statusText === 'sending' && (
                    <div className="w-full py-4 bg-slate-800 text-center text-slate-300 font-bold rounded-xl animate-pulse">
                      Firmando propuesta digitalmente...
                    </div>
                  )}
                  {statusText === 'sent' && (
                    <div className="w-full py-4 bg-emerald-600 text-center text-white font-bold rounded-xl flex items-center justify-center gap-2">
                      <Check className="w-5 h-5" />
                      <span>¡Cotización enviada al Pescador!</span>
                    </div>
                  )}
                </div>
              </form>
            </div>

            {/* Simulated footer inside column */}
            <div className="mt-8 border-t border-slate-800/80 pt-4 flex justify-between text-slate-500 text-[11px] font-sans" id="cap-footer">
              <span>Habilitado por El Guía Ya y Prefectura</span>
              <span>Comisión de Servicio: 10% retenido al cobro</span>
            </div>
          </div>

          {/* Sidebar right: Documentation & Income panel (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6" id="cap-sidebar">
            
            {/* Income Card */}
            <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 text-left relative overflow-hidden" id="cap-income-card">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl" id="income-glow" />
              
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs uppercase text-slate-400 tracking-wider font-semibold">Mis Ganancias Acumuladas</span>
                <Wallet className="w-5 h-5 text-emerald-400" />
              </div>
              <h4 className="text-3xl font-extrabold text-white font-sans">$342.800 <span className="text-xs text-emerald-400 font-bold font-sans">ARS</span></h4>
              
              <div className="flex justify-between items-center mt-3 text-xs border-t border-slate-850 pt-3">
                <span className="text-slate-400">Próxima liquidación:</span>
                <span className="font-bold text-white">Quincena (Mier 10/06)</span>
              </div>
            </div>

            {/* Documentation Checklist */}
            <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 text-left flex-1" id="cap-docs-card">
              <div className="flex justify-between items-center mb-4">
                <h5 className="font-bold text-white text-sm uppercase tracking-wider">Documentación y Habilitaciones</h5>
                <FileCheck className="w-5 h-5 text-sky-400" />
              </div>

              <div className="space-y-3" id="docs-list">
                {currentDocs.map((doc, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-slate-950 rounded-xl border border-slate-800/80">
                    <span className="text-xs text-slate-300 font-medium">{doc.name}</span>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${doc.class}`}>{doc.status}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Red panic button SOS Prefectura */}
            <div className={`p-5 rounded-3xl border text-left transition-all duration-300 ${
              sosActive
                ? 'bg-rose-950/90 border-rose-500 shadow-2xl shadow-rose-950'
                : 'bg-slate-900 border-slate-800'
            }`} id="cap-sos-panel">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer border ${
                  sosActive
                    ? 'bg-rose-600 text-white animate-bounce border-white'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-500 hover:bg-rose-600 hover:text-white'
                }`}
                onClick={() => setSosActive(!sosActive)}
                id="btn-click-sos"
                >
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-extrabold text-slate-100 uppercase tracking-wide">Botón Antipánico SOS</p>
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Sincronización radial instantánea de geolocalización con el canal 16 VHF de la **Prefectura Naval Argentina** ante emergencias reales.
                  </p>
                  {sosActive && (
                    <div className="mt-3 p-2 bg-rose-600/20 rounded-xl border border-rose-500 inline-flex items-center gap-2 text-xs text-rose-300 animate-pulse">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Alerta Prefectura activada en tus coordenadas</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
