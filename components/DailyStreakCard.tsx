
import React, { useState } from "react";
import { DailyTask } from "../types";
import { LiteChallengeModal } from "./LiteChallengeModal";

interface DailyStreakCardProps {
  streak: number;
  task: DailyTask;
}

export const DailyStreakCard = ({ streak, task }: DailyStreakCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-lg border border-slate-700 overflow-hidden flex flex-col h-full relative group">
        
        {/* Glow Effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-3xl -mr-10 -mt-10 rounded-full pointer-events-none"></div>

        {/* Top: Wisdom */}
        <div className="p-6 flex-1">
          <div className="flex items-center gap-2 mb-3">
            <i className="fa-solid fa-moon text-yellow-300 text-xs"></i>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Daily Wisdom</span>
          </div>
          <p className="text-white text-sm font-medium leading-relaxed italic opacity-90">
            "{task.concept}"
          </p>
        </div>

        {/* Bottom: Action */}
        <div className="p-4 bg-black/20 border-t border-white/5 flex items-center gap-4">
          <div className="flex flex-col items-center justify-center bg-slate-800 rounded-lg w-12 h-12 border border-slate-700 shadow-inner group-hover:border-orange-500/50 transition-colors">
            <i className="fa-solid fa-fire text-orange-500 text-lg mb-0.5 animate-pulse"></i>
            <span className="text-[10px] font-bold text-white leading-none">{streak}</span>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex-1 bg-white hover:bg-slate-50 text-slate-900 font-bold text-xs py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>Today's Challenge</span>
            <i className="fa-solid fa-chevron-right text-[10px]"></i>
          </button>
        </div>
      </div>

      <LiteChallengeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        task={task} 
      />
    </>
  );
};
