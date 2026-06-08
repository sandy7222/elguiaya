/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CircleDollarSign, CheckSquare, Coins, ArrowRight, ShieldCheck, Lock, Landmark } from 'lucide-react';

export const BusinessModel: React.FC = () => {
  const lifecycleSteps = [
    {
      step: '1',
      title: 'Aceptación de Oferta',
      desc: 'El pescador selecciona la cotización manual más conveniente enviada por el guía local.',
      icon: CircleDollarSign,
    },
    {
      step: '2',
      title: 'Sello Mercado Pago',
      desc: 'Se procesa el cobro completo con tarjeta de crédito/débito o dinero en cuenta seguro.',
      icon: Lock,
    },
    {
      step: '3',
      title: 'Custodia Escrow',
      desc: 'Los fondos quedan retenidos bajo protección hasta que la excursión náutica es finalizada.',
      icon: ShieldCheck,
    },
    {
      step: '4',
      title: 'Cierre Compartido',
      desc: 'Capitán y pescador pulsan "Finalizar" en su móvil para confirmar el fin del viaje regular.',
      icon: CheckSquare,
    },
    {
      step: '5',
      title: 'Fusión y Liquidación',
      desc: 'La pasarela deduce la comisión fija del 10% y transfiere el 90% restante al Capitán al instante.',
      icon: Coins,
    },
  ];

  return (
    <div className="py-24 bg-[#030c18] border-b border-slate-900" id="business-model-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main title heading */}
        <div className="text-center max-w-3xl mx-auto mb-16" id="biz-header">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-semibold rounded-full border border-emerald-500/20 mb-4 uppercase">
            <Coins className="w-4 h-4" />
            <span>Finanzas Claras</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 text-white">
            Modelo de Negocios de Alta Confianza
          </h2>
          <p className="text-slate-300 text-lg font-light leading-relaxed">
            Sin suscripciones mensuales ocultas ni sorpresas. El Guía Ya opera bajo un modelo de éxito compartido: solo cobramos cuando el viaje se completa de forma satisfactoria para ambas partes.
          </p>
        </div>

        {/* Infographic Steps workflow */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-16" id="biz-steps-flow">
          {lifecycleSteps.map((item, index) => {
            const StepIcon = item.icon;
            return (
              <div
                key={index}
                className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-emerald-500/20 transition-all text-left relative flex flex-col justify-between"
                id={`biz-step-${index}`}
              >
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] bg-emerald-500/15 text-emerald-400 font-bold px-2 py-0.5 rounded uppercase font-mono">
                      FASE {item.step}
                    </span>
                    <StepIcon className="w-5 h-5 text-emerald-400" />
                  </div>
                  
                  <h4 className="text-sm font-bold text-white mb-2">{item.title}</h4>
                  <p className="text-slate-400 text-xs leading-relaxed">{item.desc}</p>
                </div>

                {index < lifecycleSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-[40%] -right-4 translate-y-1/2 z-20 text-emerald-400/40">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Highlight 10% fee block */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-left grid grid-cols-1 md:grid-cols-12 gap-8 items-center" id="fee-split-summary">
          
          <div className="md:col-span-8">
            <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              TASA DE SERVICIO AD-VALOREM ESQUILMADA
            </p>
            <h3 className="text-xl sm:text-2xl font-bold text-white leading-tight">
              Liquidación Directa: <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-sky-400">90% Neto para el Capitán</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
              La tasa de uso de plataforma del 10% fija amortiza el mantenimiento satelital del mapa interactivo, la provisión de seguros, soporte técnico 24/7 de emergencia y la integración de Mercado Pago.
            </p>
          </div>

          <div className="md:col-span-4 bg-slate-950 p-6 rounded-2xl border border-slate-800 text-center flex flex-col justify-center select-none" id="fee-split-badge">
            <span className="text-xs text-slate-400 uppercase tracking-widest font-bold">Comisión El Guía Ya</span>
            <span className="text-5xl font-extrabold text-emerald-400 tracking-tight my-1.5">10%</span>
            <span className="text-[10px] text-slate-500 font-medium">Solo facturado por viaje realizado</span>
          </div>

        </div>

      </div>
    </div>
  );
};
