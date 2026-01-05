
import React, { useState } from "react";
import { CodeReviewResult } from "../types";

interface CodeReviewCardProps {
  result: CodeReviewResult;
  userCode: string;
  onClose: () => void;
}

export const CodeReviewCard = ({ result, userCode, onClose }: CodeReviewCardProps) => {
  const [showDiff, setShowDiff] = useState(false);

  // Gauge Calculation
  // Score 0-100.
  // We want a semi-circle gauge.
  // circumference = PI * r (for semi-circle arc length used in stroke-dasharray tricks usually involves full circle math)
  // Let's use simple rotation logic.
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  // We only show half circle, so max offset is half circumference?
  // Actually easier to just map 0-100 to 0-180 degrees.
  const rotation = (result.complexityScore / 100) * 180;

  // Determine Gauge Color
  let gaugeColor = "text-red-500";
  if (result.complexityScore > 40) gaugeColor = "text-yellow-500";
  if (result.complexityScore > 80) gaugeColor = "text-emerald-500";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-4xl bg-[#1e293b] rounded-2xl border border-slate-700 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-700 bg-[#0f172a] flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
               <i className="fa-solid fa-microscope"></i>
            </div>
            Code Review
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        {/* Content */}
        {!showDiff ? (
          <div className="p-8 overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Column 1: Complexity Gauge */}
            <div className="flex flex-col items-center justify-center p-6 bg-[#0f172a] rounded-xl border border-slate-700">
               <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-6">Efficiency Score</h3>
               
               <div className="relative w-48 h-24 overflow-hidden mb-2">
                  {/* Gauge Background */}
                  <div className="absolute top-0 left-0 w-48 h-48 rounded-full border-[12px] border-slate-700 box-border"></div>
                  {/* Gauge Progress (Rotated) */}
                  <div 
                    className={`absolute top-0 left-0 w-48 h-48 rounded-full border-[12px] ${gaugeColor.replace('text-', 'border-')} box-border transition-transform duration-1000 ease-out origin-center`}
                    style={{ transform: `rotate(${rotation - 180}deg)` }}
                  ></div>
               </div>
               
               <div className="text-center -mt-8 relative z-10">
                   <span className={`text-4xl font-black ${gaugeColor}`}>{result.complexityScore}</span>
                   <span className="text-slate-500 text-sm font-bold">/100</span>
               </div>
               
               <p className="text-slate-300 text-sm text-center mt-4 font-medium px-4">
                   {result.complexity}
               </p>
            </div>

            {/* Column 2: Style & Suggestions */}
            <div className="md:col-span-2 space-y-6">
                
                {/* Critical Issues Alert */}
                {result.criticalIssues && result.criticalIssues.length > 0 && (
                    <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex gap-4 animate-pulse">
                        <div className="text-red-500 text-xl pt-1">
                            <i className="fa-solid fa-triangle-exclamation"></i>
                        </div>
                        <div>
                            <h4 className="text-red-400 font-bold mb-1">Critical Issues Detected</h4>
                            <ul className="list-disc pl-4 space-y-1">
                                {result.criticalIssues.map((issue, i) => (
                                    <li key={i} className="text-red-200 text-sm">{issue}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {/* Style Audit */}
                <div className="bg-[#0f172a] rounded-xl border border-slate-700 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-700 flex justify-between items-center">
                        <h4 className="font-bold text-slate-200">Style Audit</h4>
                        <div className="flex gap-1">
                            {[...Array(10)].map((_, i) => (
                                <div key={i} className={`w-1.5 h-4 rounded-sm ${i < result.styleScore ? 'bg-blue-500' : 'bg-slate-700'}`}></div>
                            ))}
                        </div>
                    </div>
                    <ul className="divide-y divide-slate-700/50">
                        {result.suggestions.map((sug, i) => (
                            <li key={i} className="px-6 py-4 flex gap-3 text-sm text-slate-300 hover:bg-slate-800/50 transition-colors">
                                <i className="fa-solid fa-wand-magic-sparkles text-blue-400 mt-0.5"></i>
                                {sug}
                            </li>
                        ))}
                    </ul>
                </div>

                <button 
                    onClick={() => setShowDiff(true)}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                    <i className="fa-solid fa-code-pull-request"></i>
                    Fix it for me
                </button>
            </div>
          </div>
        ) : (
          /* Diff View */
          <div className="flex-1 flex flex-col overflow-hidden bg-[#1e1e1e]">
              <div className="px-6 py-3 bg-[#252526] border-b border-[#333] flex justify-between items-center">
                  <div className="flex gap-8">
                      <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-wider">
                          <i className="fa-solid fa-file-code"></i> Your Code
                      </div>
                      <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                          <i className="fa-solid fa-file-circle-check"></i> Optimized
                      </div>
                  </div>
                  <button onClick={() => setShowDiff(false)} className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
                      <i className="fa-solid fa-arrow-left"></i> Back to Review
                  </button>
              </div>
              
              <div className="flex-1 flex min-h-0">
                  <div className="flex-1 border-r border-[#333] overflow-auto p-4 font-mono text-xs leading-relaxed text-slate-300 bg-[#1e1e1e]/50">
                      <pre>{userCode}</pre>
                  </div>
                  <div className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed text-emerald-100 bg-emerald-900/10">
                      <pre>{result.fixedCode}</pre>
                  </div>
              </div>
          </div>
        )}

      </div>
    </div>
  );
};
