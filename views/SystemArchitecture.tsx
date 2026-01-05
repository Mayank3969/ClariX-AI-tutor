
import React from "react";

export const SystemArchitecture = () => {
  return (
    <div className="p-8 lg:p-12 overflow-y-auto h-[calc(100vh-80px)] bg-slate-950 text-slate-300">
      <div className="max-w-6xl mx-auto space-y-12 pb-20">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/5 pb-8">
            <div>
                <h1 className="text-4xl font-black text-white tracking-tight">System Blueprint</h1>
                <p className="text-slate-500 mt-2 font-medium">Clarix AI: Multi-modal Adaptive Learning Architecture</p>
            </div>
            <div className="flex gap-4">
                <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 text-xs font-bold flex items-center gap-2">
                    <i className="fa-solid fa-server"></i> Platform Status: Operational
                </div>
            </div>
        </div>

        {/* The Technical Diagram */}
        <div className="bg-[#0b1120] rounded-[2rem] border border-white/5 p-4 md:p-10 shadow-2xl relative overflow-hidden group">
            {/* Blueprint Grid Overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#4f46e5 1px, transparent 1px), linear-gradient(90deg, #4f46e5 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
            
            <div className="relative z-10 flex flex-col items-center">
                <div className="w-full max-w-5xl">
                    <svg viewBox="0 0 1000 700" className="w-full h-auto filter drop-shadow-2xl">
                        <defs>
                            <filter id="glow">
                                <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                                <feMerge>
                                    <feMergeNode in="coloredBlur"/>
                                    <feMergeNode in="SourceGraphic"/>
                                </feMerge>
                            </filter>
                            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
                                <stop offset="50%" stopColor="#6366f1" stopOpacity="1" />
                                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                            </linearGradient>
                        </defs>

                        {/* Connection Lines with Pulsing Data Packets */}
                        <g stroke="#1e293b" strokeWidth="1.5" fill="none">
                            {/* User to AI */}
                            <path d="M 220 200 L 400 200" />
                            <path d="M 220 500 L 400 350" />
                            {/* AI to Data */}
                            <path d="M 600 275 L 780 275" />
                            {/* Functions Triggers */}
                            <path d="M 500 400 L 500 500" strokeDasharray="4,4" />
                            <path d="M 780 500 L 600 500" strokeDasharray="4,4" />
                        </g>

                        {/* Pulsing Data Packets */}
                        <circle r="3" fill="#60a5fa" filter="url(#glow)">
                            <animateMotion dur="4s" repeatCount="indefinite" path="M 220 200 L 400 200" />
                        </circle>
                        <circle r="3" fill="#a78bfa" filter="url(#glow)">
                            <animateMotion dur="3s" repeatCount="indefinite" path="M 600 275 L 780 275" />
                        </circle>

                        {/* Layer 1: User Interactions (Client Side) */}
                        <text x="120" y="80" textAnchor="middle" fill="#475569" fontSize="12" fontWeight="900" letterSpacing="2">CLIENT LAYER</text>
                        
                        <g transform="translate(40, 120)">
                            <rect width="180" height="160" rx="20" fill="#1e293b" stroke="#334155" strokeWidth="2" />
                            <text x="90" y="40" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">React 19 Frontend</text>
                            <text x="25" y="75" fill="#64748b" fontSize="10">• Tailwind UX Engine</text>
                            <text x="25" y="95" fill="#64748b" fontSize="10">• Recharts Visuals</text>
                            <text x="25" y="115" fill="#64748b" fontSize="10">• Local persistence</text>
                            <rect x="20" y="130" width="140" height="15" rx="4" fill="#3b82f6" fillOpacity="0.1" />
                            <text x="90" y="141" textAnchor="middle" fill="#60a5fa" fontSize="8" fontWeight="bold">SDK Integration</text>
                        </g>

                        <g transform="translate(40, 420)">
                            <rect width="180" height="160" rx="20" fill="#1e293b" stroke="#334155" strokeWidth="2" />
                            <text x="90" y="40" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">External Sync</text>
                            <image x="70" y="60" width="40" height="40" href="https://upload.wikimedia.org/wikipedia/commons/1/19/LeetCode_logo_black.png" filter="invert(1)" opacity="0.5" />
                            <text x="90" y="120" textAnchor="middle" fill="#64748b" fontSize="10">LeetCode Stats API</text>
                            <text x="90" y="140" textAnchor="middle" fill="#64748b" fontSize="10">Browser Extensions</text>
                        </g>

                        {/* Layer 2: Intelligence Layer (Google AI) */}
                        <text x="500" y="80" textAnchor="middle" fill="#475569" fontSize="12" fontWeight="900" letterSpacing="2">INTELLIGENCE HUB</text>
                        
                        <g transform="translate(400, 150)">
                            <rect width="200" height="250" rx="30" fill="#312e81" stroke="#4338ca" strokeWidth="3" />
                            <circle cx="100" cy="80" r="40" fill="#4338ca" opacity="0.3" />
                            <text x="100" y="85" textAnchor="middle" fill="white" fontSize="24" fontWeight="black">GEMINI</text>
                            
                            <g transform="translate(20, 140)">
                                <rect width="160" height="40" rx="10" fill="#1e1b4b" stroke="#3730a3" />
                                <text x="80" y="25" textAnchor="middle" fill="#a5b4fc" fontSize="11" fontWeight="bold">3 FLASH (Streaming)</text>
                            </g>
                            
                            <g transform="translate(20, 190)">
                                <rect width="160" height="40" rx="10" fill="#1e1b4b" stroke="#3730a3" />
                                <text x="80" y="25" textAnchor="middle" fill="#a5b4fc" fontSize="11" fontWeight="bold">3 PRO (Reasoning)</text>
                            </g>
                        </g>

                        <g transform="translate(400, 500)">
                            <rect width="200" height="80" rx="15" fill="#0f172a" stroke="#1e293b" />
                            <text x="100" y="35" textAnchor="middle" fill="#94a3b8" fontSize="12" fontWeight="bold">Cloud Functions</text>
                            <text x="100" y="55" textAnchor="middle" fill="#475569" fontSize="10">Asynchronous Triggers</text>
                            <circle cx="20" cy="40" r="4" fill="#10b981" />
                        </g>

                        {/* Layer 3: Persistence Layer (Firebase) */}
                        <text x="880" y="80" textAnchor="middle" fill="#475569" fontSize="12" fontWeight="900" letterSpacing="2">DATA STORE</text>
                        
                        <g transform="translate(780, 150)">
                            <rect width="180" height="430" rx="20" fill="#020617" stroke="#1e293b" strokeWidth="2" />
                            
                            <g transform="translate(20, 40)">
                                <text x="0" y="0" fill="#e2e8f0" fontSize="12" fontWeight="bold">CLARIX FIRESTORE</text>
                                <text x="0" y="25" fill="#475569" fontSize="9">/users (Profiles)</text>
                                <text x="0" y="45" fill="#475569" fontSize="9">/topics (Curriculum)</text>
                                <text x="0" y="65" fill="#475569" fontSize="9">/community (Posts)</text>
                                <line x1="0" y1="85" x2="140" y2="85" stroke="#1e293b" />
                            </g>

                            <g transform="translate(20, 160)">
                                <text x="0" y="0" fill="#e2e8f0" fontSize="12" fontWeight="bold">CLOUD STORAGE</text>
                                <text x="0" y="25" fill="#475569" fontSize="9">/code-snapshots</text>
                                <text x="0" y="45" fill="#475569" fontSize="9">/user-content</text>
                                <line x1="0" y1="65" x2="140" y2="65" stroke="#1e293b" />
                            </g>

                            <g transform="translate(20, 260)">
                                <text x="0" y="0" fill="#e2e8f0" fontSize="12" fontWeight="bold">REALTIME DB</text>
                                <text x="0" y="25" fill="#475569" fontSize="9">/presence (Live)</text>
                                <text x="0" y="45" fill="#475569" fontSize="9">/votes (Atomic)</text>
                            </g>
                        </g>

                    </svg>
                </div>
            </div>
        </div>

        {/* Technical Component Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <ArchitectureCard 
                title="The Intelligence Core" 
                icon="fa-brain-circuit"
                color="text-blue-400"
                items={[
                    { label: "Gemini 3 Flash", desc: "Powers the real-time Socratic chat and daily insights." },
                    { label: "Gemini 3 Pro", desc: "Drives static analysis and high-stakes mock interviews." },
                    { label: "Function Orchestrator", desc: "Coordinates complex multi-turn AI logic flows." }
                ]}
            />
            <ArchitectureCard 
                title="Cloud Infrastructure" 
                icon="fa-cloud"
                color="text-indigo-400"
                items={[
                    { label: "Firebase Firestore", desc: "NoSQL hierarchical data for topics and submissions." },
                    { label: "Cloud Run", desc: "Isolated containers for secure algorithmic processing." },
                    { label: "Cloud Scheduler", desc: "Automated daily gap analysis and streak updates." }
                ]}
            />
            <ArchitectureCard 
                title="Security & Delivery" 
                icon="fa-shield-halved"
                color="text-emerald-400"
                items={[
                    { label: "Context Locking", desc: "Security rules enforce scoped learning environments." },
                    { label: "Logic Guard", desc: "Parallel validation pipeline for all user submissions." },
                    { label: "Multi-tab Persistence", desc: "Offline-first architecture for interrupted deep work." }
                ]}
            />
        </div>

      </div>
    </div>
  );
};

const ArchitectureCard = ({ title, icon, color, items }: { title: string, icon: string, color: string, items: { label: string, desc: string }[] }) => (
    <div className="bg-slate-900 rounded-3xl p-8 border border-white/5 hover:border-white/10 transition-all shadow-xl">
        <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 ${color}`}>
            <i className={`fa-solid ${icon} text-xl`}></i>
        </div>
        <h3 className="text-xl font-bold text-white mb-6 tracking-tight">{title}</h3>
        <div className="space-y-6">
            {items.map((item, i) => (
                <div key={i} className="group">
                    <h4 className="text-sm font-black text-slate-200 mb-1 group-hover:text-blue-400 transition-colors">{item.label}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">{item.desc}</p>
                </div>
            ))}
        </div>
    </div>
);
