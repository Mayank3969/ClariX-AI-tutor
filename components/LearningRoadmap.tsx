
import React from "react";
import { LearningModule } from "../types";

export const LearningRoadmap = ({ modules }: { modules: LearningModule[] }) => {
  return (
    <div className="py-6">
      <div className="relative border-l-2 border-slate-200 ml-4 md:ml-6 space-y-10">
        {modules.map((module, index) => {
          const isCompleted = module.status === "Completed";
          const isActive = module.status === "Active";
          const isLocked = module.status === "Locked";

          return (
            <div key={index} className="relative pl-8 md:pl-10 group">
              {/* Timeline Node */}
              <div
                className={`absolute -left-[9px] top-0 w-5 h-5 rounded-full border-4 transition-all duration-300 z-10 ${
                  isCompleted
                    ? "bg-white border-emerald-500"
                    : isActive
                    ? "bg-white border-blue-600 scale-125 shadow-[0_0_0_4px_rgba(37,99,235,0.2)]"
                    : "bg-slate-100 border-slate-300"
                }`}
              >
                {isActive && (
                  <div className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-75"></div>
                )}
              </div>

              {/* Content Card */}
              <div
                className={`p-5 rounded-xl border transition-all duration-300 ${
                  isActive
                    ? "bg-white border-blue-200 shadow-lg shadow-blue-500/10 scale-[1.02]"
                    : isCompleted
                    ? "bg-emerald-50/30 border-emerald-100 hover:border-emerald-200"
                    : "bg-slate-50 border-slate-200 opacity-70 grayscale-[0.5]"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <h4
                    className={`text-lg font-bold ${
                      isActive
                        ? "text-blue-700"
                        : isCompleted
                        ? "text-emerald-700"
                        : "text-slate-600"
                    }`}
                  >
                    {module.topic}
                  </h4>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        module.difficulty === "Easy"
                          ? "bg-green-100 text-green-700"
                          : module.difficulty === "Medium"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {module.difficulty}
                    </span>
                    {isActive && (
                      <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded uppercase tracking-wider animate-pulse">
                        Current Focus
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-2 text-sm text-slate-600">
                  <i className="fa-solid fa-circle-info mt-1 text-slate-400"></i>
                  <p>
                    <span className="font-semibold text-slate-700">Why recommended:</span>{" "}
                    {module.reason}
                  </p>
                </div>

                {isActive && (
                    <button className="mt-4 w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                        <span>Start Module</span>
                        <i className="fa-solid fa-arrow-right"></i>
                    </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
