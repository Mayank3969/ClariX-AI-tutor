
import React, { useState, useRef, useEffect } from "react";
import { Notification } from "../types";

interface NotificationCenterProps {
  onNotificationClick: (notification: Notification) => void;
}

// Mock initial notifications
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    type: "weakness_alert",
    message: "You consistently hit TLE on Graph problems. Review BFS optimizations.",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    targetTopic: "Graphs",
    actionLabel: "Fix Weakness"
  },
  {
    id: "n2",
    type: "info",
    message: "New daily challenge available: 'Reverse Linked List II'.",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
  },
  {
    id: "n3",
    type: "success",
    message: "You reached a 5-day streak! Keep it up.",
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
  },
  {
    id: "n4",
    type: "weakness_alert",
    message: "Edge case failure detected in Dynamic Programming. Check initialization values.",
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    targetTopic: "Dynamic Programming",
    actionLabel: "Review Topic"
  }
];

export const NotificationCenter = ({ onNotificationClick }: NotificationCenterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const containerRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleClick = (notification: Notification) => {
    handleMarkAsRead(notification.id);
    setIsOpen(false);
    onNotificationClick(notification);
  };

  const getTimeAgo = (dateStr: string) => {
    const minutes = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="relative" ref={containerRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-blue-600"
      >
        <i className="fa-regular fa-bell text-lg"></i>
        {unreadCount > 0 && (
          <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></div>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-80 md:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-fade-in-up origin-top-right">
          <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-800 text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllRead}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                <i className="fa-regular fa-bell-slash text-2xl mb-2 block"></i>
                No notifications
              </div>
            ) : (
              <ul>
                {notifications.map((notification) => {
                  const isAlert = notification.type === "weakness_alert";
                  return (
                    <li 
                      key={notification.id} 
                      className={`p-4 border-b border-slate-50 last:border-0 transition-colors ${
                        !notification.read ? 'bg-blue-50/30' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex gap-3 items-start">
                        {/* Icon */}
                        <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isAlert 
                            ? "bg-orange-100 text-orange-600" 
                            : notification.type === "success" 
                              ? "bg-green-100 text-green-600"
                              : "bg-blue-100 text-blue-600"
                        }`}>
                          <i className={`fa-solid ${
                            isAlert 
                              ? "fa-triangle-exclamation" 
                              : notification.type === "success"
                                ? "fa-trophy"
                                : "fa-circle-info"
                          } text-xs`}></i>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm mb-1 leading-snug ${!notification.read ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>
                            {notification.message}
                          </p>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-400">{getTimeAgo(notification.createdAt)}</span>
                            
                            {/* Interactive Action for Weakness Alerts */}
                            {isAlert && notification.targetTopic && (
                              <button 
                                onClick={() => handleClick(notification)}
                                className="text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-2 py-1 rounded transition-colors flex items-center gap-1"
                              >
                                {notification.actionLabel || "Fix Now"} <i className="fa-solid fa-arrow-right"></i>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
