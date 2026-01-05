
import React, { useState } from "react";
import { LeetCodeStats } from "../types";
import { SkillHeatmap } from "./SkillHeatmap";
import { LeetCodeConnect } from "./LeetCodeConnect";

export const LeetCodeSync = ({ onSync, existingStats }: { onSync: (stats: LeetCodeStats) => void, existingStats: LeetCodeStats | null }) => {
  const [stats, setStats] = useState<LeetCodeStats | null>(existingStats);

  const handleSyncComplete = (newStats: LeetCodeStats) => {
    setStats(newStats);
    onSync(newStats);
  };

  return (
    <div className="p-8 lg:p-12 max-w-6xl mx-auto h-full overflow-y-auto">
      
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Integrations & Data Sources</h1>
        <p className="text-slate-500 text-lg max-w-2xl">
          Connect your external coding profiles to populate your Clarix AI learning path with real-world performance data.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
        {/* Connection Card Column */}
        <div>
           <LeetCodeConnect 
             onSync={handleSyncComplete} 
             initialUsername={existingStats?.username}
             lastSyncedAt={existingStats ? new Date().toISOString() : undefined} 
           />
           
           <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3">
               <i className="fa-solid fa-circle-info text-blue-500 mt-1"></i>
               <p className="text-sm text-blue-800 leading-relaxed">
                   <strong>Privacy Note:</strong> We only access your public problem submission history. Clarix AI does not read your private messages or account settings.
               </p>
           </div>
        </div>

        {/* Info / Placeholder Column if no stats */}
        <div className="flex flex-col justify-center">
             {!stats ? (
                 <div className="text-center p-8 opacity-60">
                     <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                         <i className="fa-solid fa-chart-simple text-3xl"></i>
                     </div>
                     <h3 className="text-slate-900 font-bold text-lg">No Data Available</h3>
                     <p className="text-slate-500 text-sm">Connect your account to view your skill heatmap.</p>
                 </div>
             ) : (
                 <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <h3 className="font-bold text-slate-800 mb-4">Why Sync?</h3>
                      <ul className="space-y-3">
                          <li className="flex items-center gap-3 text-sm text-slate-600">
                              <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0"><i className="fa-solid fa-check text-xs"></i></div>
                              <span>Auto-detect weak topics (e.g., DP, Graphs)</span>
                          </li>
                          <li className="flex items-center gap-3 text-sm text-slate-600">
                              <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0"><i className="fa-solid fa-check text-xs"></i></div>
                              <span>Personalize AI Tutor difficulty</span>
                          </li>
                          <li className="flex items-center gap-3 text-sm text-slate-600">
                              <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0"><i className="fa-solid fa-check text-xs"></i></div>
                              <span>Generate custom problem sets</span>
                          </li>
                      </ul>
                 </div>
             )}
        </div>
      </div>

      {stats && (
          <div className="pt-8 border-t border-slate-200">
            <SkillHeatmap stats={stats} />
          </div>
      )}
    </div>
  );
};
