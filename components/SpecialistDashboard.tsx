"use client";

import { useLogout } from "@/features/auth/useLogout";
import { LogOut, Plus, Briefcase, TrendingUp, ChevronLeft, Phone, Mail, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import type { Patient, UserProfile } from "@/lib/types";
import { useSpecialistNotifications } from "@/hooks/useSpecialistNotifications";
import { PatientList } from "@/components/PatientList";
import { useNavigationContext } from "@/store/navigationStore";

interface SpecialistDashboardProps {
  profile: UserProfile;
  patients: Patient[];
}

export function SpecialistDashboard({ profile, patients }: SpecialistDashboardProps) {
  const router = useRouter();
  const { logout } = useLogout();
  const setContext = useNavigationContext((s) => s.setContext);

  const {
    allWounds,
    newObservationsCount,
    patientNewObsMap,
    patientHasFever,
    patientWoundMap,
    isLoading: isNotifLoading,
    thresholdRef,
  } = useSpecialistNotifications(profile.id, patients);

  const metrics = useMemo(() => {
    const totalPatients = patients.length;
    let activeWounds = 0;
    allWounds.forEach((w) => { if (!w.is_healed) activeWounds++; });
    return { totalPatients, activeWounds };
  }, [patients, allWounds]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <title>Painel do Especialista - Cicatrizando</title>

      {isNotifLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
      <header className="sticky top-0 z-10 flex items-center justify-between px-5 pt-8 pb-4 bg-white dark:bg-card border-b border-border shadow-sm">
        <div className="flex flex-col">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-0.5">
            Painel do Especialista
          </span>
          <h1 className="text-2xl font-bold font-heading text-primary">Cicatrizando</h1>
        </div>
        <button onClick={logout} className="p-2 rounded-full bg-muted hover:bg-accent transition-colors active:scale-95" title="Sair">
          <LogOut className="w-5 h-5 text-foreground" />
        </button>
      </header>

      <main className="flex-1 px-5 py-6 space-y-5">
        <section>
          <h2 className="text-xl font-bold text-foreground">
            {profile.name ? `Olá, ${profile.name.split(' ')[0]}!` : "Olá!"}
          </h2>
          <p className="text-sm text-muted-foreground">Resumo dos seus pacientes e feridas.</p>
        </section>

        {/* Summary Stats */}
        <section className="bg-white dark:bg-card rounded-2xl shadow-sm border border-border p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-foreground">Resumo</h2>
              <p className="text-xs text-muted-foreground">Visão geral dos seus pacientes</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
              <div className="bg-primary/5 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-primary">{metrics.totalPatients}</p>
                <p className="text-[10px] font-bold uppercase text-muted-foreground leading-tight">Pacientes</p>
              </div>
              <div className="bg-status-warning/5 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-status-warning">{metrics.activeWounds}</p>
                <p className="text-[10px] font-bold uppercase text-muted-foreground leading-tight">Feridas ativas</p>
              </div>
              <div className="bg-status-success/5 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-status-success">{newObservationsCount}</p>
                <p className="text-[10px] font-bold uppercase text-muted-foreground leading-tight">Novas atualizações</p>
              </div>
            </div>
        </section>

        {/* Quick Action */}
        <section>
          <button
            onClick={() => router.push("/register-patient")}
            className="w-full flex items-center gap-3 p-4 bg-primary text-primary-foreground rounded-2xl shadow-sm hover:opacity-95 transition-opacity active:scale-[0.98]"
          >
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Plus className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="font-bold text-sm">Novo Paciente</p>
              <p className="text-xs opacity-80">Cadastrar novo paciente</p>
            </div>
            <ChevronLeft className="w-5 h-5 ml-auto rotate-180" />
          </button>
        </section>

        {/* Patient List */}
        <PatientList
          patients={patients}
          patientWoundMap={patientWoundMap}
          patientNewObsMap={patientNewObsMap}
          patientHasFever={patientHasFever}
          onViewWounds={(p) => {
            setContext({ specialistId: profile.id, threshold: thresholdRef.current });
            router.push(`/patient-wounds?id=${p.id}`);
          }}
          onEdit={(p) => router.push(`/update-patient?id=${p.id}`)}
        />

        {/* Professional Data */}
        {profile?.specialist && (
          <section className="bg-white dark:bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
              <div className="flex items-center gap-3">
                <Briefcase className="w-5 h-5 text-primary" />
                <h2 className="font-bold text-foreground">Dados Profissionais</h2>
              </div>
              <button
                onClick={() => router.push("/update-specialist")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all active:scale-95 text-xs font-bold"
              >
                <PencilIcon className="w-3 h-3" />
                <span>Editar</span>
              </button>
            </div>
            <div className="p-4 space-y-3">
              <InfoRow icon={<Briefcase className="w-4 h-4 text-primary" />} label="Registro Profissional" value={profile.specialist.professional_id} />
              <InfoRow icon={<Phone className="w-4 h-4 text-primary" />} label="Telefone" value={profile.specialist.contact_phone} />
              <InfoRow icon={<Mail className="w-4 h-4 text-primary" />} label="Email" value={profile.specialist.contact_email} />
            </div>
          </section>
        )}
      </main>
        </>
      )}
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | null | undefined }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-muted/5 rounded-xl border border-border/50">
      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-bold text-sm text-foreground">{value || "—"}</p>
      </div>
    </div>
  );
}

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
      <path d="m15 5 4 4"/>
    </svg>
  );
}
