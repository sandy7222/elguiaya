/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MapPin, Compass, Calendar, FileText, CheckCircle, Ship, DollarSign, Bell, PenTool, Navigation, Receipt, Anchor } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pescadores' | 'capitanes'>('pescadores');

  const pescadoresSteps = [
    {
      num: '1',
      title: 'Elegís zona en el mapa',
      desc: 'Seleccionás tus arroyos, ríos o lagunas bonaerenses preferidas de partida.',
      icon: MapPin,
      color: 'border-emerald-500 text-emerald-400'
    },
    {
      num: '2',
      title: 'Dibujás tu recorrido',
      desc: 'Trazás el recorrido náutico aproximado de pesca o paseo con el dedo.',
      icon: Compass,
      color: 'border-emerald-500 text-emerald-400'
    },
    {
      num: '3',
      title: 'Definís fecha y horarios',
      desc: 'Indicás si buscás pesca de mañana, tarde, jornada completa o nocturna.',
      icon: Calendar,
      color: 'border-emerald-500 text-emerald-400'
    },
    {
      num: '4',
      title: 'Recibís cotizaciones',
      desc: 'Capitanes calificados de la zona te envían propuestas reguladas de embarcación.',
      icon: Bell,
      color: 'border-emerald-500 text-emerald-400'
    },
    {
      num: '5',
      title: 'Comparás las ofertas',
      desc: 'Revisás el equipamiento, habilitación náutica, reputación y precios en firme.',
      icon: FileText,
      color: 'border-emerald-500 text-emerald-400'
    },
    {
      num: '6',
      title: 'Aceptás y pagás seguro',
      desc: 'Abonás con Mercado Pago. El dinero queda retenido y asegurado hasta fin de viaje.',
      icon: Receipt,
      color: 'border-emerald-500 text-emerald-400'
    },
    {
      num: '7',
      title: '¡Salís a pescar!',
      desc: 'Te encontrás en el embarcadero convenido y disfrutás del río Paraná con todo en regla.',
      icon: Ship,
      color: 'border-emerald-500 text-emerald-400'
    }
  ];

  const capitanesSteps = [
    {
      num: '1',
      title: 'Recibís la solicitud',
      desc: 'Te notificamos de una nueva intención de pesca o paseo cerca de tu puerto base.',
      icon: Bell,
      color: 'border-sky-500 text-sky-400'
    },
    {
      num: '2',
      title: 'Ves el trazado del viaje',
      desc: 'Analizás en el mapa la ruta diseñada por el pescador deportivo y los horarios buscados.',
      icon: Navigation,
      color: 'border-sky-500 text-sky-400'
    },
    {
      num: '3',
      title: 'Cotizás manualmente',
      desc: 'Establecés tu precio justo basándote en combustible, insumos, carnada viva y guía.',
      icon: PenTool,
      color: 'border-sky-500 text-sky-400'
    },
    {
      num: '4',
      title: 'Confirmás el viaje',
      desc: 'Una vez que el pescador acepta tu oferta, se bloquea la fecha en tu calendario náutico.',
      icon: CheckCircle,
      color: 'border-sky-500 text-sky-400'
    },
    {
      num: '5',
      title: 'Finalizás la jornada',
      desc: 'Navegás de regreso a la guardería y cerrás el viaje de pesca desde el panel móvil.',
      icon: Ship,
      color: 'border-sky-500 text-sky-400'
    },
    {
      num: '6',
      title: 'Cobrás automáticamente',
      desc: 'Se libera tu dinero directo a tu cuenta de Mercado Pago o banco inmediatamente.',
      icon: DollarSign,
      color: 'border-sky-500 text-sky-400'
    }
  ];

  return (
    <div className="py-24 bg-[#05111f] text-white border-y border-slate-900" id="how-it-works">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading & Description */}
        <div className="text-center max-w-3xl mx-auto mb-16" id="hiw-header">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 text-white">
            ¿Cómo funciona <span className="text-emerald-400">El Guía Ya</span>?
          </h2>
          <p className="text-slate-300 text-lg font-light leading-relaxed">
            Una plataforma simétrica pensada para que pescar en ríos y lagunas de Argentina sea fácil, confiable y rápido tanto para pescadores entusiastas como para guías náuticos experimentados.
          </p>

          {/* Interactive Role Toggle Tab */}
          <div className="inline-flex p-1.5 rounded-xl bg-slate-900 border border-slate-800 mt-8" id="hiw-tabs">
            <button
              onClick={() => setActiveTab('pescadores')}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'pescadores'
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
              id="tab-pescadores"
            >
              <Ship className="w-4 h-4" />
              Soy Pescador
            </button>
            <button
              onClick={() => setActiveTab('capitanes')}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'capitanes'
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
              id="tab-capitanes"
            >
              <Anchor className="w-4 h-4" />
              Soy Capitán / Guía
            </button>
          </div>
        </div>

        {/* Dynamic Steps Display */}
        <div id="hiw-steps-container">
          {activeTab === 'pescadores' ? (
            /* Pescadores Steps Workflow */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" id="pescadores-grid">
              {pescadoresSteps.map((step, index) => {
                const StepIcon = step.icon;
                return (
                  <div
                    key={index}
                    className="relative group p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-950/20 text-left"
                    id={`step-pescador-${index}`}
                  >
                    {/* Top decoration row */}
                    <div className="flex justify-between items-center mb-5">
                      <div className={`p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 ${step.color}`}>
                        <StepIcon className="w-6 h-6" />
                      </div>
                      <span className="text-4xl font-extrabold text-slate-800 group-hover:text-emerald-500/20 transition-colors select-none line-clamp-1 h-12 leading-none">
                        0{step.num}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      {step.desc}
                    </p>

                    {/* Dotted bridge decorators between elements for desktop */}
                    {index < pescadoresSteps.length - 1 && (
                      <div className="hidden lg:block absolute top-1/2 -right-3 w-6 border-t-2 border-dotted border-slate-800 z-10" />
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* Capitanes Steps Workflow */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="capitanes-grid">
              {capitanesSteps.map((step, index) => {
                const StepIcon = step.icon;
                return (
                  <div
                    key={index}
                    className="relative group p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-sky-500/30 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-950/20 text-left"
                    id={`step-capitan-${index}`}
                  >
                    <div className="flex justify-between items-center mb-5">
                      <div className={`p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 ${step.color}`}>
                        <StepIcon className="w-6 h-6" />
                      </div>
                      <span className="text-4xl font-extrabold text-slate-800 group-hover:text-sky-500/20 transition-colors select-none line-clamp-1 h-12 leading-none">
                        0{step.num}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-sky-400 transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      {step.desc}
                    </p>

                    {index < capitanesSteps.length - 1 && index % 3 !== 2 && (
                      <div className="hidden lg:block absolute top-1/2 -right-3 w-6 border-t-2 border-dotted border-slate-800 z-10" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info inside how it works */}
        <div className="mt-14 p-6 rounded-2xl bg-slate-900/40 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6" id="hiw-footer">
          <div className="flex items-center gap-3 text-left">
            <span className="text-3xl">🤝</span>
            <div>
              <p className="font-bold text-white">Sinergia e Integración Técnica</p>
              <p className="text-xs text-slate-400">Todos los datos de rutas y perfiles se sincronizan con Supabase para una resiliencia impecable.</p>
            </div>
          </div>
          <span className="text-xs bg-emerald-500/10 text-emerald-400 px-3.5 py-1.5 rounded-full font-bold border border-emerald-500/20 select-none">
            Habilitación Directa de Prefectura Naval
          </span>
        </div>

      </div>
    </div>
  );
};
