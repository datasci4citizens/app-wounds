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
  const pinchZoomRef = useRef<any>(null);

  const onUpdate = useCallback(({ x, y, scale }: { x: number; y: number; scale: number }) => {
    if (imgRef.current) {
      const value = make3dTransformValue({ x, y, scale });
      imgRef.current.style.setProperty("transform", `translate(-50%, -50%) ${value}`);
    }
  }, []);

  const handleZoomIn = () => {
    if (pinchZoomRef.current) {
      pinchZoomRef.current.scaleTo({
        scale: pinchZoomRef.current.scale * 1.5,
        x: 0,
        y: 0,
      });
    }
  };

  const handleZoomOut = () => {
    if (pinchZoomRef.current) {
      pinchZoomRef.current.scaleTo({
        scale: pinchZoomRef.current.scale / 1.5,
        x: 0,
        y: 0,
      });
    }
  };

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
          ref={pinchZoomRef}
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

      {/* Zoom Controls Bar */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 p-2 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 z-[120] shadow-2xl">
          <button 
            onClick={handleZoomOut}
            className="p-4 bg-white/5 hover:bg-white/20 active:scale-90 text-white rounded-xl transition-all border border-white/10"
            title="Zoom Out"
          >
            <ZoomOut className="w-6 h-6" />
          </button>
          
          <div className="h-8 w-px bg-white/20 mx-1" />

          <button 
            onClick={handleZoomIn}
            className="p-4 bg-white/5 hover:bg-white/20 active:scale-90 text-white rounded-xl transition-all border border-white/10"
            title="Zoom In"
          >
            <ZoomIn className="w-6 h-6" />
          </button>
      </div>
    </div>
  );
}
