
import React from "react";
import { Badge } from "../types";
import { BADGES } from "../data";

interface TrophyCaseProps {
  earnedBadgeIds: string[];
}

export const TrophyCase = ({ earnedBadgeIds }: TrophyCaseProps) => {
  const allBadges = Object.values(BADGES);

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-yellow-100 text-yellow-600 flex items-center justify-center">
            <i className="fa-solid fa-award"></i>
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Trophy Case</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {allBadges.map((badge) => {
          const isEarned = earnedBadgeIds.includes(badge.id);

          return (
            <div 
              key={badge.id} 
              className={`relative group p-6 rounded-2xl border flex flex-col items-center text-center transition-all duration-300 overflow-hidden ${
                isEarned 
                  ? "bg-white border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1" 
                  : "bg-slate-50 border-slate-200"
              }`}
            >
              {/* Badge Icon Circle */}
              <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl mb-4 relative overflow-hidden shadow-inner transition-transform duration-300 group-hover:scale-110 ${
                  isEarned ? badge.color : "bg-slate-200 text-slate-400 grayscale"
              }`}>
                  {/* Metallic Shine Effect for Earned */}
                  {isEarned && (
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent opacity-50"></div>
                  )}
                  
                  {/* Icon */}
                  <i className={`fa-solid ${badge.icon} relative z-10 ${isEarned ? 'text-white drop-shadow-md' : ''}`}></i>
              </div>

              <h3 className={`font-bold text-sm mb-1 ${isEarned ? "text-slate-900" : "text-slate-500"}`}>
                  {badge.name}
              </h3>
              
              {/* Locked Overlay / Tooltip */}
              {!isEarned ? (
                  <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-slate-900/95 transition-opacity duration-200 p-4 text-center cursor-help">
                      <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-200">
                        <i className="fa-solid fa-lock text-slate-400 mb-2 text-lg"></i>
                        <p className="text-white text-xs font-medium leading-tight">
                            {badge.description}
                        </p>
                      </div>
                  </div>
              ) : (
                  <p className="text-xs text-slate-500 line-clamp-2 px-2">{badge.description}</p>
              )}
              
              {/* Earned Checkmark */}
              {isEarned && (
                  <div className="absolute top-3 right-3 text-emerald-500 bg-emerald-50 rounded-full w-5 h-5 flex items-center justify-center border border-emerald-100">
                      <i className="fa-solid fa-check text-[10px]"></i>
                  </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
