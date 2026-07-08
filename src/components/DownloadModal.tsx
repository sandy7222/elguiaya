/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Smartphone, ArrowRight, ShieldCheck, Navigation, Anchor, Star, Download } from 'lucide-react';
import QRCode from 'react-qr-code';
import { motion, AnimatePresence } from 'motion/react';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const APK_URL = 'https://elguiaya.com/app/descarga';

export const DownloadModal: React.FC<DownloadModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100]"
            id="download-modal-backdrop"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-2xl bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl z-[110] overflow-hidden flex flex-col md:flex-row text-left"
            id="download-modal-body"
          >
            {/* Left Column: Utility Description */}
            <div className="p-6 md:p-8 bg-gradient-to-br from-slate-900 to-slate-950 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800/80 md:w-[55%]" id="download-modal-left">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider mb-4">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Aplicación Oficial</span>
                </div>
                
                <h3 className="text-xl md:text-2xl font-black text-white leading-tight">
                  Descargá la App de <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-300">El Guía YA</span>
                </h3>
                <p className="text-xs text-slate-400 mt-2">
                  La herramienta de navegación y seguridad náutica indispensable para pescar en ríos y lagunas de Argentina.
                </p>

                {/* Key Real Utilities */}
                <div className="space-y-4 mt-6" id="download-utility-list">
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 text-emerald-400">
                      <Navigation className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-100">📡 Mapa Satelital Offline</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                        Navegá de forma segura sin preocuparte por la pérdida de señal 4G en medio de las islas del Delta o charcos rurales.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#0ea5e9]/10 border border-[#0ea5e9]/20 flex items-center justify-center flex-shrink-0 text-[#0ea5e9]">
                      <Anchor className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-100">🚢 Capitanes Verificados</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                        Accedé solo a guías y timoneles con licencias vigentes ante Prefectura Naval y con seguro obligatorio RC activo.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center flex-shrink-0 text-yellow-400">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-100">💳 Custodia Segura Mercado Pago</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                        Tu dinero queda resguardado en depósito escrow hasta que el viaje culmina exitosamente. Sin sorpresas.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* URL Stamp */}
              <div className="mt-6 pt-4 border-t border-slate-900 text-[10px] text-slate-500 font-mono">
                Distribución autorizada: <span className="text-emerald-400 font-semibold text-xs ml-1">elguiaya.com</span>
              </div>
            </div>

            {/* Right Column: Download Actions & QR */}
            <div className="p-6 md:p-8 flex flex-col justify-between items-center md:w-[45%]" id="download-modal-right">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-slate-550 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-full flex flex-col items-center justify-center" id="qr-container-box">
                {/* Real QR Code */}
                <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col items-center select-none shadow-inner mb-4 mt-2">
                  <div className="w-28 h-28 bg-white rounded-lg p-1 flex items-center justify-center">
                    <QRCode value={APK_URL} size={104} bgColor="#ffffff" fgColor="#000000" level="M" />
                  </div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase mt-2 tracking-wider">Escaneá para descargar</span>
                </div>

                <p className="text-[11px] text-center text-slate-400 max-w-[180px] mb-6">
                  Apuntá con la cámara de tu celular para recibir la descarga automática.
                </p>
              </div>

              {/* Direct Buttons list */}
              <div className="w-full space-y-2" id="download-modal-actions">
                <a
                  href={APK_URL}
                  rel="noreferrer"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 font-bold text-white text-xs rounded-xl transition-all flex items-center justify-center gap-2 border border-emerald-400/20 shadow-lg shadow-emerald-950/40"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar APK (Android)</span>
                </a>
                
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href="https://elguiaya.com"
                    target="_blank"
                    rel="noreferrer"
                    className="py-2 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white text-[10px] font-bold rounded-xl border border-slate-800 flex items-center justify-center gap-1 transition-colors"
                  >
                    <span>Google Play</span>
                  </a>
                  <a
                    href="https://elguiaya.com"
                    target="_blank"
                    rel="noreferrer"
                    className="py-2 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white text-[10px] font-bold rounded-xl border border-slate-800 flex items-center justify-center gap-1 transition-colors"
                  >
                    <span>App Store</span>
                  </a>
                </div>
              </div>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
