
import React, { useState } from "react";
import { LeetCodeStats } from "../types";
import { syncLeetCodeStats } from "../api";

interface LeetCodeConnectProps {
  onSync: (stats: LeetCodeStats) => void;
  initialUsername?: string;
  lastSyncedAt?: string; // ISO string
}

export const LeetCodeConnect = ({ onSync, initialUsername, lastSyncedAt }: LeetCodeConnectProps) => {
  const [username, setUsername] = useState(initialUsername || "");
  const [isConnected, setIsConnected] = useState(!!initialUsername);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncLog, setSyncLog] = useState<string | null>(null);
  const [lastSynced, setLastSynced] = useState<string | null>(lastSyncedAt || null);

  const handleSync = async () => {
    if (!username.trim()) return;
    setLoading(true);
    setError(null);
    setSyncLog(null);

    try {
      // Simulation of error states for demonstration
      if (username.toLowerCase() === 'error') throw new Error("User not found");
      if (username.toLowerCase() === 'private') throw new Error("Profile is private. Change settings in LeetCode.");

      const stats = await syncLeetCodeStats(username);
      
      // Mocking a log message based on the fetched stats
      // In a real app, the backend would return a diff object
      const total = stats.totalSolved;
      
      // Simulated diffs for demo purposes
      const arraysDiff = Math.floor(Math.random() * 5) + 1;
      const graphsDiff = Math.floor(Math.random() * 3);
      
      setSyncLog(`> Connected to @${username}\n> Imported ${total} total problems.\n> Updates:\n  + ${arraysDiff} Arrays & Hashing\n  + ${graphsDiff} Graphs\n> Recalculating learning path... Done.`);
      
      setLastSynced(new Date().toISOString());
      setIsConnected(true);
      onSync(stats);
    } catch (err: any) {
      setError(err.message || "Failed to connect to LeetCode.");
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (dateStr: string) => {
    const minutes = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden w-full max-w-xl">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FFA116]/10 rounded-lg flex items-center justify-center border border-[#FFA116]/20">
                <i className="fa-solid fa-code text-[#FFA116]"></i>
            </div>
            <div>
                <h3 className="font-bold text-slate-800">LeetCode Sync</h3>
                <p className="text-xs text-slate-500">Official Integration</p>
            </div>
        </div>
        {isConnected && (
            <div className="flex items-center gap-2 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                 <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">Active</span>
            </div>
        )}
      </div>

      <div className="p-6">
        {!isConnected ? (
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">LeetCode Username</label>
                    <div className="relative group">
                        <i className={`fa-solid fa-user absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${error ? 'text-red-400' : 'text-slate-400 group-focus-within:text-blue-500'}`}></i>
                        <input 
                            type="text" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition-all ${error ? 'border-red-300 focus:ring-red-200 bg-red-50' : 'border-slate-200 focus:ring-blue-100 focus:border-blue-400'}`}
                            placeholder="e.g. neetcode"
                            onKeyDown={(e) => e.key === 'Enter' && handleSync()}
                        />
                    </div>
                </div>
                
                {error && (
                    <div className="flex items-start gap-3 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 animate-fade-in">
                        <i className="fa-solid fa-circle-exclamation mt-0.5"></i>
                        <div>
                            <span className="font-bold block text-xs uppercase mb-0.5">Connection Failed</span>
                            {error}
                        </div>
                    </div>
                )}

                <button 
                    onClick={handleSync}
                    disabled={loading || !username}
                    className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-2"
                >
                    {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-link"></i>}
                    <span>Connect Account</span>
                </button>
            </div>
        ) : (
            <div className="space-y-6">
                 <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                     <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                             <i className="fa-regular fa-user"></i>
                         </div>
                         <div>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-0.5">Connected Account</p>
                            <p className="text-sm font-bold text-slate-900">@{username}</p>
                         </div>
                     </div>
                     <button 
                        onClick={() => {
                            setIsConnected(false);
                            setUsername("");
                            setSyncLog(null);
                        }}
                        className="text-xs text-slate-400 hover:text-red-500 font-medium underline decoration-slate-300 hover:decoration-red-300 transition-colors"
                     >
                        Disconnect
                     </button>
                 </div>

                 <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2 text-sm text-slate-500">
                         <i className="fa-regular fa-clock"></i>
                         <span>Last Synced: <span className="font-semibold text-slate-700">{lastSynced ? getTimeAgo(lastSynced) : 'Never'}</span></span>
                     </div>
                     <button 
                        onClick={handleSync}
                        disabled={loading}
                        className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors flex items-center gap-2"
                     >
                        {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-rotate"></i>}
                        Refresh
                     </button>
                 </div>

                 {/* Sync Log */}
                 {syncLog && (
                     <div className="bg-[#1e293b] rounded-lg p-4 border border-slate-700 shadow-inner animate-fade-in relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-2 opacity-10">
                             <i className="fa-solid fa-terminal text-4xl text-white"></i>
                         </div>
                         <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-2 border-b border-slate-700 pb-2">
                             <i className="fa-solid fa-check"></i> Sync Complete
                         </div>
                         <pre className="font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                             {syncLog}
                         </pre>
                     </div>
                 )}
            </div>
        )}
      </div>
    </div>
  );
};
