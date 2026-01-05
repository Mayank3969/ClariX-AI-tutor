
import React from "react";
import { View } from "../types";

// Note: We now treat this component as the "Lobby" or "Intro" screen.
// The actual session logic has moved to MockInterviewSession.tsx

export const MockInterview = ({ onStart }: { onStart: () => void }) => {
  return (
      <div className="flex items-center justify-center h-[calc(100vh-80px)] bg-slate-900 p-8">
          <div className="max-w-2xl w-full bg-[#1e293b] rounded-2xl border border-slate-700 shadow-2xl p-10 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-orange-500 to-red-500"></div>
              
              <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-8 border border-slate-600 shadow-inner">
                  <i className="fa-solid fa-user-tie text-4xl text-slate-200"></i>
              </div>
              
              <h1 className="text-3xl font-black text-white mb-4">Mock Interview Mode</h1>
              <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                  You are about to enter a simulated interview with a <strong>Senior Staff Engineer</strong> from a top tech company. 
                  <br/><br/>
                  <span className="text-red-400 font-bold"><i className="fa-solid fa-triangle-exclamation mr-2"></i> Warning:</span> 
                  The interviewer is strict. They will interrupt you if you start coding without explaining your logic first.
              </p>

              <button 
                onClick={onStart}
                className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-red-900/50 flex items-center gap-3 mx-auto"
              >
                  <i className="fa-solid fa-microphone-lines"></i>
                  Start Interview
              </button>
          </div>
      </div>
  );
};
