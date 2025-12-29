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
    { icon: <Plus />, label: "Post", action: onPostClick },
    {
      icon: (
        <Mail />
      ),
      label: "Messages",
      path: "/messages",
      count: unreadMessageCount,
    },
    {
      icon: (
        <Bell />
      ),
      label: "Notifications",
      path: "/notifications",
      count: unreadCount,
    },
    { icon: <User />, label: "Profile", path: `/profile/${user?._id}` },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 md:hidden z-50 flex justify-around items-center h-16 pb-safe">
      {menu.map((item, index) => {
        const isActive = item.path && location.pathname === item.path;
        
        return item.path ? (
          <Link
            key={index}
            to={item.path}
            className="flex-1 flex justify-center items-center h-full group"
          >
            <div className={`relative flex flex-col items-center justify-center p-2.5 rounded-full transition-all duration-300 ${
              isActive ? "bg-gray-100 scale-105" : "hover:bg-gray-50 active:bg-gray-100"
            }`}>
              {React.cloneElement(item.icon, {
                size: 24,
                strokeWidth: isActive ? 2.5 : 2,
                className: "text-gray-700 transition-all duration-300"
              })}
              {item.count > 0 && (
                <span className="absolute top-1 -right-1 bg-red-500 text-white text-[10px] font-bold min-w-[16px] h-[16px] px-0.5 rounded-full flex items-center justify-center leading-none shadow-sm border border-white">
                  {item.count > 9 ? "9+" : item.count}
                </span>
              )}
            </div>
          </Link>
        ) : (
          <button
            key={index}
            onClick={item.action}
            className="flex-1 flex justify-center items-center h-full group"
          >
            <div className="relative flex flex-col items-center justify-center p-2.5 rounded-full transition-all duration-300 hover:bg-gray-50 active:bg-gray-100">
              {React.cloneElement(item.icon, {
                size: 24,
                strokeWidth: 2,
                className: "text-gray-700 transition-colors duration-300"
              })}
            </div>
          </button>
        );
      })}
    </div>
  );
}
