
import React from "react";

interface BadgeProps {
  reason?: string;
}

const Tooltip = ({ text }: { text?: string }) => {
  if (!text) return null;
  return (
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-lg leading-snug text-center">
      {text}
      {/* Arrow */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
    </div>
  );
};

export const VerifiedBadge = ({ reason }: BadgeProps) => (
  <div className="group relative cursor-help inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-md text-[10px] font-bold uppercase tracking-wide">
    <i className="fa-solid fa-check-circle"></i>
    <span>Verified Solution</span>
    <Tooltip text={reason} />
  </div>
);

export const PartialBadge = ({ reason }: BadgeProps) => (
  <div className="group relative cursor-help inline-flex items-center gap-1.5 px-2.5 py-1 bg-yellow-100 border border-yellow-200 text-yellow-700 rounded-md text-[10px] font-bold uppercase tracking-wide">
    <i className="fa-solid fa-triangle-exclamation"></i>
    <span>Partially Correct</span>
    <Tooltip text={reason} />
  </div>
);

export const IncorrectBadge = ({ reason }: BadgeProps) => (
  <div className="group relative cursor-help inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-100 border border-red-200 text-red-700 rounded-md text-[10px] font-bold uppercase tracking-wide">
    <i className="fa-solid fa-circle-xmark"></i>
    <span>Incorrect</span>
    <Tooltip text={reason} />
  </div>
);
