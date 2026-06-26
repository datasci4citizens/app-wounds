"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Loader2 } from "lucide-react";
import { SpecialistDashboard } from "@/components/SpecialistDashboard";
import { PatientDashboard } from "@/components/PatientDashboard";
import { PatientProfileReview } from "@/components/PatientProfileReview";
import { useDashboardData } from "@/hooks/useDashboardData";

export default function AppHome() {
  const router = useRouter();
  const tokens = useAuthStore((state) => state.tokens);
  const { profile, patients, isLoading, error, refresh } = useDashboardData();

  // Wait for Zustand hydration (tokens may be null during SSR/hydration)
  if (!tokens) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6 text-center">
        <p className="text-destructive mb-4">{error}</p>
        <button
          onClick={() => router.push("/login")}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
        >
          Ir para Login
        </button>
      </div>
    );
  }

  if (!profile) return null;

  // Smart Registration Flow for Patients
  if (profile.role === "patient" && !profile.registration_complete) {
    return (
      <PatientProfileReview
        profile={profile}
        title="Complete seu Cadastro"
        description="Por favor, revise e complete as informações abaixo para começar a usar o aplicativo."
        submitLabel="Confirmar e Entrar"
        onComplete={refresh}
      />
    );
  }

  // Role Dispatcher
  if (profile.role === "specialist" && profile.registration_complete) {
    return <SpecialistDashboard profile={profile} patients={patients} />;
  }

  if (profile.role === "patient" && profile.registration_complete) {
    return <PatientDashboard profile={profile} />;
  }

  // Fallback
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6 text-center">
      <h1 className="text-2xl font-bold text-primary mb-2 text-center">Aguardando Aprovação</h1>
      <p className="text-muted-foreground mb-6">
        Sua conta está em análise ou aguardando vinculação por um especialista.
      </p>
      <button
        onClick={() => router.push("/login")}
        className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold"
      >
        Voltar para Login
      </button>
    </div>
  );
}
