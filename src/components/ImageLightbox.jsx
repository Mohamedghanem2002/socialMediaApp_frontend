import React, { useEffect } from "react";
import { X, ZoomIn, ZoomOut, Download, RotateCcw } from "lucide-react";

function ImageLightbox({ imageUrl, onClose }) {
  // Prevent background scrolling when lightbox is open
  useEffect(() => {
    if (imageUrl) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [imageUrl]);

  if (!imageUrl) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center animate-in fade-in duration-300">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/95 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Close Button */}
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all duration-300 z-10 group active:scale-95"
      >
        <X size={28} className="group-hover:rotate-90 transition-transform duration-500" />
      </button>

      {/* Image Container */}
      <div className="relative w-full h-full flex items-center justify-center p-4 md:p-12 animate-in zoom-in-95 duration-500">
        <img 
          src={imageUrl} 
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl transition-transform duration-500 ease-out select-none"
          alt="Zoomed content"
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image itself
        />
        
        {/* Helper Badge */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-6 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-3 animate-in slide-in-from-bottom-4 duration-700">
            <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Click background to close</span>
        </div>
      </div>
    </div>
  );
}

export default ImageLightbox;
