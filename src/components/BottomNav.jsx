import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Mail, Bell, User, LogOut, Search, Plus } from "lucide-react";
import { useAuth } from "../authContext/UserContext";
import { useSocket } from "../authContext/SocketContext";
import { toast } from "react-toastify";

export default function BottomNav({ onPostClick }) {
  const { user, logout } = useAuth();
  const { unreadCount, unreadMessageCount } = useSocket();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      toast.error("Logout error:", error);
    }
  };

  const menu = [
    { icon: <Home />, label: "Home", path: "/" },
    { icon: <Search />, label: "Explore", path: "/explore" },
    { icon: <Plus className="w-8 h-8" />, label: "Post", action: onPostClick, primary: true },
    {
      icon: (
        <div className="relative flex items-center justify-center">
          <Mail />
          {unreadMessageCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-semibold min-w-[16px] h-[16px] px-0.5 rounded-full flex items-center justify-center leading-none shadow-md">
              {unreadMessageCount > 9 ? "9+" : unreadMessageCount}
            </span>
          )}
        </div>
      ),
      label: "Messages",
      path: "/messages",
    },
    {
      icon: (
        <div className="relative flex items-center justify-center">
          <Bell />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-semibold min-w-[16px] h-[16px] px-0.5 rounded-full flex items-center justify-center leading-none shadow-md">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </div>
      ),
      label: "Notifications",
      path: "/notifications",
    },
    { icon: <User />, label: "Profile", path: `/profile/${user?._id}` },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 md:hidden z-50 flex justify-around items-center h-16 pb-safe">
      {menu.map((item, index) => {
        const isActive = location.pathname === item.path;
        return item.path ? (
          <Link
            key={index}
            to={item.path}
            className={`flex flex-col items-center justify-center w-full h-full ${
              isActive ? "text-primary" : "text-gray-500"
            }`}
          >
            {item.icon}
          </Link>
        ) : (
          <button
            key={index}
            onClick={item.action}
            className={`flex flex-col items-center justify-center w-full h-full ${
                item.primary ? "text-primary bg-primary/10 rounded-2xl h-12 w-12 scale-110 shadow-lg" : "text-gray-500"
            }`}
          >
            {item.icon}
          </button>
        );
      })}
    </div>
  );
}
