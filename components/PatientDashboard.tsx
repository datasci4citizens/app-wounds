"use client";

import { useLogout } from "@/features/auth/useLogout";
import { LogOut, User, Activity, Calendar, MapPin, Heart, List } from "lucide-react";

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

export function PatientDashboard({ profile }: PatientDashboardProps) {
  const { logout } = useLogout();
  const patient = profile.patient;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <title>Minha Saúde - Cicatrizando</title>
      
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-5 pt-8 pb-4 bg-white dark:bg-card border-b border-border shadow-sm">
        <div className="flex flex-col">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-0.5">
            Minha Saúde
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
          <h2 className="text-xl font-bold text-foreground">Olá, {profile.name}!</h2>
          <p className="text-sm text-muted-foreground">Acompanhe aqui o estado das suas feridas e seu perfil de saúde.</p>
        </section>

        {/* Health Profile Card */}
        <section className="bg-white dark:bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="flex items-center gap-3 p-4 border-b border-border bg-muted/30">
            <User className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-foreground">Meu Perfil de Saúde</h2>
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
                    <DataRow label="Fumante" value={formatSmoking(patient?.smoking_status || null)} />
                    <DataRow label="Álcool" value={formatAlcohol(patient?.alcohol_consumption || null)} />
                </div>
            </div>

            <div className="pt-2 border-t border-border">
                <p className="text-xs font-bold text-muted-foreground uppercase mb-2 flex items-center gap-1">
                    <Heart className="w-3 h-3 text-status-error" /> Comorbidades
                </p>
                <div className="flex flex-wrap gap-2">
                    {patient?.comorbidities && patient.comorbidities.length > 0 ? (
                        patient.comorbidities.map(c => (
                            <Badge key={c.concept_id} label={c.name} />
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
                        <div className="mt-2 text-sm">
                            <p>{s.contact_email}</p>
                            <p>{s.contact_phone}</p>
                        </div>
                    </div>
                 ))
             ) : (
                 <p className="text-sm text-muted-foreground italic">Você ainda não tem especialistas atribuídos.</p>
             )}
          </div>
        </section>

        {/* Timeline Placeholder */}
        <section className="bg-white dark:bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="flex items-center gap-3 p-4 border-b border-border bg-muted/30">
            <List className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-foreground">Linha do Tempo de Feridas</h2>
          </div>
          <div className="p-8 text-center space-y-2">
             <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto opacity-50">
                <Activity className="w-6 h-6 text-muted-foreground" />
             </div>
             <p className="font-medium text-foreground">Nenhuma observação ainda</p>
             <p className="text-xs text-muted-foreground">Quando você ou seu especialista registrarem o estado de uma ferida, ela aparecerá aqui.</p>
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

function Badge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary border border-primary/20">
      {label}
    </span>
  );
}

function formatSmoking(status: string | null) {
    switch (status) {
      case 'NEVER': return 'Nunca fumou';
      case 'LT10': return 'Menos de 10 cigarros/dia';
      case 'GT10': return 'Mais de 10 cigarros/dia';
      case 'EX': return 'Ex-tabagista';
      default: return '—';
    }
}

function formatAlcohol(status: string | null) {
    if (!status) return '—';
    const maps: Record<string, string> = {
      'NONE': 'Não bebe',
      'EX': 'Ex-etilista',
      'LT21_M': 'Menos de 21 doses/sem (H)',
      'GT21_M': 'Mais de 21 doses/sem (H)',
      'LT13_M': 'Menos de 13 latas/sem (H)',
      'GT13_M': 'Mais de 13 latas/sem (H)',
      'LT14_F': 'Menos de 14 doses/sem (M)',
      'GT14_F': 'Mais de 14 doses/sem (M)',
      'LT9_F': 'Menos de 9 latas/sem (M)',
      'GT9_F': 'Mais de 9 latas/sem (M)',
    };
    return maps[status] || status;
}
