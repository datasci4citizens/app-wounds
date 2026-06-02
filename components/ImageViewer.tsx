"use client";

import React, { useCallback, useRef } from "react";
import QuickPinchZoom, { make3dTransformValue } from "react-quick-pinch-zoom";
import { X, ZoomIn, ZoomOut, Maximize } from "lucide-react";

interface ImageViewerProps {
  src: string;
  onClose: () => void;
}

export function ImageViewer({ src, onClose }: ImageViewerProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const onUpdate = useCallback(({ x, y, scale }: { x: number; y: number; scale: number }) => {
    if (imgRef.current) {
      const value = make3dTransformValue({ x, y, scale });
      imgRef.current.style.setProperty("transform", value);
    }
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black/95 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-16 shrink-0 z-[110]">
        <div className="flex items-center gap-2 text-white/70">
            <Maximize className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Visualização</span>
        </div>
        <button 
          onClick={onClose}
          className="p-2 bg-white/10 hover:bg-white/20 active:scale-90 text-white rounded-full transition-all"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Zoom Area */}
      <div className="flex-1 w-full overflow-hidden flex items-center justify-center relative touch-none">
        <QuickPinchZoom onUpdate={onUpdate} containerProps={{ className: "w-full h-full flex items-center justify-center" }}>
          <img
            ref={imgRef}
            src={src}
            alt="Wound Full View"
            className="max-w-full max-h-full object-contain will-change-transform"
          />
        </QuickPinchZoom>
      </div>

      {/* Footer Info */}
      <div className="p-6 text-center shrink-0">
          <p className="text-[10px] text-white/40 uppercase font-medium tracking-widest">
            Use dois dedos para dar zoom ou clique e arraste
          </p>
      </div>
    </div>
  );
}
