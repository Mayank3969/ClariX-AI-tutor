
import React, { useEffect, useState, useRef } from "react";
import { CommunityPost } from "../types";
import { compareSolutions } from "../api";

interface CompareSolutionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  solutionA: CommunityPost;
  solutionB: CommunityPost;
}

export const CompareSolutionsModal = ({
  isOpen,
  onClose,
  solutionA,
  solutionB,
}: CompareSolutionsModalProps) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Refs for Scroll Synchronization
  const leftCodeRef = useRef<HTMLDivElement>(null);
  const rightCodeRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef<"left" | "right" | null>(null);

  const handleScroll = (source: "left" | "right") => {
    if (isScrolling.current && isScrolling.current !== source) return;
    
    isScrolling.current = source;
    const sourceRef = source === "left" ? leftCodeRef : rightCodeRef;
    const targetRef = source === "left" ? rightCodeRef : leftCodeRef;

    if (sourceRef.current && targetRef.current) {
      targetRef.current.scrollTop = sourceRef.current.scrollTop;
      targetRef.current.scrollLeft = sourceRef.current.scrollLeft;
    }

    // Debounce resetting the scroll lock
    setTimeout(() => {
      isScrolling.current = null;
    }, 50);
  };

  const triggerComparisonAnalysis = async () => {
    if (solutionA && solutionB) {
        setLoading(true);
        setAnalysis(null);
        const result = await compareSolutions(solutionA.code, solutionB.code);
        setAnalysis(result);
        setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
        triggerComparisonAnalysis();
    }
  }, [isOpen, solutionA, solutionB]);

  if (!isOpen) return null;

  // Helper to generate line numbers
  const CodeViewer = ({ code, refProp, onScroll }: { code: string, refProp: React.RefObject<HTMLDivElement>, onScroll: () => void }) => {
     const lineCount = code.split('\n').length;
     return (
        <div className="flex h-full font-mono text-sm bg-[#1e1e1e] text-[#d4d4d4]">
            {/* Line Numbers */}
            <div className="flex-shrink-0 w-12 bg-[#1e1e1e] border-r border-[#3e3e3e] text-[#858585] text-right py-4 pr-3 select-none leading-relaxed overflow-hidden">
                {Array.from({length: lineCount}).map((_, i) => (
                    <div key={i}>{i+1}</div>
                ))}
            </div>
            {/* Code Content */}
            <div 
                ref={refProp}
                onScroll={onScroll}
                className="flex-1 p-4 overflow-auto custom-scrollbar leading-relaxed whitespace-pre"
            >
                {code}
            </div>
        </div>
     );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      <div className="relative bg-[#1e1e1e] rounded-xl shadow-2xl w-full max-w-[90vw] h-[90vh] flex flex-col overflow-hidden animate-fade-in-up border border-[#3e3e3e]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#3e3e3e] bg-[#252526]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 text-white rounded flex items-center justify-center shadow-lg shadow-blue-500/20">
              <i className="fa-solid fa-code-compare"></i>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-200">Diff Viewer</h2>
              <p className="text-xs text-gray-400">Comparing solutions from <span className="text-blue-400">{solutionA.author.name}</span> & <span className="text-blue-400">{solutionB.author.name}</span></p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
                onClick={triggerComparisonAnalysis}
                disabled={loading}
                className="text-xs bg-[#3e3e3e] hover:bg-[#4e4e4e] text-gray-300 px-3 py-1.5 rounded transition-colors flex items-center gap-2"
            >
                <i className={`fa-solid fa-arrows-rotate ${loading ? 'fa-spin' : ''}`}></i> Re-Analyze
            </button>
            <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white rounded hover:bg-[#3e3e3e] transition-colors"
            >
                <i className="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>
        </div>

        {/* Diff Area */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-[#1e1e1e]">
             {/* Left Pane */}
             <div className="flex-1 flex flex-col border-r border-[#3e3e3e] min-w-0">
                 <div className="px-4 py-2 bg-[#2d2d2d] border-b border-[#3e3e3e] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                          <img src={solutionA.author.avatar} className="w-5 h-5 rounded-full grayscale opacity-80" />
                          <span className="text-xs font-bold text-gray-300">{solutionA.author.name}</span>
                          <span className="text-[10px] text-gray-500 uppercase px-1.5 py-0.5 bg-[#3e3e3e] rounded">Original</span>
                      </div>
                      <span className="text-xs font-mono text-gray-500">Left</span>
                 </div>
                 <div className="flex-1 overflow-hidden relative">
                     <CodeViewer code={solutionA.code} refProp={leftCodeRef} onScroll={() => handleScroll("left")} />
                 </div>
             </div>

             {/* Right Pane */}
             <div className="flex-1 flex flex-col min-w-0">
                 <div className="px-4 py-2 bg-[#2d2d2d] border-b border-[#3e3e3e] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                          <img src={solutionB.author.avatar} className="w-5 h-5 rounded-full grayscale opacity-80" />
                          <span className="text-xs font-bold text-gray-300">{solutionB.author.name}</span>
                          <span className="text-[10px] text-gray-500 uppercase px-1.5 py-0.5 bg-[#3e3e3e] rounded">Comparison</span>
                      </div>
                      <span className="text-xs font-mono text-gray-500">Right</span>
                 </div>
                 <div className="flex-1 overflow-hidden relative">
                    <CodeViewer code={solutionB.code} refProp={rightCodeRef} onScroll={() => handleScroll("right")} />
                 </div>
             </div>
        </div>

        {/* AI Analysis Footer (Collapsible/Overlay) */}
        <div className="h-1/3 min-h-[200px] border-t border-[#3e3e3e] bg-[#1e1e1e] flex flex-col">
             <div className="px-6 py-2 bg-[#252526] border-b border-[#3e3e3e] flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
                <i className="fa-solid fa-robot"></i> Gemini Analysis
             </div>
             <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-full space-y-4">
                        <div className="flex gap-1.5">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-75"></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-150"></div>
                        </div>
                        <p className="text-sm text-gray-500 font-mono">Analyzing logic differences...</p>
                    </div>
                ) : (
                    <div className="prose prose-invert prose-sm max-w-none text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">
                        {analysis}
                    </div>
                )}
             </div>
        </div>

      </div>
    </div>
  );
};
