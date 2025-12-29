import React from "react";
import { useState } from "react";
import { useAuth } from "../authContext/UserContext";
import WhatesHappening from "../components/WhatesHappening";
import PostFeeds from "../components/PostFeeds";
import { Sparkles } from "lucide-react";

function Home() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("foryou");
  const [refreshFeed, setRefreshFeed] = useState(0);

  const handlePostCreated = () => {
    setRefreshFeed((prev) => prev + 1);
  };

  return (
    <div className="bg-[#F8F9FD] min-h-screen">
      {/* Sticky Premium Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100/50 shadow-sm transition-all duration-300">
        <div className="flex items-center px-4 md:px-6 py-2 md:py-4 justify-between">
           <h1 className="text-lg md:text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
             Home <Sparkles size={16} className="text-yellow-500 fill-yellow-500 md:w-[18px] md:h-[18px]" />
           </h1>
        </div>
        
        <div className="flex items-center">
            <button
            className={`relative flex-1 text-center py-3 md:py-4 text-xs md:text-sm font-bold transition-all duration-300 overflow-hidden ${
                activeTab === "foryou"
                ? "text-primary"
                : "text-gray-400 hover:text-gray-600 hover:bg-gray-50/50"
            }`}
            onClick={() => setActiveTab("foryou")}
            >
            <span className="relative z-10">For you</span>
            {activeTab === "foryou" && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 md:w-12 h-1 bg-primary rounded-t-full shadow-[0_-4px_10px_rgba(29,155,240,0.5)]" />
            )}
            </button>
            <button
            className={`relative flex-1 text-center py-3 md:py-4 text-xs md:text-sm font-bold transition-all duration-300 overflow-hidden ${
                activeTab === "following"
                ? "text-primary"
                : "text-gray-400 hover:text-gray-600 hover:bg-gray-50/50"
            }`}
            onClick={() => setActiveTab("following")}
            >
            <span className="relative z-10">Following</span>
            {activeTab === "following" && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 md:w-12 h-1 bg-primary rounded-t-full shadow-[0_-4px_10px_rgba(29,155,240,0.5)]" />
            )}
            </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        <WhatesHappening user={user} onPostCreated={handlePostCreated} />
        <div className="flex items-center justify-center py-2">
            <div className="h-[1px] bg-gray-100 flex-1 ml-6" />
            <span className="px-4 text-[10px] font-black text-gray-300 uppercase tracking-widest">Latest Updates</span>
            <div className="h-[1px] bg-gray-100 flex-1 mr-6" />
        </div>
        <PostFeeds refreshTrigger={refreshFeed} activeTab={activeTab} />
      </div>
    </div>
  );
}

export default Home;
