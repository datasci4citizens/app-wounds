"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, getAuthHeaders } from "@/store/authStore";
import { useLogout } from "@/features/auth/useLogout";
import { Loader2, LogOut, CheckCircle2, User, Briefcase, Plus, Users } from "lucide-react";

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
  const tokens = useAuthStore((state) => state.tokens);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);

  // Wait for Zustand to hydrate from localStorage
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    // Wait for hydration before checking tokens
    if (!isHydrated) return;

    // Redirect to login if no auth tokens
    if (!tokens?.access) {
      router.push("/login");
      return;
    }

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

        // Se for especialista, buscar a lista de pacientes
        if (data.role === 'specialist') {
          try {
            const patientsRes = await fetch(`${API_URL}/specialist/patients/`, {
              headers: getAuthHeaders(),
            });
            if (patientsRes.ok) {
              const patientsData = await patientsRes.json();
              setPatients(patientsData);
            }
          } catch (pErr) {
            console.error('Erro ao buscar pacientes:', pErr);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        console.error("Error fetching profile:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [router, tokens, isHydrated]);

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
          <>
            <section className="bg-white dark:bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-primary" />
                  <h2 className="font-bold text-foreground">Pacientes</h2>
                </div>
                <button
                  onClick={() => router.push("/register-patient")}
                  className="flex items-center gap-1 text-sm bg-primary text-primary-foreground px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Novo Paciente</span>
                </button>
              </div>
              <div className="p-4 flex flex-col items-center justify-center text-center py-4">
                {patients.length > 0 ? (
                  <div className="w-full text-left space-y-4">
                    {patients.map((p: any, idx: number) => (
                      <div key={idx} className="flex flex-col border border-border rounded-lg overflow-hidden">
                        <div className="bg-muted/50 p-3 border-b border-border">
                          <span className="font-bold text-foreground">{p.name || 'Paciente sem nome'}</span>
                        </div>
                        <div className="p-3 space-y-2">
                          <DataRow label="Email" value={p.contact_email} />
                          <DataRow label="Telefone" value={p.contact_phone} />
                          <DataRow label="Data Nasc." value={p.birth_date} />
                          <DataRow label="Localidade" value={`${p.city || ''} - ${p.state || ''}`} />
                          
                          <div className="pt-2 border-t border-border mt-2">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Dados Clínicos</p>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                              <DataRow label="Sexo" value={p.gender === 'M' ? 'Masc.' : p.gender === 'F' ? 'Fem.' : '—'} />
                              <DataRow label="Altura" value={p.height ? `${p.height}m` : '—'} />
                              <DataRow label="Peso" value={p.weight ? `${p.weight}kg` : '—'} />
                              <DataRow label="Fumante" value={formatSmoking(p.smoking_status)} />
                            </div>
                            <div className="mt-2">
                              <DataRow label="Álcool" value={formatAlcohol(p.alcohol_consumption)} />
                            </div>
                          </div>

                          <div className="pt-2 border-t border-border mt-2">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Comorbidades</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {p.comorbidities && p.comorbidities.length > 0 ? (
                                p.comorbidities.map((c: any) => (
                                  <Badge key={c.concept_id} label={c.name} />
                                ))
                              ) : (
                                <span className="text-xs text-muted-foreground italic">Nenhuma informada</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-4">
                    <p className="text-sm text-muted-foreground">
                      Nenhum paciente cadastrado ainda.
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Clique no botão acima para adicionar.
                    </p>
                  </div>
                )}
              </div>
            </section>

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
          </>
        )}

        {/* Raw JSON (for debugging) */}
        <section className="bg-muted/50 rounded-2xl p-4">
          <p className="text-xs font-mono text-muted-foreground mb-2">Raw API Response:</p>
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Profile:</p>
              <pre className="text-xs font-mono text-foreground overflow-x-auto whitespace-pre-wrap break-all bg-card/50 p-2 rounded border border-border">
                {JSON.stringify(profile, null, 2)}
              </pre>
            </div>
            {patients.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Patients:</p>
                <pre className="text-xs font-mono text-foreground overflow-x-auto whitespace-pre-wrap break-all bg-card/50 p-2 rounded border border-border">
                  {JSON.stringify(patients, null, 2)}
                </pre>
              </div>
            )}
          </div>
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

function Badge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary border border-primary/20">
      {label}
    </span>
  );
}

function formatSmoking(status: string | null) {
  switch (status) {
    case 'NEVER': return 'Nunca fumou';
    case 'LT10': return '< 10/dia';
    case 'GT10': return '> 10/dia';
    case 'EX': return 'Ex-fumante';
    default: return '—';
  }
}

function formatAlcohol(status: string | null) {
  if (!status) return '—';
  const maps: Record<string, string> = {
    'NONE': 'Não bebe',
    'EX': 'Ex-etilista',
    'LT21_M': '< 21 doses/sem (M)',
    'GT21_M': '> 21 doses/sem (M)',
    'LT13_M': '< 13 latas/sem (M)',
    'GT13_M': '> 13 latas/sem (M)',
    'LT14_F': '< 14 doses/sem (F)',
    'GT14_F': '> 14 doses/sem (F)',
    'LT9_F': '< 9 latas/sem (F)',
    'GT9_F': '> 9 latas/sem (F)',
  };
  return maps[status] || status;
}
