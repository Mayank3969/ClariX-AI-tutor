
import React from "react";

export const PhilosophyBrief = () => {
  const pillars = [
    {
      problem: "Tutorial Hell & Passive Learning",
      solution: "Socratic AI Tutoring",
      desc: "Generic bots give answers. Clarix asks the right questions to build your neural pathways.",
      icon: "fa-brain-circuit"
    },
    {
      problem: "Disconnected Performance Data",
      solution: "LeetCode Data Sync",
      desc: "We analyze your real-world struggle patterns to curate a roadmap that evolves with you.",
      icon: "fa-link-slash"
    },
    {
      problem: "Misleading Community Advice",
      solution: "AI-Verified Solutions",
      desc: "Every peer solution is stress-tested by Gemini 3 Pro for logical errors before you see it.",
      icon: "fa-shield-check"
    }
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden animate-fade-in-up">
      <div className="p-8 lg:p-10 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-2xl font-black text-slate-900 mb-2">The Clarix Mission</h2>
        <p className="text-slate-500 font-medium max-w-2xl">
          We didn't build another chatbot. We built a context-locked environment for deep engineering mastery.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
        {pillars.map((p, i) => (
          <div key={i} className="p-8 hover:bg-slate-50 transition-colors group">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl mb-6 shadow-sm group-hover:scale-110 transition-transform">
                <i className={`fa-solid ${p.icon}`}></i>
            </div>
            
            <div className="space-y-4">
                <div>
                    <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest block mb-1">The Problem</span>
                    <h4 className="text-sm font-bold text-slate-400 line-through decoration-rose-300">{p.problem}</h4>
                </div>
                <div>
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block mb-1">The Clarix Solution</span>
                    <h4 className="text-lg font-extrabold text-slate-900">{p.solution}</h4>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                    {p.desc}
                </p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-indigo-600 p-4 text-center">
          <p className="text-white text-xs font-bold uppercase tracking-widest">
              Powered by Google Gemini Pro & Adaptive Pedagogy Logic
          </p>
      </div>
    </div>
  );
};
