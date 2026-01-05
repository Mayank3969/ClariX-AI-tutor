
import React, { useState } from "react";
import { MOCK_COMMUNITY_POSTS, MOCK_USER } from "../data";
import { CommunityPost } from "../types";
import { CompareSolutionsModal } from "./CompareSolutionsModal";
import { MisconceptionAlert } from "./MisconceptionAlert";
import { CreatePostButton } from "./CreatePostButton";
import { VoteControl } from "./VoteControl";
import { VerifiedBadge, PartialBadge, IncorrectBadge } from "./ValidationBadges";
import { ContributorBadge } from "./ContributorBadge";

export const CommunityFeed = ({ topicId, algorithmId, topicName }: { topicId?: string; algorithmId?: string; topicName?: string }) => {
  // Filter posts by topic if topicId provided
  const initialPosts = topicId 
    ? MOCK_COMMUNITY_POSTS.filter(p => p.topicId === topicId)
    : MOCK_COMMUNITY_POSTS;

  const [posts, setPosts] = useState<CommunityPost[]>(initialPosts);
  // Default sort set to "relevance" to prioritize high-relevance posts
  const [sortMethod, setSortMethod] = useState<"score" | "relevance">("relevance");
  const [userVotes, setUserVotes] = useState<Record<string, "up" | "down" | null>>({});
  
  // Selection State for Comparison Mode
  const [selectedPostIds, setSelectedPostIds] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  const handleVote = (postId: string, newVote: "up" | "down" | null) => {
    // We update the parent state to ensure consistency (e.g. for sorting), 
    // even though VoteControl handles the immediate visual feedback.
    setPosts(currentPosts => currentPosts.map(post => {
      if (post.id !== postId) return post;

      const previousVote = userVotes[postId] || null;
      
      // Calculate numeric values: up=1, down=-1, null=0
      const getVal = (v: string | null) => v === 'up' ? 1 : v === 'down' ? -1 : 0;
      const prevVal = getVal(previousVote);
      const newVal = getVal(newVote);
      
      const scoreChange = newVal - prevVal;

      return { ...post, weightedScore: post.weightedScore + scoreChange };
    }));
    
    setUserVotes(prev => ({ ...prev, [postId]: newVote }));
  };

  const toggleSelection = (postId: string) => {
    if (selectedPostIds.includes(postId)) {
      setSelectedPostIds(prev => prev.filter(id => id !== postId));
    } else {
      if (selectedPostIds.length < 2) {
        setSelectedPostIds(prev => [...prev, postId]);
      } else {
        // Replace the oldest selection (first item) with the new one to keep it fluid
        setSelectedPostIds(prev => [prev[1], postId]);
      }
    }
  };

  const handleDismissMisconception = (postId: string) => {
    setPosts(currentPosts => currentPosts.map(post => {
        if (post.id !== postId) return post;
        // Effectively remove the flag visually
        return { ...post, hasMisconception: false };
    }));
  };

  // Filter posts based on Relevance AND Shadowban logic
  const filteredPosts = posts.filter(p => {
      // 1. Soft Hide Low Relevance
      if (p.aiRelevance < 40) return false;

      // 2. Shadowban Logic
      // If a post is shadowbanned, it is hidden from everyone EXCEPT the author.
      if (p.shadowBanned) {
          // In a real app with Auth, this would check `auth.currentUser.uid === p.author.uid`
          // Here we use the mock user's name for simulation
          return p.author.name === MOCK_USER.displayName;
      }

      return true;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortMethod === "relevance") {
      return b.aiRelevance - a.aiRelevance;
    }
    return b.weightedScore - a.weightedScore;
  });

  const getSelectedPosts = () => {
    return posts.filter(p => selectedPostIds.includes(p.id));
  };

  return (
    <div className="mt-16 border-t border-slate-200 pt-10 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h3 className="text-2xl font-bold text-slate-900">Community Solutions</h3>
            <p className="text-slate-500 text-sm mt-1">Peer solutions analyzed by Clarix AI</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-slate-100 rounded-lg p-1 flex text-xs font-semibold">
                <button 
                    onClick={() => setSortMethod("score")}
                    className={`px-3 py-1.5 rounded-md transition-all ${sortMethod === "score" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                    Top Rated
                </button>
                <button 
                    onClick={() => setSortMethod("relevance")}
                    className={`px-3 py-1.5 rounded-md transition-all ${sortMethod === "relevance" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                    AI Relevance
                </button>
            </div>
            
            {/* Show CreatePostButton only if we have context (topicId and algorithmId) */}
            {topicId && algorithmId && topicName && (
              <CreatePostButton 
                topicId={topicId} 
                algorithmId={algorithmId} 
                topicName={topicName} 
              />
            )}
          </div>
      </div>
      
      <div className="space-y-6">
        {sortedPosts.map((post) => {
          const isSelected = selectedPostIds.includes(post.id);
          const isLowRelevance = post.aiRelevance <= 70;
          const isHighRelevance = post.aiRelevance > 90;
          const isAuthor = post.author.name === MOCK_USER.displayName;

          let cardClasses = `bg-white rounded-xl border shadow-sm overflow-hidden transition-all duration-300 relative`;
          
          if (isSelected) {
            cardClasses += ' border-blue-500 ring-2 ring-blue-100 shadow-lg z-10';
          } else if (isHighRelevance) {
            // Highlight with subtle golden border
            cardClasses += ' border-amber-400 ring-1 ring-amber-100 shadow-md'; 
          } else {
             cardClasses += ' border-slate-200 hover:shadow-md';
          }

          if (isLowRelevance) {
            cardClasses += ' opacity-75';
          }
          
          // Visual Indicator for Author only that their post is shadowbanned
          const isShadowBannedVisible = post.shadowBanned && isAuthor;

          return (
          <div key={post.id} className={cardClasses}>
            {isShadowBannedVisible && (
                <div className="bg-red-50 text-red-600 text-[10px] font-bold text-center py-1 border-b border-red-100 uppercase tracking-wide">
                    <i className="fa-solid fa-eye-slash mr-1"></i> Shadow Banned (Visible only to you)
                </div>
            )}

            {/* Card Header */}
            <div className="p-5 flex items-start sm:items-center justify-between border-b border-slate-100 bg-slate-50/50">
               <div className="flex items-center gap-3">
                   {/* Compare Checkbox */}
                   <div 
                      onClick={(e) => { e.stopPropagation(); toggleSelection(post.id); }}
                      className="flex items-center gap-2 cursor-pointer group/check mr-2 select-none"
                   >
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                          isSelected 
                          ? "bg-blue-600 border-blue-600" 
                          : "bg-white border-slate-300 group-hover/check:border-blue-400 shadow-sm"
                      }`}>
                          {isSelected && <i className="fa-solid fa-check text-[10px] text-white"></i>}
                      </div>
                      <span className={`text-xs font-bold uppercase tracking-wide ${isSelected ? "text-blue-700" : "text-slate-400 group-hover/check:text-slate-600"}`}>
                          Compare
                      </span>
                   </div>

                   <div className="relative">
                        <img src={post.author.avatar} alt={post.author.name} className="w-10 h-10 rounded-full border border-white shadow-sm" />
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center text-[8px] text-white ${
                            post.author.expertise === "Expert" ? "bg-purple-600" :
                            post.author.expertise === "Intermediate" ? "bg-blue-500" : "bg-green-500"
                        }`}>
                            <i className="fa-solid fa-star"></i>
                        </div>
                   </div>
                   <div>
                       <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900 text-sm">{post.author.name}</span>
                            
                            {/* NEW: Contributor Badge */}
                            <ContributorBadge 
                                roles={post.author.roles} 
                                badges={post.author.badges} 
                                topicName={topicName || "Algorithms"} 
                            />

                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                                post.author.expertise === "Expert" ? "bg-purple-50 text-purple-700 border-purple-200" :
                                post.author.expertise === "Intermediate" ? "bg-blue-50 text-blue-700 border-blue-200" :
                                "bg-green-50 text-green-700 border-green-200"
                            }`}>
                                {post.author.expertise}
                            </span>

                            {isLowRelevance && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-300 bg-slate-100 text-slate-500 uppercase tracking-wider">
                                    Low Relevance
                                </span>
                            )}
                       </div>
                       <p className="text-xs text-slate-500">{post.timestamp}</p>
                   </div>
               </div>
               
               <div className="flex items-center gap-2">
                   {/* Validation Badges */}
                   {post.validationStatus === 'VERIFIED' && <VerifiedBadge reason={post.validationReason} />}
                   {post.validationStatus === 'PARTIAL' && <PartialBadge reason={post.validationReason} />}
                   {post.validationStatus === 'INCORRECT' && <IncorrectBadge reason={post.validationReason} />}

                   {/* AI Match Score */}
                   <div className={`hidden sm:flex flex-shrink-0 items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold shadow-sm ${
                       post.aiRelevance >= 80 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : 
                       post.aiRelevance >= 50 ? "bg-yellow-50 text-yellow-700 border-yellow-200" : 
                       "bg-red-50 text-red-700 border-red-200"
                   }`}>
                       <i className={`fa-solid ${post.aiRelevance >= 80 ? 'fa-check-circle' : 'fa-triangle-exclamation'}`}></i>
                       <span>AI Match: {post.aiRelevance}%</span>
                   </div>
               </div>
            </div>

            {/* Card Body */}
            <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                    <h4 className="text-lg font-bold text-slate-800">{post.title}</h4>
                </div>

                {/* Misconception Alert (Priority) */}
                {post.hasMisconception && post.misconceptionReason ? (
                    <MisconceptionAlert 
                        reason={post.misconceptionReason} 
                        isAuthor={isAuthor}
                        onDismiss={() => handleDismissMisconception(post.id)}
                    />
                ) : post.aiWarning ? (
                    <div className="mb-4 p-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg flex gap-3 animate-fade-in">
                        <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                             <i className="fa-solid fa-triangle-exclamation"></i>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-amber-900">AI Warning</p>
                            <p className="text-sm text-amber-800 mt-1 leading-relaxed">{post.aiWarning}</p>
                        </div>
                    </div>
                ) : null}

                <div className="relative group">
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="text-xs bg-slate-800 text-white px-2 py-1 rounded hover:bg-slate-700">Copy</button>
                    </div>
                    <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto border border-slate-800 shadow-inner">
                        <pre className="text-sm font-mono text-blue-100 leading-relaxed">
                            <code>{post.code}</code>
                        </pre>
                    </div>
                </div>
            </div>

            {/* Card Footer / Voting */}
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                     <VoteControl 
                        postId={post.id}
                        initialScore={post.weightedScore}
                        initialVote={userVotes[post.id] || null}
                        onVote={handleVote}
                        userReputation={MOCK_USER.reputation}
                     />

                     <button className="text-slate-500 text-sm hover:text-blue-600 flex items-center gap-1.5 font-medium transition-colors">
                         <i className="fa-regular fa-comment-dots"></i> 
                         <span className="hidden sm:inline">Discussion</span>
                     </button>
                </div>
                
                <button className="text-slate-400 hover:text-blue-500 transition-colors" title="Share">
                    <i className="fa-solid fa-share-nodes"></i>
                </button>
            </div>
          </div>
        );})}

        {sortedPosts.length === 0 && (
             <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                 <i className="fa-solid fa-ghost text-slate-300 text-4xl mb-3"></i>
                 <p className="text-slate-500">No solutions available (Some might be hidden due to low AI relevance or safety filters)</p>
             </div>
        )}
      </div>
      
      {/* Floating Compare Action Bar */}
      {selectedPostIds.length > 0 && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up w-[90%] max-w-md">
              <div className="bg-slate-900/90 backdrop-blur-md text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center justify-between border border-white/10 ring-1 ring-black/20">
                  <div className="flex items-center gap-4">
                      <div className="bg-blue-600 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-lg shadow-blue-500/30">
                          {selectedPostIds.length}
                      </div>
                      <div className="flex flex-col">
                          <span className="text-sm font-bold text-white">Compare Solutions</span>
                          <span className="text-xs text-slate-400">{selectedPostIds.length === 2 ? "Ready to diff" : "Select one more"}</span>
                      </div>
                  </div>

                  <div className="flex items-center gap-3">
                      {selectedPostIds.length === 2 ? (
                          <button 
                            onClick={() => setIsCompareModalOpen(true)}
                            className="bg-white text-slate-900 text-sm font-bold px-5 py-2 rounded-xl hover:bg-blue-50 transition-colors flex items-center gap-2 shadow-lg"
                          >
                              <i className="fa-solid fa-code-compare text-blue-600"></i> Compare Now
                          </button>
                      ) : (
                          <span className="text-xs font-medium text-slate-500 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">Select 2 items</span>
                      )}
                      
                      <button 
                        onClick={() => setSelectedPostIds([])}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        title="Clear Selection"
                      >
                          <i className="fa-solid fa-xmark"></i>
                      </button>
                  </div>
              </div>
          </div>
      )}

      {selectedPostIds.length === 2 && (
          <CompareSolutionsModal 
            isOpen={isCompareModalOpen}
            onClose={() => setIsCompareModalOpen(false)}
            solutionA={getSelectedPosts()[0]}
            solutionB={getSelectedPosts()[1]}
          />
      )}
    </div>
  )
}
