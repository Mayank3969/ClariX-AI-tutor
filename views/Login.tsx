
import React, { useState } from "react";

export const Login = ({ onLogin }: { onLogin: () => void }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [modalContent, setModalContent] = useState<{ title: string; body: string } | null>(null);

  const scrollToSection = (id: string) => {
    const section = document.getElementById(id);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
        setMobileMenuOpen(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const openMethodologyModal = () => {
      setModalContent({
          title: 'The Clarix Methodology',
          body: 'We use Topic Locking to prevent AI hallucinations. Unlike generic chatbots, our AI is strictly bound to the current subject (e.g., OOP or Graphs) to ensure academic accuracy.'
      });
      setMobileMenuOpen(false);
  };

  const openPricingModal = () => {
      setModalContent({
          title: 'Pricing',
          body: 'Clarix AI is currently in Beta. All features are Free for early adopters. No credit card required.'
      });
      setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] font-['Poppins'] text-slate-200 overflow-x-hidden selection:bg-blue-500 selection:text-white">
      
      {/* 1. Navbar (Glassmorphic) */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#0f172a]/70 backdrop-blur-md transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between relative">
          
          {/* Left: Logo */}
          <div className="flex items-center gap-3 cursor-pointer group z-20" onClick={scrollToTop}>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow">
              <i className="fa-solid fa-terminal text-white text-sm"></i>
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Clarix AI</span>
          </div>

          {/* Center: Navigation Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400 absolute left-1/2 -translate-x-1/2">
            <button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors duration-200">Features</button>
            <button onClick={() => scrollToSection('journey')} className="hover:text-white transition-colors duration-200">Journey</button>
            <button onClick={openMethodologyModal} className="hover:text-white transition-colors duration-200">Methodology</button>
            <button onClick={openPricingModal} className="hover:text-white transition-colors duration-200">Pricing</button>
          </div>

          {/* Right: Auth Actions */}
          <div className="hidden md:flex items-center gap-6 z-20">
            <button onClick={onLogin} className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Log In</button>
            <button onClick={onLogin} className="group relative px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full text-sm font-bold text-white shadow-lg shadow-blue-900/50 hover:shadow-blue-900/70 hover:-translate-y-0.5 transition-all duration-300">
              Get Started Free
            </button>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section (Restored & Enhanced) */}
      <section className="relative pt-32 pb-20 lg:pt-40 min-h-screen flex flex-col items-center justify-start overflow-hidden">
        
        {/* Atmosphere: Aurora & Mesh */}
        <div className="absolute inset-0 z-0 pointer-events-none">
             {/* Geometric Mesh */}
             <div className="absolute inset-0 opacity-[0.03]" 
                  style={{ 
                      backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.3) 1px, transparent 1px)', 
                      backgroundSize: '40px 40px' 
                  }}>
             </div>
             {/* Aurora Gradients */}
             <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow"></div>
             <div className="absolute top-[10%] right-[20%] w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[100px] mix-blend-screen animate-pulse-slow delay-1000"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10 flex flex-col items-center text-center">
          
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-bold mb-8 backdrop-blur-sm animate-fade-in-up">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              v2.0 Now Available with Gemini Pro
          </div>

          {/* Headlines */}
          <h1 className="max-w-5xl text-5xl md:text-7xl font-bold tracking-tight text-white mb-8 leading-[1.1] drop-shadow-2xl">
            Master the Core of <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 animate-gradient-x">Computer Science.</span> <br />
            Without the Chaos.
          </h1>

          <p className="max-w-2xl text-lg md:text-xl text-slate-400 mb-10 leading-relaxed font-light">
            Structured learning paths, topic-locked AI tutoring, and LeetCode integration. The first platform designed for deep work, not doomscrolling.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-20">
            <button onClick={onLogin} className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-bold text-lg shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)] hover:shadow-[0_0_60px_-15px_rgba(37,99,235,0.6)] hover:-translate-y-1 transition-all duration-300">
              Start Your Mastery Journey
            </button>
            <button onClick={openMethodologyModal} className="px-8 py-4 bg-transparent border border-white/20 text-white rounded-full font-bold text-lg hover:bg-white/5 hover:border-white/40 transition-all flex items-center gap-2 backdrop-blur-sm">
              Explore Methodology
            </button>
          </div>

          {/* 3. Visual Anchor: Tilted 3D Glass Code Card */}
          <div className="w-full max-w-4xl relative [perspective:2000px] group">
             <div className="transform rotate-x-12 group-hover:rotate-x-6 transition-transform duration-700 ease-out origin-top">
                <div className="bg-[#0f172a]/60 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-1 overflow-hidden ring-1 ring-white/5">
                    {/* Fake Window Bar */}
                    <div className="bg-[#1e293b]/80 border-b border-white/5 px-4 py-3 flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                        <div className="ml-4 px-3 py-1 bg-black/20 rounded text-[10px] font-mono text-slate-500 flex items-center gap-2">
                            <i className="fa-solid fa-lock text-[8px]"></i>
                            <span>graph_traversal.py</span>
                        </div>
                    </div>
                    {/* Code Content */}
                    <div className="p-6 bg-[#0b1120]/90 text-left overflow-x-auto">
                        <pre className="font-mono text-sm leading-relaxed">
                            <code className="language-python">
<span className="text-purple-400">def</span> <span className="text-blue-400">dfs_recursive</span>(graph, node, visited=<span className="text-purple-400">None</span>):{'\n'}
    <span className="text-slate-500"># Clarix AI Tip: Always handle base cases for recursion stack safety.</span>{'\n'}
    <span className="text-purple-400">if</span> visited <span className="text-purple-400">is None</span>:{'\n'}
        visited = <span className="text-yellow-300">set</span>(){'\n'}
    {'\n'}
    visited.add(node){'\n'}
    <span className="text-emerald-400">print</span>(node){'\n'}
    {'\n'}
    <span className="text-purple-400">for</span> neighbor <span className="text-purple-400">in</span> graph[node]:{'\n'}
        <span className="text-purple-400">if</span> neighbor <span className="text-purple-400">not in</span> visited:{'\n'}
            dfs_recursive(graph, neighbor, visited){'\n'}
    {'\n'}
    <span className="text-purple-400">return</span> visited
                            </code>
                        </pre>
                    </div>
                    {/* AI Annotation Overlay */}
                    <div className="absolute bottom-6 right-6 bg-blue-600/20 backdrop-blur-md border border-blue-500/30 px-4 py-2 rounded-lg flex items-center gap-3 animate-pulse-slow">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
                        <span className="text-xs font-bold text-blue-200">AI Logic Verification: Pass</span>
                    </div>
                </div>
             </div>
             {/* Reflection/Shadow */}
             <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[90%] h-20 bg-blue-500/10 blur-[50px] rounded-full pointer-events-none"></div>
          </div>

        </div>
      </section>

      {/* 3. Detailed Features Grid - Engineered for Deep Mastery */}
      <section id="features" className="relative py-24 bg-[#0f172a] border-t border-white/5">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Engineered for Deep Mastery</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureItem 
              icon="fa-compass" 
              title="Strict Topic Scoping" 
              desc="No noisy global feeds. Learn inside dedicated environments for Algorithms, Data Structures, and more."
            />
            <FeatureItem 
              icon="fa-microchip" 
              title="Context-Aware AI Tutoring" 
              desc="Get step-by-step breakdowns, dry runs, and complexity analysis. Our AI knows exactly which topic you are studying."
            />
            <FeatureItem 
              icon="fa-arrow-trend-up" 
              title="External Sync & Realtime Stats" 
              desc="Connect LeetCode. Track weak spots with our Confidence Meter and get personalized practice sets."
            />
          </div>
        </div>
      </section>

      {/* Project Journey Section (Timeline) */}
      <section id="journey" className="relative py-32 bg-[#0b1120] border-t border-white/5 overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
            <div className="text-center mb-24">
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Your Path from Concept to Offer Letter</h2>
                <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full shadow-lg shadow-purple-900/50"></div>
            </div>

            <div className="relative max-w-6xl mx-auto">
                {/* Desktop Connecting Line */}
                <div className="hidden md:block absolute top-[48px] left-[10%] right-[10%] h-[3px] bg-gradient-to-r from-blue-600/30 via-indigo-500/30 to-emerald-500/30 -z-10 rounded-full"></div>
                
                {/* Mobile Connecting Line */}
                <div className="md:hidden absolute top-12 bottom-12 left-1/2 -translate-x-1/2 w-0.5 bg-gradient-to-b from-blue-600/30 via-indigo-500/30 to-emerald-500/30 -z-10"></div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-6">
                    <TimelineNode 
                        icon="fa-chart-pie" 
                        title="Assess Gaps" 
                        desc="Sync external data to find weak spots." 
                        step="01"
                        color="text-blue-400"
                        borderColor="border-blue-500"
                        glowColor="shadow-blue-500/20"
                    />
                    <TimelineNode 
                        icon="fa-book-open" 
                        title="Structured Study" 
                        desc="Master topics with curated guides." 
                        step="02"
                        color="text-indigo-400"
                        borderColor="border-indigo-500"
                        glowColor="shadow-indigo-500/20"
                    />
                    <TimelineNode 
                        icon="fa-code" 
                        title="Deliberate Practice" 
                        desc="Targeted problems & mock interviews." 
                        step="03"
                        color="text-purple-400"
                        borderColor="border-purple-500"
                        glowColor="shadow-purple-500/20"
                    />
                    <TimelineNode 
                        icon="fa-trophy" 
                        title="Verified Mastery" 
                        desc="Earn high-trust badges and confidence." 
                        step="04"
                        color="text-emerald-400"
                        borderColor="border-emerald-500"
                        glowColor="shadow-emerald-500/20"
                    />
                </div>
            </div>
        </div>
      </section>

      {/* Methodology Section */}
      <section id="methodology" className="relative py-24 bg-[#0f172a] border-t border-white/5">
        <div className="container mx-auto px-6">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">The Clarix Methodology</h2>
                <div className="h-1 w-16 bg-blue-600 mx-auto rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)]"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
               <div className="p-10 rounded-3xl bg-[#0B1120] border border-white/10 hover:border-indigo-500/30 transition-all duration-500 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none group-hover:bg-indigo-600/10 transition-colors"></div>
                  
                  <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6">
                    <i className="fa-solid fa-lock text-2xl text-indigo-400"></i>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-4">Context Locking</h3>
                  <p className="text-slate-400 leading-relaxed text-lg">
                      Generic bots hallucinate. Clarix locks the AI context to specific DSA topics to ensure specialized, grounded tutoring for the exact concept you are mastering.
                  </p>
               </div>

               <div className="p-10 rounded-3xl bg-[#0B1120] border border-white/10 hover:border-purple-500/30 transition-all duration-500 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/5 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none group-hover:bg-purple-600/10 transition-colors"></div>
                  
                  <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6">
                    <i className="fa-solid fa-graduation-cap text-2xl text-purple-400"></i>
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-4">Socratic Guidance</h3>
                  <p className="text-slate-400 leading-relaxed text-lg">
                      Mastery comes from "why", not "what". Our AI asks guiding questions, forcing your brain to build the neural pathways required for real-world problem solving.
                  </p>
               </div>
            </div>
        </div>
      </section>

      {/* Clean Footer */}
      <footer className="py-12 bg-[#020617] border-t border-white/5 text-slate-500 text-sm">
         <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
             <div className="text-center md:text-left">
                 <p className="font-bold text-slate-300 text-base mb-1">Clarix AI © 2026</p>
                 <p className="text-xs text-slate-600">Built for ambitious students focused on the fundamentals of CS.</p>
             </div>
             <div className="flex items-center gap-8 font-medium">
                 <span className="hover:text-white transition-colors cursor-pointer">Privacy</span>
                 <span className="hover:text-white transition-colors cursor-pointer">Terms</span>
                 <span className="hover:text-white transition-colors cursor-pointer">Contact</span>
             </div>
         </div>
      </footer>

      {/* Modals */}
      <InfoModal content={modalContent} onClose={() => setModalContent(null)} />
    </div>
  );
};

const FeatureItem = ({ icon, title, desc }: { icon: string, title: string, desc: string }) => (
  <div className="relative p-8 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-white/10 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 group overflow-hidden">
    <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
      <i className={`fa-solid ${icon} text-xl text-blue-400`}></i>
    </div>
    <h3 className="text-lg font-bold text-white mb-3 group-hover:text-blue-100 transition-colors">{title}</h3>
    <p className="text-sm text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">{desc}</p>
  </div>
);

const TimelineNode = ({ icon, title, desc, step, color, borderColor, glowColor }: any) => (
    <div className="flex flex-col items-center text-center group bg-[#0b1120] md:bg-transparent p-6 rounded-2xl md:p-0 border border-white/5 md:border-none relative z-10">
       <div className={`w-24 h-24 rounded-full bg-[#0f172a] border-4 ${borderColor} ${glowColor} shadow-xl flex items-center justify-center mb-6 relative group-hover:scale-110 transition-transform duration-300`}>
           <i className={`fa-solid ${icon} text-3xl ${color}`}></i>
           <div className={`absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[#1e293b] border ${borderColor} flex items-center justify-center`}>
               <span className={`text-xs font-bold ${color}`}>{step}</span>
           </div>
       </div>
       <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-200 transition-colors">{title}</h3>
       <p className="text-slate-400 text-sm leading-relaxed max-w-[200px]">{desc}</p>
    </div>
);

const InfoModal = ({ content, onClose }: { content: { title: string; body: string } | null, onClose: () => void }) => {
  if (!content) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm animate-fade-in" onClick={onClose}></div>
        <div className="relative bg-[#1e293b]/90 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl p-8 max-w-lg w-full animate-fade-in-up">
            <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
                <i className="fa-solid fa-xmark text-xl"></i>
            </button>
            <h2 className="text-2xl font-bold text-white mb-4">{content.title}</h2>
            <p className="text-slate-300 leading-relaxed text-lg">
                {content.body}
            </p>
        </div>
    </div>
  );
};
