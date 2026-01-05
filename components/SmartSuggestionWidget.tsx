
import React, { useState, useEffect } from "react";
import { RecommendedProblem } from "../types";
import { getRecommendedProblem } from "../api";

export const SmartSuggestionWidget = ({ onSolve }: { onSolve?: (title: string) => void }) => {
  const [recommendations, setRecommendations] = useState<RecommendedProblem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      // In a real app, this would fetch 3 distinct recommendations
      // For this demo, we'll simulate fetching 3 problems
      const mockData: RecommendedProblem[] = [
        {
          title: "Trapping Rain Water",
          difficulty: "Hard",
          topic: "Arrays & Pointers",
          reason: "You've mastered 'Two Pointers' basics. This builds on that intuition while introducing Monotonic Stacks."
        },
        {
          title: "Lowest Common Ancestor",
          difficulty: "Medium",
          topic: "Trees",
          reason: "Your tree traversal speed is high. LCA will test your recursive backtracking logic."
        },
        {
          title: "Course Schedule II",
          difficulty: "Medium",
          topic: "Graphs",
          reason: "Based on your interest in SDE roles, Topological Sort is a common interview pattern you haven't tried yet."
        }
      ];
      
      setRecommendations(mockData);
      setLoading(false);
    };
    fetchRecommendations();
  }, []);

  if (loading) {
    return (
      <div className="flex gap-4 overflow-x-hidden">
        {[1, 2, 3].map((i) => (
          <div key={i} className="min-w-[320px] h-64 bg-slate-200 animate-pulse rounded-2xl"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="relative group">
      {/* Scroll Indicators */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <i className="fa-solid fa-sparkles text-indigo-500"></i> Smart Suggestions
        </h3>
        <div className="flex gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
            <div className="w-2 h-2 rounded-full bg-slate-300"></div>
            <div className="w-2 h-2 rounded-full bg-slate-300"></div>
        </div>
      </div>

      {/* Horizontal Scroll Container */}
      <div className="flex overflow-x-auto gap-6 pb-6 scrollbar-hide snap-x snap-mandatory">
        {recommendations.map((problem, idx) => (
          <div 
            key={idx}
            className="snap-center min-w-[320px] md:min-w-[360px] relative overflow-hidden rounded-3xl p-6 transition-all duration-500 hover:-translate-y-1"
          >
            {/* Glassmorphism Background */}
            <div className="absolute inset-0 bg-white/40 backdrop-blur-xl border border-white/60 shadow-xl shadow-indigo-100/50 -z-10"></div>
            
            {/* Decorative Gradient Blob */}
            <div className={`absolute -top-12 -right-12 w-32 h-32 blur-3xl opacity-20 -z-10 rounded-full ${
                problem.difficulty === 'Hard' ? 'bg-rose-500' : 'bg-indigo-500'
            }`}></div>

            <div className="flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${
                        problem.difficulty === "Easy" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                        problem.difficulty === "Medium" ? "bg-amber-50 text-amber-600 border-amber-100" :
                        "bg-rose-50 text-rose-600 border-rose-100"
                    }`}>
                        {problem.difficulty}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">{problem.topic}</span>
                </div>

                <h4 className="text-xl font-extrabold text-slate-900 mb-4 group-hover:text-indigo-600 transition-colors">
                    {problem.title}
                </h4>

                <div className="flex-1 bg-white/30 rounded-2xl p-4 border border-white/40 mb-6">
                    <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider mb-1">
                        <i className="fa-solid fa-wand-magic-sparkles mr-1"></i> Why this?
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed italic">
                        "{problem.reason}"
                    </p>
                </div>

                <button 
                    onClick={() => onSolve?.(problem.title)}
                    className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-2 group/btn"
                >
                    <span>Start Solving</span>
                    <i className="fa-solid fa-arrow-right text-[10px] group-hover/btn:translate-x-1 transition-transform"></i>
                </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
