
import React, { useState, useEffect, useRef } from "react";
import { Chat, GenerateContentResponse } from "@google/genai";
import { createMockInterviewer, getRandomInterviewProblem, analyzeCodeSubmission } from "../api";
import { ChatMessage, InterviewProblem, CodeReviewResult, Badge } from "../types";
import { CodeReviewCard } from "../components/CodeReviewCard";
import { checkForNewBadges } from "../utils/badgeManager";
import { MOCK_USER, MOCK_USER_STATS } from "../data";
import { BadgeCelebrationModal } from "../components/BadgeCelebrationModal";

// Declare SpeechRecognition types since they are not standard in all TS environments
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const MockInterviewSession = () => {
  // Session State
  const [problem, setProblem] = useState<InterviewProblem | null>(null);
  const [timeLeft, setTimeLeft] = useState(45 * 60); // 45 minutes
  
  // Chat & AI State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const chatRef = useRef<Chat | null>(null);
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Audio State
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Editor State
  const [isEditorEnabled, setIsEditorEnabled] = useState(false);
  const [code, setCode] = useState("// Wait for interviewer approval to start coding...");
  
  // Review State
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewResult, setReviewResult] = useState<CodeReviewResult | null>(null);
  
  // Badge State
  const [earnedBadge, setEarnedBadge] = useState<Badge | null>(null);

  // 1. Initialize Session
  useEffect(() => {
    const initSession = async () => {
      // Get a random problem
      const p = getRandomInterviewProblem();
      setProblem(p);

      // Create Chat with context
      const chat = createMockInterviewer(p);
      chatRef.current = chat;

      // Start the conversation
      setIsAIProcessing(true);
      try {
        const result: GenerateContentResponse = await chat.sendMessage({ message: "I am ready. Please start the interview." });
        setMessages([{ role: "model", text: result.text || "Hello. Let's begin." }]);
      } catch (e) {
        console.error(e);
      } finally {
        setIsAIProcessing(false);
      }
    };

    initSession();

    // Timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 2. Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        handleSend(transcript);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
  };

  // 3. Handle Messaging
  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() || !chatRef.current) return;

    setInput("");
    setMessages(prev => [...prev, { role: "user", text: textToSend }]);
    setIsAIProcessing(true);

    try {
      const result: GenerateContentResponse = await chatRef.current.sendMessage({ message: textToSend });
      const responseText = result.text || "...";
      
      setMessages(prev => [...prev, { role: "model", text: responseText }]);

      // Check for unlock phrase
      if (responseText.toLowerCase().includes("you may proceed to code")) {
        setIsEditorEnabled(true);
        setCode((prev) => prev === "// Wait for interviewer approval to start coding..." ? "" : prev);
      }

    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: "model", text: "Connection error." }]);
    } finally {
      setIsAIProcessing(false);
    }
  };

  // 4. Handle Code Submission
  const handleSubmitCode = async () => {
    if (!problem || !code.trim()) return;
    setIsReviewing(true);
    
    // Simulate "Submitting..." UI
    try {
        const result = await analyzeCodeSubmission(code, problem);
        setReviewResult(result);

        // Check for Badges (e.g., Clean Coder)
        const newBadge = checkForNewBadges(MOCK_USER, MOCK_USER_STATS, {
            styleScore: result.styleScore,
            topic: "Graphs" // Assume context for demo logic or check problem metadata
        });
        
        if (newBadge) {
            setEarnedBadge(newBadge);
            MOCK_USER.badges.push(newBadge.id);
        }

    } catch (e) {
        console.error(e);
    } finally {
        setIsReviewing(false);
    }
  };

  // Auto-scroll chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Formatting Timer
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!problem) return (
      <div className="flex items-center justify-center h-screen bg-slate-900 text-white">
          <div className="flex flex-col items-center gap-4">
              <i className="fa-solid fa-spinner fa-spin text-4xl text-blue-500"></i>
              <p>Setting up interview environment...</p>
          </div>
      </div>
  );

  return (
    <div className="flex flex-col h-screen bg-[#0f172a] overflow-hidden text-slate-300 font-sans relative">
      
      {earnedBadge && (
          <BadgeCelebrationModal badge={earnedBadge} onClose={() => setEarnedBadge(null)} />
      )}

      {/* Top Bar: Timer */}
      <div className="h-14 bg-[#1e293b] border-b border-slate-700 flex items-center justify-between px-6 relative z-20">
         <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
             <span className="font-bold text-white text-sm tracking-wider">LIVE SESSION</span>
         </div>
         
         <div className="absolute left-1/2 -translate-x-1/2 bg-black/30 px-6 py-1.5 rounded-full border border-white/5 flex items-center gap-3">
             <i className="fa-regular fa-clock text-blue-400"></i>
             <span className={`font-mono font-bold text-lg ${timeLeft < 300 ? 'text-red-400' : 'text-white'}`}>
                 {formatTime(timeLeft)}
             </span>
         </div>

         <button 
            onClick={() => window.location.reload()} // Quick exit
            className="text-xs font-medium text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded transition-all"
         >
             End Interview
         </button>
      </div>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden">
          
          {/* Left: Problem Statement (3 cols) */}
          <div className="col-span-3 border-r border-slate-800 bg-[#0f172a] flex flex-col min-w-0">
              <div className="p-6 overflow-y-auto custom-scrollbar">
                  <h2 className="text-xl font-bold text-white mb-4">{problem.title}</h2>
                  <div className="flex gap-2 mb-6">
                      <span className="px-2 py-0.5 rounded border border-yellow-700 text-yellow-500 text-xs font-bold uppercase">{problem.difficulty}</span>
                      <span className="px-2 py-0.5 rounded border border-slate-700 text-slate-400 text-xs font-bold uppercase">Algorithms</span>
                  </div>
                  
                  <div className="prose prose-invert prose-sm">
                      <p>{problem.description}</p>
                      
                      <h4 className="text-slate-200 font-bold mt-6 mb-2">Examples</h4>
                      {problem.examples.map((ex, i) => (
                          <div key={i} className="bg-slate-900 rounded p-3 mb-3 border border-slate-800">
                              <div className="mb-1"><span className="text-slate-500 font-mono text-xs">Input:</span> <span className="font-mono text-xs text-blue-300">{ex.input}</span></div>
                              <div><span className="text-slate-500 font-mono text-xs">Output:</span> <span className="font-mono text-xs text-green-300">{ex.output}</span></div>
                          </div>
                      ))}

                      <h4 className="text-slate-200 font-bold mt-6 mb-2">Constraints</h4>
                      <ul className="list-disc pl-4 space-y-1 text-slate-400 text-xs font-mono">
                          {problem.constraints.map((c, i) => <li key={i}>{c}</li>)}
                      </ul>
                  </div>
              </div>
          </div>

          {/* Center: Code Editor (5 cols) */}
          <div className="col-span-6 bg-[#1e1e1e] flex flex-col border-r border-slate-800 relative">
              {/* Editor Header */}
              <div className="h-10 bg-[#252526] border-b border-[#333] flex items-center px-4 justify-between">
                  <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]"></div>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">solution.py</span>
                  
                  {isEditorEnabled && (
                      <button 
                        onClick={handleSubmitCode}
                        className="flex items-center gap-2 bg-green-700 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-bold transition-colors"
                        disabled={isReviewing}
                      >
                          {isReviewing ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-play"></i>}
                          Submit Solution
                      </button>
                  )}
              </div>

              {/* Editor Body */}
              <div className="flex-1 relative">
                  {!isEditorEnabled && (
                      <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center text-center p-8 animate-fade-in">
                          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 shadow-lg border border-slate-700">
                              <i className="fa-solid fa-lock text-slate-400 text-2xl"></i>
                          </div>
                          <h3 className="text-white font-bold text-lg mb-2">Editor Locked</h3>
                          <p className="text-slate-400 max-w-xs text-sm">
                              You must explain your approach to the interviewer before writing code.
                          </p>
                      </div>
                  )}
                  <textarea 
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      disabled={!isEditorEnabled}
                      className="w-full h-full bg-[#1e1e1e] text-[#d4d4d4] font-mono text-sm p-4 resize-none focus:outline-none leading-relaxed"
                      spellCheck="false"
                  ></textarea>
              </div>
          </div>

          {/* Right: Interviewer Chat (4 cols) */}
          <div className="col-span-3 bg-[#0f172a] flex flex-col">
              <div className="p-4 border-b border-slate-800 bg-[#162032] flex items-center gap-3">
                  <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center overflow-hidden">
                          <i className="fa-solid fa-user-tie text-xl text-slate-300"></i>
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-[#162032] rounded-full"></div>
                  </div>
                  <div>
                      <h3 className="font-bold text-white text-sm">Senior Interviewer</h3>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wide">Google • L6 Staff Engineer</p>
                  </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                  {messages.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[90%] p-3 rounded-2xl text-sm leading-relaxed ${
                              msg.role === 'user' 
                              ? 'bg-blue-600 text-white rounded-br-none' 
                              : 'bg-[#1e293b] text-slate-300 border border-slate-700 rounded-bl-none'
                          }`}>
                              {msg.text}
                          </div>
                      </div>
                  ))}
                  {isAIProcessing && (
                      <div className="flex justify-start">
                          <div className="bg-[#1e293b] border border-slate-700 px-4 py-3 rounded-2xl rounded-bl-none flex gap-1.5">
                              <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></div>
                              <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-75"></div>
                              <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-150"></div>
                          </div>
                      </div>
                  )}
              </div>

              {/* Controls */}
              <div className="p-4 border-t border-slate-800 bg-[#162032]">
                  <div className="flex items-center gap-2 mb-2">
                      <button 
                          onClick={toggleRecording}
                          className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                              isRecording 
                              ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse' 
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                          }`}
                      >
                          <i className={`fa-solid ${isRecording ? 'fa-stop' : 'fa-microphone'}`}></i>
                          {isRecording ? "Listening..." : "Start Recording"}
                      </button>
                  </div>
                  <div className="relative">
                      <input 
                          type="text" 
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                          placeholder="Type or speak your answer..."
                          className="w-full bg-[#0f172a] text-white border border-slate-700 rounded-lg py-2.5 pl-3 pr-10 text-sm focus:outline-none focus:border-blue-500"
                      />
                      <button 
                          onClick={() => handleSend()}
                          disabled={!input.trim() || isAIProcessing}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-400 disabled:opacity-30"
                      >
                          <i className="fa-solid fa-paper-plane"></i>
                      </button>
                  </div>
              </div>
          </div>
      </div>

      {/* Code Review Card (Replaces old modal) */}
      {reviewResult && (
          <CodeReviewCard 
            result={reviewResult} 
            userCode={code} 
            onClose={() => setReviewResult(null)} 
          />
      )}
    </div>
  );
};
