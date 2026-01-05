
import React, { useState, useEffect } from "react";
import { generateReflectionQuestion, saveReflectionToHistory } from "../api";

interface ReflectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  topicName: string;
  problemTitle: string;
  userCode: string;
}

export const ReflectionModal = ({ isOpen, onClose, topicName, problemTitle, userCode }: ReflectionModalProps) => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchQuestion = async () => {
        setLoading(true);
        const q = await generateReflectionQuestion(topicName, userCode);
        setQuestion(q);
        setLoading(false);
      };
      fetchQuestion();
    } else {
        setAnswer("");
    }
  }, [isOpen, topicName, userCode]);

  const handleSave = async () => {
    if (!answer.trim()) return;
    setSaving(true);
    try {
        await saveReflectionToHistory(topicName, problemTitle, question, answer);
        onClose();
    } catch (e) {
        console.error(e);
    } finally {
        setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-fade-in" onClick={onClose}></div>
      <div className="relative bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up border border-white/40">
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
        <div className="p-8">
            <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 shadow-inner">
                    <i className="fa-solid fa-brain-circuit text-xl"></i>
                </div>
                <div>
                    <h2 className="text-xl font-black text-slate-900 leading-tight">Post-Solve Reflection</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{problemTitle}</p>
                </div>
            </div>

            <div className="min-h-[100px] mb-8">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-full space-y-4">
                        <div className="flex gap-2">
                            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        </div>
                        <p className="text-sm text-slate-500 italic font-medium">Gemini is analyzing your code logic...</p>
                    </div>
                ) : (
                    <div className="bg-indigo-50/50 rounded-2xl p-5 border border-indigo-100/50 shadow-sm animate-fade-in">
                        <p className="text-sm font-bold text-indigo-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                             <i className="fa-solid fa-wand-magic-sparkles"></i> AI Insight
                        </p>
                        <p className="text-slate-800 font-medium leading-relaxed">"{question}"</p>
                    </div>
                )}
            </div>

            <div className="space-y-4">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Your Reflection</label>
                <textarea 
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    className="w-full h-32 p-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 transition-all text-slate-800 placeholder-slate-300 shadow-sm resize-none"
                    disabled={loading || saving}
                ></textarea>
            </div>

            <div className="mt-8 flex gap-3">
                <button onClick={onClose} disabled={saving} className="flex-1 py-3 text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-colors border border-transparent">
                    Skip
                </button>
                <button 
                    onClick={handleSave}
                    disabled={loading || saving || !answer.trim()}
                    className="flex-[2] py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-indigo-600 disabled:opacity-50 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2"
                >
                    {saving ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-cloud-arrow-up text-xs"></i>}
                    <span>{saving ? 'Saving...' : 'Save Reflection'}</span>
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
