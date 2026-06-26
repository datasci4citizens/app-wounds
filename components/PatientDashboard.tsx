"use client";

import { useLogout } from "@/features/auth/useLogout";
import { LogOut, User, Activity, Calendar, MapPin, Heart, List, Users, Pencil, ChevronLeft, Camera, Clock, ChevronDown, ChevronUp, Wind, Wine } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { PatientProfileReview } from "./PatientProfileReview";
import { fetchWounds } from "@/lib/api";
import type { Wound, UserProfile, Observation, AssignedSpecialist } from "@/lib/types";
import { formatDate, formatSmoking, formatAlcohol } from "@/lib/format";

interface PatientDashboardProps {
  profile: UserProfile;
}

const STALE_DAYS = 3;

export function PatientDashboard({ profile: initialProfile }: PatientDashboardProps) {
  const router = useRouter();
  const { logout } = useLogout();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(initialProfile);
  const [wounds, setWounds] = useState<Wound[]>([]);
  const [isLoadingWounds, setIsLoadingWounds] = useState(true);
  const [observationsCache, setObservationsCache] = useState<Record<number, Observation[]>>({});

  // Collapsible UI state
  const [showWoundPicker, setShowWoundPicker] = useState(false);

  const patient = profile.patient;

  useEffect(() => {
    const getWounds = async () => {
      try {
        const data = await fetchWounds();
        setWounds(data);
        data.forEach(async (w) => {
          try {
            const { fetchObservations } = await import("@/lib/api");
            const obs = await fetchObservations(w.id);
            setObservationsCache(prev => ({ ...prev, [w.id]: obs }));
          } catch { /* silently ignore */ }
        });
      } catch (err) {
        console.error("Error fetching wounds:", err);
      } finally {
        setIsLoadingWounds(false);
      }
    };
    getWounds();
  }, []);

  const activeWounds = useMemo(() => wounds.filter(w => !w.is_healed), [wounds]);
  const healedWounds = useMemo(() => wounds.filter(w => w.is_healed), [wounds]);

  const getLastObservation = (woundId: number) => {
    const obs = observationsCache[woundId];
    if (!obs || obs.length === 0) return null;
    return obs[0];
  };

  const isStale = (woundId: number) => {
    const last = getLastObservation(woundId);
    if (!last) return false;
    const daysSince = (Date.now() - new Date(last.created_at).getTime()) / (1000 * 60 * 60 * 24);
    return daysSince > STALE_DAYS;
  };

  const getLastObsText = (woundId: number) => {
    const last = getLastObservation(woundId);
    if (!last) return null;
    const days = Math.floor((Date.now() - new Date(last.created_at).getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return "Hoje";
    if (days === 1) return "Ontem";
    return `${days} dias`;
  };

  const handleRegisterEvolution = (woundId?: number) => {
    setShowWoundPicker(false);
    if (woundId) {
      router.push(`/add-observation?woundId=${woundId}`);
    }
  };

  if (isEditing) {
    return (
      <div className="relative min-h-screen bg-background">
        <header className="sticky top-0 z-20 flex items-center h-16 px-4 bg-background border-b border-border pt-safe">
          <button data-back-override onClick={() => setIsEditing(false)}
            className="p-2 -ml-2 rounded-full hover:bg-muted active:bg-accent text-foreground transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h2 className="ml-2 font-bold text-foreground">Editar Perfil</h2>
        </header>
        <PatientProfileReview
          profile={profile}
          title="Editar Perfil"
          description="Atualize suas informações de saúde e contato."
          submitLabel="Salvar Alterações"
          onComplete={() => { setIsEditing(false); window.location.reload(); }}
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
          <h1 className="text-2xl font-bold font-heading text-primary">Cicatrizando</h1>
        </div>
        <button onClick={logout} className="p-2 rounded-full bg-muted hover:bg-accent transition-colors active:scale-95" title="Sair">
          <LogOut className="w-5 h-5 text-foreground" />
        </button>
      </header>

      <main className="flex-1 px-5 py-6 space-y-5">

        {/* ─── Welcome ─── */}
        <section>
          <h2 className="text-xl font-bold text-foreground">
            {profile.name ? `Olá, ${profile.name}!` : "Olá!"}
          </h2>
        </section>

        {/* ─── Hero CTA: Registrar Evolução (with inline picker) ─── */}
        {activeWounds.length === 1 ? (
          <button
            onClick={() => handleRegisterEvolution(activeWounds[0].id)}
            className="w-full flex items-center gap-4 p-4 bg-primary text-primary-foreground rounded-2xl shadow-sm hover:opacity-95 transition-opacity active:scale-[0.98]"
          >
            <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="font-bold text-sm">Registrar Evolução</p>
              <p className="text-xs opacity-80">{activeWounds[0].etiology} · {activeWounds[0].location}</p>
            </div>
            <ChevronLeft className="w-5 h-5 ml-auto rotate-180" />
          </button>
        ) : activeWounds.length > 1 ? (
          <div>
            <button
              onClick={() => setShowWoundPicker(!showWoundPicker)}
              className="w-full flex items-center gap-4 p-4 bg-primary text-primary-foreground rounded-2xl shadow-sm hover:opacity-95 transition-opacity active:scale-[0.98]"
            >
              <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <Camera className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="font-bold text-sm">Registrar Evolução</p>
                <p className="text-xs opacity-80">Escolha qual ferida atualizar</p>
              </div>
              {showWoundPicker
                ? <ChevronUp className="w-5 h-5 ml-auto" />
                : <ChevronDown className="w-5 h-5 ml-auto" />
              }
            </button>

            {showWoundPicker && (
              <div className="mt-2 bg-white dark:bg-card rounded-2xl border border-border shadow-sm overflow-hidden animate-in slide-in-from-top-2 duration-200">
                {activeWounds.map(w => {
                  const stale = isStale(w.id);
                  const lastText = getLastObsText(w.id);
                  return (
                    <button
                      key={w.id}
                      onClick={() => handleRegisterEvolution(w.id)}
                      className="w-full flex items-center gap-3 p-4 hover:bg-muted/10 transition-colors active:bg-muted/20 border-b border-border last:border-0 text-left"
                    >
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${stale ? 'bg-status-warning' : 'bg-status-success'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">{w.etiology}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {w.location}{lastText ? ` · ${lastText}` : ''}
                        </p>
                      </div>
                      <ChevronLeft className="w-4 h-4 text-muted-foreground rotate-180 flex-shrink-0" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ) : null}

        {/* ─── Minhas Feridas ─── */}
        <button
          onClick={() => router.push("/patient-wounds")}
          className="w-full flex items-center gap-4 p-4 bg-white dark:bg-card rounded-2xl border border-border shadow-sm hover:bg-muted/10 transition-colors active:scale-[0.98]"
        >
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <List className="w-5 h-5 text-primary" />
          </div>
          <div className="text-left">
            <p className="font-bold text-sm text-foreground">Minhas Feridas</p>
            <p className="text-xs text-muted-foreground">Histórico completo das suas feridas</p>
          </div>
          <ChevronLeft className="w-5 h-5 ml-auto rotate-180 text-muted-foreground" />
        </button>

        {/* ─── Loading / Empty ─── */}
        {isLoadingWounds && (
          <div className="flex justify-center py-4">
            <Activity className="w-6 h-6 animate-pulse text-muted-foreground" />
          </div>
        )}
        {!isLoadingWounds && wounds.length === 0 && (
          <div className="bg-white dark:bg-card rounded-2xl shadow-sm border border-border p-8 text-center space-y-3">
            <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center mx-auto">
              <Activity className="w-7 h-7 text-muted-foreground opacity-50" />
            </div>
            <p className="font-bold text-foreground">Nenhuma ferida registrada</p>
            <p className="text-sm text-muted-foreground">
              Seu especialista irá registrar suas feridas aqui para acompanhamento.
            </p>
          </div>
        )}

        {/* ─── Health Profile ─── */}
        <section className="bg-white dark:bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-foreground">Perfil de Saúde</h2>
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
              <div className="grid grid-cols-2 gap-3">
                <MetricChip icon={<Activity className="w-3.5 h-3.5" />} label="Altura" value={patient?.height ? `${patient.height}m` : '—'} />
                <MetricChip icon={<Activity className="w-3.5 h-3.5" />} label="Peso" value={patient?.weight ? `${patient.weight}kg` : '—'} />
                <MetricChip icon={<Calendar className="w-3.5 h-3.5" />} label="Nascimento" value={formatDate(profile.birth_date)} />
                <MetricChip icon={<MapPin className="w-3.5 h-3.5" />} label="Localidade" value={profile.city && profile.state ? `${profile.city} - ${profile.state}` : profile.city || profile.state || '—'} />
                <MetricChip icon={<Wind className="w-3.5 h-3.5" />} label="Tabagismo" value={formatSmoking(patient?.smoking_status ?? null)} />
                <MetricChip icon={<Wine className="w-3.5 h-3.5" />} label="Álcool" value={formatAlcohol(patient?.alcohol_consumption ?? null)} />
              </div>
              <div className="pt-2 border-t border-border">
                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2 flex items-center gap-1">
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

        {/* ─── Specialists ─── */}
        {patient?.assigned_specialists && patient.assigned_specialists.length > 0 && (
          <section className="bg-white dark:bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
            <div className="flex items-center gap-3 p-4 border-b border-border bg-muted/30">
              <Users className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-foreground">Especialistas</h2>
            </div>
            <div className="p-4 space-y-3">
                {patient.assigned_specialists.map(s => (
                  <div key={s.id} className="flex items-center gap-3 p-3 border border-border rounded-xl bg-muted/5">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-foreground">{s.name}</p>
                      <p className="text-[10px] text-muted-foreground">Registro: {s.professional_id}</p>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        )}

        {patient?.assigned_specialists && patient.assigned_specialists.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-2">Você ainda não tem especialistas atribuídos.</p>
        )}
      </main>
    </div>
  );
}

/* ─── Sub-components ─── */

function MetricChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-muted/20 p-3 rounded-xl border border-border/40">
      <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-tight">{label}</span>
      </div>
      <p className="text-base font-bold text-foreground truncate">{value}</p>
    </div>
  );
}

function Badge({ label, code }: { label: string; code?: string }) {
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary border border-primary/20">
      {code && <span className="font-bold mr-1 opacity-70">[{code}]</span>}
      {label}
    </span>
  );
}
