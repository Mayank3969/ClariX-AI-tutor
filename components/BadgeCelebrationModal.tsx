
import React from 'react';
import { Badge } from '../types';

export const BadgeCelebrationModal = ({ badge, onClose }: { badge: Badge, onClose: () => void }) => {
  if (!badge) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm animate-fade-in" onClick={onClose}></div>
        
        {/* Modal */}
        <div className="relative bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-bounce-in overflow-hidden border border-white/20">
            {/* Background Rays */}
            <div className="absolute inset-0 animate-spin-slow opacity-10 pointer-events-none">
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_20deg,theme('colors.yellow.400')_40deg,transparent_60deg,transparent_80deg,theme('colors.yellow.400')_100deg,transparent_120deg)]"></div>
            </div>

            <div className={`w-24 h-24 mx-auto rounded-full ${badge.color} flex items-center justify-center text-white text-4xl shadow-lg mb-6 relative z-10 animate-bounce`}>
                <i className={`fa-solid ${badge.icon}`}></i>
            </div>

            <h2 className="text-2xl font-black text-slate-900 mb-2 relative z-10">New Badge Unlocked!</h2>
            <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600 mb-4 relative z-10">{badge.name}</h3>
            
            <p className="text-slate-500 mb-8 relative z-10 leading-relaxed">
                {badge.description}
            </p>

            <button 
                onClick={onClose}
                className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg relative z-10"
            >
                Awesome!
            </button>
        </div>
    </div>
  );
};
