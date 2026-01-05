
import React from "react";
import { UserStats } from "../types";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const StatCard = ({ label, value, icon, color }: { label: string, value: string | number, icon: string, color: string }) => (
  <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 shadow-lg flex items-center justify-between group hover:border-slate-600 transition-colors">
    <div>
      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{label}</p>
      <h3 className="text-2xl font-extrabold text-white">{value}</h3>
    </div>
    <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center text-xl shadow-inner`}>
      <i className={`fa-solid ${icon} text-white`}></i>
    </div>
  </div>
);

export const UserStatsDashboard = ({ stats }: { stats: UserStats }) => {
  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* 1. Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
            label="Accuracy Rate" 
            value={`${stats.accuracyRate}%`} 
            icon="fa-crosshairs" 
            color="bg-emerald-600"
        />
        <StatCard 
            label="Streak Days" 
            value={stats.streakDays} 
            icon="fa-fire" 
            color="bg-orange-500 animate-pulse"
        />
        <StatCard 
            label="Problems Solved" 
            value={stats.totalSolved} 
            icon="fa-check-double" 
            color="bg-blue-600"
        />
      </div>

      {/* 2. Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Radar Chart: Skill Balance */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg">
          <div className="flex items-center justify-between mb-6">
             <h3 className="text-lg font-bold text-white flex items-center gap-2">
                 <i className="fa-solid fa-chart-pie text-purple-400"></i> Skill Radar
             </h3>
             <span className="text-xs text-slate-400">Topic Proficiency</span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={stats.skillRadar}>
                <PolarGrid stroke="#475569" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={{ fill: '#475569' }} />
                <Radar
                  name="Skill Level"
                  dataKey="A"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fill="#8b5cf6"
                  fillOpacity={0.3}
                />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }}
                    itemStyle={{ color: '#c4b5fd' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Line Chart: Reputation Growth */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg">
           <div className="flex items-center justify-between mb-6">
             <h3 className="text-lg font-bold text-white flex items-center gap-2">
                 <i className="fa-solid fa-arrow-trend-up text-blue-400"></i> Reputation Growth
             </h3>
             <span className="text-xs text-slate-400">Last 6 Months</span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={stats.reputationHistory}
                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis 
                    dataKey="date" 
                    stroke="#94a3b8" 
                    tick={{ fontSize: 12 }} 
                    axisLine={false}
                    tickLine={false}
                />
                <YAxis 
                    stroke="#94a3b8" 
                    tick={{ fontSize: 12 }} 
                    axisLine={false}
                    tickLine={false}
                />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }}
                    itemStyle={{ color: '#60a5fa' }}
                />
                <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4, stroke: '#1e293b' }}
                    activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};
