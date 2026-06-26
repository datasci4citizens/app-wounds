"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    console.error("Uncaught application error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-6 text-center">
      <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
        <AlertTriangle className="w-8 h-8 text-destructive" />
      </div>
      <h1 className="text-xl font-bold font-heading text-foreground mb-2">
        Algo deu errado
      </h1>
      <p className="text-sm text-muted-foreground mb-6 max-w-xs">
        Ocorreu um erro inesperado. Tente novamente.
      </p>
      <button
        onClick={reset}
        className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl active:scale-95 transition-transform"
      >
        Tentar novamente
      </button>
    </div>
  );
}
