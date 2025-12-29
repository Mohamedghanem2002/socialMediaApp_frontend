import React, { useCallback, useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../authContext/UserContext";
import { getUserProfile, updateMyAvatar, followUser } from "../api/auth";
import { Trash, Heart, MessageCircle, Calendar, Mail, MapPin, Link as LinkIcon, MoreHorizontal, ChevronLeft, LogOut } from "lucide-react";
import { toast } from "react-toastify";
import WhatesHappening from "../components/WhatesHappening";
import AvatarUploader from "../components/AvatarUploader";
import PostFeeds from "../components/PostFeeds";
import UserListModal from "../components/UserListModal";

function Profile() {
  const { id } = useParams();
  const { user, setUser, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [followModal, setFollowModal] = useState({ isOpen: false, type: "followers" });
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      toast.error("Logout error");
      console.error("Logout error:", error);
    }
  };

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

  const handlePostCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleAvatarUploaded = async (url) => {
    try {
      toast.loading("Updating avatar...");
      await updateMyAvatar(profile._id, url);
      setProfile((prev) => (prev ? { ...prev, avatar: url } : prev));
      toast.success("Avatar updated");
    } catch (error) {
      toast.error("Failed to save avatar");
    } finally {
      toast.dismiss();
    }
  };

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
      {/* Mini Top Bar */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100/50 px-6 py-3 flex items-center gap-6">
        <Link to="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
          <ChevronLeft size={24} />
        </Link>
        <div className="flex-1 min-w-0">
          <h2 className="font-black text-gray-900 tracking-tight leading-none truncate">{profile.name}</h2>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mt-1">Profile View</span>
        </div>
        {isOwner && (
          <button 
            onClick={handleLogout}
            className="md:hidden p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-90"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        )}
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Profile Header Card */}
        <div className="bg-white p-6 md:p-8 rounded-b-[32px] md:rounded-b-[40px] shadow-xl shadow-gray-200/50 relative overflow-hidden mb-6">
          <div className="absolute top-0 left-0 w-full h-24 md:h-32 bg-gradient-to-r from-primary/10 via-blue-100/30 to-purple-100/20" />
          
          <div className="relative z-10">
            <div className="flex justify-between items-end mb-4 md:mb-6">
              <div className="relative">
                <div className="p-0.5 md:p-1 bg-white rounded-[24px] md:rounded-[32px] shadow-2xl">
                    <AvatarUploader
                    src={profile?.avatar}
                    size={window.innerWidth < 768 ? 80 : 110}
                    disabled={!isOwner}
                    onUploaded={handleAvatarUploaded}
                    className="rounded-[20px] md:rounded-[28px] object-cover"
                    />
                </div>
              </div>
              
              {isOwner ? (
                <button className="px-6 py-2.5 bg-gray-900 text-white font-black text-xs rounded-2xl hover:bg-gray-800 transition-all shadow-lg active:scale-95">
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                    <button className="p-2.5 border border-gray-200 rounded-2xl hover:bg-gray-50 transition-all text-gray-600">
                        <Mail size={20} />
                    </button>
                    <button 
                      onClick={handleFollow}
                      className={`px-6 py-2.5 font-black text-xs rounded-2xl transition-all shadow-lg active:scale-95 ${
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
              <p className="text-gray-500 font-medium text-[10px] md:text-base">@{profile.email.split("@")[0]}</p>
            </div>

            <p className="mt-3 md:mt-4 text-gray-700 font-medium leading-relaxed max-w-lg text-[11px] md:text-sm">
              Passionate developer & social media explorer. Building things that make sense. 🚀
            </p>

            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 md:gap-x-6 mt-4 md:mt-6">
              <div className="flex items-center gap-1.5 text-gray-400 text-[10px] md:text-sm font-bold uppercase tracking-tighter">
                <MapPin size={14} className="md:w-4 md:h-4 text-primary/60" />
                <span>San Francisco, CA</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-400 text-[10px] md:text-sm font-bold uppercase tracking-tighter">
                <Calendar size={14} className="md:w-4 md:h-4 text-primary/60" />
                <span>Joined Dec 2025</span>
              </div>
            </div>

            <div className="flex items-center gap-6 md:gap-8 mt-6 md:mt-8 border-t border-gray-100 pt-4 md:pt-6">
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
              
              // Update local profile state to reflect follow change in modal
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

        {isOwner && <WhatesHappening user={user} onPostCreated={handlePostCreated} />}

        {/* Unified Post List using PostFeeds */}
        <div className="space-y-6 pt-4 px-4 md:px-0">
          <div className="flex items-center justify-between px-6 mb-2">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Posts</h3>
            <div className="h-[1px] bg-gray-200 flex-1 ml-4" />
          </div>

          <PostFeeds userId={id} refreshTrigger={refreshTrigger} />
        </div>
        <div className="h-20" /> {/* Spacer for BottomNav */}
      </div>
    </div>
  );
}

export default Profile;
