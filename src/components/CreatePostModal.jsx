import React, { useState } from "react";
import { X, Image as ImageIcon, Smile, MapPin, Globe, Sparkles, Send } from "lucide-react";
import { toast } from "react-toastify";
import API_URL, { getHeaders } from "../config";

function CreatePostModal({ isOpen, onClose, user, onPostCreated }) {
  const [text, setText] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleCreatePost = async () => {
    if (!text && !image) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/posts`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ text, image }),
        credentials: "include",
      });
      if (res.ok) {
        toast.success("Post shared successfully! ✨");
        setText("");
        setImage("");
        onClose();
        if (onPostCreated) onPostCreated();
      }
    } catch (error) {
      toast.error("Failed to share post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-xl md:rounded-[40px] rounded-t-[32px] h-full md:h-auto shadow-2xl overflow-hidden animate-in slide-in-from-bottom md:zoom-in-95 duration-300">
        {/* Header */}
        <div className="px-6 md:px-8 py-5 md:py-6 flex items-center justify-between border-b border-gray-50 bg-white/80 backdrop-blur-xl">
          <div className="flex items-center gap-3">
             <div className="w-9 h-9 md:w-10 md:h-10 bg-primary/10 rounded-xl md:rounded-2xl flex items-center justify-center">
                <Sparkles size={20} className="text-primary" />
             </div>
             <div>
                <h2 className="text-xl font-black text-gray-900 tracking-tight leading-none">Create Post</h2>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 block">Share your thoughts</span>
             </div>
          </div>
          <button 
            onClick={onClose}
            className="p-3 hover:bg-gray-100 rounded-2xl transition-all active:scale-95 text-gray-400 hover:text-gray-900"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 md:p-8 h-[calc(100%-160px)] md:h-auto overflow-y-auto">
          <div className="flex gap-4">
            <img
              src={user?.avatar || "/avatar.png"}
              className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl object-cover shadow-lg shrink-0"
              alt="avatar"
            />
            <div className="flex-1 space-y-4">
                <textarea
                    className="w-full text-base md:text-lg font-medium text-gray-800 placeholder:text-gray-300 border-none focus:ring-0 outline-none resize-none bg-transparent min-h-[150px] md:min-h-[120px]"
                    placeholder="What's happening?"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />
                
                {image && (
                    <div className="relative group/img rounded-3xl overflow-hidden shadow-inner border border-gray-100">
                        <img src={image} className="w-full h-auto max-h-[300px] object-cover" />
                        <button 
                            onClick={() => setImage("")}
                            className="absolute top-4 right-4 p-2 bg-gray-900/80 text-white rounded-xl backdrop-blur-md opacity-0 group-hover/img:opacity-100 transition-all hover:bg-red-500"
                        >
                            <X size={18} />
                        </button>
                    </div>
                )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 md:px-8 py-5 md:py-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between absolute bottom-0 w-full md:relative md:bottom-auto">
           <div className="flex items-center gap-1 md:gap-2">
                <button className="p-2 md:p-3 text-primary hover:bg-primary/10 rounded-xl md:rounded-2xl transition-all" onClick={() => {
                    const url = prompt("Enter image URL");
                    if (url) setImage(url);
                }}>
                    <ImageIcon size={22} />
                </button>
                <button className="p-3 text-gray-400 hover:bg-gray-200/50 rounded-2xl transition-all">
                    <Smile size={22} />
                </button>
                <button className="p-3 text-gray-400 hover:bg-gray-200/50 rounded-2xl transition-all">
                    <MapPin size={22} />
                </button>
           </div>
           
           <div className="flex items-center gap-6">
                <div className="hidden sm:flex items-center gap-2 text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                    <Globe size={14} />
                    <span>Public View</span>
                </div>
                <button 
                    disabled={(!text && !image) || loading}
                    onClick={handleCreatePost}
                    className="flex items-center gap-3 px-8 py-4 bg-primary text-white font-black text-sm rounded-[24px] shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100"
                >
                    {loading ? (
                        <div className="w-5 h-5 border-t-white border-2 border-primary/30 rounded-full animate-spin" />
                    ) : (
                        <>
                            <span>Post Now</span>
                            <Send size={18} className="rotate-45" />
                        </>
                    )}
                </button>
           </div>
        </div>
      </div>
    </div>
  );
}

export default CreatePostModal;
