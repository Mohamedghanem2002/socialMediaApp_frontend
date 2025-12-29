import React from "react";
import { X, UserPlus, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../authContext/UserContext";

function UserListModal({ isOpen, onClose, title, users, onFollowToggle }) {
  const { user: currentUser, setUser } = useAuth();

  // Prevent background scrolling when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">{title}</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-900"
          >
            <X size={24} />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2 no-scrollbar">
          {users && users.length > 0 ? (
            <div className="flex flex-col gap-1">
              {users.map((u) => {
                const isFollowing = currentUser?.following?.some(f => (f._id || f) === u._id) || 
                                   u.followers?.some(f => (f._id || f) === currentUser?._id) || 
                                   u.isFollowing; // Fallback for various data structures
                                   
                return (
                  <div key={u._id} className="p-4 flex items-center justify-between hover:bg-gray-50 rounded-[28px] transition-colors group">
                    <Link 
                      to={`/user/${u._id}`} 
                      onClick={onClose}
                      className="flex items-center gap-4 overflow-hidden"
                    >
                      <img 
                        src={u.avatar || "/avatar.png"} 
                        className="w-12 h-12 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform" 
                        alt={u.name} 
                      />
                      <div className="overflow-hidden">
                        <p className="font-black text-gray-900 tracking-tight leading-none truncate">{u.name}</p>
                        <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-tighter truncate">@{u.email ? u.email.split("@")[0] : "user"}</p>
                      </div>
                    </Link>
                    
                    {currentUser?._id !== u._id && (
                      <button
                        onClick={() => onFollowToggle(u._id, u.name)}
                        className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-1.5 ${
                          isFollowing
                            ? "bg-gray-100 text-gray-900 border border-gray-200"
                            : "bg-gray-900 text-white shadow-lg shadow-gray-200"
                        }`}
                      >
                        {isFollowing ? (
                          <>
                            <Check size={12} />
                            Following
                          </>
                        ) : (
                          <>
                            <UserPlus size={12} />
                            Follow
                          </>
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center">
              <p className="text-gray-300 font-black text-xl italic tracking-tight">Empty List</p>
              <p className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-widest">No users to show yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserListModal;
