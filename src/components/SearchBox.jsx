import { Search } from "lucide-react";
import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import API_URL, { getHeaders } from "../config";

function SearchBox() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length > 1) {
        setLoading(true);
        try {
          const res = await fetch(`${API_URL}/users/search/users?q=${query}`, {
            headers: getHeaders(),
            credentials: "include",
          });
          const data = await res.json();
          setResults(data.slice(0, 5));
          setIsOpen(true);
        } catch (error) {
          console.error("Search failed");
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="mt-4 mb-2 relative" ref={dropdownRef}>
      <div className="relative group/search">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search size={18} className="text-gray-400 group-focus-within/search:text-primary transition-colors duration-300" />
        </div>
        <input
          type="text"
          placeholder="Search Gravity"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length > 1 && setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && query.trim()) {
              navigate("/explore", { state: { initialQuery: query.trim() } });
              setIsOpen(false);
            }
          }}
          className="w-full bg-gray-100/50 border border-transparent rounded-full py-2.5 pl-11 pr-4 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-300 shadow-sm hover:bg-gray-200/50"
        />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
          {loading ? (
            <div className="p-4 text-center">
              <div className="w-5 h-5 border-t-primary border-2 border-gray-200 rounded-full animate-spin mx-auto" />
            </div>
          ) : results.length > 0 ? (
            <div className="flex flex-col">
              {results.map((u) => (
                <Link
                  key={u._id}
                  to={`/user/${u._id}`}
                  onClick={() => {
                    setIsOpen(false);
                    setQuery("");
                  }}
                  className="px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                >
                  <img src={u.avatar || "/avatar.png"} className="w-10 h-10 rounded-xl object-cover" alt="" />
                  <div className="overflow-hidden">
                    <p className="font-black text-xs text-gray-900 truncate tracking-tight">{u.name}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">@{u.email.split("@")[0]}</p>
                  </div>
                </Link>
              ))}
              <Link
                to="/explore"
                className="px-4 py-3 text-xs font-black text-primary hover:bg-gray-50 transition-colors border-t border-gray-50 text-center uppercase tracking-widest"
                onClick={() => setIsOpen(false)}
              >
                Show all results
              </Link>
            </div>
          ) : (
            <div className="p-4 text-center text-xs font-bold text-gray-400 italic">
              No results for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchBox;
