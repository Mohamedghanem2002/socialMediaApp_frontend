import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Sparkles, AlertCircle } from "lucide-react";
import PostFeeds from "../components/PostFeeds";
import API_URL, { getHeaders } from "../config";

function PostDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/posts/${id}`, {
          headers: getHeaders(),
          credentials: "include",
        });
        if (!res.ok) throw new Error("Post not found");
        const data = await res.json();
        setPost(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F8F9FD]">
        <div className="w-10 h-10 border-t-primary border-4 border-gray-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#F8F9FD] p-6">
        <div className="w-20 h-20 bg-red-50 rounded-[32px] flex items-center justify-center mb-6 text-red-500">
          <AlertCircle size={40} />
        </div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Post not found</h2>
        <p className="text-gray-500 font-medium mb-8">This post may have been deleted or the link is incorrect.</p>
        <button 
          onClick={() => navigate("/")}
          className="px-8 py-3 bg-primary text-white font-black text-sm rounded-2xl shadow-lg shadow-primary/20 active:scale-95 transition-all"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#F8F9FD] min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100/50 px-6 py-3 flex items-center gap-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
          <ChevronLeft size={24} />
        </button>
        <div>
          <h2 className="font-black text-gray-900 tracking-tight leading-none">Post</h2>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
            Permalink View <Sparkles size={10} className="text-yellow-500" />
          </span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto py-4 md:py-8">
        {/* We can pass just one post to PostFeeds by wrapping it in an array if we modify PostFeeds to accept initialPosts or just use the PostFeeds logic here */}
        {/* But since PostFeeds is already complex, let's just render the post directly here using the same structure for consistency */}
        
        {/* Reusing PostFeeds component but with a specific filter logic or just rendering it. 
            Currently PostFeeds fetches its own data. 
            Let's modify PostFeeds to accept a static list if provided, or just let it fetch.
            Since PostFeeds is designed to fetch, I can add a postId prop to it.
        */}
        <PostFeeds postId={id} />
      </div>
    </div>
  );
}

export default PostDetails;
