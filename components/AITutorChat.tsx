
import React, { useState, useEffect, useRef } from "react";
import { Chat, GenerateContentResponse } from "@google/genai";
import { getGeminiClient, generateExplanationImage, generateExplanationVideo, getAITutorVariant, logExplanationRating } from "../api";
import { ChatMessage } from "../types";

export const AITutorChat = ({ 
  collapsed, 
  toggleCollapsed,
  initialContext,
  userId
}: { 
  collapsed: boolean, 
  toggleCollapsed: () => void,
  initialContext?: string,
  userId: string
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatRef = useRef<Chat | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);
  const activeVariantRef = useRef<{ id: string, name: string } | null>(null);

  // Initialize Chat with A/B Variant
  useEffect(() => {
    if (initialized.current) return;
    
    // 1. Determine A/B Test Variant based on User ID
    const variant = getAITutorVariant(userId);
    activeVariantRef.current = variant;
    console.log(`[A/B Test] Assigned Variant: ${variant.name}`);

    // Set initial messages based on context or default
    const startMessages: ChatMessage[] = initialContext 
      ? [{ role: "model", text: initialContext }]
      : [{ role: "model", text: "Hello! I'm your AI Tutor. I'm here to help you master this concept." }];
    
    setMessages(startMessages);

    const ai = getGeminiClient();
    
    // 2. Configure Chat with variant-specific prompt
    chatRef.current = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: variant.prompt,
      },
    });

    initialized.current = true;
  }, [initialContext, userId]);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      const { scrollHeight, clientHeight } = chatContainerRef.current;
      if (scrollHeight > clientHeight) {
          chatContainerRef.current.scrollTo({
            top: scrollHeight,
            behavior: "smooth"
          });
      }
    }
  };

  useEffect(() => {
    if (!collapsed) {
        setTimeout(scrollToBottom, 100);
    }
  }, [messages, collapsed]);

  const handleSend = async () => {
    if (!input.trim() || !chatRef.current) return;

    const userMsg = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);

    try {
      const result: GenerateContentResponse = await chatRef.current.sendMessage({ message: userMsg });
      const text = result.text || "I'm having trouble thinking right now.";
      setMessages((prev) => [...prev, { role: "model", text }]);
    } catch (e) {
        console.error(e);
      setMessages((prev) => [...prev, { role: "model", text: "Error connecting to AI Tutor." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleRating = (index: number, rating: 'Helpful' | 'Not Helpful') => {
      if (!activeVariantRef.current) return;
      
      // Optimistic update of UI
      setMessages(prev => prev.map((msg, i) => i === index ? { ...msg, rating } : msg));
      
      // Log the rating
      logExplanationRating(userId, rating, activeVariantRef.current.id);
  };

  const handleMediaGen = async (type: 'image' | 'video') => {
    const lastModelMessage = [...messages].reverse().find(m => m.role === 'model');
    const context = lastModelMessage?.text || "The algorithm visualization";

    setMessages(prev => [...prev, { 
      role: 'model', 
      text: type === 'image' ? 'Generating visual diagram...' : 'Rendering cinematic animation...', 
      isGenerating: true,
      statusText: type === 'image' ? 'Crafting Diagram...' : 'Initializing Cinematic Engine...'
    }]);

    try {
      if (type === 'image') {
        const url = await generateExplanationImage(context);
        setMessages(prev => prev.map((msg, i) => 
          i === prev.length - 1 ? { ...msg, text: 'Here is a visual explanation:', imageUrl: url || undefined, isGenerating: false } : msg
        ));
      } else {
        const url = await generateExplanationVideo(context, (status) => {
          setMessages(prev => prev.map((msg, i) => 
            i === prev.length - 1 ? { ...msg, statusText: status } : msg
          ));
        });
        setMessages(prev => prev.map((msg, i) => 
          i === prev.length - 1 ? { ...msg, text: 'I have generated a cinematic animation for you:', videoUrl: url || undefined, isGenerating: false } : msg
        ));
      }
    } catch (e) {
      setMessages(prev => prev.map((msg, i) => 
        i === prev.length - 1 ? { ...msg, text: 'Sorry, I failed to generate that visual. Please try again.', isGenerating: false } : msg
      ));
    }
  };

  if (collapsed) {
      return (
        <div className="flex flex-col items-center p-4 gap-4">
             <button 
                onClick={toggleCollapsed}
                className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors"
                title="Expand AI Tutor"
            >
                 <i className="fa-solid fa-comment-dots"></i>
            </button>
        </div>
      );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px-120px)] relative">
      <button 
        onClick={toggleCollapsed}
        className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 z-20"
        title="Minimize"
      >
         <i className="fa-solid fa-compress-alt"></i>
      </button>

      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200 shadow-sm"
              }`}
            >
              <div className="prose prose-sm">
                {msg.text.split('\n').map((line, i) => (
                    <p key={i} className="mb-1">{line}</p>
                ))}
              </div>

              {msg.isGenerating && (
                <div className="mt-2 p-3 bg-white/50 rounded-lg border border-slate-200 flex flex-col items-center gap-2">
                   <div className="flex gap-1.5">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-75"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-150"></div>
                   </div>
                   <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{msg.statusText}</span>
                </div>
              )}

              {msg.imageUrl && (
                <div className="mt-3 rounded-lg overflow-hidden border border-slate-200 bg-slate-200 animate-fade-in">
                  <img src={msg.imageUrl} alt="AI Generated Explanation" className="w-full h-auto cursor-zoom-in hover:opacity-90 transition-opacity" />
                </div>
              )}

              {msg.videoUrl && (
                <div className="mt-3 rounded-lg overflow-hidden border border-slate-200 bg-black aspect-video animate-fade-in relative group">
                  <video src={msg.videoUrl} controls className="w-full h-full" />
                  <div className="absolute top-2 left-2 bg-indigo-600 text-white text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <i className="fa-solid fa-video mr-1"></i> Cinematic AI
                  </div>
                </div>
              )}
            </div>
            
            {/* Message Rating UI for A/B Testing */}
            {msg.role === 'model' && !msg.isGenerating && (
                <div className="flex items-center gap-2 mt-1 ml-2">
                    <button 
                        onClick={() => handleRating(idx, 'Helpful')}
                        className={`text-xs p-1 rounded hover:bg-slate-100 transition-colors ${msg.rating === 'Helpful' ? 'text-emerald-600' : 'text-slate-400'}`}
                        title="Helpful explanation"
                    >
                        <i className={`fa-${msg.rating === 'Helpful' ? 'solid' : 'regular'} fa-thumbs-up`}></i>
                    </button>
                    <button 
                        onClick={() => handleRating(idx, 'Not Helpful')}
                        className={`text-xs p-1 rounded hover:bg-slate-100 transition-colors ${msg.rating === 'Not Helpful' ? 'text-red-500' : 'text-slate-400'}`}
                        title="Not helpful"
                    >
                        <i className={`fa-${msg.rating === 'Not Helpful' ? 'solid' : 'regular'} fa-thumbs-down`}></i>
                    </button>
                </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
             <div className="bg-slate-100 rounded-2xl rounded-bl-none p-3 border border-slate-200">
                <div className="flex gap-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                </div>
             </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-slate-200">
        <div className="flex items-center gap-2 mb-3">
           <button 
             onClick={() => handleMediaGen('image')}
             disabled={loading}
             className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition-all border border-indigo-100 disabled:opacity-50"
           >
              <i className="fa-solid fa-wand-magic-sparkles"></i> Visualize
           </button>
           <button 
             onClick={() => handleMediaGen('video')}
             disabled={loading}
             className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-xs font-bold transition-all border border-purple-100 disabled:opacity-50"
           >
              <i className="fa-solid fa-film"></i> Animate
           </button>
        </div>
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask a question..."
            className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-full py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <i className="fa-solid fa-paper-plane text-xs"></i>
          </button>
        </div>
      </div>
    </div>
  );
};
