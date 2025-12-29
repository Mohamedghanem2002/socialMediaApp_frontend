import React, { useState, useEffect, useRef } from "react";
import { useSocket } from "../authContext/SocketContext";
import { useAuth } from "../authContext/UserContext";
import { 
  Send, 
  User as UserIcon, 
  Mail, 
  Search, 
  MoreVertical, 
  Phone, 
  Video, 
  StickyNote, 
  Paperclip, 
  Smile,
  ChevronLeft
} from "lucide-react";
import { useLocation } from "react-router-dom";

export default function Messages() {
  const { user } = useAuth();
  const { socket, userChannel, unreadMessageCount, setUnreadMessageCount } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    if (location.state?.startWithUser) {
      const newUser = location.state.startWithUser;
      setSelectedUser(newUser);
    }
  }, [location.state]);

  useEffect(() => {
    fetchConversations();

    if (userChannel) {
      const handleNewMessage = (message) => {
        if (
          selectedUser &&
          (message.sender === selectedUser._id ||
            message.recipient === selectedUser._id)
        ) {
          setMessages((prev) => [...prev, message]);
        }
        fetchConversations();
      };

      userChannel.bind("newMessage", handleNewMessage);
      userChannel.bind("message:new", handleNewMessage);

      return () => {
        userChannel.unbind("newMessage", handleNewMessage);
        userChannel.unbind("message:new", handleNewMessage);
      };
    }
  }, [userChannel, selectedUser]);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser._id);
      markAsRead(selectedUser._id);
    }
  }, [selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const res = await fetch("https://social-media-app-backend-mu.vercel.app/messages/conversations", {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setConversations(data);
        if (
          location.state?.startWithUser &&
          !data.find((u) => u._id === location.state.startWithUser._id)
        ) {
          setConversations((prev) => [location.state.startWithUser, ...prev]);
        }
      } else {
        setConversations([]);
      }
    } catch (error) {
      console.error("Failed to load conversations", error);
      setConversations([]);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const res = await fetch(`https://social-media-app-backend-mu.vercel.app/messages/${userId}`, {
        credentials: "include",
      });
      const data = await res.json();
      setMessages(data);
    } catch (error) {
      console.error("Failed to load messages", error);
    }
  };

  const markAsRead = async (userId) => {
    try {
      const conv = conversations.find((c) => c._id === userId);
      if (!conv || conv.unreadCount === 0) return;

      const res = await fetch(`https://social-media-app-backend-mu.vercel.app/messages/read/${userId}`, {
        method: "PUT",
        credentials: "include",
      });
      if (res.ok) {
        setUnreadMessageCount((prev) => Math.max(0, prev - conv.unreadCount));
        setConversations((prev) =>
          prev.map((c) => (c._id === userId ? { ...c, unreadCount: 0 } : c))
        );
      }
    } catch (error) {
      console.error("Failed to mark messages as read", error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() || !selectedUser) return;

    try {
      const res = await fetch(
        `https://social-media-app-backend-mu.vercel.app/messages/send/${selectedUser._id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
          credentials: "include",
        }
      );
      const data = await res.json();
      setMessages((prev) => [...prev, data]);
      setText("");
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const filteredConversations = conversations.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-64px)] md:h-screen flex bg-[#F8F9FD] overflow-hidden lg:pr-4 lg:py-4 gap-4 md:px-4 w-full max-w-full overflow-x-hidden">
      {/* Sidebar Container */}
      <div className={`w-full md:w-[380px] lg:w-[420px] min-w-0 bg-white md:bg-white/70 md:backdrop-blur-xl md:rounded-3xl md:shadow-2xl flex flex-col border-r md:border-none overflow-hidden transition-all duration-300 ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
        {/* Sidebar Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Messages</h2>
            <div className="p-2 bg-gray-100 rounded-full cursor-pointer hover:bg-gray-200 transition-colors">
              <StickyNote size={20} className="text-gray-600" />
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search conversations..."
              className="w-full bg-gray-100 border-none rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto px-2 pb-4 scrollbar-hide">
          <div className="px-4 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Recent Chats</div>
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm italic">No conversations found</div>
          ) : (
            filteredConversations.map((c) => (
              <div
                key={c._id}
                onClick={() => setSelectedUser(c)}
                className={`group p-4 mb-1 rounded-2xl flex items-center gap-4 cursor-pointer transition-all duration-200 ${
                  selectedUser?._id === c._id 
                    ? "bg-primary shadow-lg shadow-primary/30" 
                    : "hover:bg-gray-100/80 active:scale-[0.98]"
                }`}
              >
                <div className="relative">
                  <img
                    src={c.avatar || "/avatar.png"}
                    alt={c.name}
                    className="w-14 h-14 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-4 border-white md:border-white/70 rounded-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className={`font-bold truncate ${selectedUser?._id === c._id ? "text-white" : "text-gray-900"}`}>{c.name}</p>
                    <span className={`text-[10px] ${selectedUser?._id === c._id ? "text-blue-100" : "text-gray-400"}`}>12:45 PM</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className={`text-sm truncate ${selectedUser?._id === c._id ? "text-blue-50" : "text-gray-500"}`}>
                      {c.unreadCount > 0 ? "Sent you a message" : "Click to view chat"}
                    </p>
                    {c.unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                        {c.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className={`flex-1 min-w-0 flex flex-col bg-white md:rounded-3xl md:shadow-2xl overflow-hidden relative ${!selectedUser ? 'hidden md:flex' : 'flex'}`}>
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="px-4 md:px-6 py-4 border-b border-gray-100 bg-white/80 backdrop-blur-md flex items-center justify-between z-10">
              <div className="flex flex-1 items-center gap-3 md:gap-4 min-w-0">
                <button className="md:hidden p-2 -ml-2 text-gray-600 active:scale-90 transition-transform flex-shrink-0" onClick={() => setSelectedUser(null)}>
                  <ChevronLeft size={24} />
                </button>
                <div className="relative flex-shrink-0">
                  <img
                    src={selectedUser.avatar || "/avatar.png"}
                    alt={selectedUser.name}
                    className="w-10 h-10 md:w-11 md:h-11 rounded-2xl object-cover shadow-sm"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-black text-gray-900 leading-none truncate">{selectedUser.name}</h3>
                  <span className="text-[11px] font-bold text-green-500 uppercase tracking-tighter block mt-0.5 truncate">Online Now</span>
                </div>
              </div>
              <div className="flex items-center gap-1 md:gap-3 ml-2 flex-shrink-0">
                <button className="p-2.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all">
                  <Phone size={20} />
                </button>
                <button className="p-2.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all">
                  <Video size={20} />
                </button>
                <div className="w-[1px] h-6 bg-gray-100 mx-1" />
                <button className="p-2.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all">
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-[#FAFBFD] custom-scrollbar overflow-x-hidden">
              <div className="flex justify-center my-4">
                <span className="bg-gray-200/50 text-gray-500 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Today</span>
              </div>
              
              {messages.map((msg, index) => {
                const isMe = msg.sender === user?._id;
                const showAvatar = index === 0 || messages[index-1].sender !== msg.sender;
                
                return (
                  <div
                    key={msg._id}
                    className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    {!isMe && showAvatar && (
                       <img
                        src={selectedUser.avatar || "/avatar.png"}
                        className="w-7 h-7 rounded-lg object-cover mb-1 shadow-sm"
                        alt=""
                      />
                    )}
                    {!isMe && !showAvatar && <div className="w-7" />}
                    
                    <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[75%] md:max-w-[65%] min-w-0 flex-shrink`}>
                      <div
                        className={`px-4 py-3 shadow-sm break-all overflow-hidden ${
                          isMe
                            ? "bg-gradient-to-tr from-primary to-blue-400 text-white rounded-2xl rounded-br-none"
                            : "bg-white text-gray-800 rounded-2xl rounded-bl-none border border-gray-100"
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-all">{msg.text}</p>
                      </div>
                      <span className="text-[9px] font-bold text-gray-400 mt-1.5 mx-1 uppercase">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Area */}
            <div className="p-4 md:p-6 bg-white border-t border-gray-100">
              <form
                onSubmit={handleSendMessage}
                className="flex items-center gap-3 bg-gray-50 p-2 rounded-2xl border border-gray-100 focus-within:border-primary/30 focus-within:ring-4 focus-within:ring-primary/5 transition-all"
              >
                <div className="flex items-center pl-2 gap-1">
                  <button type="button" className="p-2 text-gray-400 hover:text-primary transition-colors hover:bg-white rounded-lg shadow-none hover:shadow-sm">
                    <Smile size={20} />
                  </button>
                  <button type="button" className="p-2 text-gray-400 hover:text-primary transition-colors hover:bg-white rounded-lg shadow-none hover:shadow-sm">
                    <Paperclip size={20} />
                  </button>
                </div>
                
                <input
                  type="text"
                  placeholder="Ask something or write a message..."
                  className="flex-1 bg-transparent border-none py-3 px-2 outline-none text-sm placeholder:text-gray-400"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(e)}
                />

                <button
                  type="submit"
                  className={`p-3 rounded-xl transition-all flex items-center justify-center ${
                    text.trim() 
                      ? "bg-primary text-white shadow-lg shadow-primary/30 scale-100 active:scale-90" 
                      : "bg-gray-200 text-gray-400 scale-95 opacity-50 cursor-not-allowed"
                  }`}
                  disabled={!text.trim()}
                >
                  <Send size={18} fill={text.trim() ? "currentColor" : "none"} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-gradient-to-b from-white to-[#F8F9FD]">
            <div className="relative mb-8">
              <div className="w-32 h-32 bg-primary/5 rounded-[40px] flex items-center justify-center animate-pulse">
                <Mail size={56} className="text-primary opacity-20" />
              </div>
              <div className="absolute -top-2 -right-2 w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center animate-bounce">
                <Smile size={24} className="text-yellow-500" />
              </div>
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">Your Inbox is Ready</h3>
            <p className="text-gray-500 max-w-xs leading-relaxed">
              Select one of your contacts from the sidebar to start a new premium conversation flow.
            </p>
            <button className="mt-8 px-8 py-3 bg-white border border-gray-100 text-gray-900 font-bold rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-sm active:scale-95">
              Create New Broadcast
            </button>
          </div>
        )}
      </div>

      {/* Injecting CSS for custom items */}
      <style dangerouslySetInnerHTML={{ __html: `
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }
        
        .animate-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}
