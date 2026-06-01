"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createObservation } from "@/lib/api";
import { useUserStore } from "@/store/userStore";
import { ChevronLeft, Loader2 } from "lucide-react";
import { ObservationForm, ObservationFormData } from "@/components/ObservationForm";

function AddObservationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const woundId = searchParams.get("woundId");
  const { user } = useUserStore();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: ObservationFormData) => {
    if (!woundId) return;
    setError(null);
    setIsSubmitting(true);

    try {
      await createObservation(parseInt(woundId), formData);
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar observação');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!woundId) return null;

  return (
    <div className="flex flex-col min-h-screen bg-background items-center">
      <title>Nova Observação - Cicatrizando</title>
      <div className="w-full max-w-lg flex flex-col flex-1 relative">
        <header className="sticky top-0 z-10 flex items-center h-16 px-4 bg-background pt-safe">
          <button 
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-full hover:bg-muted active:bg-accent text-foreground transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h2 className="ml-2 font-bold text-foreground">Registrar Evolução</h2>
        </header>

        <main className="flex-1 px-6 py-4 no-scrollbar pb-10">
          <div className="mb-8 space-y-2">
            <h1 className="text-2xl font-bold font-heading text-foreground">
              Como está a ferida?
            </h1>
            <p className="text-sm text-muted-foreground">
              Descreva o estado atual para acompanhar a cicatrização.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm">
              {error}
            </div>
          )}

          <ObservationForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            authorRole={user?.role || null}
          />
        </main>
      </div>
    </div>
  );
}

export default function AddObservationPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-background"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <AddObservationContent />
    </Suspense>
  );
}
