import { Heart, MessageCircle, Share2, MoreHorizontal, Send, Trash } from "lucide-react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useOptimistic,
  useRef,
  useState,
  useTransition,
} from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../authContext/UserContext";
import CommentsSection from "./CommentsSection";
import { getCommentCount } from "../api/comments";
import ImageLightbox from "./ImageLightbox";

function PostFeeds({ refreshTrigger, userId, activeTab, postId }) {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [isPending, startTransition] = useTransition();
  const [showComments, setShowComments] = useState({});
  const [commentCounts, setCommentCounts] = useState({});
  const [openMenuId, setOpenMenuId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const menuRef = useRef(null);
  const [optimisticPosts, setOptimisticPosts] = useOptimistic(
    posts,
    (state, { postId, liked, likesCount }) => {
      return state.map((post) =>
        post._id === postId
          ? {
              ...post,
              likes: Array(likesCount).fill(null),
              isLikedByUser: liked,
            }
          : post
      );
    }
  );

  const handleLike = async (postId, currentLikesCount, isCurrentlyLiked) => {
    const newLiked = !isCurrentlyLiked;
    const newLikesCount = newLiked
      ? currentLikesCount + 1
      : currentLikesCount - 1;

    startTransition(async () => {
      setOptimisticPosts({
        postId,
        liked: newLiked,
        likesCount: newLikesCount,
      });

      try {
        const res = await fetch(`https://social-media-app-backend-mu.vercel.app/posts/like/${postId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setPosts((prev) =>
          prev.map((post) =>
            post._id === postId
              ? {
                  ...post,
                  likes: Array(data.likesCount).fill(null),
                  isLikedByUser: data.liked,
                }
              : post
          )
        );
      } catch (error) {
        toast.error("Failed to update like");
        loadPosts();
      }
    });
  };

  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      setErr("");
      let url = userId 
        ? `https://social-media-app-backend-mu.vercel.app/posts/by-user/${userId}`
        : "https://social-media-app-backend-mu.vercel.app/posts";
      
      if (postId) {
        url = `https://social-media-app-backend-mu.vercel.app/posts/${postId}`;
      } else if (!userId && activeTab === "following") {
        url += "?filter=following";
      }
        
      const res = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : [data]);

      const counts = {};
      await Promise.all(
        data.map(async (post) => {
          try {
            counts[post._id] = await getCommentCount(post._id);
          } catch (error) {
            console.error("Failed to load comment count", error);
          }
        })
      );
      setCommentCounts(counts);
    } catch (e) {
      setErr("Error while loading posts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [loadPosts, refreshTrigger, activeTab, postId]);

  const toggleComments = (postId) =>
    setShowComments((prev) => ({ ...prev, [postId]: !prev[postId] }));

  const handleDelete = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      const res = await fetch(`https://social-media-app-backend-mu.vercel.app/posts/${postId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p._id !== postId));
        toast.success("Post deleted");
      }
    } catch (error) {
      toast.error("Failed to delete post");
    }
  };

  const handleUpdate = async (postId) => {
    if (!editText.trim()) return;
    try {
      const res = await fetch(`https://social-media-app-backend-mu.vercel.app/posts/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: editText }),
        credentials: "include",
      });
      if (res.ok) {
        const updated = await res.json();
        setPosts((prev) =>
          prev.map((p) => (p._id === postId ? { ...p, text: updated.text } : p))
        );
        setEditingId(null);
        toast.success("Post updated");
      }
    } catch (error) {
      toast.error("Failed to update post");
    }
  };

  const handleShare = async (post) => {
    const postUrl = `${window.location.origin}/post/${post._id}`;
    const shareData = {
      title: "Check out this post!",
      text: post.text,
      url: postUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success("Shared successfully");
      } else {
        await navigator.clipboard.writeText(postUrl);
        toast.success("Link copied to clipboard");
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        toast.error("Failed to share");
      }
    }
  };

  if (loading)
    return (
      <div className="flex flex-col gap-4 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-[32px] p-6 shadow-sm animate-pulse">
            <div className="flex gap-4">
              <div className="w-14 h-14 bg-gray-200 rounded-2xl" />
              <div className="flex-1 space-y-2 mt-2">
                <div className="h-4 bg-gray-200 rounded w-1/4" />
                <div className="h-3 bg-gray-200 rounded w-1/6" />
              </div>
            </div>
            <div className="h-20 bg-gray-100 rounded-2xl mt-4" />
          </div>
        ))}
      </div>
    );

  if (err) return <div className="p-8 text-center text-red-500 font-bold bg-white rounded-3xl m-4 shadow-sm">{err}</div>;
  
  if (!optimisticPosts.length)
    return (
      <div className="text-gray-400 flex flex-col items-center justify-center p-20 bg-white rounded-[40px] m-4 border-2 border-dashed border-gray-100">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <MessageCircle size={40} className="text-gray-200" />
        </div>
        <p className="text-xl font-black text-gray-300">No Posts Yet</p>
        <p className="text-sm">Be the first to share something amazing!</p>
      </div>
    );

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

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-2xl mx-auto">
      {optimisticPosts.map((post) => (
        <article
          key={post._id}
          className="bg-white rounded-[24px] md:rounded-[32px] shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 group border border-transparent hover:border-primary/10"
        >
          {/* Post Header */}
          <div className="p-4 md:p-6 pb-2 md:pb-4 flex items-start justify-between">
            <div className="flex gap-3 md:gap-4">
              <Link to={`/profile/${post.user?._id}`} className="relative shrink-0">
                <img
                  src={post.user?.avatar || "/avatar.png"}
                  className="h-10 w-10 md:h-14 md:w-14 rounded-xl md:rounded-2xl object-cover shadow-md group-hover:scale-105 transition-transform duration-300"
                  alt={post.user?.name}
                />
              </Link>
              <div className="flex flex-col justify-center">
                <Link
                  to={`/user/${post.user?._id}`}
                  className="group/name flex items-center gap-1.5"
                >
                  <span className="font-black text-gray-900 group-hover/name:text-primary transition-colors tracking-tight text-xs md:text-base">
                    {post.user?.name}
                  </span>
                  <span className="text-gray-400 text-[10px] md:text-sm font-medium">
                    @{post.user?.email.split("@")[0]}
                  </span>
                </Link>
                <div className="flex items-center gap-1.5 text-[9px] md:text-xs font-bold text-gray-400 uppercase tracking-tighter mt-0.5">
                  <span>{timeSince(post.createdAt)}</span>
                  <span>·</span>
                  <span className="text-primary/60">Public</span>
                </div>
              </div>
            </div>
            {post.user?._id === user?._id && (
              <div className="relative" ref={openMenuId === post._id ? menuRef : null}>
                <button 
                  onClick={() => setOpenMenuId(openMenuId === post._id ? null : post._id)}
                  className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
                >
                  <MoreHorizontal size={20} />
                </button>
                
                {openMenuId === post._id && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 z-50 animate-in translate-y-2">
                    <button 
                      onClick={() => {
                        setEditingId(post._id);
                        setEditText(post.text);
                        setOpenMenuId(null);
                      }}
                      className="w-full text-left px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-xl transition-colors flex items-center gap-3"
                    >
                      <div className="w-8 h-8 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center">
                        <Send size={14} className="rotate-45" />
                      </div>
                      Edit Post
                    </button>
                    <button 
                      onClick={() => {
                        handleDelete(post._id);
                        setOpenMenuId(null);
                      }}
                      className="w-full text-left px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-3"
                    >
                      <div className="w-8 h-8 bg-red-50 text-red-500 rounded-lg flex items-center justify-center">
                        <Trash size={14} />
                      </div>
                      Delete Post
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Post Content */}
          <div className="px-4 md:px-6 pb-3 md:pb-4">
            {editingId === post._id ? (
              <div className="space-y-3">
                <textarea
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-xs md:text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  rows={3}
                />
                <div className="flex gap-2 justify-end">
                  <button 
                    onClick={() => setEditingId(null)}
                    className="px-3 py-1.5 text-[10px] md:text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => handleUpdate(post._id)}
                    className="px-3 py-1.5 text-[10px] md:text-xs font-bold bg-primary text-white rounded-lg shadow-lg shadow-primary/20 transition-all active:scale-95"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs md:text-[15px] text-gray-800 leading-relaxed whitespace-pre-wrap font-medium">
                {post.text}
              </p>
            )}
            
            {post.image && (
              <div 
                className="mt-4 rounded-[24px] overflow-hidden border border-gray-100 shadow-inner group/image cursor-zoom-in"
                onClick={() => setSelectedImage(post.image)}
              >
                <img
                  src={post.image}
                  className="w-full h-auto max-h-[600px] object-cover group-hover/image:scale-[1.02] transition-transform duration-700 ease-out"
                  loading="lazy"
                  alt="Post content"
                />
              </div>
            )}
          </div>

          {/* Post Actions */}
          <div className="px-4 md:px-6 py-3 md:py-4 bg-gray-50/50 flex items-center gap-3 md:gap-6">
            <button
              className={`flex items-center gap-1.5 md:gap-2 px-3 py-1.5 rounded-xl transition-all active:scale-95 group/like ${
                post.isLikedByUser 
                  ? "bg-pink-50 text-pink-600 shadow-sm" 
                  : "text-gray-500 hover:bg-white hover:shadow-sm"
              }`}
              disabled={isPending}
              onClick={() =>
                handleLike(
                  post._id,
                  Array.isArray(post.likes) ? post.likes.length : 0,
                  !!post.isLikedByUser
                )
              }
            >
              <Heart
                size={16}
                className={`md:w-5 md:h-5 transition-all duration-300 ${
                  post.isLikedByUser 
                    ? "fill-pink-600 scale-110" 
                    : "group-hover/like:scale-110 group-hover/like:text-pink-400"
                }`}
              />
              <span className="font-bold text-xs md:text-sm">
                {Array.isArray(post.likes) ? post.likes.length : 0}
              </span>
            </button>

            <button
              onClick={() => toggleComments(post._id)}
              className={`flex items-center gap-1.5 md:gap-2 px-3 py-1.5 rounded-xl transition-all active:scale-95 group/comm ${
                showComments[post._id]
                  ? "bg-blue-50 text-primary shadow-sm"
                  : "text-gray-500 hover:bg-white hover:shadow-sm"
              }`}
            >
              <MessageCircle
                size={16}
                className={`md:w-5 md:h-5 transition-all duration-300 ${
                  showComments[post._id]
                    ? "fill-primary scale-110"
                    : "group-hover/comm:scale-110 group-hover/comm:text-primary"
                }`}
              />
              <span className="font-bold text-xs md:text-sm">
                {commentCounts[post._id] || 0}
              </span>
            </button>

            <button 
              onClick={() => handleShare(post)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-gray-500 hover:bg-white hover:shadow-sm transition-all active:scale-95 ml-auto group/share"
            >
              <Share2 size={16} className="group-hover:text-primary transition-colors" />
              <span className="font-bold text-xs hidden sm:block group-hover:text-primary transition-colors">Share</span>
            </button>
          </div>

          {/* Comments Section */}
          <div className={`transition-all duration-500 overflow-hidden ${showComments[post._id] ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="px-6 py-6 border-t border-gray-100 bg-white">
              <CommentsSection
                postId={post._id}
                showComments={showComments[post._id] || false}
                commentsCount={commentCounts[post._id] || 0}
                onCountChange={(count) =>
                  setCommentCounts((prev) => ({ ...prev, [post._id]: count }))
                }
              />
            </div>
          </div>
        </article>
      ))}
      
      {/* Custom Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes heartPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        .animate-pulse-heart { animation: heartPulse 0.3s ease-out; }
      `}} />

      <ImageLightbox 
        imageUrl={selectedImage} 
        onClose={() => setSelectedImage(null)} 
      />
    </div>
  );
}

export default PostFeeds;
