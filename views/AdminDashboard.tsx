
import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { 
  MOCK_DAILY_STATS, 
  MOCK_TOPIC_MISCONCEPTIONS, 
  MOCK_AI_ACCURACY, 
  MOCK_FLAGGED_USERS,
  MOCK_EXPERIMENT_DATA
} from "../data";
import { promoteExperimentVariant } from "../api";

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'experiments'>('overview');
  const [promotingId, setPromotingId] = useState<string | null>(null);

  const handlePromote = async (experimentId: string, variantId: string) => {
      setPromotingId(variantId);
      try {
          await promoteExperimentVariant(experimentId, variantId);
          alert(`Success! System prompt updated to Variant ${variantId}.`);
      } catch (e) {
          console.error(e);
          alert("Failed to promote variant.");
      } finally {
          setPromotingId(null);
      }
  };

  return (
    <div className="p-8 lg:p-12 overflow-y-auto h-[calc(100vh-80px)] bg-slate-50">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header with Tabs */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
                <h1 className="text-3xl font-black text-slate-900">Admin Dashboard</h1>
                <p className="text-slate-500">Platform Health & Community Safety Overview</p>
            </div>
            <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200 flex">
                <button 
                    onClick={() => setActiveTab('overview')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                        activeTab === 'overview' 
                        ? 'bg-slate-900 text-white shadow-md' 
                        : 'text-slate-500 hover:bg-slate-50'
                    }`}
                >
                    Overview
                </button>
                <button 
                    onClick={() => setActiveTab('experiments')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                        activeTab === 'experiments' 
                        ? 'bg-slate-900 text-white shadow-md' 
                        : 'text-slate-500 hover:bg-slate-50'
                    }`}
                >
                    Experiments
                </button>
            </div>
        </div>

        {activeTab === 'overview' ? (
            <>
                {/* Top Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Active Users</p>
                    <h3 className="text-3xl font-black text-slate-900 mt-1">12,450</h3>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                    <i className="fa-solid fa-users text-xl"></i>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Problems Solved Today</p>
                    <h3 className="text-3xl font-black text-slate-900 mt-1">8,392</h3>
                    </div>
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                    <i className="fa-solid fa-check-double text-xl"></i>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Flags</p>
                    <h3 className="text-3xl font-black text-red-600 mt-1">14</h3>
                    </div>
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-600">
                    <i className="fa-solid fa-flag text-xl"></i>
                    </div>
                </div>
                </div>

                {/* Row 2: Daily Active Users & AI Accuracy */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Line Chart */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <i className="fa-solid fa-chart-line text-blue-500"></i> Daily Active Users
                    </h3>
                    <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={MOCK_DAILY_STATS} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                            itemStyle={{ color: '#60a5fa' }}
                        />
                        <Line type="monotone" dataKey="activeUsers" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6' }} activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                    </div>
                </div>

                {/* Pie Chart */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <i className="fa-solid fa-robot text-purple-500"></i> AI Generation Accuracy
                    </h3>
                    <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                        <Pie
                            data={MOCK_AI_ACCURACY}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {MOCK_AI_ACCURACY.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                    </div>
                </div>
                </div>

                {/* Row 3: Misleading Posts Bar Chart & Flagged Users Table */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-20">
                
                {/* Bar Chart */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <i className="fa-solid fa-triangle-exclamation text-amber-500"></i> Misleading Posts by Topic
                    </h3>
                    <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={MOCK_TOPIC_MISCONCEPTIONS} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                        <XAxis type="number" stroke="#94a3b8" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis dataKey="topic" type="category" width={120} stroke="#64748b" tick={{ fontSize: 11, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                        <Tooltip 
                            cursor={{fill: '#f1f5f9'}}
                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                        />
                        <Bar dataKey="misleadingCount" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                    </div>
                </div>

                {/* Flagged Users Table */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <i className="fa-solid fa-user-shield text-red-500"></i> Flagged Users
                        </h3>
                        <button className="text-xs text-blue-600 font-bold hover:underline">View All</button>
                    </div>
                    
                    <div className="overflow-x-auto flex-1">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-4 py-3">User</th>
                            <th className="px-4 py-3">Type</th>
                            <th className="px-4 py-3">Score</th>
                            <th className="px-4 py-3">Action</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                        {MOCK_FLAGGED_USERS.map((user) => (
                            <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3">
                                <p className="font-bold text-slate-800">{user.displayName}</p>
                                <p className="text-[10px] text-slate-400">{user.email}</p>
                            </td>
                            <td className="px-4 py-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                user.flagType === 'Spam' ? 'bg-orange-100 text-orange-700' :
                                user.flagType === 'Toxicity' ? 'bg-red-100 text-red-700' :
                                'bg-purple-100 text-purple-700'
                                }`}>
                                {user.flagType}
                                </span>
                            </td>
                            <td className="px-4 py-3 font-mono font-bold text-slate-600">
                                {(user.severityScore * 100).toFixed(0)}%
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex gap-2">
                                    <button title="Ban User" className="w-7 h-7 flex items-center justify-center rounded bg-slate-100 hover:bg-red-100 text-slate-400 hover:text-red-600 transition-colors">
                                        <i className="fa-solid fa-gavel"></i>
                                    </button>
                                    <button title="Shadowban" className="w-7 h-7 flex items-center justify-center rounded bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors">
                                        <i className="fa-solid fa-eye-slash"></i>
                                    </button>
                                </div>
                            </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    </div>
                </div>

                </div>
            </>
        ) : (
            // EXPERIMENTS TAB CONTENT
            <div className="space-y-8 animate-fade-in">
                
                {/* Experiment Header */}
                <div className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-sm flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Active A/B Test</span>
                            <span className="text-sm text-slate-400 font-mono">{MOCK_EXPERIMENT_DATA.id}</span>
                        </div>
                        <h2 className="text-2xl font-black text-slate-900">{MOCK_EXPERIMENT_DATA.name}</h2>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-black text-slate-900">2,420</div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Participants</p>
                    </div>
                </div>

                {/* Variants Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {MOCK_EXPERIMENT_DATA.variants.map((variant) => {
                        const isPromoting = promotingId === variant.id;
                        // Find opposing variant to compare stats (for simple greater/less than highlighting)
                        const otherVariant = MOCK_EXPERIMENT_DATA.variants.find(v => v.id !== variant.id);
                        const isWinnerFeedback = otherVariant ? variant.positiveFeedbackPercent > otherVariant.positiveFeedbackPercent : false;
                        const isWinnerRetention = otherVariant ? variant.avgSessionSeconds > otherVariant.avgSessionSeconds : false;
                        const isWinnerSuccess = otherVariant ? variant.nextProblemSuccessRate > otherVariant.nextProblemSuccessRate : false;

                        return (
                            <div key={variant.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden relative">
                                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
                                <div className="p-6 border-b border-slate-100">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-xl font-bold text-slate-800">Group {variant.id}: {variant.name}</h3>
                                        <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold">{variant.totalParticipants} Users</span>
                                    </div>
                                    <p className="text-sm text-slate-500 italic">"{variant.description}"</p>
                                </div>
                                
                                <div className="p-6 flex-1 space-y-6">
                                    {/* Metric 1: Retention */}
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-slate-500">Avg Session Time (Retention)</span>
                                            <span className={`font-bold ${isWinnerRetention ? 'text-emerald-600' : 'text-slate-800'}`}>{variant.avgSessionTime}</span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full ${isWinnerRetention ? 'bg-emerald-500' : 'bg-slate-400'}`} 
                                                style={{ width: `${Math.min(100, (variant.avgSessionSeconds / 1000) * 100)}%` }} // Normalized visual
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Metric 2: Feedback */}
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-slate-500">Positive Feedback %</span>
                                            <span className={`font-bold ${isWinnerFeedback ? 'text-emerald-600' : 'text-slate-800'}`}>{variant.positiveFeedbackPercent}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full ${isWinnerFeedback ? 'bg-emerald-500' : 'bg-slate-400'}`} 
                                                style={{ width: `${variant.positiveFeedbackPercent}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Metric 3: Success Rate */}
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-slate-500">Next Problem Success Rate</span>
                                            <span className={`font-bold ${isWinnerSuccess ? 'text-emerald-600' : 'text-slate-800'}`}>{variant.nextProblemSuccessRate}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full ${isWinnerSuccess ? 'bg-emerald-500' : 'bg-slate-400'}`} 
                                                style={{ width: `${variant.nextProblemSuccessRate}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 bg-slate-50 border-t border-slate-100">
                                    <button 
                                        onClick={() => handlePromote(MOCK_EXPERIMENT_DATA.id, variant.id)}
                                        disabled={promotingId !== null}
                                        className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm ${
                                            isPromoting 
                                            ? 'bg-emerald-600 text-white cursor-not-allowed opacity-80' 
                                            : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-800 hover:text-white hover:border-slate-800'
                                        }`}
                                    >
                                        {isPromoting ? (
                                            <><i className="fa-solid fa-spinner fa-spin"></i> Updating System Prompt...</>
                                        ) : (
                                            <><i className="fa-solid fa-trophy"></i> Promote to Winner</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        )}

      </div>
    </div>
  );
};
