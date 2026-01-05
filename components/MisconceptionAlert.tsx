import React from "react";

interface MisconceptionAlertProps {
  reason: string;
  isAuthor: boolean;
  onDismiss?: () => void;
}

export const MisconceptionAlert = ({ reason, isAuthor, onDismiss }: MisconceptionAlertProps) => {
  return (
    <div className="mb-4 p-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg flex gap-3 animate-fade-in items-start relative group">
      <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
        <i className="fa-solid fa-triangle-exclamation"></i>
      </div>
      <div className="flex-1">
        <p className="text-sm font-bold text-amber-900">AI Warning: Misconception Detected</p>
        <p className="text-sm text-amber-800 mt-1 leading-relaxed">{reason}</p>
      </div>

      {isAuthor && onDismiss && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          className="text-amber-400 hover:text-amber-700 transition-colors p-1"
          title="Dismiss warning (I have fixed this)"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
      )}
    </div>
  );
};
