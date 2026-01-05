
import React from "react";

interface ConfidenceGaugeProps {
  score: number;
  topicName: string;
  previousScore?: number;
}

export const ConfidenceGauge = ({ score, topicName, previousScore }: ConfidenceGaugeProps) => {
  // Determine visual state based on score tiers
  let colorClass = "text-red-500";
  let bgClass = "bg-red-50";
  let label = "Novice";

  if (score > 70) {
    colorClass = "text-emerald-500";
    bgClass = "bg-emerald-50";
    label = "Master";
  } else if (score > 30) {
    colorClass = "text-yellow-500";
    bgClass = "bg-yellow-50";
    label = "Intermediate";
  }

  // Calculate Trend
  let trendIcon = "fa-minus";
  let trendColor = "text-slate-400";
  let trendValue = 0;

  if (previousScore !== undefined) {
    trendValue = score - previousScore;
    if (trendValue > 0) {
      trendIcon = "fa-arrow-trend-up";
      trendColor = "text-emerald-600";
    } else if (trendValue < 0) {
      trendIcon = "fa-arrow-trend-down";
      trendColor = "text-red-500";
    }
  }

  // SVG Configuration
  const size = 160;
  const strokeWidth = 12;
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-slate-200 shadow-sm w-full hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between w-full mb-6 px-2">
          <h3 className="text-slate-600 text-xs font-bold uppercase tracking-wider truncate max-w-[180px]" title={topicName}>{topicName}</h3>
          <div className="group relative">
             <i className="fa-solid fa-circle-info text-slate-300 hover:text-blue-400 cursor-help transition-colors"></i>
             <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-slate-900 text-white text-[10px] rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 leading-relaxed">
                 Score based on accuracy, problem difficulty, and consistency over the last 7 days.
             </div>
          </div>
      </div>

      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        {/* Ring Background */}
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          <circle
            stroke="currentColor"
            fill="transparent"
            strokeWidth={strokeWidth}
            className="text-slate-100"
            r={radius}
            cx={center}
            cy={center}
          />
          {/* Progress Ring */}
          <circle
            stroke="currentColor"
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference + " " + circumference}
            style={{ strokeDashoffset, transition: "stroke-dashoffset 1s ease-out" }}
            className={colorClass}
            strokeLinecap="round"
            r={radius}
            cx={center}
            cy={center}
          />
        </svg>

        {/* Center Text */}
        <div className="absolute flex flex-col items-center justify-center inset-0">
            <span className="text-4xl font-extrabold text-slate-900 tracking-tight">{score}</span>
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full mt-1 ${bgClass} ${colorClass.replace('text-', 'text-opacity-80 text-')}`}>
                {label}
            </span>
        </div>
      </div>

      {/* Trend Indicator */}
      <div className="mt-6 flex items-center justify-center w-full h-8">
        {previousScore !== undefined && trendValue !== 0 ? (
            <div className={`flex items-center gap-1.5 text-xs font-bold ${trendColor} bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100`}>
                <i className={`fa-solid ${trendIcon}`}></i>
                <span>{trendValue > 0 ? "+" : ""}{trendValue}% Since last session</span>
            </div>
        ) : (
             <div className="text-xs text-slate-400 font-medium px-3 py-1 border border-transparent">
                 <span className="opacity-60">— Stable —</span>
             </div>
        )}
      </div>
    </div>
  );
};
