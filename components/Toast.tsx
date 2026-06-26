"use client";

import { useEffect, useState, useCallback } from "react";
import { CheckCircle2, X } from "lucide-react";

interface Toast {
  id: number;
  message: string;
}

let nextId = 0;
const listeners: Set<(toast: Toast) => void> = new Set();

export function toast(message: string) {
  const t: Toast = { id: nextId++, message };
  listeners.forEach((fn) => fn(t));
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [leaving, setLeaving] = useState<Set<number>>(new Set());

  const removeToast = useCallback((id: number) => {
    setLeaving((prev) => new Set(prev).add(id));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      setLeaving((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 300);
  }, []);

  const addToast = useCallback((t: Toast) => {
    setToasts((prev) => [...prev, t]);
    setTimeout(() => removeToast(t.id), 4000);
  }, [removeToast]);

  useEffect(() => {
    listeners.add(addToast);
    return () => { listeners.delete(addToast); };
  }, [addToast]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-2xl shadow-lg pointer-events-auto transition-all duration-300 ${
            leaving.has(t.id)
              ? "opacity-0 translate-y-2 scale-95"
              : "opacity-100 translate-y-0 scale-100 animate-in slide-in-from-top-4 fade-in"
          }`}
        >
          <CheckCircle2 className="w-5 h-5 text-status-success flex-shrink-0" />
          <p className="text-sm font-medium text-foreground flex-1">{t.message}</p>
          <button
            onClick={() => removeToast(t.id)}
            className="p-1 -mr-1 rounded-full hover:bg-muted transition-colors flex-shrink-0"
          >
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
      ))}
    </div>
  );
}
