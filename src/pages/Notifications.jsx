import React, { useEffect, useState } from "react";
import { useSocket } from "../authContext/SocketContext";
import { Bell, Heart, MessageCircle, Reply, Sparkles, CheckCheck, UserPlus } from "lucide-react";
import { followUser } from "../api/auth";
import { useAuth } from "../authContext/UserContext";
import { toast } from "react-toastify";
import API_URL, { getHeaders } from "../config";

function timeSince(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);

  const intervals = [
    { label: "y", seconds: 31536000 },
    { label: "mo", seconds: 2592000 },
    { label: "d", seconds: 86400 },
    { label: "h", seconds: 3600 },
    { label: "m", seconds: 60 },
    { label: "s", seconds: 1 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) return `${count}${interval.label}`;
  }

  return "just now";
}

function Notifications({ onRead }) {
  const [notifications, setNotifications] = useState([]);
  const { fetchUnreadCount } = useSocket();
  const { user, setUser } = useAuth();

  useEffect(() => {
    fetchNotifications();
    markAllAsRead();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_URL}/notifications`, {
        headers: getHeaders(),
        credentials: "include",
      });
      const data = await res.json();
      setNotifications(data);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch(`${API_URL}/notifications/read-all`, {
        method: "POST",
        headers: getHeaders(),
        credentials: "include",
      });

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      fetchUnreadCount();
      if (onRead) onRead();
    } catch (error) {
      console.error("Failed to mark notifications as read:", error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "like":
        return <Heart size={16} className="text-pink-500 fill-pink-500" />;
      case "comment":
        return <MessageCircle size={16} className="text-primary fill-primary" />;
      case "reply":
        return <Reply size={16} className="text-purple-500" />;
      case "follow":
        return <UserPlus size={16} className="text-green-500" />;
      default:
        return <Bell size={16} className="text-gray-400" />;
    }
  };

  const getNotificationText = (notification) => {
    switch (notification.type) {
      case "like":
        return "liked your post";
      case "comment":
        return "commented on your post";
      case "reply":
        return "replied to your comment";
      case "follow":
        return "followed you";
      default:
        return "interacted with your content";
    }
  };

  return (
    <div className="bg-[#F8F9FD] min-h-screen">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100/50 shadow-sm transition-all duration-300">
        <div className="max-w-xl mx-auto flex items-center px-6 py-5 justify-between">
           <h1 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
             Notifications <Bell size={18} className="text-primary" />
           </h1>
           <button
             className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/10 px-4 py-2 rounded-xl transition-all active:scale-95"
             onClick={markAllAsRead}
           >
             <CheckCheck size={14} />
             Clear All
           </button>
        </div>
      </div>

      <div className="max-w-xl mx-auto p-4 md:p-6 space-y-4">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[40px] shadow-sm border-2 border-dashed border-gray-100">
             <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Sparkles size={32} className="text-gray-200" />
             </div>
             <p className="text-lg font-black text-gray-300 italic tracking-tight">All quiet here</p>
             <p className="text-xs text-gray-400 font-medium">No new notifications yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`
                  group relative flex items-start gap-4 p-5 rounded-[28px] transition-all duration-300
                  ${!notification.read 
                    ? "bg-white shadow-xl shadow-gray-200/50 border border-primary/5" 
                    : "bg-white/60 hover:bg-white hover:shadow-lg hover:shadow-gray-200/30"}
                `}
              >
                {/* Avatar with Icon Badge */}
                <div className="relative shrink-0">
                  <img
                    src={notification?.sender?.avatar || "/avatar.png"}
                    alt="avatar"
                    className="w-12 h-12 rounded-2xl object-cover shadow-sm bg-gray-100"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-lg shadow-md border border-gray-50">
                    {getNotificationIcon(notification.type)}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[14px] text-gray-800 leading-snug">
                      <span className="font-black text-gray-900">
                        {notification?.sender?.name}
                      </span>{" "}
                      <span className="font-medium text-gray-500">
                        {getNotificationText(notification)}
                      </span>
                    </p>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter shrink-0 pt-0.5">
                        {timeSince(notification.createdAt)}
                    </span>
                  </div>

                  {/* Preview Content */}
                  {(notification?.comment?.text || notification?.reply?.text || notification?.post?.text) && (
                    <div className="mt-2 bg-gray-50/80 p-3 rounded-2xl border border-gray-50 group-hover:bg-white transition-colors duration-300">
                        <p className="text-xs text-gray-600 font-medium line-clamp-2 italic leading-relaxed">
                        "{notification.comment?.text || notification.reply?.text || notification.post?.text}"
                        </p>
                    </div>
                  )}

                  {notification.type === "follow" && !user?.following?.some(f => (f._id || f) === notification.sender._id) && (
                    <button 
                      onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          const data = await followUser(notification.sender._id);
                          toast.success(`You are now following ${notification.sender.name}`);
                          // Sync global state
                          if (data.following) {
                            setUser(prev => ({ ...prev, following: data.following }));
                          }
                        } catch (err) {
                          toast.error(err.message);
                        }
                      }}
                      className="mt-3 px-4 py-1.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95 text-center"
                    >
                      Follow Back
                    </button>
                  )}
                </div>

                {!notification.read && (
                  <div className="absolute top-5 right-5 w-2 h-2 bg-primary rounded-full shadow-[0_0_10px_rgba(29,155,240,0.8)]" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="h-20" /> {/* Bottom spacing */}
    </div>
  );
}

export default Notifications;
