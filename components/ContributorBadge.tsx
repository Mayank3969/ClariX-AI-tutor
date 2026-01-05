
import React from 'react';

interface ContributorBadgeProps {
  roles?: string[];
  badges?: string[];
  topicName?: string;
}

export const ContributorBadge = ({ roles = [], badges = [], topicName = "Algorithms" }: ContributorBadgeProps) => {
  // Logic: Check user.roles or user.badges array
  const isTopicExpert = roles.includes("Topic Expert") || badges.includes("GRAPH_GOD"); 
  const isVerifiedHelper = roles.includes("Verified Helper") || badges.includes("CLEAN_CODER");

  if (!isTopicExpert && !isVerifiedHelper) return null;

  return (
    <div className="flex items-center gap-1.5 ml-1">
      {/* Top Contributor Badge */}
      {isTopicExpert && (
        <div className="group relative">
          <div className="flex items-center justify-center w-5 h-5 bg-gradient-to-br from-yellow-300 via-amber-400 to-amber-500 rounded-full text-white shadow-sm cursor-help ring-1 ring-white">
            <i className="fa-solid fa-star text-[10px] drop-shadow-sm"></i>
          </div>
          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[200px] px-3 py-2 bg-slate-900 text-white text-xs rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl border border-slate-700">
            <div className="flex items-center gap-1.5 mb-1">
                <i className="fa-solid fa-crown text-yellow-400"></i>
                <p className="font-bold text-yellow-100">Top Contributor</p>
            </div>
            <p className="font-medium text-slate-300">Top 1% Contributor in {topicName}</p>
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
          </div>
        </div>
      )}

      {/* Verified Helper Badge */}
      {isVerifiedHelper && (
        <div className="group relative">
           <div className="flex items-center justify-center w-5 h-5 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full text-white shadow-sm cursor-help ring-1 ring-white">
            <i className="fa-solid fa-check text-[10px] drop-shadow-sm"></i>
          </div>
           {/* Tooltip */}
           <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-2 bg-slate-900 text-white text-xs rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl border border-slate-700">
            <div className="flex items-center gap-1.5 mb-1">
                <i className="fa-solid fa-shield-check text-blue-400"></i>
                <p className="font-bold text-blue-100">Verified Helper</p>
            </div>
            <p className="font-medium text-slate-300">50+ Validated Solutions</p>
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
          </div>
        </div>
      )}
    </div>
  );
};
