
import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { Dashboard } from "./views/Dashboard";
import { Login } from "./views/Login";
import { AlgorithmPage } from "./views/AlgorithmPage";
import { TopicOverview } from "./views/TopicOverview";
import { Topics } from "./views/Topics";
import { LeetCodeSync } from "./components/LeetCodeSync";
import { Profile } from "./views/Profile";
import { PracticeSession } from "./views/PracticeSession";
import { MockInterview } from "./views/MockInterview";
import { MockInterviewSession } from "./views/MockInterviewSession";
import { AdminDashboard } from "./views/AdminDashboard";
import { SystemArchitecture } from "./views/SystemArchitecture";
import { MOCK_USER, MOCK_TOPICS, MOCK_TOPIC_OVERVIEW } from "./data";
import { View, Topic, LeetCodeStats, SubAlgorithm, Notification } from "./types";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setView] = useState<View>("Dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<Topic>(MOCK_TOPICS[0]);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<SubAlgorithm | null>(null);
  const [leetcodeStats, setLeetcodeStats] = useState<LeetCodeStats | null>(null);
  const [aiContextMessage, setAiContextMessage] = useState<string | undefined>(undefined);

  const navigateToTopicOverview = (topic: Topic) => {
      setSelectedTopic(topic);
      setView("TopicOverview"); 
  };

  const navigateToAlgorithm = (algorithm: SubAlgorithm) => {
      setSelectedAlgorithm(algorithm);
      // Construct a temporary Topic object for the AlgorithmPage based on the sub-algo
      const algorithmAsTopic: Topic = {
          id: algorithm.id,
          title: algorithm.title,
          status: algorithm.status === "Completed" ? "Mastered" : "In Progress",
          progress: 0, 
          total: 1,
          icon: selectedTopic.icon
      };
      setSelectedTopic(algorithmAsTopic);
      setView("AlgorithmPage");
  };

  const handlePracticeRemediation = (topicName: string, message: string) => {
      const topic = MOCK_TOPICS.find(t => t.title === topicName) || MOCK_TOPICS[0];
      setSelectedTopic(topic);
      setAiContextMessage(message);
      
      const mockAlgo: SubAlgorithm = { 
          id: "remedial-1", 
          title: `${topicName} Fundamentals`, 
          difficulty: "Easy", 
          timeComplexity: "N/A", 
          spaceComplexity: "N/A", 
          status: "Available" 
      };
      
      setSelectedAlgorithm(mockAlgo);
      
      const algorithmAsTopic: Topic = {
          id: mockAlgo.id,
          title: topicName, 
          status: "In Progress",
          progress: 0, 
          total: 1,
          icon: topic.icon
      };
      setSelectedTopic(algorithmAsTopic);
      setView("AlgorithmPage");
  };

  const handleNotificationClick = (notification: Notification) => {
    if (notification.targetTopic) {
      const topic = MOCK_TOPICS.find(t => t.title.toLowerCase() === notification.targetTopic?.toLowerCase()) || 
                    MOCK_TOPICS.find(t => notification.targetTopic?.toLowerCase().includes(t.title.toLowerCase()));
      
      if (topic) {
        setSelectedTopic(topic);
        setView("TopicOverview");
      }
    }
  };

  const handleSyncComplete = (stats: LeetCodeStats) => {
    setLeetcodeStats(stats);
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const renderContent = () => {
    if (currentView === "AdminDashboard" || currentView === "SystemArchitecture") {
       if (!MOCK_USER.roles?.includes("admin")) {
           return (
               <div className="flex items-center justify-center h-full text-slate-500">
                   <div className="text-center">
                       <i className="fa-solid fa-lock text-4xl mb-4"></i>
                       <h2 className="text-xl font-bold">Access Denied</h2>
                       <p>You do not have permission to view this page.</p>
                       <button onClick={() => setView("Dashboard")} className="mt-4 text-blue-600 underline">Return to Dashboard</button>
                   </div>
               </div>
           );
       }
       return currentView === "AdminDashboard" ? <AdminDashboard /> : <SystemArchitecture />;
    }

    switch (currentView) {
      case "Dashboard":
        return <Dashboard onTopicClick={navigateToTopicOverview} />;
      case "Topics":
        return <Topics onTopicClick={navigateToTopicOverview} />;
      case "TopicOverview":
        return (
            <TopicOverview 
                data={MOCK_TOPIC_OVERVIEW} 
                onAlgorithmClick={navigateToAlgorithm}
                onBack={() => setView("Dashboard")}
            />
        );
      case "AlgorithmPage":
        return (
            <AlgorithmPage 
                topic={selectedTopic} 
                stats={leetcodeStats} 
                userProfile={MOCK_USER} 
                key={selectedTopic.id + (aiContextMessage || "")} 
                initialAiContext={aiContextMessage}
            />
        );
      case "LeetCode Sync":
        return <LeetCodeSync onSync={handleSyncComplete} existingStats={leetcodeStats} />;
      case "Profile":
        return <Profile stats={leetcodeStats} onSync={handleSyncComplete} />;
      case "PracticeSession":
        return (
            <PracticeSession 
                onRemediation={handlePracticeRemediation}
                onSuccess={() => alert("Congratulations! You've unlocked Hard mode questions.")}
            />
        );
      case "MockInterview":
        return <MockInterview onStart={() => setView("MockInterviewSession")} />;
      case "MockInterviewSession":
        return <MockInterviewSession />;
      default:
        return (
            <div className="p-12 text-center text-slate-500">
                <i className="fa-solid fa-person-digging text-4xl mb-4"></i>
                <h2 className="text-xl font-bold">Work in Progress</h2>
                <p>The {currentView} view is coming soon.</p>
                <button 
                    onClick={() => setView("Dashboard")}
                    className="mt-4 text-blue-600 hover:underline"
                >
                    Return to Dashboard
                </button>
            </div>
        );
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  if (currentView === "MockInterviewSession") {
      return (
          <div className="bg-[#0f172a] min-h-screen font-sans text-slate-200">
              {renderContent()}
          </div>
      );
  }

  return (
    <div className="flex bg-slate-50 min-h-screen font-sans">
      <Sidebar
        currentView={currentView}
        setView={setView}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        user={MOCK_USER}
      />
      
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <Header 
          user={MOCK_USER} 
          sidebarCollapsed={sidebarCollapsed} 
          onNotificationClick={handleNotificationClick}
        />
        <main>
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
