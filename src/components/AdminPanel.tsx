/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LayoutGrid, Map, Users, CircleDollarSign, ShieldAlert, BarChart3, ArrowDownRight, ArrowUpRight } from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const [activeReport, setActiveReport] = useState<'all' | 'financial' | 'documentation'>('all');

  const pendingDocs = [
    { captain: 'Roberto F.', boat: 'Paranacito II', doc: 'Seguro de Responsabilidad RC', age: 'Vence mañana' },
    { captain: 'Mateo L.', boat: 'Lagunera III', doc: 'Matrícula de Embarcación', age: 'Hace 2 días' },
  ];

  const adminTrips = [
    { id: 't-105', fisherman: 'Hernán G.', captain: 'Cap. Horacio', zone: 'Rosario Delta', fee: 16500, state: 'Navegando' },
    { id: 't-106', fisherman: 'Esteban M.', captain: 'Guía Raúl', zone: 'Laguna Chascomús', fee: 13500, state: 'Fin de Viaje' },
    { id: 't-107', fisherman: 'Lucas J.', captain: 'Hugo B.', zone: 'Bajos del Temor', fee: 18000, state: 'Esperando Pago' },
  ];

  return (
    <div className="py-24 bg-[#05111d] border-b border-slate-900" id="admin-panel-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Title */}
        <div className="max-w-3xl mx-auto text-center mb-16" id="admin-header">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/10 text-yellow-400 text-xs font-semibold rounded-full border border-yellow-500/20 mb-4 uppercase select-none">
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Operaciones de Control</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 text-white">
            Panel del Administrador (Backoffice)
          </h2>
          <p className="text-slate-300 text-lg font-light leading-relaxed">
            Una central operativa transparente para supervisar las regulaciones marítimas, la facturación directa y las comisiones cruzadas por los viajes de pesca en todo el territorio argentino.
          </p>
        </div>

        {/* Dashboard visual frame */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch" id="admin-grid-layout">
          
          {/* Key Metrics Widgets (Left side - 4 cols / 3 rows) */}
          <div className="lg:col-span-4 flex flex-col gap-6" id="admin-sidebar-stats">
            
            {/* Metric 1 */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 text-left select-none relative overflow-hidden">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs text-slate-400 font-bold uppercase">Viajes en curso (Vivo)</span>
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
              </div>
              <div className="flex bg-slate-950 p-2.5 rounded-xl justify-between items-center">
                <p className="text-3xl font-extrabold text-white">24</p>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <ArrowUpRight className="w-3" /> +12% vs ayer
                </span>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 text-left select-none relative overflow-hidden">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs text-slate-400 font-bold uppercase">Comisiones acumuladas (10%)</span>
                <CircleDollarSign className="w-4.5 h-4.5 text-yellow-500" />
              </div>
              <div className="flex bg-slate-950 p-2.5 rounded-xl justify-between items-center">
                <p className="text-2xl font-extrabold text-white">$218.400 <span className="text-xs text-slate-400">ARS</span></p>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold">Líquido</span>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 text-left select-none">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs text-slate-400 font-bold uppercase">Capitanes Verificados</span>
                <Users className="w-4.5 h-4.5 text-blue-400" />
              </div>
              <div className="flex bg-slate-950 p-2.5 rounded-xl justify-between items-center">
                <p className="text-3xl font-extrabold text-white">154</p>
                <p className="text-[10px] text-slate-400 uppercase">9 puertos autorizados</p>
              </div>
            </div>

          </div>

          {/* Core Operations Center (Right side - 8 cols) */}
          <div className="lg:col-span-8 bg-slate-900 rounded-2xl p-6 border border-slate-800 flex flex-col justify-between text-left" id="admin-operations-desk">
            
            <div id="admin-workspace-inner">
              
              {/* Category tabs */}
              <div className="flex border-b border-slate-850 pb-4 mb-6 gap-4" id="admin-tab-row">
                <button
                  onClick={() => setActiveReport('all')}
                  className={`text-xs font-bold uppercase transition-colors cursor-pointer ${
                    activeReport === 'all' ? 'text-amber-400 border-b-2 border-amber-400 pb-1' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  📡 Tránsito Activo
                </button>
                <button
                  onClick={() => setActiveReport('documentation')}
                  className={`text-xs font-bold uppercase transition-colors cursor-pointer ${
                    activeReport === 'documentation' ? 'text-amber-400 border-b-2 border-amber-400 pb-1' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🗄️ Habilitaciones Vencidas ({pendingDocs.length})
                </button>
              </div>

              {/* Render Tab Content */}
              {activeReport === 'all' && (
                <div className="space-y-4" id="report-transit-tab">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Monitoreo de Expediciones de Pesca en vivo</p>
                  
                  <div className="overflow-x-auto" id="admin-table">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-500 text-[10px] font-bold uppercase">
                          <th className="pb-3 pr-2">ID Viaje</th>
                          <th className="pb-3 pr-2">Pescador</th>
                          <th className="pb-3 pr-2">Capitán</th>
                          <th className="pb-3 pr-2">Ubicación</th>
                          <th className="pb-3 pr-2">Comisión YA</th>
                          <th className="pb-3">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs text-slate-300 divide-y divide-slate-850">
                        {adminTrips.map((entry) => (
                          <tr key={entry.id} className="hover:bg-slate-950/40">
                            <td className="py-3 font-mono text-slate-400">{entry.id}</td>
                            <td className="py-3 font-semibold text-white">{entry.fisherman}</td>
                            <td className="py-3">{entry.captain}</td>
                            <td className="py-3 text-slate-400">{entry.zone}</td>
                            <td className="py-3 font-bold text-emerald-400">${entry.fee.toLocaleString()}</td>
                            <td className="py-3">
                              <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                entry.state === 'Navegando' 
                                  ? 'bg-emerald-500/10 text-emerald-400 animate-pulse' 
                                  : entry.state === 'Fin de Viaje'
                                  ? 'bg-blue-500/10 text-blue-400' 
                                  : 'bg-amber-500/10 text-amber-400'
                              }`}>
                                {entry.state}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Visual SVG mini timeline representation of earnings */}
                  <div className="mt-8 bg-slate-950 p-4 rounded-xl border border-slate-8000" id="admin-mini-graph">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-3 flex items-center gap-1.5">
                      <BarChart3 className="w-3.5 h-3.5 text-amber-500" />
                      Proyección de comisiones mensuales (Plataforma)
                    </p>
                    
                    {/* SVG Curve chart */}
                    <svg className="w-full h-16 text-emerald-500 mt-2" viewBox="0 0 400 60" preserveAspectRatio="none">
                      <path
                        d="M 0,55 Q 80,45 160,25 T 320,10 T 400,15"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />
                      <circle cx="320" cy="10" r="4" fill="#fbbf24" />
                      <circle cx="160" cy="25" r="4" fill="#fbbf24" />
                    </svg>
                    
                    <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-1">
                      <span>Semana 1</span>
                      <span>Semana 2 (Crecida)</span>
                      <span>Semana 3</span>
                      <span>Hoy</span>
                    </div>
                  </div>

                </div>
              )}

              {activeReport === 'documentation' && (
                <div className="space-y-4" id="report-docs-tab">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Habilitaciones en Alerta Fuerte (Prefectura Naval)</p>
                  
                  <div className="space-y-3">
                    {pendingDocs.map((doc, i) => (
                      <div key={i} className="p-4 bg-slate-950 rounded-xl border border-slate-850 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="text-left">
                          <p className="text-xs font-bold text-white">{doc.captain} ({doc.boat})</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">Habilitación requerida: <u>{doc.doc}</u></p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 font-bold uppercase">{doc.age}</span>
                          <button className="text-[10px] bg-slate-800 hover:bg-slate-700 text-white font-bold px-3 py-1.5 rounded transition-colors cursor-pointer">
                            Dar Aviso SMS Activo
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-850 text-xs text-rose-300 flex items-start gap-2 mt-6">
                    <ShieldAlert className="w-5 h-5 flex-shrink-0 text-rose-500" />
                    <p className="leading-snug">
                      <strong>Regla del Negocio:</strong> Embarcaciones con certificados vencidos o en alerta roja son temporalmente deslistadas del motor de búsqueda geo-circular automáticamente.
                    </p>
                  </div>
                </div>
              )}

            </div>

            {/* Footer metadata inside */}
            <div className="mt-8 pt-4 border-t border-slate-850 flex justify-between text-[11px] text-slate-500 font-mono">
              <span>Backoffice Consola v1.0.4-beta</span>
              <span>Conectado con Firebase & Supabase Auth</span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
