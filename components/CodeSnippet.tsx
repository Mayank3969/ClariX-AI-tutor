
import React, { useState, useEffect, useRef } from 'react';

// Declare Prism global
declare const Prism: any;

interface CodeSnippetProps {
  codeMap: {
    cpp?: string;
    python?: string;
    py?: string;
    java?: string;
    [key: string]: string | undefined;
  };
  preferredLanguage?: string;
}

export const CodeSnippet = ({ codeMap, preferredLanguage = "Python" }: CodeSnippetProps) => {
  const normalize = (lang: string) => {
    const lower = lang.toLowerCase();
    if (lower === 'c++' || lower === 'cpp') return 'cpp';
    if (lower === 'python' || lower === 'py') return 'python';
    if (lower === 'java') return 'java';
    return 'python';
  };

  const availableLangs = Object.keys(codeMap).filter(k => codeMap[k]);
  
  const [activeLang, setActiveLang] = useState(() => {
    const target = normalize(preferredLanguage);
    const match = availableLangs.find(k => normalize(k) === target);
    return match || availableLangs[0] || 'python';
  });

  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof Prism !== 'undefined' && codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [activeLang, codeMap]);

  const handleCopy = () => {
    const code = codeMap[activeLang] || "";
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayLang = (key: string) => {
    const n = normalize(key);
    if (n === 'cpp') return 'C++';
    if (n === 'python') return 'Python';
    if (n === 'java') return 'Java';
    return key.toUpperCase();
  };

  const getPrismLangClass = (key: string) => {
      const n = normalize(key);
      if (n === 'cpp') return 'cpp';
      if (n === 'java') return 'java';
      return 'python';
  }

  return (
    <div className="bg-[#1e293b] rounded-xl border border-slate-700 overflow-hidden shadow-lg my-6 group">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#0b1120] border-b border-slate-700">
        <div className="flex gap-2">
           <div className="flex gap-1.5 mr-4 items-center">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
            </div>
          {availableLangs.map(langKey => (
            <button
              key={langKey}
              onClick={() => setActiveLang(langKey)}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all border ${
                activeLang === langKey 
                  ? 'bg-slate-700 text-white border-slate-600 shadow-sm' 
                  : 'text-slate-400 border-transparent hover:text-white hover:bg-slate-800'
              }`}
            >
              {displayLang(langKey)}
            </button>
          ))}
        </div>
        
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-blue-400 transition-colors bg-slate-800/50 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700/50"
        >
          {copied ? (
              <>
                <i className="fa-solid fa-check text-emerald-400"></i>
                <span className="text-emerald-400">Copied</span>
              </>
          ) : (
              <>
                <i className="fa-regular fa-copy"></i>
                <span>Copy Code</span>
              </>
          )}
        </button>
      </div>

      {/* Code Body */}
      <div className="relative">
         <pre className="!m-0 !p-6 !bg-[#0f172a] !text-sm !font-mono !leading-relaxed overflow-x-auto custom-scrollbar">
            <code ref={codeRef} className={`language-${getPrismLangClass(activeLang)}`}>
              {codeMap[activeLang]}
            </code>
         </pre>
      </div>
    </div>
  );
};
