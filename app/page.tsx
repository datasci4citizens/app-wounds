"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuthHeaders } from "@/store/authStore";
import { useLogout } from "@/features/auth/useLogout";
import { Loader2, LogOut, CheckCircle2, User, Briefcase } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface SpecialistData {
  id: number;
  professional_id: string;
  contact_phone: string;
  contact_email: string;
}

interface UserProfile {
  id: number;
  email: string;
  name: string | null;
  birth_date: string | null;
  state: string | null;
  city: string | null;
  role: string | null;
  registration_complete: boolean;
  specialist: SpecialistData | null;
}

export default function AppHome() {
  const router = useRouter();
  const { logout } = useLogout();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${API_URL}/auth/me/`, {
          method: "GET",
          headers: getAuthHeaders(),
        });

        if (!response.ok) {
          if (response.status === 401) {
            // Unauthorized - redirect to login
            router.push("/login");
            return;
          }
          throw new Error(`Failed to fetch profile (${response.status})`);
        }

        const data: UserProfile = await response.json();
        setProfile(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        console.error("Error fetching profile:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6">
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

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-5 pt-8 pb-4 bg-white dark:bg-card border-b border-border shadow-sm">
        <div className="flex flex-col">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-0.5">
            Painel do Especialista
          </span>
          <h1 className="text-2xl font-bold font-heading text-primary">
            Cicatrizando
          </h1>
        </div>
        <button
          onClick={logout}
          className="p-2 rounded-full bg-muted hover:bg-accent transition-colors active:scale-95"
          title="Sair"
        >
          <LogOut className="w-5 h-5 text-foreground" />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-5 py-6 space-y-6">
        {/* Success Banner */}
        <div className="flex items-center gap-3 p-4 bg-status-success/10 border border-status-success/20 rounded-2xl">
          <CheckCircle2 className="w-6 h-6 text-status-success flex-shrink-0" />
          <div>
            <p className="font-bold text-foreground">Cadastro completo!</p>
            <p className="text-sm text-muted-foreground">
              Seus dados foram salvos com sucesso.
            </p>
          </div>
        </div>

        {/* User Profile Card */}
        <section className="bg-white dark:bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="flex items-center gap-3 p-4 border-b border-border bg-muted/30">
            <User className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-foreground">Dados Pessoais</h2>
          </div>
          <div className="p-4 space-y-3">
            <DataRow label="ID" value={profile?.id?.toString()} />
            <DataRow label="Email" value={profile?.email} />
            <DataRow label="Nome" value={profile?.name} />
            <DataRow label="Data de Nascimento" value={profile?.birth_date} />
            <DataRow label="Estado" value={profile?.state} />
            <DataRow label="Cidade" value={profile?.city} />
            <DataRow label="Perfil" value={profile?.role === "specialist" ? "Especialista" : profile?.role} />
            <DataRow 
              label="Cadastro Completo" 
              value={profile?.registration_complete ? "Sim" : "Não"} 
              highlight={profile?.registration_complete}
            />
          </div>
        </section>

        {/* Specialist Data Card */}
        {profile?.specialist && (
          <section className="bg-white dark:bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
            <div className="flex items-center gap-3 p-4 border-b border-border bg-muted/30">
              <Briefcase className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-foreground">Dados Profissionais</h2>
            </div>
            <div className="p-4 space-y-3">
              <DataRow label="ID Especialista" value={profile.specialist.id?.toString()} />
              <DataRow label="Registro Profissional" value={profile.specialist.professional_id} />
              <DataRow label="Telefone" value={profile.specialist.contact_phone || "—"} />
              <DataRow label="Email Profissional" value={profile.specialist.contact_email || "—"} />
            </div>
          </section>
        )}

        {/* Raw JSON (for debugging) */}
        <section className="bg-muted/50 rounded-2xl p-4">
          <p className="text-xs font-mono text-muted-foreground mb-2">Raw API Response:</p>
          <pre className="text-xs font-mono text-foreground overflow-x-auto whitespace-pre-wrap break-all">
            {JSON.stringify(profile, null, 2)}
          </pre>
        </section>
      </main>
    </div>
  );
}

function DataRow({ 
  label, 
  value, 
  highlight = false 
}: { 
  label: string; 
  value: string | null | undefined;
  highlight?: boolean;
}) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm font-medium ${highlight ? "text-status-success" : "text-foreground"}`}>
        {value || "—"}
      </span>
    </div>
  );
}
