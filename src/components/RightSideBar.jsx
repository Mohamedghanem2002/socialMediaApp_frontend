import { Search } from "lucide-react";
import React from "react";
import SearchBox from "./SearchBox";
import TodayNews from "./TodayNews";
import WhoToFollow from "./WhoToFollow";

function RightSideBar() {
  return (
    <div className="hidden lg:flex flex-col w-[350px] p-4 h-screen sticky top-0 overflow-y-auto no-scrollbar scroll-smooth">
      <SearchBox />
      <TodayNews />
      <WhoToFollow />
      
      {/* Footer Links */}
      <div className="mt-6 px-4 pb-8">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {["Terms of Service", "Privacy Policy", "Cookie Policy", "Accessibility", "Ads info", "More"].map((link) => (
            <button key={link} className="text-[11px] font-medium text-gray-400 hover:text-primary transition-colors">
              {link}
            </button>
          ))}
        </div>
        <p className="mt-4 text-[11px] font-bold text-gray-300 uppercase tracking-widest">
          © 2025 Antigravity Gravity
        </p>
      </div>
    </div>
  );
}

export default RightSideBar;
