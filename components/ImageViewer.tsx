"use client";

import React from "react";
import { TransformWrapper, TransformComponent, useTransformContext } from "react-zoom-pan-pinch";
import { X, ZoomIn, ZoomOut, Maximize, RotateCcw } from "lucide-react";

interface ImageViewerProps {
  src: string;
  onClose: () => void;
}

export function ImageViewer({ src, onClose }: ImageViewerProps) {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-16 shrink-0 z-[110]">
        <div className="flex items-center gap-2 text-white/70">
            <Maximize className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Visualização Clínica</span>
        </div>
        <button 
          onClick={onClose}
          className="p-2 bg-white/10 hover:bg-white/20 active:scale-90 text-white rounded-full transition-all"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Zoom Area */}
      <div className="flex-1 w-full overflow-hidden flex items-center justify-center relative touch-none select-none">
        <TransformWrapper
          initialScale={1}
          centerOnInit={true}
          minScale={1}
          maxScale={8}
        >
          {({ zoomIn, zoomOut, resetTransform }: any) => (
            <>
              <TransformComponent 
                wrapperClass="!w-full !h-full" 
                contentClass="!w-full !h-full flex items-center justify-center"
              >
                <div className="w-screen h-full flex items-center justify-center">
                  <img
                    src={src}
                    alt="Wound Full View"
                    draggable={false}
                    className="max-w-full max-h-full object-contain shadow-2xl pointer-events-auto"
                  />
                </div>
              </TransformComponent>

              {/* Zoom Controls Bar - Dark Glassmorphism */}
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 bg-zinc-900/60 backdrop-blur-2xl rounded-3xl border border-white/10 z-[120] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                <button 
                  type="button"
                  onClick={() => zoomOut()}
                  className="p-4 bg-white/5 hover:bg-white/10 active:bg-white/20 text-white/90 rounded-2xl transition-all border border-white/5"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-6 h-6" />
                </button>
                
                <button 
                  type="button"
                  onClick={() => resetTransform()}
                  className="p-4 bg-white/5 hover:bg-white/10 active:bg-white/20 text-white/90 rounded-2xl transition-all border border-white/5"
                  title="Reset"
                >
                  <RotateCcw className="w-6 h-6" />
                </button>

                <button 
                  type="button"
                  onClick={() => zoomIn()}
                  className="p-4 bg-white/5 hover:bg-white/10 active:bg-white/20 text-white/90 rounded-2xl transition-all border border-white/5"
                  title="Zoom In"
                >
                  <ZoomIn className="w-6 h-6" />
                </button>
              </div>
            </>
          )}
        </TransformWrapper>
      </div>
      
      {/* Footer hint */}
      <div className="p-6 text-center shrink-0 opacity-40">
          <p className="text-[10px] text-white uppercase font-medium tracking-widest leading-relaxed">
            Aperte os botões para zoom • Arraste para mover
          </p>
      </div>
    </div>
  );
}
