import React, { useState } from "react";
import { TopicOverviewData, SubAlgorithm } from "../types";
import { regenerateTopicSummary } from "../api";

interface TopicOverviewProps {
  data: TopicOverviewData;
  onAlgorithmClick: (algorithm: SubAlgorithm) => void;
  onBack: () => void;
}

export const TopicOverview = ({ data, onAlgorithmClick, onBack }: TopicOverviewProps) => {
  const [description, setDescription] = useState(data.description);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    const algoTitles = data.algorithms.map(a => a.title);
    const newSummary = await regenerateTopicSummary(data.title, algoTitles);
    setDescription(newSummary);
    setIsRegenerating(false);
    console.log(`Updated summary for topic ${data.topicId} in Firestore:`, newSummary);
  };

  return (
    <div className="p-8 lg:p-12 min-h-screen bg-slate-50 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* 1. Concept Header */}
        <div className="relative">
           <button 
             onClick={onBack}
             className="absolute -top-8 left-0 text-slate-400 hover:text-slate-600 text-sm font-medium flex items-center gap-1 transition-colors"
           >
             <i className="fa-solid fa-arrow-left"></i> Back to Dashboard
           </button>
           <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="flex-1">
                 <div className="flex items-center gap-3 mb-3">
                     <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                         data.difficulty === "Easy" ? "bg-green-100 text-green-700 border-green-200" :
                         data.difficulty === "Medium" ? "bg-yellow-100 text-yellow-700 border-yellow-200" :
                         "bg-red-100 text-red-700 border-red-200"
                     }`}>
                         {data.difficulty} Topic
                     </span>
                     <span className="text-slate-400 text-sm"><i className="fa-solid fa-list-check mr-1"></i> {data.algorithms.length} Algorithms</span>
                 </div>
                 <h1 className="text-4xl font-extrabold text-slate-900 mb-4">{data.title}</h1>
                 
                 <div className="mb-4">
                    <p className="text-lg text-slate-600 leading-relaxed max-w-3xl mb-3">
                        {description}
                    </p>
                    <button
                        onClick={handleRegenerate}
                        disabled={isRegenerating}
                        className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isRegenerating ? (
                            <><i className="fa-solid fa-spinner fa-spin"></i> Generating...</>
                        ) : (
                            <><i className="fa-solid fa-wand-magic-sparkles"></i> Regenerate Summary (Admin)</>
                        )}
                    </button>
                 </div>

              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center min-w-[120px]">
                 <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl mb-2">
                     <i className="fa-solid fa-cubes-stacked"></i>
                 </div>
                 <span className="text-xs font-bold text-slate-500 uppercase">Mastery</span>
                 <span className="text-xl font-black text-slate-900">15%</span>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* 2. Common Mistakes Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
                <div className="px-6 py-4 bg-amber-50 border-b border-amber-100 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                        <i className="fa-solid fa-triangle-exclamation"></i>
                    </div>
                    <h3 className="font-bold text-amber-900">Common Pitfalls</h3>
                </div>
                <div className="p-6 flex-1">
                    <ul className="space-y-4">
                        {data.commonMistakes.map((mistake, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-slate-700 text-sm">
                                <i className="fa-solid fa-xmark text-red-400 mt-1 flex-shrink-0"></i>
                                <span>{mistake}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* 3. Complexity Cheat Sheet */}
            <div className="bg-slate-900 rounded-2xl shadow-sm border border-slate-800 overflow-hidden flex flex-col h-full text-slate-300">
                <div className="px-6 py-4 bg-slate-800 border-b border-slate-700 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-700 text-blue-400 flex items-center justify-center">
                        <i className="fa-solid fa-table"></i>
                    </div>
                    <h3 className="font-bold text-white">Complexity Cheat Sheet</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-800/50">
                            <tr>
                                <th className="px-6 py-3">Algorithm</th>
                                <th className="px-6 py-3 font-mono text-blue-400">Time</th>
                                <th className="px-6 py-3 font-mono text-purple-400">Space</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {data.algorithms.slice(0, 5).map((algo) => (
                                <tr key={algo.id} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="px-6 py-3 font-medium text-slate-200">{algo.title}</td>
                                    <td className="px-6 py-3 font-mono">{algo.timeComplexity}</td>
                                    <td className="px-6 py-3 font-mono">{algo.spaceComplexity}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        {/* 4. Algorithms Grid */}
        <div>
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-xl text-slate-900">Core Algorithms</h3>
                <div className="flex gap-2 text-xs">
                     <span className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-full text-slate-500">
                         <div className="w-2 h-2 rounded-full bg-green-500"></div> Completed
                     </span>
                     <span className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-full text-slate-500">
                         <div className="w-2 h-2 rounded-full bg-blue-500"></div> Available
                     </span>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {data.algorithms.map((algo) => {
                    const isLocked = algo.status === "Locked";
                    const isCompleted = algo.status === "Completed";
                    
                    return (
                        <button
                            key={algo.id}
                            onClick={() => !isLocked && onAlgorithmClick(algo)}
                            disabled={isLocked}
                            className={`group relative p-5 rounded-xl border text-left transition-all duration-300 ${
                                isLocked 
                                ? "bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed" 
                                : "bg-white border-slate-200 hover:border-blue-400 hover:shadow-lg hover:-translate-y-1"
                            }`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border ${
                                     algo.difficulty === "Easy" ? "bg-green-50 text-green-700 border-green-100" :
                                     algo.difficulty === "Medium" ? "bg-yellow-50 text-yellow-700 border-yellow-100" :
                                     "bg-red-50 text-red-700 border-red-100"
                                }`}>
                                    {algo.difficulty}
                                </span>
                                {isLocked ? (
                                    <i className="fa-solid fa-lock text-slate-300"></i>
                                ) : isCompleted ? (
                                    <div className="bg-green-100 text-green-600 w-6 h-6 rounded-full flex items-center justify-center">
                                        <i className="fa-solid fa-check text-xs"></i>
                                    </div>
                                ) : (
                                    <div className="bg-blue-50 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <i className="fa-solid fa-arrow-right text-xs"></i>
                                    </div>
                                )}
                            </div>
                            
                            <h4 className="font-bold text-slate-800 text-lg mb-1 group-hover:text-blue-600 transition-colors">
                                {algo.title}
                            </h4>
                            
                            <div className="flex items-center gap-4 text-xs text-slate-500 font-mono mt-3 pt-3 border-t border-slate-100">
                                <span title="Time Complexity"><i className="fa-regular fa-clock mr-1"></i> {algo.timeComplexity}</span>
                                <span title="Space Complexity"><i className="fa-solid fa-database mr-1"></i> {algo.spaceComplexity}</span>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>

      </div>
    </div>
  );
};
