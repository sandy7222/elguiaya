/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PreRegisterInput } from '../types';
import { Ship, Mail, Phone, MapPin, User, Anchor, CheckCircle, Volume2, Sparkles } from 'lucide-react';

interface EarlyRegistrationProps {
  initialRole?: 'pescador' | 'capitan';
}

export const EarlyRegistration: React.FC<EarlyRegistrationProps> = ({ initialRole = 'pescador' }) => {
  const [role, setRole] = useState<'pescador' | 'capitan'>(initialRole);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+54 9 ');
  const [location, setLocation] = useState('Delta de Tigre');
  const [boatDetails, setBoatDetails] = useState('');
  
  const [submitState, setSubmitState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [totalRegistrations, setTotalRegistrations] = useState<number>(142);
  const [myQueueNumber, setMyQueueNumber] = useState<number>(0);

  // Sync initial role when changed from parent callback triggers
  useEffect(() => {
    setRole(initialRole);
  }, [initialRole]);

  // Live fetch current waiting list registration counter
  const fetchCount = async () => {
    try {
      const response = await fetch('/api/registrations/count');
      if (response.ok) {
        const data = await response.json();
        setTotalRegistrations(data.count);
      }
    } catch (e) {
      console.error('[Fetch Registration Count Error]:', e);
    }
  };

  useEffect(() => {
    fetchCount();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      alert('Por favor, completá todos los campos requeridos chambigo.');
      return;
    }

    setSubmitState('submitting');

    const payload: PreRegisterInput = {
      role,
      name: fullName.trim(),
      email: email.trim(),
      location: location.trim(),
      ...(role === 'capitan' ? { boatInfo: boatDetails.trim() } : {}),
    };

    try {
      const response = await fetch('/api/pre-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Servidor falló al pre-registrar');
      }

      const data = await response.json();
      setSubmitState('success');
      setMyQueueNumber(data.queueNumber);
      
      // Update registration totals scoreboard live
      setTimeout(() => {
        fetchCount();
      }, 500);

    } catch (err) {
      console.error('[PreRegister Submit Error]:', err);
      setSubmitState('error');
    }
  };

  return (
    <div className="py-24 bg-[#030d19] border-b border-slate-900 scroll-mt-20" id="early-registration-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center" id="registration-layout">
          
          {/* Left Column: Register Call-out pitches (5 cols) */}
          <div className="lg:col-span-5 text-left" id="reg-pitch-col">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-semibold rounded-full border border-emerald-500/20 mb-4 uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Prioridad de Alta</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6 text-white leading-tight">
              Asegurá tu lugar en el <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-sky-450">Zarpazo Histórico</span>
            </h2>
            
            <p className="text-slate-350 text-base sm:text-lg font-light leading-relaxed mb-6">
              Registrate hoy para ser parte de la lista selecta de lanzamientos. Los pescadores fundadores recibirán **descuentos del 15%** en su primera expedición. Los capitanes recibirán **tasa de servicio del 0%** durante los primeros 45 días de navegación.
            </p>

            {/* Pulsing Scoreboard */}
            <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 text-left select-none relative overflow-hidden max-w-sm" id="pioneer-scoreboard">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl" />
              <div className="flex items-center gap-3">
                <span className="text-3xl animate-bounce">🎣</span>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-extrabold">Pioneros Registrados Hoy</p>
                  <p className="text-4xl font-extrabold text-white mt-0.5">{totalRegistrations} <span className="text-xs text-emerald-400 font-bold uppercase">Registros</span></p>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-500 mt-4 max-w-sm">
              🔑 Sincronización continua en Supabase para almacenamiento de datos e identidad cifrada.
            </p>
          </div>

          {/* Right Column: Dynamic Form (7 cols) */}
          <div className="lg:col-span-7" id="reg-form-col">
            <div className="bg-slate-900 p-6 sm:p-10 rounded-3xl border border-slate-800 shadow-2xl relative" id="reg-inner-container">
              
              {/* If SUCCESS, show elegant success screen */}
              {submitState === 'success' ? (
                <div className="text-center py-8 animate-in fade-in duration-300" id="reg-success">
                  <div className="w-16 h-16 bg-emerald-500/15 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
                    <CheckCircle className="w-10 h-10" />
                  </div>
                  
                  <h3 className="text-2xl font-extrabold text-white mb-2">¡Felicitaciones e bienvenido a bordo!</h3>
                  <p className="text-slate-300 text-sm max-w-sm mx-auto mb-6 leading-relaxed">
                    Completaste tu pre-registro con éxito en El Guía Ya. Recibirás tu credencial digital por correo.
                  </p>

                  <div className="inline-block bg-slate-950 px-8 py-4 rounded-xl border border-slate-800 select-none">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Tu posición en la Lista de Espera:</p>
                    <p className="text-3xl font-extrabold text-emerald-400 mt-1">Nº #{myQueueNumber}</p>
                  </div>

                  <button
                    onClick={() => {
                      setFullName('');
                      setEmail('');
                      setBoatDetails('');
                      setSubmitState('idle');
                    }}
                    className="mt-8 text-xs text-slate-400 hover:text-white underline cursor-pointer"
                  >
                    Registrar otra cuenta
                  </button>
                </div>
              ) : (
                /* Interactive Registration Inputs Form */
                <form onSubmit={handleSubmit} className="space-y-6 text-left" id="pioneer-signin-form">
                  
                  {/* Role Selector Tabs inside Form */}
                  <div className="flex p-1 rounded-xl bg-slate-950 border border-slate-850" id="form-role-selectors">
                    <button
                      type="button"
                      onClick={() => setRole('pescador')}
                      className={`flex-1 py-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        role === 'pescador'
                          ? 'bg-emerald-600 text-white shadow-lg'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      id="form-tab-pescador"
                    >
                      <Ship className="w-3.5 h-3.5" />
                      Soy Pescador Deportivo
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('capitan')}
                      className={`flex-1 py-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        role === 'capitan'
                          ? 'bg-emerald-600 text-white shadow-lg'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      id="form-tab-capitan"
                    >
                      <Anchor className="w-3.5 h-3.5" />
                      Soy Capitán de Navío
                    </button>
                  </div>

                  {/* Fields wrap */}
                  <div className="space-y-4" id="form-fields">
                    {/* Fullname */}
                    <div className="text-left">
                      <label className="block text-xs text-slate-300 font-semibold mb-2">Nombre y Apellido completo *</label>
                      <div className="relative">
                        <User className="absolute left-4 top-3.5 w-4.5 h-4.5 text-slate-500" />
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Ej: Hugo Benítez"
                          className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 rounded-xl pl-12 pr-4 py-3 text-xs text-white focus:outline-none placeholder-slate-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Email */}
                      <div className="text-left">
                        <label className="block text-xs text-slate-300 font-semibold mb-2">Correo Electrónico *</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-3.5 w-4.5 h-4.5 text-slate-500" />
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="hugo@pesca.com.ar"
                            className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 rounded-xl pl-12 pr-4 py-3 text-xs text-white focus:outline-none placeholder-slate-500"
                          />
                        </div>
                      </div>

                      {/* Phone */}
                      <div className="text-left">
                        <label className="block text-xs text-slate-300 font-semibold mb-2">Teléfono Celular *</label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-3.5 w-4.5 h-4.5 text-slate-500" />
                          <input
                            type="text"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+54 9 341 555-1234"
                            className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 rounded-xl pl-12 pr-4 py-3 text-xs text-white focus:outline-none placeholder-slate-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Zone Location */}
                      <div className="text-left">
                        <label className="block text-xs text-slate-300 font-semibold mb-2">Localidad / Zona de actividad *</label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-3.5 w-4.5 h-4.5 text-slate-500" />
                          <input
                            type="text"
                            required
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="Ej: Tigre, Rosario, Goya"
                            className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 rounded-xl pl-12 pr-4 py-3 text-xs text-white focus:outline-none placeholder-slate-500"
                          />
                        </div>
                      </div>

                      {role === 'capitan' ? (
                        /* Captain boat description specification */
                        <div className="text-left">
                          <label className="block text-xs text-slate-300 font-semibold mb-2">Embarcación y Motorización *</label>
                          <div className="relative">
                            <Anchor className="absolute left-4 top-3.5 w-4.5 h-4.5 text-slate-500" />
                            <input
                              type="text"
                              required={role === 'capitan'}
                              value={boatDetails}
                              onChange={(e) => setBoatDetails(e.target.value)}
                              placeholder="Ej: Tracker Astillero 5.4m / Mercury 60hp"
                              className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 rounded-xl pl-12 pr-4 py-3 text-xs text-white focus:outline-none placeholder-slate-500"
                            />
                          </div>
                        </div>
                      ) : (
                        /* Fisherman targets specification */
                        <div className="text-left">
                          <label className="block text-xs text-slate-300 font-semibold mb-2">Modalidad de Pesca Preferida</label>
                          <select className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-xs text-slate-300 focus:outline-none">
                            <option>Baitcasting / Artificial de dorado</option>
                            <option>Flote con paternoster (Pejerrey)</option>
                            <option>Pesca de costa y variada pesada</option>
                            <option>Navegación familiar de recreación</option>
                          </select>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Submission alerts and warnings */}
                  {submitState === 'error' && (
                    <div className="p-3 bg-rose-950/40 border border-rose-500/30 text-rose-400 text-xs rounded-xl" id="reg-error-disclaimer">
                      ⚠ Hubo un error de conexión con la central náutica. Probá de nuevo chamigo.
                    </div>
                  )}

                  {/* Actions submit button */}
                  <div>
                    <button
                      type="submit"
                      disabled={submitState === 'submitting'}
                      className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 font-bold text-white rounded-xl shadow-lg transition-transform hover:scale-[1.01] active:scale-95 disabled:bg-slate-800 disabled:text-slate-500 cursor-pointer text-center"
                      id="btn-submit-early"
                    >
                      {submitState === 'submitting' ? 'Enviando hoja de vida...' : 'Confirmar Pre-Registro Gratuito'}
                    </button>
                    
                    <p className="text-[10px] text-slate-500 mt-3 text-center leading-relaxed">
                      Al sumarte prestás conformidad a los términos de seguridad y validación de bases náuticas.
                    </p>
                  </div>

                </form>
              )}

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
