
import React, { useState } from "react";
import { TopicCard } from "../components/TopicCard";
import { MOCK_TOPICS } from "../data";
import { Topic } from "../types";

export const Topics = ({ onTopicClick }: { onTopicClick: (topic: Topic) => void }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTopics = MOCK_TOPICS.filter(t => 
    t.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 lg:p-12 overflow-y-auto h-[calc(100vh-80px)]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Complete Curriculum</h1>
                <p className="text-slate-500">Master Data Structures & Algorithms one topic at a time.</p>
            </div>
            <div className="relative w-full md:w-64">
                <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                <input 
                    type="text" 
                    placeholder="Filter topics..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm focus:shadow-md"
                />
            </div>
        </div>

        {filteredTopics.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTopics.map((topic) => (
                <TopicCard key={topic.id} topic={topic} onClick={() => onTopicClick(topic)} />
            ))}
            </div>
        ) : (
            <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300 shadow-sm border border-slate-100">
                    <i className="fa-solid fa-search"></i>
                </div>
                <h3 className="text-slate-900 font-bold mb-1">No topics found</h3>
                <p className="text-slate-500 text-sm">Try searching for broad categories like "Trees" or "Graphs"</p>
            </div>
        )}
      </div>
    </div>
  );
};
