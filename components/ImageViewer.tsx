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
      // Prepend translate(-50%, -50%) to ensure centering is preserved 
      // even when the library applies its zoom/pan transforms
      imgRef.current.style.setProperty("transform", `translate(-50%, -50%) ${value}`);
    }
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black animate-in fade-in duration-200">
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
      <div className="flex-1 w-full overflow-hidden relative touch-none select-none">
        <QuickPinchZoom 
          onUpdate={onUpdate} 
          draggableUnZoomed={false}
          containerProps={{ 
            className: "w-full h-full" 
          }}
        >
          <div className="w-full h-full relative">
            <img
              ref={imgRef}
              src={src}
              alt="Wound Full View"
              draggable={false}
              style={{ transformOrigin: '0 0' }}
              className="absolute top-1/2 left-1/2 max-w-full max-h-full object-contain will-change-transform shadow-2xl"
            />
          </div>
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
