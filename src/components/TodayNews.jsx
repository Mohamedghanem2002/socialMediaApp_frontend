import { TrendingUp, MoreHorizontal } from "lucide-react";

const TRENDS = [
  { category: "Web Development · Trending", title: "#ReactJS", posts: "42.5K Posts" },
  { category: "Technology · Local", title: "Artificial Intelligence", posts: "128K Posts" },
  { category: "Design · Trending", title: "Tailwind CSS", posts: "15.2K Posts" },
  { category: "Programming · Trending", title: "#JavaScript", posts: "89K Posts" },
];

function TodayNews() {
  return (
    <div className="bg-gray-50/50 rounded-[32px] border border-gray-100 overflow-hidden mt-6">
      <div className="px-6 py-4 flex items-center justify-between">
        <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          What's happening <TrendingUp size={18} className="text-primary" />
        </h2>
      </div>

      <div className="flex flex-col">
        {TRENDS.map((trend, i) => (
          <div 
            key={i} 
            className="px-6 py-3 hover:bg-gray-100/50 transition-colors cursor-pointer group"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-0.5">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{trend.category}</p>
                <h3 className="text-sm font-black text-gray-900 group-hover:text-primary transition-colors tracking-tight">{trend.title}</h3>
                <p className="text-xs font-medium text-gray-500">{trend.posts}</p>
              </div>
              <button className="p-2 -mr-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-full transition-all">
                <MoreHorizontal size={14} />
              </button>
            </div>
          </div>
        ))}
        
        <button className="w-full text-left px-6 py-4 text-sm font-bold text-primary hover:bg-gray-100/50 transition-all border-t border-gray-100/50">
          Show more
        </button>
      </div>
    </div>
  );
}

export default TodayNews;
