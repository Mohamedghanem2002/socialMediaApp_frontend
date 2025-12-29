import React, { useState } from "react";
import { Film, BarChart3, Smile, MapPin, Calendar, Send, Image as ImageIcon, Sparkles } from "lucide-react";
import ImageUploader from "../components/ImageUploader";
import { toast } from "react-toastify";

function WhatesHappening({ user, onPostCreated }) {
  const [uploadImage, setUploadImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [text, setText] = useState("");

  const isDisabled = uploading || (!text.trim() && !uploadImage);

  const handlePost = async () => {
    const newPost = {
      text,
      image: uploadImage,
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await fetch("https://social-media-app-backend-mu.vercel.app/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPost),
        credentials: "include",
      });
      const data = await res.json();
      
      // Reset state after posting
      setText("");
      setUploadImage(null);
      toast.success("Post shared with the world!");
      if (onPostCreated) onPostCreated();
    } catch (error) {
      toast.error("Failed to share post");
    }
  };

  return (
    <div className="mx-4 md:mx-6 mt-6 mb-2">
      <div className="bg-white rounded-[32px] p-6 shadow-xl shadow-gray-200/50 border border-transparent focus-within:border-primary/20 transition-all duration-300">
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <img
              src={user?.avatar || "/avatar.png"}
              alt={user?.name || "User"}
              className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl object-cover shadow-sm border-2 border-white"
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 md:w-4 md:h-4 bg-green-500 border-2 border-white rounded-full" />
          </div>

          <div className="flex-1">
            <textarea
              placeholder="What's on your mind today?"
              className="w-full bg-transparent resize-none text-sm md:text-[17px] font-medium text-gray-800 outline-none placeholder-gray-400 mt-1 md:mt-2 min-h-[80px] md:min-h-[100px] leading-relaxed"
              onChange={(e) => setText(e.target.value)}
              value={text}
            />
            
            {uploading && (
                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest animate-pulse mt-2">
                    <Sparkles size={14} />
                    <span>Processing Media...</span>
                </div>
            )}

            {/* Uploaded image preview */}
            {uploadImage && (
              <div className="relative mt-4 group">
                <img
                  src={uploadImage}
                  alt="Preview"
                  className="w-full rounded-[24px] border border-gray-100 shadow-inner max-h-[400px] object-cover"
                />
                <button 
                  onClick={() => setUploadImage(null)}
                  className="absolute top-3 right-3 bg-black/50 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-black/70 transition-all"
                >
                  Remove
                </button>
              </div>
            )}

            {/* Divider */}
            <div className="h-[1px] bg-gray-100 w-full my-4" />

            {/* Footer Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 sm:gap-2">
                <ImageUploader
                  onImageUpload={setUploadImage}
                  setUploading={setUploading}
                />

                <IconWrapper>
                  <Film size={18} />
                </IconWrapper>

                <IconWrapper>
                  <Smile size={18} />
                </IconWrapper>

                <div className="hidden sm:flex items-center gap-1 sm:gap-2">
                    <IconWrapper>
                        <MapPin size={18} />
                    </IconWrapper>

                    <IconWrapper>
                        <Calendar size={18} />
                    </IconWrapper>
                </div>
              </div>

              <button
                className={`flex items-center gap-2 font-black py-3 px-8 rounded-2xl transition-all active:scale-95 ${
                  isDisabled || !user
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-primary text-white shadow-lg shadow-primary/30 hover:shadow-primary/40"
                }`}
                disabled={isDisabled || !user}
                onClick={handlePost}
              >
                <span>{user ? "Share" : "Login"}</span>
                <Send size={16} fill={!isDisabled && user ? "currentColor" : "none"} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WhatesHappening;

// Helper component
function IconWrapper({ children }) {
  return (
    <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg md:rounded-xl hover:bg-gray-100 cursor-pointer transition-all text-gray-400 hover:text-primary active:scale-90">
      {children}
    </div>
  );
}
