
import React, { useState, useEffect } from "react";
import { generatePracticeSet, gradePracticeSet } from "../api";
import { PracticeSet, GradingResult, Badge } from "../types";
import { MOCK_USER_STATS, MOCK_USER } from "../data";
import { checkForNewBadges } from "../utils/badgeManager";
import { BadgeCelebrationModal } from "../components/BadgeCelebrationModal";

interface PracticeSessionProps {
  onRemediation?: (topic: string, aiMessage: string) => void;
  onSuccess?: () => void;
}

export const PracticeSession = ({ onRemediation, onSuccess }: PracticeSessionProps) => {
  const [loading, setLoading] = useState(true);
  const [practiceSet, setPracticeSet] = useState<PracticeSet | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [gradingResult, setGradingResult] = useState<GradingResult | null>(null);
  const [isGrading, setIsGrading] = useState(false);
  const [weakTopic, setWeakTopic] = useState("");
  const [earnedBadge, setEarnedBadge] = useState<Badge | null>(null);

  useEffect(() => {
    const initSession = async () => {
      const topic = MOCK_USER_STATS.weakAreas.length > 0 
        ? MOCK_USER_STATS.weakAreas[0] 
        : "Dynamic Programming"; 
      
      setWeakTopic(topic);
      const data = await generatePracticeSet(topic);
      setPracticeSet(data);
      setLoading(false);
    };
    initSession();
  }, []);

  const handleOptionSelect = (qId: number, option: string) => {
    if (gradingResult) return;
    setAnswers(prev => ({ ...prev, [qId]: option }));
  };

  const handleTextChange = (qId: number, text: string) => {
    if (gradingResult) return;
    setAnswers(prev => ({ ...prev, [qId]: text }));
  };

  const handleSubmit = async () => {
    if (!practiceSet) return;
    setIsGrading(true);
    
    // Prepare simple question format for API
    const questionsForGrading = practiceSet.questions.map(q => ({
      id: q.id,
      text: q.questionText,
      correctAnswer: q.correctAnswer || "Refer to explanation"
    }));

    const result = await gradePracticeSet(practiceSet.topic, questionsForGrading, answers);
    setGradingResult(result);
    setIsGrading(false);

    // Check for Badges
    const newBadge = checkForNewBadges(MOCK_USER, MOCK_USER_STATS, {
        topic: practiceSet.topic
    });
    
    if (newBadge) {
        setEarnedBadge(newBadge);
        MOCK_USER.badges.push(newBadge.id); // Update local mock state
    }

    // Auto-Action Logic
    if (result.score < 50) {
       setTimeout(() => {
           onRemediation?.(practiceSet.topic, `It seems you're struggling with **${practiceSet.topic}**. Let's review the basics together.`);
       }, 4000); // 4s delay to let user see score
    } else if (result.score > 80) {
       onSuccess?.();
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] bg-slate-50">
        <div className="relative w-20 h-20 mb-6">
          <div className="absolute inset-0 border-4 border-indigo-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <h2 className="text-xl font-bold text-slate-900">Configuring Practice Pod</h2>
        <p className="text-slate-500 mt-2">Gemini is generating custom questions for <span className="font-bold text-indigo-600">{weakTopic}</span>...</p>
      </div>
    );
  }

  if (!practiceSet) return null;

  return (
    <div className="p-8 lg:p-12 overflow-y-auto h-[calc(100vh-80px)] bg-slate-50">
      
      {earnedBadge && (
          <BadgeCelebrationModal badge={earnedBadge} onClose={() => setEarnedBadge(null)} />
      )}

      <div className="max-w-4xl mx-auto space-y-8 pb-20">
        
        {/* Header */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Weak Area Focus</span>
            <span className="text-slate-400 text-sm font-medium">5 Questions</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">{practiceSet.topic} Deep Dive</h1>
          <p className="text-slate-500">
            This session is tailored to address your specific gaps in {practiceSet.topic}. 
            Complete the set to unlock detailed AI feedback.
          </p>
        </div>
        
        {/* Results Banner */}
        {gradingResult && (
           <div className={`p-6 rounded-2xl border-2 flex items-center gap-6 animate-fade-in-up shadow-xl ${
               gradingResult.score < 50 ? 'bg-red-50 border-red-100' :
               gradingResult.score > 80 ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'
           }`}>
               <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black border-4 bg-white ${
                   gradingResult.score < 50 ? 'border-red-500 text-red-600' :
                   gradingResult.score > 80 ? 'border-emerald-500 text-emerald-600' : 'border-amber-500 text-amber-600'
               }`}>
                   {gradingResult.score}
               </div>
               <div className="flex-1">
                   <h3 className={`text-xl font-bold mb-1 ${
                       gradingResult.score < 50 ? 'text-red-800' :
                       gradingResult.score > 80 ? 'text-emerald-800' : 'text-amber-800'
                   }`}>
                       {gradingResult.score < 50 ? 'Needs Improvement' : gradingResult.score > 80 ? 'Mastery Achieved!' : 'Solid Progress'}
                   </h3>
                   <p className="text-slate-700 leading-relaxed text-sm">{gradingResult.feedback}</p>
                   
                   {gradingResult.score < 50 && (
                       <div className="mt-3 flex items-center gap-2 text-red-700 font-bold text-sm bg-red-100/50 p-2 rounded-lg inline-block">
                           <i className="fa-solid fa-arrows-rotate fa-spin"></i> Redirecting to Remedial Tutoring...
                       </div>
                   )}
                   {gradingResult.score > 80 && (
                       <div className="mt-3 flex items-center gap-2 text-emerald-700 font-bold text-sm bg-emerald-100/50 p-2 rounded-lg inline-block">
                           <i className="fa-solid fa-trophy"></i> Ready for LeetCode Hard!
                       </div>
                   )}
               </div>
           </div>
        )}

        {/* Questions List */}
        <div className="space-y-8">
          {practiceSet.questions.map((q, idx) => {
             const analysis = gradingResult?.questionAnalysis.find(a => a.id === q.id);
             
             return (
            <div key={q.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden animate-fade-in-up transition-colors duration-500 ${
                analysis 
                ? (analysis.isCorrect ? 'border-emerald-200' : 'border-red-200') 
                : 'border-slate-200'
            }`} style={{ animationDelay: `${idx * 100}ms` }}>
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                <span className="font-bold text-slate-400 text-sm uppercase tracking-wide">Question {idx + 1}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                  q.type === 'MCQ' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                  q.type === 'Debugging' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                  'bg-purple-50 text-purple-600 border-purple-100'
                }`}>
                  {q.type}
                </span>
              </div>
              
              <div className="p-6">
                <p className="text-lg font-bold text-slate-800 mb-4 leading-relaxed">{q.questionText}</p>

                {/* Code Snippet for Debugging */}
                {q.codeSnippet && (
                  <div className="mb-6 bg-slate-900 rounded-lg p-4 border border-slate-800 overflow-x-auto">
                    <pre className="font-mono text-sm text-blue-100">{q.codeSnippet}</pre>
                  </div>
                )}

                {/* Render Answer Input based on Type */}
                {q.type === 'MCQ' && q.options ? (
                  <div className="space-y-3">
                    {q.options.map((option) => {
                      const isSelected = answers[q.id] === option;
                      // Logic: If graded, show correct vs incorrect
                      let optionClass = "border-slate-200 hover:border-indigo-300 hover:bg-slate-50";
                      
                      if (gradingResult) {
                          // Note: In a real app we'd need to strictly match MCQ logic, 
                          // here we rely on the AI's analysis of correctness for simplicity 
                          // or match string exactly if provided
                          if (isSelected) {
                              optionClass = analysis?.isCorrect 
                                ? "border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500" 
                                : "border-red-500 bg-red-50 ring-1 ring-red-500";
                          } else if (option === q.correctAnswer) {
                               optionClass = "border-emerald-500 ring-1 ring-emerald-500 opacity-60"; // Show correct answer
                          } else {
                              optionClass = "border-slate-100 opacity-50";
                          }
                      } else if (isSelected) {
                        optionClass = "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500";
                      }

                      return (
                        <button
                          key={option}
                          onClick={() => handleOptionSelect(q.id, option)}
                          disabled={!!gradingResult}
                          className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center justify-between group ${optionClass}`}
                        >
                          <span className={`font-medium text-slate-700`}>{option}</span>
                          {gradingResult && isSelected && analysis?.isCorrect && <i className="fa-solid fa-check text-emerald-600"></i>}
                          {gradingResult && isSelected && !analysis?.isCorrect && <i className="fa-solid fa-xmark text-red-500"></i>}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  // Text Area for Debugging & Algorithmic
                  <div>
                    <textarea
                      value={answers[q.id] || ""}
                      onChange={(e) => handleTextChange(q.id, e.target.value)}
                      disabled={!!gradingResult}
                      placeholder={q.type === 'Debugging' ? "Identify the error and explain the fix..." : "Describe your approach step-by-step..."}
                      className={`w-full h-32 p-4 rounded-xl border bg-white focus:ring-2 focus:ring-indigo-100 transition-all resize-none ${
                        gradingResult 
                          ? "border-slate-200 text-slate-500 bg-slate-50" 
                          : "border-slate-300 focus:border-indigo-400 text-slate-800"
                      }`}
                    ></textarea>
                  </div>
                )}

                {/* Feedback Section (Visible after submit) */}
                {analysis && (
                  <div className={`mt-6 pt-6 border-t ${analysis.isCorrect ? 'border-emerald-100' : 'border-red-100'} animate-fade-in`}>
                    <div className={`flex items-start gap-3 p-4 rounded-xl border ${analysis.isCorrect ? 'bg-emerald-50/50 border-emerald-100' : 'bg-red-50/50 border-red-100'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${analysis.isCorrect ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                        <i className={`fa-solid ${analysis.isCorrect ? 'fa-check' : 'fa-xmark'}`}></i>
                      </div>
                      <div>
                        <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${analysis.isCorrect ? 'text-emerald-800' : 'text-red-800'}`}>
                            {analysis.isCorrect ? "Correct" : "Incorrect"}
                        </p>
                        <p className="text-sm text-slate-700 leading-relaxed">{analysis.feedback}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )})}
        </div>

        {/* Submit Action */}
        <div className="sticky bottom-8 z-10 flex justify-center">
          {!gradingResult ? (
            <button
              onClick={handleSubmit}
              disabled={isGrading}
              className="bg-slate-900 hover:bg-indigo-600 text-white font-bold py-4 px-12 rounded-full shadow-2xl shadow-slate-900/20 transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isGrading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    <span>Grading with Gemini...</span>
                  </>
              ) : (
                  <>
                    <span>Submit Practice Set</span>
                    <i className="fa-solid fa-paper-plane"></i>
                  </>
              )}
            </button>
          ) : (
            <button
              onClick={() => window.location.reload()}
              className="bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 font-bold py-4 px-12 rounded-full shadow-lg transition-all flex items-center gap-2"
            >
              <i className="fa-solid fa-rotate-right"></i>
              <span>Start New Session</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
