import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { followUser } from "../api/auth";
import { toast } from "react-toastify";
import { useAuth } from "../authContext/UserContext";
import API_URL, { getHeaders } from "../config";

function WhoToFollow() {
  const { user: currentUser, setUser } = useAuth();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const res = await fetch(`${API_URL}/users/suggestions/users`, {
        headers: getHeaders(),
        credentials: "include",
      });
      const data = await res.json();
      setSuggestions(data.slice(0, 3)); // Only show top 3 in sidebar
    } catch (error) {
      console.error("Failed to fetch suggestions");
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId, name) => {
    try {
      const data = await followUser(userId);
      toast.success(data.isFollowing ? `Following ${name}` : `Unfollowed ${name}`);
      setSuggestions(prev => prev.filter(u => u._id !== userId));
      
      // Update global context
      if (data.following) {
        setUser(prev => ({ ...prev, following: data.following }));
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading) return null;
  if (suggestions.length === 0) return null;

  return (
    <div className="bg-gray-50/50 rounded-[32px] border border-gray-100 overflow-hidden mt-6">
      <div className="px-6 py-4">
        <h2 className="text-xl font-black text-gray-900 tracking-tight">Who to follow</h2>
      </div>

      <div className="flex flex-col">
        {suggestions.map((u) => (
          <div key={u._id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-100/50 transition-colors group">
            <Link to={`/user/${u._id}`} className="flex items-center gap-3 overflow-hidden">
              <img src={u.avatar || "/avatar.png"} className="w-10 h-10 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform" alt={u.name} />
              <div className="overflow-hidden">
                <p className="font-black text-gray-900 tracking-tight leading-none text-sm truncate">{u.name}</p>
                <p className="text-[11px] font-bold text-gray-400 mt-1 uppercase tracking-tighter truncate">@{u.email.split("@")[0]}</p>
              </div>
            </Link>
            <button
              onClick={() => handleFollow(u._id, u.name)}
              className="px-4 py-1.5 bg-gray-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest transition-all hover:bg-gray-800 active:scale-95 shadow-sm ml-2 shrink-0"
            >
              Follow
            </button>
          </div>
        ))}
        
        <Link to="/explore" className="w-full text-left px-6 py-4 text-sm font-bold text-primary hover:bg-gray-100/50 transition-all border-t border-gray-100/50">
          Show more
        </Link>
      </div>
    </div>
  );
}

export default WhoToFollow;
