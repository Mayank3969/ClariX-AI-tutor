
import React, { useState } from "react";

interface VoteControlProps {
  postId: string;
  initialScore: number;
  initialVote: "up" | "down" | null;
  onVote: (postId: string, newVote: "up" | "down" | null) => void;
  userReputation: number;
}

export const VoteControl = ({ 
  postId, 
  initialScore, 
  initialVote, 
  onVote, 
  userReputation 
}: VoteControlProps) => {
  const [score, setScore] = useState(initialScore);
  const [vote, setVote] = useState<"up" | "down" | null>(initialVote);
  
  const isPowerVoter = userReputation > 500;

  const handleVote = (direction: "up" | "down") => {
    let newVote: "up" | "down" | null = direction;
    let scoreDelta = 0;

    if (vote === direction) {
        // Toggle off if clicking the same active vote
        newVote = null;
        scoreDelta = direction === 'up' ? -1 : 1;
    } else if (vote === null) {
        // New vote from neutral
        scoreDelta = direction === 'up' ? 1 : -1;
    } else {
        // Switch vote (e.g. up to down)
        scoreDelta = direction === 'up' ? 2 : -2;
    }
    
    // Optimistic Update
    setVote(newVote);
    setScore(prev => prev + scoreDelta);
    
    // Sync with parent/server
    onVote(postId, newVote);
  };

  const formatScore = (num: number) => {
    if (Math.abs(num) >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  return (
    <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm select-none group/vote">
      <button 
        onClick={() => handleVote("up")}
        className={`px-3 py-1.5 transition-all duration-300 border-r border-slate-200 flex items-center justify-center ${
            vote === "up" 
            ? isPowerVoter
                ? "bg-gradient-to-t from-amber-50 to-amber-100 text-amber-600 shadow-[inset_0_0_8px_rgba(245,158,11,0.2)]"
                : "bg-orange-50 text-orange-600"
            : "hover:bg-slate-50 text-slate-400 hover:text-orange-500"
        }`}
        title={isPowerVoter && vote === "up" ? "Power Vote Active!" : "Upvote"}
      >
        <i className={`fa-solid fa-caret-up text-lg transition-transform duration-200 ${vote === 'up' ? 'scale-110' : ''} ${isPowerVoter && vote === "up" ? "drop-shadow-[0_0_5px_rgba(245,158,11,0.6)]" : ""}`}></i>
      </button>
      
      <span className={`px-3 py-1.5 text-sm font-bold min-w-[40px] text-center transition-colors ${
          vote === "up" ? (isPowerVoter ? "text-amber-600" : "text-orange-600") : 
          vote === "down" ? "text-indigo-600" : 
          score < 0 ? "text-red-500" : "text-slate-700"
      }`}>
        {formatScore(score)}
      </span>
      
      <button 
        onClick={() => handleVote("down")}
        className={`px-3 py-1.5 transition-colors border-l border-slate-200 flex items-center justify-center ${
            vote === "down" 
            ? "bg-indigo-50 text-indigo-600" 
            : "hover:bg-slate-50 text-slate-400 hover:text-indigo-500"
        }`}
      >
        <i className={`fa-solid fa-caret-down text-lg transition-transform duration-200 ${vote === 'down' ? 'scale-110' : ''}`}></i>
      </button>
    </div>
  );
};
