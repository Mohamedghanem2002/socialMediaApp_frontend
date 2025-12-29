import React, { useState, useEffect } from "react";
import { Search, UserPlus, Sparkles, TrendingUp, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { followUser } from "../api/auth";
import { toast } from "react-toastify";
import { useAuth } from "../authContext/UserContext";

function Explore() {
  const { user: currentUser, setUser } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const res = await fetch("https://social-media-app-backend-mu.vercel.app/users/suggestions/users", {
        credentials: "include",
      });
      const data = await res.json();
      setSuggestions(data);
    } catch (error) {
      console.error("Failed to fetch suggestions");
    }
  };

  const handleSearch = async (val) => {
    setQuery(val);
    if (val.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`https://social-media-app-backend-mu.vercel.app/users/search/users?q=${val}`, {
        credentials: "include",
      });
      const data = await res.json();
      setResults(data);
    } catch (error) {
      console.error("Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId, name) => {
    try {
      const data = await followUser(userId);
      toast.success(data.isFollowing ? `Following ${name}` : `Unfollowed ${name}`);
      
      // Sync global context
      if (data.following) {
        setUser(prev => ({ ...prev, following: data.following }));
      }

      // Sync local results to avoid delayed UI
      setResults(prev => prev.map(u => u._id === userId ? {
        ...u, 
        followers: data.isFollowing 
          ? [...(u.followers || []), currentUser._id] 
          : (u.followers || []).filter(id => (id._id || id) !== currentUser._id)
      } : u));
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="bg-[#F8F9FD] min-h-screen">
      {/* Search Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100/50 px-6 py-4">
        <div className="max-w-xl mx-auto relative group">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <Search size={20} className="text-gray-400 group-focus-within:text-primary transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search users or topics..."
            className="w-full bg-gray-50 border-none rounded-[20px] md:rounded-[28px] py-3 md:py-4 pl-12 md:pl-14 pr-4 md:pr-6 text-xs md:text-sm font-bold focus:ring-4 focus:ring-primary/10 transition-all outline-none placeholder:text-gray-300 shadow-inner"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="max-w-xl mx-auto p-4 md:p-6 space-y-8">
        {/* Search Results */}
        {query.length >= 2 && (
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4 flex items-center gap-2">
              Results for "{query}" <Sparkles size={14} className="text-yellow-500 fill-yellow-500" />
            </h3>
            <div className="bg-white rounded-[40px] shadow-xl shadow-gray-200/50 overflow-hidden divide-y divide-gray-50">
              {loading ? (
                <div className="p-10 flex justify-center">
                  <div className="w-8 h-8 border-t-primary border-2 border-gray-200 rounded-full animate-spin" />
                </div>
              ) : results.length > 0 ? (
                results.map((u) => (
                  <div key={u._id} className="p-4 md:p-5 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                    <Link to={`/user/${u._id}`} className="flex items-center gap-3 md:gap-4">
                      <img src={u.avatar || "/avatar.png"} className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl object-cover shadow-sm" alt={u.name} />
                      <div>
                        <p className="font-black text-gray-900 tracking-tight leading-none text-xs md:text-base">{u.name}</p>
                        <p className="text-[9px] md:text-[11px] font-bold text-gray-400 mt-1 uppercase tracking-tighter">@{u.email.split("@")[0]}</p>
                      </div>
                    </Link>
                      <button
                        onClick={() => handleFollow(u._id, u.name)}
                        className={`px-4 md:px-6 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${
                          currentUser?.following?.some(f => (f._id || f) === u._id)
                            ? "bg-gray-100 text-gray-900 border border-gray-200"
                            : "bg-gray-900 text-white shadow-lg shadow-gray-200"
                        }`}
                      >
                        {currentUser?.following?.some(f => (f._id || f) === u._id) ? "Following" : "Follow"}
                      </button>
                  </div>
                ))
              ) : (
                <p className="p-10 text-center text-gray-400 font-bold italic tracking-tight">No users found matching "{query}"</p>
              )}
            </div>
          </div>
        )}

        {/* Explore Categories */}
        <div className="grid grid-cols-2 gap-4">
           <div className="bg-gradient-to-br from-primary/10 to-blue-50/50 p-6 rounded-[32px] border border-primary/5 group cursor-pointer hover:shadow-xl transition-all">
                <TrendingUp size={24} className="text-primary mb-3" />
                <h4 className="font-black text-gray-900 tracking-tight">Trending</h4>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">What's hot right now</p>
           </div>
           <div className="bg-gradient-to-br from-purple-50 to-pink-50/30 p-6 rounded-[32px] border border-purple-100/50 group cursor-pointer hover:shadow-xl transition-all">
                <Users size={24} className="text-purple-500 mb-3" />
                <h4 className="font-black text-gray-900 tracking-tight">Communities</h4>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Find your tribe</p>
           </div>
        </div>

        {/* Suggestions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-4">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              Who to follow <Sparkles size={14} className="text-yellow-500 fill-yellow-500" />
            </h3>
            <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Show more</button>
          </div>
          
          <div className="bg-white rounded-[40px] shadow-xl shadow-gray-200/50 overflow-hidden divide-y divide-gray-50">
            {suggestions.map((u) => (
              <div key={u._id} className="p-4 md:p-5 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                <Link to={`/user/${u._id}`} className="flex items-center gap-3 md:gap-4">
                  <img src={u.avatar || "/avatar.png"} className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl object-cover shadow-sm" alt={u.name} />
                  <div>
                    <p className="font-black text-gray-900 tracking-tight leading-none text-xs md:text-base">{u.name}</p>
                    <p className="text-[9px] md:text-[11px] font-bold text-gray-400 mt-1 uppercase tracking-tighter">@{u.email.split("@")[0]}</p>
                  </div>
                </Link>
                <button 
                   onClick={() => handleFollow(u._id, u.name)}
                   className={`px-4 md:px-6 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${
                     currentUser?.following?.some(f => (f._id || f) === u._id)
                       ? "bg-gray-100 text-gray-900 border border-gray-200"
                       : "bg-gray-900 text-white shadow-lg shadow-gray-200"
                   }`}
                >
                  {currentUser?.following?.some(f => (f._id || f) === u._id) ? "Following" : "Follow"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Explore;
