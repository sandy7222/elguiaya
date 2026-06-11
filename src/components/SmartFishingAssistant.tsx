/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { Sparkles, MessageCircle, X, Send, Anchor, RefreshCw, Compass, ShieldAlert, Waves, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const FloatingRobot: React.FC<{ size?: number; className?: string; isAnimated?: boolean }> = ({ size = 70, className = '', isAnimated = true }) => {
  return (
    <div className={`relative flex flex-col items-center select-none ${className}`} style={{ width: size, height: size + 35 }}>
      <div className={isAnimated ? "animate-[float_3.5s_ease-in-out_infinite]" : ""}>
        <img
          src="/asistente.gif"
          alt="Asistente"
          width={size}
          height={size + 15}
          className="drop-shadow-[0_12px_24px_rgba(16,185,129,0.25)]"
          style={{ objectFit: 'contain' }}
        />
        <div className="w-[50px] h-[5px] bg-emerald-500/25 rounded-full blur-[2.5px] mx-auto mt-2 animate-[shadowPulse_3.5s_ease-in-out_infinite]" />
      </div>
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
          100% { transform: translateY(0px); }
        }
        @keyframes shadowPulse {
          0% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(0.7); opacity: 0.45; }
          100% { transform: scale(1); opacity: 0.9; }
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
      const chatHistory = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        text: msg.text
      }));

      const response = await fetch('/api/gemini/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: textToSend, chatHistory })
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
            
            <FloatingRobot size={240} />
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
                <FloatingRobot size={120} className="scale-110 translate-y-1" isAnimated={true} />
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
