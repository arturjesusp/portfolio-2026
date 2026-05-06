import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { createPortal } from 'react-dom';
import { GoogleGenAI } from '@google/genai';
import { X, Send, Mail } from 'lucide-react';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export default function Chatbot({ buttonText, lang = 'en' }: { buttonText: string; lang?: 'en' | 'es' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showMailButton, setShowMailButton] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Create Gemini instance
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const chatModel = 'gemini-3-flash-preview';
  
  const t = {
    en: {
      welcome: "Welcome to Arturo Perez's digital space. I am here to outline your vision before connecting you with him.",
      title: "Digital Assistant",
      placeholder: "Type your message...",
      emailPlaceholder: "Your email address...",
      emailAppBtn: "Open Email App",
      webBtn: "Web",
      copyBtn: "Copy Text",
      copiedBtn: "Copied!",
      quotaError: "I am currently experiencing high traffic and have reached my limit. Please use the direct email option below to contact Arturo.",
      generalError: "Sorry, there was an error processing your message. Please try again."
    },
    es: {
      welcome: "Bienvenido al espacio digital de Arturo Perez. Estoy aquí para perfilar su visión antes de conectar con él.",
      title: "Asistente Digital",
      placeholder: "Escribe tu mensaje...",
      emailPlaceholder: "Tu correo electrónico...",
      emailAppBtn: "Abrir App de Correo",
      webBtn: "Web",
      copyBtn: "Copiar Texto",
      copiedBtn: "¡Copiado!",
      quotaError: "Actualmente hay alto tráfico y he alcanzado mi límite. Por favor, usa la opción de correo directo abajo para contactar a Arturo.",
      generalError: "Lo siento, hubo un error procesando tu mensaje. Por favor, intenta de nuevo."
    }
  };

  const systemPrompts = {
    en: `You are the Digital Assistant for Arturo Perez, a Digital Architect and Strategic Marketing Specialist based in Toronto. Your mission is to act as the first point of contact for potential clients who click 'EMAIL'.

Your conversation flow must be strict:
1. Zen Welcome (ALREADY SENT AT THE START): "Welcome to Arturo Perez's digital space. I am here to outline your vision before connecting you with him."
2. Need Identification: Kindly ask their name and which of Arturo's pillars they need: Web Architecture (React/Vite), Marketing Strategy (growth/engagement), or Digital Infrastructure (automation/logistics).
3. Project Context: Ask one (and only one) follow-up question about the main goal or timeline of the project.
4. Closing and Action: Once you have their name, project type, and goal, say EXACTLY: "Excellent. I have synthesized the details of our chat. Please enter your email and use the options below to contact Arturo. He will reply shortly." and DO NOT ASK ANY MORE QUESTIONS.

Golden Rules:
- Vocal Aesthetics: Be minimalist. Do not use excessive emojis or long paragraphs. Less is more.
- No pricing: If they ask about costs, reply: "Arturo evaluates each architecture in a personalized way. Financial details will be discussed in the strategy session."
- Languages: Always answer in English.
- Arturo's Knowledge: If they ask what he has done, briefly mention he has worked with global brands like BMW and MINI, and has created tools like the Tamago Pixel Timer.`,
    es: `Eres el Asistente Digital de Arturo Perez, un Arquitecto Digital y Especialista en Marketing Estratégico basado en Toronto. Tu misión es actuar como el primer punto de contacto para clientes potenciales que hacen clic en 'EMAIL'.

Tu flujo de conversación debe ser estricto:
1. Bienvenida Zen (YA SE ENVIÓ AL INICIO): "Bienvenido al espacio digital de Arturo Perez. Estoy aquí para perfilar su visión antes de conectar con él."
2. Identificación de Necesidad: Pregunta amablemente su nombre y cuál de los pilares de Arturo necesitan: Arquitectura Web (React/Vite), Estrategia de Marketing (crecimiento/engagement) o Infraestructura Digital (automatización/logística).
3. Contexto del Proyecto: Haz una (y solo una) pregunta de seguimiento sobre el objetivo principal o el plazo del proyecto.
4. Cierre y Acción: Una vez que tengas su nombre, el tipo de proyecto y el objetivo, di TEXTUALMENTE: "Excelente. He sintetizado los detalles de nuestra charla. Por favor, ingrese su correo y use las opciones de abajo para comunicarse con Arturo. Él le responderá a la brevedad." y NO HAGAS MÁS PREGUNTAS.

Reglas de Oro:
- Estética Vocal: Sé minimalista. No uses emojis excesivos ni párrafos largos. Menos es más.
- No des precios: Si preguntan por costos, responde: "Arturo evalúa cada arquitectura de forma personalizada. Los detalles financieros se discutirán en la sesión de estrategia."
- Idiomas: Responde siempre en Español.
- Conocimiento de Arturo: Si preguntan qué ha hecho, menciona brevemente que ha trabajado con marcas globales como BMW y MINI, y ha creado herramientas como el Tamago Pixel Timer.`
  };

  // Reset chat on language change
  useEffect(() => {
    setMessages([
      { role: 'model', text: t[lang].welcome }
    ]);
    setShowMailButton(false);
    setInput('');
  }, [lang]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', text: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      
      history.push({
        role: 'user',
        parts: [{ text: userMessage.text }]
      });

      const response = await ai.models.generateContent({
        model: chatModel,
        contents: history as any,
        config: {
          systemInstruction: systemPrompts[lang],
        }
      });

      const modelText = response.text || '';
      
      setMessages(prev => [...prev, { role: 'model', text: modelText }]);
      
      const triggerWords = [
        "Excelente. He sintetizado los detalles de nuestra charla",
        "opciones de abajo",
        "Excellent. I have synthesized",
        "options below"
      ];
      if (triggerWords.some(word => modelText.includes(word))) {
        setShowMailButton(true);
      }
      
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      const errorStr = (error?.message || '') + JSON.stringify(error);
      const isQuotaError = errorStr.toLowerCase().includes('quota') || errorStr.includes('429') || errorStr.toLowerCase().includes('exhausted');
      
      if (isQuotaError) {
        setMessages(prev => [...prev, { role: 'model', text: t[lang].quotaError }]);
        setShowMailButton(true);
      } else {
        setMessages(prev => [...prev, { role: 'model', text: t[lang].generalError }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getEmailContent = () => {
    const summary = messages.map(m => `${m.role === 'user' ? (lang === 'en' ? 'Client' : 'Cliente') : (lang === 'en' ? 'Assistant' : 'Asistente')}: ${m.text}`).join('\n\n');
    const subject = lang === 'en' 
      ? "New contact: Project via Digital Assistant" 
      : "Nuevo contacto: Proyecto via Asistente Digital";
    const bodyText = lang === 'en' 
      ? `Hi Arturo,\n\nI would like to discuss a possible collaboration. Here is the summary of my chat with your digital assistant:\n\n---\n\n${summary}\n\n---\n\nMy contact email is: ${clientEmail}\n\nBest regards,`
      : `Hola Arturo,\n\nMe gustaría conversar sobre una posible colaboración. Aquí está el resumen de mi charla con tu asistente digital:\n\n---\n\n${summary}\n\n---\n\nMi correo de contacto es: ${clientEmail}\n\nAtentamente,`;
    return { subject, bodyText };
  };

  const generateMailto = () => {
    const { subject, bodyText } = getEmailContent();
    window.location.href = `mailto:arturjesusp@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
  };

  const openGmail = () => {
    const { subject, bodyText } = getEmailContent();
    const url = `https://mail.google.com/mail/?view=cm&fs=1&to=arturjesusp@gmail.com&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
    window.open(url, '_blank');
  };

  const copyToClipboard = () => {
    const { bodyText } = getEmailContent();
    navigator.clipboard.writeText(bodyText);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <>
      <button 
        onClick={handleOpen}
        className="hover:opacity-40 transition-all duration-500 bg-transparent border-none p-0 cursor-pointer text-inherit font-inherit uppercase tracking-[0.2em] text-[10px]"
      >
        {buttonText}
      </button>

      {isOpen && typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end sm:items-end justify-center sm:justify-end bg-black/40 backdrop-blur-sm p-4 sm:p-6 text-zen-charcoal"
            onClick={handleClose}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-zen-cream border border-zen-divider w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[500px] max-h-[85vh] sm:max-h-[500px]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-center p-4 border-b border-zen-divider">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <h3 className="text-xs uppercase tracking-widest font-bold">{t[lang].title}</h3>
                </div>
                <button onClick={handleClose} className="p-1 opacity-50 hover:opacity-100 transition-opacity">
                  <X size={16} />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                      m.role === 'user' 
                        ? 'bg-zen-charcoal text-zen-cream rounded-tr-sm' 
                        : 'bg-zen-charcoal/5 rounded-tl-sm'
                    }`}>
                      {m.text}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] p-3 rounded-2xl rounded-tl-sm text-sm bg-zen-charcoal/5 flex gap-1 items-center">
                      <div className="w-1.5 h-1.5 bg-current opacity-40 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-current opacity-40 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                      <div className="w-1.5 h-1.5 bg-current opacity-40 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                    </div>
                  </div>
                )}
                {showMailButton && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col gap-3 mt-4"
                  >
                    <input 
                      type="email" 
                      placeholder={t[lang].emailPlaceholder}
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      className="bg-transparent border border-zen-charcoal/20 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-zen-charcoal transition-colors w-full"
                    />
                    <div className="flex flex-col gap-2 mt-2">
                      <button
                        onClick={generateMailto}
                        disabled={!clientEmail.trim() || !clientEmail.includes('@')}
                        className="w-full flex items-center justify-center gap-2 bg-zen-charcoal text-zen-cream px-4 py-3 rounded-full text-[10px] sm:text-xs uppercase tracking-widest font-bold hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                      >
                        <Mail size={14} />
                        {t[lang].emailAppBtn}
                      </button>
                      <div className="flex gap-2 w-full">
                        <button
                          onClick={openGmail}
                          disabled={!clientEmail.trim() || !clientEmail.includes('@')}
                          className="flex-1 flex items-center justify-center bg-zen-charcoal/10 text-zen-charcoal px-3 py-2.5 rounded-full text-[10px] uppercase tracking-widest font-bold hover:bg-zen-charcoal/20 transition-colors disabled:opacity-50"
                        >
                          {t[lang].webBtn}
                        </button>
                        <button
                          onClick={copyToClipboard}
                          disabled={!clientEmail.trim() || !clientEmail.includes('@')}
                          className="flex-1 flex items-center justify-center bg-zen-charcoal/10 text-zen-charcoal px-3 py-2.5 rounded-full text-[10px] uppercase tracking-widest font-bold hover:bg-zen-charcoal/20 transition-colors disabled:opacity-50"
                        >
                          {hasCopied ? t[lang].copiedBtn : t[lang].copyBtn}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-zen-divider">
                <form 
                  onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={t[lang].placeholder}
                    className="flex-1 bg-transparent border border-zen-charcoal/20 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-zen-charcoal transition-colors"
                    disabled={isLoading || showMailButton}
                  />
                  <button 
                    type="submit" 
                    disabled={!input.trim() || isLoading || showMailButton}
                    className="p-2 rounded-full bg-zen-charcoal text-zen-cream disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                  >
                    <Send size={16} />
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
