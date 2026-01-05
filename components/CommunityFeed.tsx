
import React, { useState } from "react";
import { MOCK_COMMUNITY_POSTS, MOCK_USER } from "../data";
import { CommunityPost } from "../types";
import { CompareSolutionsModal } from "./CompareSolutionsModal";
import { MisconceptionAlert } from "./MisconceptionAlert";
import { CreatePostButton } from "./CreatePostButton";
import { VoteControl } from "./VoteControl";
import { VerifiedBadge, PartialBadge, IncorrectBadge } from "./ValidationBadges";
import { ContributorBadge } from "./ContributorBadge";

// Dummy Data for Empty State / Demo
const DUMMY_POSTS: CommunityPost[] = [
  {
    id: "dummy-1",
    topicId: "dp",
    author: {
      name: "Alex Chen",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=AlexChen",
      expertise: "Intermediate", // Rep 1200 ~ Intermediate/Expert
      roles: [],
      badges: [] 
    },
    title: "Why does my Knapsack solution TLE on Case 45?",
    code: "I am using memoization dp[n][w], but for large W it crashes. Should I switch to the 1D array optimization?",
    language: "text", // Custom flag for text content
    aiRelevance: 88,
    weightedScore: 15,
    timestamp: "2h ago"
  },
  {
    id: "dummy-2",
    topicId: "sys-design",
    author: {
      name: "Sarah Miller",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=SarahMiller",
      expertise: "Expert",
      roles: ["Verified Helper"],
      badges: []
    },
    title: "My notes on Consistent Hashing vs. Rendezvous Hashing",
    code: "Visualized the difference for the Interview Prep module. Check out this diagram attached.",
    language: "text",
    aiRelevance: 95,
    weightedScore: 42,
    timestamp: "5h ago",
    validationStatus: "VERIFIED",
    validationReason: "Accurate comparison of hashing strategies."
  },
  {
    id: "dummy-3",
    topicId: "graphs",
    author: {
      name: "David Kim",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=DavidKim",
      expertise: "Intermediate",
      roles: [],
      badges: []
    },
    title: "Dijkstra vs BFS for unweighted graphs?",
    code: "Is there any reason to use Dijkstra if edges have no weights? BFS seems faster O(V+E).",
    language: "text",
    aiRelevance: 60,
    weightedScore: 5,
    timestamp: "1d ago",
    aiWarning: "Misconception: BFS is optimal for unweighted; Dijkstra adds unnecessary overhead."
  },
  {
    id: "dummy-4",
    topicId: "os",
    author: {
      name: "CodeNinja",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=CodeNinja",
      expertise: "Beginner",
      roles: [],
      badges: []
    },
    title: "The Dining Philosophers problem is driving me crazy",
    code: "I keep getting deadlocks in the simulation lab. How do I implement the resource hierarchy solution?",
    language: "text",
    aiRelevance: 75,
    weightedScore: 2,
    timestamp: "1d ago"
  },
  {
    id: "dummy-5",
    topicId: "career",
    author: {
      name: "Admin",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=AdminBot",
      expertise: "Expert",
      roles: ["Admin"],
      badges: []
    },
    title: "Weekly Challenge: Build a Rate Limiter",
    code: "Join us this Sunday for a live system design mock interview session.",
    language: "text",
    aiRelevance: 100,
    weightedScore: 999,
    timestamp: "Pinned"
  }
];

export const CommunityFeed = ({ topicId, algorithmId, topicName }: { topicId?: string; algorithmId?: string; topicName?: string }) => {
  // Logic: If topic filtered results are empty, show Dummy Posts to demonstrate layout.
  const getInitialPosts = () => {
    if (!topicId) return MOCK_COMMUNITY_POSTS;
    
    const filtered = MOCK_COMMUNITY_POSTS.filter(p => p.topicId === topicId);
    if (filtered.length > 0) return filtered;
    
    // Return dummy posts if DB (Mock Data) is empty for this topic
    return DUMMY_POSTS;
  };

  const [posts, setPosts] = useState<CommunityPost[]>(getInitialPosts());
  const [sortMethod, setSortMethod] = useState<"score" | "relevance">("relevance");
  const [userVotes, setUserVotes] = useState<Record<string, "up" | "down" | null>>({});
  
  const [selectedPostIds, setSelectedPostIds] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  const handleVote = (postId: string, newVote: "up" | "down" | null) => {
    setPosts(currentPosts => currentPosts.map(post => {
      if (post.id !== postId) return post;
      const previousVote = userVotes[postId] || null;
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
        setSelectedPostIds(prev => [prev[1], postId]);
      }
    }
  };

  const handleDismissMisconception = (postId: string) => {
    setPosts(currentPosts => currentPosts.map(post => {
        if (post.id !== postId) return post;
        return { ...post, hasMisconception: false };
    }));
  };

  const filteredPosts = posts.filter(p => {
      if (p.aiRelevance < 40) return false;
      if (p.shadowBanned) {
          return p.author.name === MOCK_USER.displayName;
      }
      return true;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    // Pinned posts always at top
    if (a.author.name === "Admin" && b.author.name !== "Admin") return -1;
    if (b.author.name === "Admin" && a.author.name !== "Admin") return 1;

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
          const isPinned = post.author.name === "Admin";

          let cardClasses = `bg-white rounded-2xl border shadow-sm overflow-hidden transition-all duration-300 relative`;
          
          if (isSelected) {
            cardClasses += ' border-blue-500 ring-2 ring-blue-100 shadow-lg z-10';
          } else if (isPinned) {
            // Gold Pinned Style
            cardClasses += ' border-amber-300 ring-1 ring-amber-100 shadow-md bg-gradient-to-br from-white to-amber-50/30';
          } else if (isHighRelevance) {
            cardClasses += ' border-emerald-200 ring-1 ring-emerald-50/50 shadow-md'; 
          } else {
             cardClasses += ' border-slate-200 hover:border-blue-200 hover:shadow-md';
          }

          if (isLowRelevance && !isPinned) {
            cardClasses += ' opacity-75';
          }
          
          const isShadowBannedVisible = post.shadowBanned && isAuthor;

          return (
          <div key={post.id} className={cardClasses}>
            {isShadowBannedVisible && (
                <div className="bg-red-50 text-red-600 text-[10px] font-bold text-center py-1 border-b border-red-100 uppercase tracking-wide">
                    <i className="fa-solid fa-eye-slash mr-1"></i> Shadow Banned (Visible only to you)
                </div>
            )}
            
            {isPinned && (
                <div className="bg-amber-100 text-amber-700 text-[10px] font-bold text-center py-1 border-b border-amber-200 uppercase tracking-wider flex items-center justify-center gap-2">
                    <i className="fa-solid fa-thumbtack"></i> Pinned by Moderators
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
                       </div>
                       <p className="text-xs text-slate-500">{post.timestamp}</p>
                   </div>
               </div>
               
               <div className="flex items-center gap-2">
                   {post.validationStatus === 'VERIFIED' && <VerifiedBadge reason={post.validationReason} />}
                   {post.validationStatus === 'PARTIAL' && <PartialBadge reason={post.validationReason} />}
                   {post.validationStatus === 'INCORRECT' && <IncorrectBadge reason={post.validationReason} />}

                   {!isPinned && (
                       <div className={`hidden sm:flex flex-shrink-0 items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold shadow-sm ${
                           post.aiRelevance >= 80 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : 
                           post.aiRelevance >= 50 ? "bg-yellow-50 text-yellow-700 border-yellow-200" : 
                           "bg-red-50 text-red-700 border-red-200"
                       }`}>
                           <i className={`fa-solid ${post.aiRelevance >= 80 ? 'fa-check-circle' : 'fa-triangle-exclamation'}`}></i>
                           <span>AI Match: {post.aiRelevance}%</span>
                       </div>
                   )}
               </div>
            </div>

            {/* Card Body */}
            <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                    <h4 className="text-lg font-bold text-slate-800">{post.title}</h4>
                </div>

                {/* Misconception Alert */}
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

                {/* Content Rendering: Text vs Code */}
                {post.language === 'text' ? (
                     <div className="text-slate-700 text-sm leading-relaxed mb-2 whitespace-pre-wrap font-medium">
                         {post.code}
                     </div>
                ) : (
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
                )}
            </div>

            {/* Card Footer */}
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
                 <p className="text-slate-500">No solutions available.</p>
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
