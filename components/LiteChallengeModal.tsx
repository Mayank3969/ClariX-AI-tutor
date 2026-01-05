
import React, { useState } from "react";
import { DailyTask, Badge } from "../types";
import { checkForNewBadges } from "../utils/badgeManager";
import { MOCK_USER, MOCK_USER_STATS } from "../data";
import { BadgeCelebrationModal } from "./BadgeCelebrationModal";

interface LiteChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: DailyTask;
}

export const LiteChallengeModal = ({ isOpen, onClose, task }: LiteChallengeModalProps) => {
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [earnedBadge, setEarnedBadge] = useState<Badge | null>(null);

  const handleSubmit = () => {
    if (!answer.trim()) return;
    setSubmitted(true);
    // In a real app, verify answer via API/AI
    
    // Check for badges (e.g., Streak Master)
    const newBadge = checkForNewBadges(MOCK_USER, MOCK_USER_STATS, {});
    if (newBadge) {
        setEarnedBadge(newBadge);
        MOCK_USER.badges.push(newBadge.id);
    }
  };

  if (!isOpen) return null;

  return (
    <>
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      ></div>
      
      <div className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in-up">
        {submitted ? (
          <div className="p-10 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-4xl mb-6 shadow-inner animate-bounce">
              <i className="fa-solid fa-check"></i>
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">Streak Extended!</h3>
            <p className="text-slate-500 mb-8">You're one step closer to mastery.</p>
            <button 
              onClick={onClose}
              className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all w-full"
            >
              Continue
            </button>
          </div>
        ) : (
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded border border-indigo-100">
                  Daily Micro-Problem
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-2 leading-tight">
                  {task.problem.title}
                </h3>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6 text-sm text-slate-700 leading-relaxed font-medium">
              {task.problem.description}
            </div>

            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your solution or reasoning here..."
              className="w-full h-32 p-4 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none mb-6 text-sm text-slate-800"
            ></textarea>

            <button 
              onClick={handleSubmit}
              disabled={!answer.trim()}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              <span>Submit & Keep Streak</span>
              <i className="fa-solid fa-fire text-orange-400"></i>
            </button>
          </div>
        )}
      </div>
    </div>
    {earnedBadge && (
        <BadgeCelebrationModal badge={earnedBadge} onClose={() => setEarnedBadge(null)} />
    )}
    </>
  );
};
