
import React, { useState, useEffect } from "react";
import { CommunityFeed } from "../components/CommunityFeed";
import { ConfidenceMeter } from "../components/ConfidenceMeter";
import { AITutorChat } from "../components/AITutorChat";
import { ReflectionModal } from "../components/ReflectionModal";
import { getAlgorithmExplanation } from "../api";
import { Topic, LeetCodeStats, AlgorithmExplanation, UserProfile } from "../types";

interface AlgorithmPageProps {
  topic: Topic;
  stats: LeetCodeStats | null;
  userProfile: UserProfile;
  initialAiContext?: string;
  key?: React.Key;
}

export const AlgorithmPage = ({ topic, stats, userProfile, initialAiContext }: AlgorithmPageProps) => {
  const [activeTab, setActiveTab] = useState<'learn' | 'implement' | 'community'>('learn');
  const [aiPanelCollapsed, setAiPanelCollapsed] = useState(false);
  const [explanation, setExplanation] = useState<AlgorithmExplanation | null>(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<"cpp" | "python" | "java">("python");
  const [isReflectionOpen, setIsReflectionOpen] = useState(false);

  const algorithmId = topic.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      const data = await getAlgorithmExplanation(topic.title, userProfile.expertise);
      setExplanation(data);
      setLoading(false);
    };
    fetchContent();
  }, [topic, userProfile.expertise]);

  const handleSimulateSubmit = () => {
    setIsReflectionOpen(true);
  };

  const currentSkill = stats?.topicSkills.flatMap(c => c.topics).find(t => t.name.toLowerCase().includes(topic.title.toLowerCase()) || topic.title.toLowerCase().includes(t.name.toLowerCase()));

  if (loading) {
      return (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] bg-white w-full">
              <div className="relative w-24 h-24 mb-6">
                <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <i className="fa-solid fa-brain text-blue-600 text-2xl animate-pulse"></i>
                </div>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Generating Personalized Explanation</h2>
              <p className="text-slate-500">Gemini is analyzing your LeetCode profile to tailor this content...</p>
          </div>
      );
  }

  return (
    <div className="flex h-[calc(100vh-80px)] bg-slate-50 overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 overflow-y-auto">
            <div className="max-w-5xl mx-auto p-6 lg:p-10 pb-20">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full border border-blue-200 uppercase tracking-wider">
                            {currentSkill ? `Level ${currentSkill.level} Mastery` : 'Algorithm'}
                        </span>
                        <span className="text-slate-400 text-sm flex items-center gap-2">
                             <i className={`fa-solid ${topic.icon}`}></i> {topic.title}
                        </span>
                    </div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">{explanation?.title || topic.title}</h1>
                </div>

                <div className="border-b border-slate-200 mb-8 sticky top-0 bg-slate-50 z-10 pt-2">
                    <nav className="flex gap-8">
                        {(['learn', 'implement', 'community'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-4 text-sm font-bold uppercase tracking-wide transition-all border-b-2 ${
                                    activeTab === tab 
                                    ? "border-blue-600 text-blue-600" 
                                    : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
                                }`}
                            >
                                {tab === 'learn' && <><i className="fa-solid fa-book-open mr-2"></i>Learn</>}
                                {tab === 'implement' && <><i className="fa-solid fa-code mr-2"></i>Implement</>}
                                {tab === 'community' && <><i className="fa-solid fa-users mr-2"></i>Community</>}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="animate-fade-in">
                    {activeTab === 'learn' && explanation && (
                        <div className="space-y-8">
                            <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <i className="fa-solid fa-align-left text-blue-500"></i> Concept Overview
                                </h3>
                                <p className="text-lg text-slate-600 leading-relaxed">
                                    {explanation.description}
                                </p>
                            </section>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <section className="bg-indigo-50 p-8 rounded-2xl border border-indigo-100">
                                    <h3 className="text-lg font-bold text-indigo-900 mb-3 flex items-center gap-2">
                                        <i className="fa-solid fa-lightbulb text-indigo-600"></i> Intuition
                                    </h3>
                                    <p className="text-indigo-800 leading-relaxed italic">
                                        "{explanation.intuition}"
                                    </p>
                                </section>

                                <div className="space-y-4">
                                     <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Time Complexity</p>
                                            <p className="text-xl font-mono font-bold text-slate-900">{explanation.complexity.time}</p>
                                        </div>
                                     </div>
                                     <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Space Complexity</p>
                                            <p className="text-xl font-mono font-bold text-slate-900">{explanation.complexity.space}</p>
                                        </div>
                                     </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'implement' && explanation && (
                        <div className="h-full">
                             <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col min-h-[600px]">
                                <div className="flex items-center justify-between px-6 py-4 bg-[#0b1120] border-b border-slate-800">
                                    <div className="flex items-center gap-2">
                                        <div className="flex gap-1.5 mr-4">
                                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                        </div>
                                        <span className="text-slate-400 text-xs font-mono">solution.{lang === 'python' ? 'py' : lang === 'cpp' ? 'cpp' : 'java'}</span>
                                    </div>
                                    
                                    <div className="flex items-center gap-4">
                                        <select value={lang} onChange={(e) => setLang(e.target.value as any)} className="bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-lg border border-slate-700">
                                            <option value="python">Python</option>
                                            <option value="cpp">C++</option>
                                            <option value="java">Java</option>
                                        </select>
                                        <button onClick={handleSimulateSubmit} className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 px-6 rounded-lg transition-all shadow-lg shadow-blue-900/40">
                                            Submit Solution
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="flex-1 p-6 overflow-auto bg-[#0f172a]">
                                    <pre className="font-mono text-sm leading-relaxed text-blue-100">
                                        <code>{explanation.code[lang]}</code>
                                    </pre>
                                </div>
                             </div>
                        </div>
                    )}

                    {activeTab === 'community' && (
                        <CommunityFeed topicId={topic.id} algorithmId={algorithmId} topicName={topic.title} />
                    )}
                </div>
            </div>
        </div>
      </div>

      <div className={`${aiPanelCollapsed ? 'w-20' : 'w-[28%]'} max-w-sm border-l border-slate-200 bg-white flex flex-col shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] transition-all duration-300 relative z-30`}>
         <ConfidenceMeter score={currentSkill ? Math.min(100, (currentSkill.level / 4) * 100) : 10} collapsed={aiPanelCollapsed} />
         <AITutorChat 
            collapsed={aiPanelCollapsed} 
            toggleCollapsed={() => setAiPanelCollapsed(!aiPanelCollapsed)}
            initialContext={initialAiContext}
            userId={userProfile.uid}
         />
      </div>

      <ReflectionModal 
        isOpen={isReflectionOpen} 
        onClose={() => setIsReflectionOpen(false)}
        topicName={topic.title}
        problemTitle={explanation?.title || topic.title}
        userCode={explanation?.code[lang] || ""}
      />
    </div>
  );
};
