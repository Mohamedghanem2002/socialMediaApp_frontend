import React from "react";
import {
  Home,
  Search,
  Mail,
  User,
  LogOut,
  Bell,
  Sparkles,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../authContext/UserContext";
import { toast } from "react-toastify";
import { useSocket } from "../authContext/SocketContext";

export default function LeftSideBar({ onPostClick }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { unreadCount, unreadMessageCount } = useSocket();

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

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Search, label: "Explore", path: "/explore" },
    { 
      icon: Bell, 
      label: "Notifications", 
      path: "/notifications",
      badge: unreadCount 
    },
    { 
      icon: Mail, 
      label: "Messages", 
      path: "/messages",
      badge: unreadMessageCount 
    },
    { icon: User, label: "Profile", path: `/profile/${user?._id}` },
  ];

  return (
    <div className="hidden md:flex flex-col w-24 xl:w-72 h-screen sticky top-0 bg-white/50 backdrop-blur-xl border-r border-gray-100/50 p-4 justify-between transition-all duration-500 ease-in-out z-40">
      <div className="space-y-8">
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-3 px-4 md:px-2 xl:px-4 group pt-2">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 ease-out">
            <Sparkles className="text-white w-7 h-7" />
          </div>
          <span className="hidden xl:block text-2xl font-black text-gray-900 tracking-tighter">
            Social<span className="text-primary italic">App</span>
          </span>
        </Link>

        {/* Navigation Section */}
        <nav className="space-y-1 md:space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-4 p-4 rounded-[20px] transition-all duration-400 group relative
                  ${isActive 
                    ? "bg-primary text-white shadow-2xl shadow-primary/30 active:scale-95" 
                    : "text-gray-500 hover:bg-primary/5 hover:text-primary active:scale-95"}
                `}
              >
                <div className="relative">
                  <Icon size={24} className={`
                    ${isActive ? "scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" : "group-hover:scale-110 transition-transform duration-300"}
                  `} />
                  
                  {item.badge > 0 && (
                    <span className={`
                      absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] rounded-full text-[10px] font-black flex items-center justify-center border-2
                      ${isActive 
                        ? "bg-white text-primary border-primary animate-bounce" 
                        : "bg-red-500 text-white border-white shadow-lg shadow-red-500/40"}
                    `}>
                      {item.badge > 9 ? "9+" : item.badge}
                    </span>
                  )}
                </div>
                
                <span className={`
                  hidden xl:block text-base tracking-tight font-black
                  ${isActive ? "opacity-100" : "opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all"}
                `}>
                  {item.label}
                </span>

                {/* Subtle Active Indicator Bar */}
                {isActive && (
                  <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-white rounded-r-full hidden xl:block" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Post Button Section */}
        <div className="px-2 xl:px-0">
          <button
            onClick={onPostClick}
            className="w-full bg-gray-900 text-white rounded-[24px] py-4 font-black flex items-center justify-center gap-2 shadow-2xl shadow-gray-200 group hover:bg-black transition-all duration-300 active:scale-95 hover:shadow-gray-300"
          >
            <span className="hidden xl:block uppercase tracking-widest text-[11px] font-black">Create Post</span>
            <span className="xl:hidden text-xl">+</span>
          </button>
        </div>
      </div>

      {/* User Quick Profile & Logout Section */}
      <div className="mb-4 px-2 xl:px-0">
        {user && (
          <div className="relative group/user space-y-2">
            <div 
              onClick={() => navigate(`/profile/${user?._id}`)}
              className="flex items-center gap-3 p-3 rounded-[24px] bg-gray-50/80 hover:bg-white hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-500 cursor-pointer border border-transparent hover:border-gray-100 group/avatar"
            >
              <div className="shrink-0 relative">
                <img 
                  src={user.avatar || "/avatar.png"} 
                  className="w-10 h-10 rounded-[14px] object-cover shadow-sm group-hover/avatar:ring-2 ring-primary/20 transition-all" 
                  alt="Profile" 
                />
              </div>
              
              <div className="hidden xl:block flex-1 min-w-0">
                <p className="font-black text-gray-900 text-[13px] truncate leading-none">{user.name}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter truncate mt-1">
                  @{user.email?.split("@")[0]}
                </p>
              </div>

              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleLogout();
                }}
                className="hidden xl:flex p-2 hover:bg-red-50 rounded-xl transition-all text-gray-300 hover:text-red-500 group-hover/user:opacity-100 opacity-0"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
            
            {/* Quick Logout for Minimalist Tablet View */}
            <button 
                onClick={handleLogout}
                className="xl:hidden flex items-center justify-center w-full p-3 rounded-[20px] text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all duration-300"
                title="Logout"
            >
                <LogOut size={22} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
