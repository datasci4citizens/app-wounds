"use client";

import { useLogout } from "@/features/auth/useLogout";
import { LogOut, User, Activity, Calendar, MapPin, Heart, List, Users, Pencil, ChevronLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PatientProfileReview } from "./PatientProfileReview";
import { fetchWounds, Wound } from "@/lib/api";

interface SpecialistData {
  id: number;
  name: string;
  professional_id: string;
  contact_phone: string;
  contact_email: string;
}

interface PatientData {
  id: number;
  name: string;
  birth_date: string | null;
  state: string | null;
  city: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  gender: string | null;
  height: string | null;
  weight: string | null;
  smoking_status: string | null;
  alcohol_consumption: string | null;
  assigned_specialists: SpecialistData[];
  comorbidities: Array<{ concept_id: string; code: string; name: string }>;
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
  patient?: PatientData | null;
}

interface PatientDashboardProps {
  profile: UserProfile;
}

export function PatientDashboard({ profile: initialProfile }: PatientDashboardProps) {
  const router = useRouter();
  const { logout } = useLogout();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(initialProfile);
  const [wounds, setWounds] = useState<Wound[]>([]);
  const [isLoadingWounds, setIsLoadingWounds] = useState(true);
  const patient = profile.patient;

  useEffect(() => {
    const getWounds = async () => {
      try {
        const data = await fetchWounds();
        setWounds(data);
      } catch (err) {
        console.error("Error fetching wounds:", err);
      } finally {
        setIsLoadingWounds(false);
      }
    };
    getWounds();
  }, []);

  if (isEditing) {
    return (
      <div className="relative min-h-screen bg-background">
        <header className="sticky top-0 z-20 flex items-center h-16 px-4 bg-background border-b border-border pt-safe">
          <button
            data-back-override
            onClick={() => setIsEditing(false)}
            className="p-2 -ml-2 rounded-full hover:bg-muted active:bg-accent text-foreground transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h2 className="ml-2 font-bold text-foreground">Editar Perfil</h2>
        </header>
        <PatientProfileReview
          profile={profile}
          title="Editar Perfil"
          description="Atualize suas informações de saúde e contato."
          submitLabel="Salvar Alterações"
          onComplete={() => {
            setIsEditing(false);
            window.location.reload();
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <title>Painel do Paciente - Cicatrizando</title>

      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-5 pt-8 pb-4 bg-white dark:bg-card border-b border-border shadow-sm">
        <div className="flex flex-col">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-0.5">
            Painel do Paciente
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

        {/* Welcome Section */}
        <section>
          <h2 className="text-xl font-bold text-foreground">
            {profile.name ? `Olá, ${profile.name}!` : "Olá!"}
          </h2>
          <p className="text-sm text-muted-foreground">Acompanhe aqui o estado das suas feridas e seu perfil de saúde.</p>
        </section>

        <section className="bg-white dark:bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-foreground">Meu Perfil de Saúde</h2>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all active:scale-95 text-xs font-bold"
            >
              <Pencil className="w-3 h-3" />
              <span>Editar</span>
            </button>
          </div>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <MetricCard icon={<Activity className="w-4 h-4" />} label="Altura" value={patient?.height ? `${patient.height}m` : '—'} />
              <MetricCard icon={<Activity className="w-4 h-4" />} label="Peso" value={patient?.weight ? `${patient.weight}kg` : '—'} />
              <MetricCard icon={<Calendar className="w-4 h-4" />} label="Nascimento" value={profile.birth_date || '—'} />
              <MetricCard icon={<MapPin className="w-4 h-4" />} label="Cidade" value={profile.city || '—'} />
            </div>

            <div className="pt-2 border-t border-border">
              <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Hábitos</p>
              <div className="space-y-2">
                <DataRow label="Tabagismo" value={formatSmoking(patient?.smoking_status || null)} />
                <DataRow label="Consumo de álcool" value={formatAlcohol(patient?.alcohol_consumption || null)} />
              </div>
            </div>

            <div className="pt-2 border-t border-border">
              <p className="text-xs font-bold text-muted-foreground uppercase mb-2 flex items-center gap-1">
                <Heart className="w-3 h-3 text-status-error" /> Comorbidades
              </p>
              <div className="flex flex-wrap gap-2">
                {patient?.comorbidities && patient.comorbidities.length > 0 ? (
                  patient.comorbidities.map(c => (
                    <Badge key={c.concept_id} label={c.name} code={c.code} />
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground italic">Nenhuma informada.</p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Specialists Card */}
        <section className="bg-white dark:bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="flex items-center gap-3 p-4 border-b border-border bg-muted/30">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-foreground">Especialistas Acompanhando</h2>
          </div>
          <div className="p-4 space-y-3">
            {patient?.assigned_specialists && patient.assigned_specialists.length > 0 ? (
              patient.assigned_specialists.map(s => (
                <div key={s.id} className="p-3 border border-border rounded-xl bg-muted/10">
                  <p className="font-bold text-primary">{s.name}</p>
                  <p className="text-xs text-muted-foreground">Reg: {s.professional_id}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground italic">Você ainda não tem especialistas atribuídos.</p>
            )}
          </div>
        </section>

        {/* Wounds List */}
        <section className="bg-white dark:bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="flex items-center gap-3 p-4 border-b border-border bg-muted/30">
            <List className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-foreground">Minhas Feridas</h2>
          </div>
          <div className="p-4 space-y-4">
            {isLoadingWounds ? (
              <div className="flex justify-center py-8">
                <Activity className="w-6 h-6 animate-pulse text-muted-foreground" />
              </div>
            ) : wounds.length > 0 ? (
              <div className="space-y-3">
                {wounds.map(w => (
                  <div
                    key={w.id}
                    onClick={() => router.push(`/wound-detail?id=${w.id}`)}
                    className="p-4 border border-border rounded-xl bg-card hover:bg-muted/10 transition-colors active:scale-[0.99] cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-primary">{w.etiology}</h3>
                      {w.is_healed ? (
                        <span className="text-[10px] bg-status-success/10 text-status-success px-2 py-0.5 rounded-full font-bold uppercase">Cicatrizada</span>
                      ) : (
                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase">Em Tratamento</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{w.location}</span>
                    </div>
                    <div className="mt-3 flex justify-end">
                      <span className="text-xs font-bold text-primary flex items-center gap-1">
                        Ver Detalhes <ChevronLeft className="w-3 h-3 rotate-180" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center space-y-2">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto opacity-50">
                  <Activity className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="font-medium text-foreground">Nenhuma ferida registrada</p>
                <p className="text-xs text-muted-foreground">Seu especialista irá registrar suas feridas aqui para acompanhamento.</p>
              </div>
            )}
          </div>
        </section>

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
          </div>
        </section>

      </main>
    </div>
  );
}

function MetricCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-muted/20 p-3 rounded-xl border border-border/50">
      <div className="flex items-center gap-2 text-muted-foreground mb-1">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-tight">{label}</span>
      </div>
      <p className="text-lg font-bold text-primary">{value}</p>
    </div>
  );
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

function Badge({ label, code }: { label: string, code?: string }) {
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary border border-primary/20">
      {code && <span className="font-bold mr-1 opacity-70">[{code}]</span>}
      {label}
    </span>
  );
}

function formatSmoking(status: string | null) {
  switch (status) {
    case 'NEVER': return 'Não tabagista';
    case 'LT10': return 'Menos de 10 cigarros/dia';
    case 'GT10': return 'Mais de 10 cigarros/dia';
    case 'EX': return 'Ex-tabagista';
    default: return '—';
  }
}

function formatAlcohol(status: string | string[] | null) {
  if (!status || (Array.isArray(status) && status.length === 0)) return '—';
  
  const maps: Record<string, string> = {
    'NONE': 'Não bebe',
    'EX': 'Ex-etilista',
    'LT21_M': 'Menos de 21 doses/sem',
    'GT21_M': 'Mais de 21 doses/sem',
    'LT13_M': 'Menos de 13 latas/sem',
    'GT13_M': 'Mais de 13 latas/sem',
    'LT14_F': 'Menos de 14 doses/sem',
    'GT14_F': 'Mais de 14 doses/sem',
    'LT9_F': 'Menos de 9 latas/sem',
    'GT9_F': 'Mais de 9 latas/sem',
  };

  if (Array.isArray(status)) {
    return status.map(s => maps[s] || s).join(', ');
  }

  return maps[status] || status;
}
