import React from "react";
import LeftSideBar from "./LeftSideBar";
import RightSideBar from "./RightSideBar";
import BottomNav from "./BottomNav";
import CreatePostModal from "./CreatePostModal";
import { useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../authContext/UserContext";

function Layout({ children }) {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const [isPostModalOpen, setPostModalOpen] = useState(false);

  const authPaths = ["/login", "/register"];

  const hidePaths = authPaths.includes(pathname);

  if (hidePaths) {
    return <>{children}</>;
  }
  return (
    <div className=" flex max-w-7xl mx-auto ">
      <LeftSideBar onPostClick={() => setPostModalOpen(true)} />
      <main className="flex-1 border-x border-gray-200 min-h-screen pb-16 md:pb-0">
        {children}
      </main>
      <RightSideBar />
      <BottomNav onPostClick={() => setPostModalOpen(true)} />
      
      <CreatePostModal 
        isOpen={isPostModalOpen} 
        onClose={() => setPostModalOpen(false)} 
        user={user}
        onPostCreated={() => {
          // If we are on Home page, we might want to refresh. 
          // But since it's a global modal, we'll just show success toast (already in modal).
        }}
      />
    </div>
  );
}

export default Layout;
