
import React, { useState } from "react";

interface CreatePostButtonProps {
  topicId: string;
  algorithmId: string;
  topicName: string;
}

export const CreatePostButton = ({ topicId, algorithmId, topicName }: CreatePostButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [explanation, setExplanation] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This strictly enforces the path structure: topics/{topicId}/algorithms/{algorithmId}/posts
    // In a real implementation, this payload is sent to Firestore or a Cloud Function.
    console.log("Creating post at path:", `topics/${topicId}/algorithms/${algorithmId}/posts`, {
        title, 
        code, 
        explanation,
        timestamp: new Date().toISOString()
    });
    
    setIsOpen(false);
    setTitle("");
    setCode("");
    setExplanation("");
    alert("Solution submitted! Clarix AI is analyzing your code for misconceptions...");
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
      >
        <i className="fa-solid fa-pen-to-square"></i>
        <span className="hidden sm:inline">Post Solution</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
           {/* Backdrop */}
           <div 
             className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"
             onClick={() => setIsOpen(false)}
           ></div>

           {/* Modal */}
           <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800 text-lg">Contribute Solution</h3>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                      <i className="fa-solid fa-xmark text-lg"></i>
                  </button>
              </div>

              {/* Locked Context Bar - Enforces "content stays where it belongs" */}
              <div className="bg-blue-50 px-6 py-3 border-b border-blue-100 flex items-center gap-2 text-sm text-blue-800">
                  <i className="fa-solid fa-lock text-xs"></i>
                  <span className="font-semibold">Posting to:</span>
                  <div className="flex items-center gap-1">
                    <span className="bg-white px-2 py-0.5 rounded border border-blue-200 text-xs font-mono font-bold">{topicName}</span>
                    <span className="text-blue-300">/</span>
                    <span className="bg-white px-2 py-0.5 rounded border border-blue-200 text-xs font-mono font-bold">{algorithmId}</span>
                  </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
                  <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Solution Title</label>
                      <input 
                        type="text" 
                        required
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="e.g. Optimal HashMap Approach O(n)"
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                      />
                  </div>

                  <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Your Code</label>
                      <div className="relative group">
                        <textarea 
                            required
                            value={code}
                            onChange={e => setCode(e.target.value)}
                            placeholder="def solution(): ..."
                            className="w-full h-40 px-4 py-3 bg-slate-900 text-blue-100 font-mono text-sm border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed resize-none"
                        ></textarea>
                        <div className="absolute top-2 right-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider bg-slate-800 px-2 py-1 rounded">
                            Python / C++ / Java
                        </div>
                      </div>
                  </div>

                   <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Explanation (Optional)</label>
                      <textarea 
                        value={explanation}
                        onChange={e => setExplanation(e.target.value)}
                        placeholder="Briefly explain your intuition, time complexity, or trade-offs..."
                        className="w-full h-24 px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                      ></textarea>
                  </div>

                  <div className="pt-2">
                      <button 
                        type="submit"
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 group"
                      >
                          <span>Submit for AI Analysis</span>
                          <i className="fa-solid fa-wand-magic-sparkles group-hover:animate-pulse"></i>
                      </button>
                      <p className="text-center text-xs text-slate-400 mt-3">
                          Clarix AI analyzes every submission for logical errors and misconceptions.
                      </p>
                  </div>
              </form>
           </div>
        </div>
      )}
    </>
  );
};
