/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { Sparkles, MessageCircle, X, Send, Anchor, RefreshCw, Compass, ShieldAlert, Waves, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Beautiful high-fidelity SVG robot matching the user's provided design (slate-blue body, orange accents, olive vest, fishing rod & bobber, net, and boots)
const FloatingRobot: React.FC<{ size?: number; className?: string; isAnimated?: boolean }> = ({ size = 70, className = '', isAnimated = true }) => {
  return (
    <div className={`relative flex flex-col items-center select-none ${className}`} style={{ width: size, height: size + 35 }}>
      {/* 3D floating effect with translation keyframe animation */}
      <div className={isAnimated ? "animate-[float_3.5s_ease-in-out_infinite]" : ""}>
        <svg
          width={size}
          height={size + 15}
          viewBox="0 0 120 145"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-[0_12px_24px_rgba(16,185,129,0.25)]"
        >
          {/* Gradients declarations */}
          <defs>
            <radialGradient id="eyeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="30%" stopColor="#38bdf8" />
              <stop offset="70%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#0f172a" />
            </radialGradient>
            <linearGradient id="bodyMetallic" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#64748b" />
              <stop offset="50%" stopColor="#475569" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>
            <linearGradient id="orangeAccent" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
            <linearGradient id="bootsGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4d5f30" />
              <stop offset="100%" stopColor="#2e3a1d" />
            </linearGradient>
            <pattern id="netMesh" width="4" height="4" patternUnits="userSpaceOnUse">
              <path d="M 0 2 L 4 2 M 2 0 L 2 4" stroke="#4a5568" strokeWidth="0.5" strokeOpacity="0.4" />
            </pattern>
          </defs>

          {/* 1. Landing Fishing Net on his Back */}
          <g id="fishing-net">
            {/* Wooden ring frame */}
            <path d="M 82 45 C 92 42, 102 55, 96 75 C 92 90, 80 94, 76 80 Z" fill="none" stroke="#854d0e" strokeWidth="2.5" />
            {/* Net mesh material */}
            <path d="M 82 45 C 92 42, 102 55, 96 75 C 92 90, 80 94, 76 80 Z" fill="url(#netMesh)" />
            {/* Net handle connecting behind vest */}
            <rect x="74" y="74" width="3" height="24" transform="rotate(-15 74 74)" fill="#78350f" rx="1.5" />
          </g>

          {/* 2. Antennas (With orange rounded tips) */}
          <g id="antennas">
            {/* Left Antenna */}
            <path d="M 46 22 L 36 6" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
            <circle cx="36" cy="6" r="3.5" fill="url(#orangeAccent)" stroke="#1e293b" strokeWidth="1" />
            {/* Right Antenna */}
            <path d="M 74 22 L 84 6" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
            <circle cx="84" cy="6" r="3.5" fill="url(#orangeAccent)" stroke="#1e293b" strokeWidth="1" />
          </g>

          {/* 3. Earbolts / Sockets */}
          <rect x="25" y="32" width="6" height="14" rx="2" fill="url(#orangeAccent)" stroke="#1e293b" strokeWidth="1" />
          <rect x="89" y="32" width="6" height="14" rx="2" fill="url(#orangeAccent)" stroke="#1e293b" strokeWidth="1" />

          {/* 4. Head Module */}
          {/* Main Slate Blue Metallic Head */}
          <rect x="30" y="16" width="60" height="48" rx="18" fill="url(#bodyMetallic)" stroke="#1e293b" strokeWidth="3" />
          {/* Orange design panel on top peak */}
          <path d="M 48 16 L 72 16 L 68 23 L 52 23 Z" fill="url(#orangeAccent)" />
          {/* Inner dark matte glass plate */}
          <rect x="35" y="21" width="50" height="38" rx="13" fill="#0f172a" />

          {/* 5. Glowing Circular Blue Eyes */}
          <g id="glowing-eyes">
            {/* Left Eye */}
            <circle cx="48" cy="34" r="9" fill="url(#eyeGlow)" />
            <circle cx="48" cy="34" r="6" fill="none" stroke="#22d3ee" strokeWidth="1" strokeOpacity="0.8" />
            <circle cx="50" cy="32" r="2.5" fill="#ffffff" /> {/* reflection glint */}
            
            {/* Right Eye */}
            <circle cx="72" cy="34" r="9" fill="url(#eyeGlow)" />
            <circle cx="72" cy="34" r="6" fill="none" stroke="#22d3ee" strokeWidth="1" strokeOpacity="0.8" />
            <circle cx="74" cy="32" r="2.5" fill="#ffffff" /> {/* reflection glint */}
          </g>

          {/* 6. Grill Smile */}
          <rect x="48" y="47" width="24" height="6" rx="3" fill="#020617" stroke="#475569" strokeWidth="1" />
          {/* Vertical metal grates */}
          <line x1="52" y1="47" x2="52" y2="53" stroke="#64748b" strokeWidth="1.2" />
          <line x1="56" y1="47" x2="56" y2="53" stroke="#64748b" strokeWidth="1.2" />
          <line x1="60" y1="47" x2="60" y2="53" stroke="#64748b" strokeWidth="1.2" />
          <line x1="64" y1="47" x2="64" y2="53" stroke="#64748b" strokeWidth="1.2" />
          <line x1="68" y1="47" x2="68" y2="53" stroke="#64748b" strokeWidth="1.2" />

          {/* 7. Neck joint */}
          <rect x="54" y="63" width="12" height="6" rx="1" fill="#1e293b" />
          <line x1="56" y1="66" x2="64" y2="66" stroke="#475569" strokeWidth="1.5" />

          {/* 8. Mechanical Torso (Blue Slate) */}
          <rect x="36" y="68" width="48" height="36" rx="8" fill="url(#bodyMetallic)" stroke="#1e293b" strokeWidth="2.5" />
          {/* Orange active shoulder joints */}
          <circle cx="34" cy="74" r="5" fill="url(#orangeAccent)" stroke="#1e293b" strokeWidth="1" />
          <circle cx="86" cy="74" r="5" fill="url(#orangeAccent)" stroke="#1e293b" strokeWidth="1" />

          {/* 9. Utility Fishing Vest (Olive green matching the image) */}
          <g id="fishing-vest">
            {/* Left Vest lapel body */}
            <path d="M 36 68 L 58 68 L 54 104 L 36 98 Z" fill="#4d5f30" stroke="#1f2910" strokeWidth="1.5" />
            {/* Right Vest lapel body */}
            <path d="M 84 68 L 62 68 L 66 104 L 84 98 Z" fill="#4d5f30" stroke="#1f2910" strokeWidth="1.5" />
            
            {/* Central zipper teeth */}
            <line x1="59.5" y1="68" x2="59.5" y2="104" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="2,2" />
            {/* Metal zipper slider head */}
            <rect x="58" y="72" width="3" height="5" rx="1" fill="#cbd5e1" stroke="#334155" strokeWidth="0.5" />

            {/* Vest chest labels & badges */}
            {/* Gold ANGLER patch on right chest (viewer's left) */}
            <rect x="40" y="73" width="13" height="4" rx="0.5" fill="#facc15" stroke="#713f12" strokeWidth="0.5" />
            <text x="41.5" y="76.2" fill="#713f12" fontSize="2.8" fontWeight="bold" fontFamily="sans-serif">ANGLER</text>

            {/* Dark FISH-BOT label on left chest (viewer's right) */}
            <rect x="67" y="73" width="13" height="4" rx="0.5" fill="#1e293b" stroke="#0f172a" strokeWidth="0.5" />
            <text x="68" y="76.2" fill="#38bdf8" fontSize="2.5" fontWeight="bold" fontFamily="sans-serif">FISH-BOT</text>

            {/* Flap pockets (Bottom pockets) */}
            {/* Left utility pocket */}
            <rect x="39" y="84" width="14" height="11" rx="2" fill="#3a4724" stroke="#1f2910" strokeWidth="1" />
            <path d="M 38 84 L 54 84 L 52 87 L 40 87 Z" fill="#2d371b" /> {/* pocket flap */}
            <circle cx="46" cy="85.5" r="0.8" fill="#e2e8f0" /> {/* silver button snap */}

            {/* Right utility pocket */}
            <rect x="67" y="84" width="14" height="11" rx="2" fill="#3a4724" stroke="#1f2910" strokeWidth="1" />
            <path d="M 66 84 L 82 84 L 80 87 L 68 87 Z" fill="#2d371b" /> {/* pocket flap */}
            <circle cx="74" cy="85.5" r="0.8" fill="#e2e8f0" /> {/* silver button snap */}
          </g>

          {/* 10. Left Mechanical Arm holding the Fishing Rod */}
          <g id="fishing-rod-arm">
            {/* Segmented blue arm */}
            <path d="M 32 76 L 20 84 L 16 98" fill="none" stroke="url(#bodyMetallic)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            {/* Joint accent rings */}
            <circle cx="20" cy="84" r="4.5" fill="url(#orangeAccent)" />
            <circle cx="16" cy="98" r="4.5" fill="url(#orangeAccent)" />

            {/* Fishing Rod Pole (dark vintage brown) */}
            <line x1="8" y1="125" x2="32" y2="45" stroke="#5c4033" strokeWidth="2.2" strokeLinecap="round" />
            {/* Cork Fishing rod handle bottom */}
            <line x1="6" y1="131" x2="10" y2="119" stroke="#b45309" strokeWidth="3" strokeLinecap="round" />
            
            {/* Golden Reels mechanism & lever */}
            <circle cx="12" cy="116" r="3.5" fill="#eab308" stroke="#1e293b" strokeWidth="1" />
            <rect x="8" y="113" width="7" height="3" rx="1" fill="#facc15" />
            {/* Fine monofilament line drop */}
            <path d="M 28 58 Q 5 70, 7 94" fill="none" stroke="#e2e8f0" strokeWidth="0.8" strokeDasharray="3,1" />

            {/* Retro red & white bobber (Boyita) hanging off the line */}
            <g transform="translate(7, 94)">
              {/* White lower half */}
              <path d="M -3 0 Q 0 4, 3 0 Z" fill="#ffffff" stroke="#1e293b" strokeWidth="0.5" />
              {/* Red top half */}
              <path d="M -3 0 Q 0 -5, 3 0 Z" fill="#ef4444" stroke="#1e293b" strokeWidth="0.5" />
              {/* Little antenna tip */}
              <line x1="0" y1="-5" x2="0" y2="-8" stroke="#f59e0b" strokeWidth="0.8" />
            </g>
          </g>

          {/* 11. Right Mechanical Arm (Relaxed) */}
          <g id="right-arm">
            {/* Upper arm */}
            <path d="M 88 76 L 100 86 L 96 98" fill="none" stroke="url(#bodyMetallic)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            {/* Joints */}
            <circle cx="100" cy="86" r="4.5" fill="url(#orangeAccent)" />
            <circle cx="96" cy="98" r="4" fill="#64748b" />
          </g>

          {/* 12. Segmented Metallic Legs & Rain Boots */}
          <g id="legs-and-boots">
            {/* Left mechanical leg core */}
            <path d="M 44 104 L 43 118" stroke="url(#bodyMetallic)" strokeWidth="5.5" strokeLinecap="round" />
            <circle cx="43.5" cy="114" r="3.5" fill="url(#orangeAccent)" />

            {/* Right mechanical leg core */}
            <path d="M 76 104 L 77 118" stroke="url(#bodyMetallic)" strokeWidth="5.5" strokeLinecap="round" />
            <circle cx="76.5" cy="114" r="3.5" fill="url(#orangeAccent)" />

            {/* Khaki-green rubber fisherman's boots */}
            {/* Left Boot */}
            <path d="M 34 118 L 50 118 L 48 134 L 32 134 Q 31 138, 35 138 L 49 138 Q 52 138, 51 132 L 51 118 Z" fill="url(#bootsGrad)" stroke="#14532d" strokeWidth="1" />
            {/* Right Boot */}
            <path d="M 70 118 L 86 118 L 85 134 L 68 134 Q 67 138, 71 138 L 85 138 Q 88 138, 87 132 L 87 118 Z" fill="url(#bootsGrad)" stroke="#14532d" strokeWidth="1" />
          </g>
        </svg>

        {/* Soft interactive floating shadow underneath that shrinks and expands synchronized with the hover */}
        <div className="w-[50px] h-[5px] bg-emerald-500/25 rounded-full blur-[2.5px] mx-auto mt-2 animate-[shadowPulse_3.5s_ease-in-out_infinite]" />
      </div>

      {/* Embedded inline CSS for customized rich animations without cluttering tailwind files */}
      <style>{`
        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-12px);
          }
          100% {
            transform: translateY(0px);
          }
        }
        @keyframes shadowPulse {
          0% {
            transform: scale(1);
            opacity: 0.9;
          }
          50% {
            transform: scale(0.7);
            opacity: 0.45;
          }
          100% {
            transform: scale(1);
            opacity: 0.9;
          }
        }
      `}</style>
    </div>
  );
};

export const SmartFishingAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'default-1',
      sender: 'assistant',
      text: '¡Buenas y santa pique chamigo! Soy **El GuIA**, tu baqueano náutico inteligente de El Guía Ya. 🤖🎣\n\n¿En qué te puedo asesorar hoy? Preguntame sobre la **tabla lunar del pique**, **clima y vientos en el río**, **carnadas y señuelos**, o **requisitos de Prefectura** para navegar seguro en Argentina.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Quick reply prompt helper list
  const quickQuestions = [
    { label: '🌒 Tabla lunar y pique', prompt: '¿Cómo influye la fase lunar actual en la pesca de dorados y pejerreyes en Argentina?' },
    { label: '🌊 Estado del Río Paraná', prompt: '¿Cuál es el estado de la altura del río Paraná y recomendaciones de seguridad de Prefectura?' },
    { label: '🐟 Carnada para Dorado', prompt: '¿Qué carnadas vívas o señuelos rinden mejor para pescar Dorados en Corrientes de día?' },
    { label: '🛡️ Documentación náutica', prompt: '¿Qué documentación exige Prefectura Naval Argentina para el timonel y embarcaciones deportivas?' }
  ];

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to chat bottoms
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: textToSend })
      });

      if (!response.ok) {
        throw new Error('Servidor offline o problema de configuración');
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: data.sources || []
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('[Assistant Chat Error]:', err);
      // Friendly fallback error warning
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: '¡Chamigo, disculpame! Parece que perdí señal radial con la central en la isla. Revisá si tu clave de Gemini está bien configurada en la terminal, o probá de nuevo en unos minutos. 🧭',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const parseMarkdownBold = (text: string) => {
    // Simple parser for **bold** text to render nicely in chatbubble
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-bold text-white">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end" id="fishing-ai">
      
      {/* Floating Animated Button with Mate-drinking Robot */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex flex-col items-center group cursor-pointer focus:outline-none transition-all duration-300"
          id="btn-open-assistant"
          title="Abrir chat con El GuIA"
        >
          {/* Talk bubble tooltip appearing on hover over the floating robot */}
          <div className="bg-slate-900 border border-slate-800 text-emerald-400 font-extrabold text-[11px] px-3 py-1.5 rounded-xl shadow-lg mb-2 opacity-0 group-hover:opacity-100 transition-all duration-350 select-none flex items-center gap-1.5 filter drop-shadow">
            <Sparkles className="w-3 h-3 text-yellow-400 animate-pulse" />
            <span>¿Hablamos de pesca?</span>
          </div>

          <div className="relative hover:scale-110 active:scale-95 transition-all duration-300">
            {/* Active signal ping indicator */}
            <span className="absolute top-2 right-4 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-950 animate-ping z-20" />
            <span className="absolute top-2 right-4 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-slate-950 z-20" title="En línea" />
            
            <FloatingRobot size={80} />
          </div>

          <span className="mt-1 text-[11px] text-slate-300 font-bold bg-slate-950/80 px-2.5 py-1 rounded-full border border-slate-800/80 group-hover:border-emerald-500/40 transition-colors uppercase tracking-wider select-none shadow">
            El GuIA Bot
          </span>
        </button>
      )}

      {/* Styled Chat window */}
      {isOpen && (
        <div
          className="w-[340px] sm:w-[410px] h-[550px] bg-slate-900 rounded-2xl shadow-2xl shadow-emerald-950/50 border border-slate-800 flex flex-col justify-between overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300 relative z-10"
          id="assistant-chat-window"
        >
          {/* Header */}
          <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between" id="chat-header">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-emerald-600/10 flex items-center justify-center border border-emerald-500/20 overflow-hidden relative">
                {/* Miniature animated robot in the title header column */}
                <FloatingRobot size={40} className="scale-110 translate-y-1" isAnimated={true} />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-extrabold text-white leading-none">Asistente El GuIA</p>
                  <span className="text-[7.5px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1 py-0.2 rounded font-extrabold tracking-wide">IA FLOTANTE</span>
                </div>
                <p className="text-[9px] text-slate-450 mt-0.5">Clima, Pique y Seguridad de Ríos</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              title="Cerrar chat"
              id="btn-close-chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages screen */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#071321]/90 relative scrollbar-thin" id="chat-messages-area">
            
            {/* Watermark/Glow icon in chatbg */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none select-none z-0">
              <Anchor className="w-56 h-56 text-white" />
            </div>

            {/* Render loop */}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[85%] z-10 relative text-left ${
                  msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                }`}
                id={`chat-msg-${msg.id}`}
              >
                {/* Bubble content */}
                <div className={`p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap shadow ${
                  msg.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-tr-none font-medium'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 rounded-tl-none font-sans'
                }`}>
                  {parseMarkdownBold(msg.text)}
                </div>

                {/* Sources list */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-1.5 flex flex-col gap-1 w-full pl-2" id={`sources-${msg.id}`}>
                    <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Fuentes de consulta:</p>
                    {msg.sources.map((src, i) => (
                      <a
                        key={i}
                        href={src.url}
                        target="_blank"
                        rel="referrer noopener"
                        className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1 leading-none"
                      >
                        ⚓ {src.title}
                      </a>
                    ))}
                  </div>
                )}

                {/* Time footer */}
                <span className="text-[9px] text-slate-500 mt-1 pl-1">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {/* Spinner loading */}
            {isLoading && (
              <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800 p-3 rounded-xl max-w-[200px]" id="chat-loading">
                <RefreshCw className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                <span className="text-[10px] text-slate-400 font-semibold font-sans">El GuIA está consultando el satélite...</span>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Quick presets area */}
          <div className="p-2.5 bg-slate-900 border-t border-slate-850 flex gap-1.5 overflow-x-auto scrollbar-none snap-x" id="chat-presets-area">
            {quickQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(q.prompt)}
                className="flex-shrink-0 snap-center px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg hover:border-emerald-500/50 hover:bg-slate-900 text-[10px] font-semibold text-slate-300 cursor-pointer transition-colors"
                id={`preset-btn-${i}`}
              >
                {q.label}
              </button>
            ))}
          </div>

          {/* Input submission footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputValue);
            }}
            className="p-3 bg-slate-950 border-t border-slate-850 flex items-center gap-2"
            id="chat-input-form"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Preguntar a El GuIA sobre la pesca..."
              className="flex-1 bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
              id="chat-input-field"
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="p-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl transition-all cursor-pointer"
              id="btn-chat-submit"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </div>
  );
};
