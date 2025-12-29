import React, { useCallback, useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../authContext/UserContext";
import { getUserProfile, followUser } from "../api/auth";
import { MessageCircle, ChevronLeft, Mail, MapPin, Calendar, Sparkles } from "lucide-react";
import { toast } from "react-toastify";
import PostFeeds from "../components/PostFeeds";
import UserListModal from "../components/UserListModal";

function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [followModal, setFollowModal] = useState({ isOpen: false, type: "followers" });

  useEffect(() => {
    (async () => {
      if (!id || id === "undefined") return;
      try {
        const u = await getUserProfile(id);
        setProfile(u);
      } catch (error) {
        console.error("Failed to load profile", error);
        toast.error("Failed to load profile");
      }
    })();
  }, [id]);

  const handleFollow = async () => {
    if (!user) {
      toast.error("Please login to follow");
      return;
    }
    try {
      const data = await followUser(profile._id);
      
      // Update global context
      if (data.following) {
        setUser(prev => ({ ...prev, following: data.following }));
      }

      setProfile((prev) => ({
        ...prev,
        followers: data.isFollowing 
          ? [...(prev.followers || []), user._id] 
          : (prev.followers || []).filter(id => (id._id || id) !== user._id)
      }));
      toast.success(data.isFollowing ? `Following ${profile.name}` : `Unfollowed ${profile.name}`);
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (!profile)
    return (
      <div className="flex items-center justify-center h-screen bg-[#F8F9FD]">
        <div className="w-10 h-10 border-t-primary border-4 border-gray-200 rounded-full animate-spin"></div>
      </div>
    );

  const isOwner = user?._id === profile?._id;

  return (
    <div className="bg-[#F8F9FD] min-h-screen">
      {/* Sticky Mini Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100/50 px-6 py-3 flex items-center gap-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
          <ChevronLeft size={24} />
        </button>
        <div>
          <h2 className="font-black text-gray-900 tracking-tight leading-none">{profile.name}</h2>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">User Details</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Profile Card */}
        <div className="bg-white p-6 md:p-8 rounded-b-[32px] md:rounded-b-[40px] shadow-xl shadow-gray-200/50 relative overflow-hidden mb-6 md:mb-8">
            <div className="absolute top-0 left-0 w-full h-24 md:h-32 bg-gradient-to-r from-primary/5 via-blue-50/20 to-indigo-50/10" />
            
            <div className="relative z-10">
                <div className="flex justify-between items-end mb-6">
                    <div className="relative">
                        <div className="p-0.5 md:p-1 bg-white rounded-[24px] md:rounded-[32px] shadow-2xl">
                            <img
                                src={profile.avatar || "/avatar.png"}
                                alt={profile.name}
                                className="w-20 h-20 md:w-[110px] md:h-[110px] rounded-[20px] md:rounded-[28px] object-cover"
                            />
                        </div>
                    </div>
                    
                    {!isOwner && (
                        <div className="flex gap-3">
                            <button
                                onClick={() => navigate("/messages", { state: { startWithUser: profile } })}
                                className="p-3 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all text-gray-600 shadow-sm"
                            >
                                <Mail size={22} />
                            </button>
                            <button 
                                onClick={handleFollow}
                                className={`px-8 py-3 font-black text-xs rounded-2xl transition-all shadow-lg active:scale-95 ${
                                    profile.followers?.some(f => (f._id?.toString() || f.toString()) === user?._id)
                                    ? "bg-gray-100 text-gray-900 border border-gray-200"
                                    : "bg-gray-900 text-white hover:bg-gray-800 shadow-primary/20"
                                }`}
                            >
                                {profile.followers?.some(f => (f._id?.toString() || f.toString()) === user?._id) ? "Following" : "Follow"}
                            </button>
                        </div>
                    )}
                </div>

                <div className="space-y-0.5 md:space-y-1">
                    <h1 className="text-xl md:text-3xl font-black text-gray-900 tracking-tighter">{profile.name}</h1>
                    <p className="text-gray-500 font-medium tracking-tight text-xs md:text-base">@{profile.email.split("@")[0]}</p>
                </div>

                <p className="mt-3 md:mt-4 text-gray-700 font-medium leading-relaxed max-w-lg text-[11px] md:text-sm">
                    Exploring the digital world and sharing creative moments. ✨
                </p>

                <div className="flex flex-wrap items-center gap-y-2 gap-x-4 md:gap-x-6 mt-4 md:mt-6">
                    <div className="flex items-center gap-1.5 text-gray-400 text-[10px] md:text-sm font-bold uppercase tracking-tighter">
                        <MapPin size={14} className="md:w-4 md:h-4 text-primary/60" />
                        <span>Somewhere Digitally</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-400 text-[10px] md:text-sm font-bold uppercase tracking-tighter">
                        <Calendar size={14} className="md:w-4 md:h-4 text-primary/60" />
                        <span>Joined Socially</span>
                    </div>
                </div>

                <div className="flex items-center justify-center md:justify-start gap-6 md:gap-8 mt-6 md:mt-8 border-t border-gray-100 pt-4 md:pt-6">
                    <button 
                        onClick={() => setFollowModal({ isOpen: true, type: "following" })}
                        className="flex items-center gap-1.5 md:gap-2 hover:bg-gray-50 px-2 py-1 rounded-lg transition-colors"
                    >
                        <span className="font-black text-gray-900 text-sm md:text-base">{profile.following?.length || 0}</span>
                        <span className="text-gray-400 font-bold text-[9px] md:text-xs uppercase tracking-widest">Following</span>
                    </button>
                    <button 
                        onClick={() => setFollowModal({ isOpen: true, type: "followers" })}
                        className="flex items-center gap-1.5 md:gap-2 hover:bg-gray-50 px-2 py-1 rounded-lg transition-colors"
                    >
                        <span className="font-black text-gray-900 text-sm md:text-base">{profile.followers?.length || 0}</span>
                        <span className="text-gray-400 font-bold text-[9px] md:text-xs uppercase tracking-widest">Followers</span>
                    </button>
                </div>
            </div>
        </div>

        <UserListModal
          isOpen={followModal.isOpen}
          onClose={() => setFollowModal({ ...followModal, isOpen: false })}
          title={followModal.type === "followers" ? "Followers" : "Following"}
          users={profile[followModal.type]}
          onFollowToggle={async (targetId, name) => {
            try {
              const data = await followUser(targetId);
              toast.success(data.isFollowing ? `Following ${name}` : `Unfollowed ${name}`);
              
              // Sync global state
              if (data.following) {
                setUser(prev => ({ ...prev, following: data.following }));
              }
              
              setProfile(prev => {
                const updatedType = [...(prev[followModal.type] || [])].map(u => {
                  if (u._id === targetId) {
                    return {
                      ...u,
                      followers: data.isFollowing 
                        ? [...(u.followers || []), user._id] 
                        : (u.followers || []).filter(id => (id._id || id) !== user._id)
                    };
                  }
                  return u;
                });
                return { ...prev, [followModal.type]: updatedType };
              });
            } catch (error) {
              toast.error(error.message);
            }
          }}
        />

        {/* Post List */}
        <div className="px-4 md:px-0 space-y-6 pb-20">
            <div className="flex items-center justify-between px-6 mb-2">
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    Recent Posts <Sparkles size={14} className="text-yellow-500 fill-yellow-500" />
                </h3>
                <div className="h-[1px] bg-gray-200 flex-1 ml-4" />
            </div>

            <PostFeeds userId={id} />
        </div>
      </div>
    </div>
  );
}

export default UserDetails;
