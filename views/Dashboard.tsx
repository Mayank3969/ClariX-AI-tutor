
import React, { useState, useEffect } from "react";
import { GeminiWidget } from "../components/GeminiWidget";
import { SmartSuggestionWidget } from "../components/SmartSuggestionWidget";
import { TopicCard } from "../components/TopicCard";
import { LearningRoadmap } from "../components/LearningRoadmap";
import { DailyStreakCard } from "../components/DailyStreakCard";
import { PhilosophyBrief } from "../components/PhilosophyBrief";
import { MOCK_TOPICS, MOCK_USER, MOCK_LEARNING_PATH, MOCK_USER_STATS } from "../data";
import { Topic, DailyTask } from "../types";
import { fetchDailyTask } from "../api";

export const Dashboard = ({ onTopicClick }: { onTopicClick: (topic: Topic) => void }) => {
  const [dailyTask, setDailyTask] = useState<DailyTask | null>(null);

  useEffect(() => {
    const loadTask = async () => {
        const task = await fetchDailyTask();
        setDailyTask(task);
    };
    loadTask();
  }, []);

  return (
    <div className="p-8 lg:p-12 overflow-y-auto h-[calc(100vh-80px)] bg-slate-50/50">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Welcome & Smart Suggestion (8 cols) */}
            <div className="lg:col-span-8 flex flex-col gap-8">
                 <div className="flex items-center gap-3">
                    <div className="relative">
                        <img src={MOCK_USER.photoURL || ""} className="w-14 h-14 rounded-full border-2 border-white shadow-md" />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center">
                            <i className="fa-solid fa-bolt text-[8px] text-white"></i>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900">Welcome back, {MOCK_USER.displayName.split(' ')[0]}</h2>
                        <p className="text-slate-500 text-sm font-medium">Ready to conquer your weak spots today?</p>
                    </div>
                 </div>
                 
                 <SmartSuggestionWidget onSolve={(problemTitle) => onTopicClick({ 
                    id: 'gen-' + Date.now(), 
                    title: problemTitle, 
                    status: 'In Progress', 
                    progress: 0, 
                    total: 1, 
                    icon: 'fa-code' 
                  })} />
            </div>

            {/* Right Column: Daily Streak & Gemini (4 cols) */}
            <div className="lg:col-span-4 flex flex-col gap-6">
                 {/* Mobile-friendly Daily Card */}
                 <div className="flex-1 min-h-[180px]">
                    {dailyTask ? (
                        <DailyStreakCard streak={MOCK_USER_STATS.streakDays} task={dailyTask} />
                    ) : (
                        <div className="h-full bg-slate-200 animate-pulse rounded-2xl"></div>
                    )}
                 </div>
                 <div>
                    <GeminiWidget expertise={MOCK_USER.expertise} />
                 </div>
            </div>
        </div>

        {/* Philosophy Section - Explaining the Brief/Solution */}
        <PhilosophyBrief />

        {/* Learning Roadmap Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
            <div className="xl:col-span-2">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="font-bold text-xl text-slate-900 flex items-center gap-2">
                            <i className="fa-solid fa-route text-blue-600"></i> Your AI Learning Path
                        </h3>
                        <p className="text-slate-500 text-sm">Personalized curriculum based on your recent performance.</p>
                    </div>
                    <button className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-blue-100">
                        <i className="fa-solid fa-arrows-rotate mr-1"></i> Refresh
                    </button>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <LearningRoadmap modules={MOCK_LEARNING_PATH} />
                </div>
            </div>

            {/* Quick Access Topics */}
            <div className="xl:col-span-1">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-xl text-gray-800">Browse Topics</h3>
                    <button className="text-sm text-blue-600 font-medium hover:underline">View All</button>
                </div>
                <div className="space-y-4">
                    {MOCK_TOPICS.slice(0, 4).map(topic => (
                        <div key={topic.id} onClick={() => onTopicClick(topic)}>
                             <div className="bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer flex items-center gap-4 group">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-colors ${
                                    topic.status === "Weak" ? "bg-red-100 text-red-600 group-hover:bg-red-200" : 
                                    topic.status === "Mastered" ? "bg-amber-100 text-amber-600 group-hover:bg-amber-200" : 
                                    "bg-blue-50 text-blue-600 group-hover:bg-blue-100"
                                }`}>
                                    <i className={`fa-solid ${topic.icon}`}></i>
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-800 text-sm">{topic.title}</h4>
                                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full ${
                                                topic.status === "Weak" ? "bg-red-500" : topic.status === "Mastered" ? "bg-amber-500" : "bg-blue-500"
                                            }`} 
                                            style={{ width: `${(topic.progress / topic.total) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                             </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};
