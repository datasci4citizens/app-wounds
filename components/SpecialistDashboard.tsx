"use client";

import { useLogout } from "@/features/auth/useLogout";
import { LogOut, User, Users, Plus, Briefcase, Activity, TrendingUp, Phone, Mail, ChevronLeft, Pencil, Loader2, Bell, Search, Calendar, Ruler, Weight, Wind, Wine, MapPin, Thermometer } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo, useRef } from "react";
import { fetchWounds, fetchObservations } from "@/lib/api";
import type { Wound, Observation, Patient, UserProfile, Comorbidity } from "@/lib/types";
import { calculateAge, formatGender, formatSmoking, formatAlcohol } from "@/lib/format";

const LS_LAST_CHECK_PREFIX = "specialist_last_check_";
const LS_PATIENT_SEEN_PREFIX = "specialist_seen_patient_";

interface SpecialistDashboardProps {
  profile: UserProfile;
  patients: Patient[];
}

export function SpecialistDashboard({ profile, patients }: SpecialistDashboardProps) {
  const router = useRouter();
  const { logout } = useLogout();

  const [allWounds, setAllWounds] = useState<Wound[]>([]);
  const [isLoadingWounds, setIsLoadingWounds] = useState(true);
  const [newObservationsCount, setNewObservationsCount] = useState(0);
  const [isCountingUpdates, setIsCountingUpdates] = useState(true);
  const [patientNewObsMap, setPatientNewObsMap] = useState<Record<number, number>>({});
  const [patientHasFever, setPatientHasFever] = useState<Record<number, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");

  const storageKey = `${LS_LAST_CHECK_PREFIX}${profile.id}`;
  const thresholdRef = useRef<string>("");

  /* ─── Load last-check timestamp & fetch everything ─── */
  useEffect(() => {
    if (patients.length === 0) {
      setIsLoadingWounds(false);
      setIsCountingUpdates(false);
      return;
    }

    // Detect if this mount is a page refresh (preserve count)
    const navEntry = performance.getEntriesByType?.("navigation")?.[0] as PerformanceNavigationTiming | undefined;
    const isReload = navEntry?.type === "reload";

    const loadAll = async () => {
      /* 1. Fetch all wounds */
      const results = await Promise.allSettled(
        patients.map((p) => fetchWounds(p.id))
      );
      const wounds: Wound[] = [];
      results.forEach((r) => {
        if (r.status === "fulfilled") wounds.push(...r.value);
      });
      setAllWounds(wounds);
      setIsLoadingWounds(false);

      /* 2. Read the last-seen timestamp */
      const raw = typeof window !== "undefined"
        ? localStorage.getItem(storageKey)
        : null;

      let lastCheck: Date;
      if (!raw) {
        // First visit ever — set baseline to now, count = 0
        lastCheck = new Date();
        if (typeof window !== "undefined") {
          localStorage.setItem(storageKey, lastCheck.toISOString());
        }
      } else {
        lastCheck = new Date(raw);
      }
      thresholdRef.current = lastCheck.toISOString();

      /* 3. Fetch observations for ALL wounds (active + healed) */
      const obsResults = await Promise.allSettled(
        wounds.map(w => fetchObservations(w.id))
      );

      /* 4. Count new observations — total + per-patient */
      let totalNew = 0;
      const perPatient: Record<number, number> = {};
      const feverMap: Record<number, boolean> = {};

      const woundPatientMap: Record<number, number> = {};
      wounds.forEach(w => { woundPatientMap[w.id] = w.patient; });

      wounds.forEach((w, idx) => {
        const r = obsResults[idx];
        if (r.status !== "fulfilled") return;
        const patientId = woundPatientMap[w.id];

        // Per-patient + per-wound dismissal timestamps override global lastCheck
        const patientSeenRaw = typeof window !== "undefined"
          ? localStorage.getItem(`${LS_PATIENT_SEEN_PREFIX}${profile.id}_${patientId}`)
          : null;
        const woundSeenRaw = typeof window !== "undefined"
          ? localStorage.getItem(`specialist_seen_wound_${profile.id}_${w.id}`)
          : null;
        const threshold = new Date(Math.max(
          lastCheck.getTime(),
          patientSeenRaw ? new Date(patientSeenRaw).getTime() : 0,
          woundSeenRaw ? new Date(woundSeenRaw).getTime() : 0
        ));

        r.value.forEach((obs: Observation) => {
          if (new Date(obs.created_at) > threshold) {
            totalNew++;
            perPatient[patientId] = (perPatient[patientId] || 0) + 1;
            if (obs.fever_24h) {
              feverMap[patientId] = true;
            }
          }
        });
      });

      setNewObservationsCount(totalNew);
      setPatientNewObsMap(perPatient);
      setPatientHasFever(feverMap);

      /* 5. Store arrival time ONLY if this isn't a refresh */
      if (typeof window !== "undefined" && !isReload) {
        localStorage.setItem(storageKey, new Date().toISOString());
      }
      setIsCountingUpdates(false);
    };

    loadAll();
  }, [patients, storageKey]);

  /* ─── Derived metrics ─── */
  const metrics = useMemo(() => {
    const totalPatients = patients.length;

    let activeWounds = 0;
    allWounds.forEach((w) => {
      if (!w.is_healed) activeWounds++;
    });

    return { totalPatients, activeWounds };
  }, [patients, allWounds]);

  /* ─── Per-patient wound counts ─── */
  const patientWoundMap = useMemo(() => {
    const map: Record<number, { total: number; active: number; healed: number }> = {};
    patients.forEach((p) => {
      map[p.id] = { total: 0, active: 0, healed: 0 };
    });
    allWounds.forEach((w) => {
      if (map[w.patient]) {
        map[w.patient].total++;
        if (w.is_healed) {
          map[w.patient].healed++;
        } else {
          map[w.patient].active++;
        }
      }
    });
    return map;
  }, [patients, allWounds]);

  /* ─── Sort + filter patients ─── */
  const filteredPatients = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    let list = [...patients].sort((a, b) => {
      // Fever patients first (highest priority)
      const aFever = patientHasFever[a.id] ? 1 : 0;
      const bFever = patientHasFever[b.id] ? 1 : 0;
      if (aFever !== bFever) return bFever - aFever;
      // Then patients with new observations
      const aNew = patientNewObsMap[a.id] || 0;
      const bNew = patientNewObsMap[b.id] || 0;
      if (aNew !== bNew) return bNew - aNew;
      // Then by active wounds
      const aActive = patientWoundMap[a.id]?.active || 0;
      const bActive = patientWoundMap[b.id]?.active || 0;
      if (aActive !== bActive) return bActive - aActive;
      // Then alphabetically
      return (a.name || '').localeCompare(b.name || '');
    });

    if (query) {
      list = list.filter((p) =>
        (p.name || '').toLowerCase().includes(query)
      );
    }

    return list;
  }, [patients, patientWoundMap, patientNewObsMap, patientHasFever, searchQuery]);

  const isLoading = isLoadingWounds || isCountingUpdates;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <title>Painel do Especialista - Cicatrizando</title>

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
      <main className="flex-1 px-5 py-6 space-y-5">

        {/* Welcome */}
        <section>
          <h2 className="text-xl font-bold text-foreground">
            {profile.name ? `Olá, ${profile.name}!` : "Olá!"}
          </h2>
          <p className="text-sm text-muted-foreground">Resumo dos seus pacientes e feridas.</p>
        </section>

        {/* ──────────── Summary Stats ──────────── */}
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
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
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
          )}
        </section>

        {/* ──────────── Quick Action ──────────── */}
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

        {/* ──────────── Patient List ──────────── */}
        <section className="bg-white dark:bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="flex items-center gap-3 p-4 border-b border-border bg-muted/30">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-foreground">Meus Pacientes</h2>
            <span className="ml-auto text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {patients.length}
            </span>
          </div>

          {/* Search bar */}
          <div className="px-4 pt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar paciente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-4 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                >
                  Limpar
                </button>
              )}
            </div>
            {searchQuery && (
              <p className="text-[10px] text-muted-foreground mt-2 ml-1">
                {filteredPatients.length} de {patients.length} paciente{patients.length !== 1 ? 's' : ''} encontrado{filteredPatients.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          <div className="p-4">
            {filteredPatients.length > 0 ? (
              <div className="space-y-3">
                {filteredPatients.map((p) => (
                  <PatientCard
                    key={p.id}
                    patient={p}
                    woundCounts={patientWoundMap[p.id] || { total: 0, active: 0, healed: 0 }}
                    newObsCount={patientNewObsMap[p.id] || 0}
                    hasFever={patientHasFever[p.id] || false}
                    onViewWounds={() => {
                      router.push(`/patient-wounds?id=${p.id}&specialistId=${profile.id}&since=${encodeURIComponent(thresholdRef.current)}`);
                    }}
                    onEdit={() => router.push(`/update-patient?id=${p.id}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="py-8 text-center space-y-2">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <Search className="w-6 h-6 text-muted-foreground opacity-50" />
                </div>
                <p className="font-medium text-foreground">
                  {searchQuery ? "Nenhum paciente encontrado" : "Nenhum paciente cadastrado"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {searchQuery ? "Tente outro termo de busca." : "Comece adicionando seu primeiro paciente."}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ──────────── Professional Data ──────────── */}
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
                <Pencil className="w-3 h-3" />
                <span>Editar</span>
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-3 p-3 bg-muted/5 rounded-xl border border-border/50">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Registro Profissional</p>
                  <p className="font-bold text-sm text-foreground">{profile.specialist.professional_id || "—"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/5 rounded-xl border border-border/50">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Telefone</p>
                  <p className="font-bold text-sm text-foreground">{profile.specialist.contact_phone || "—"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/5 rounded-xl border border-border/50">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-bold text-sm text-foreground">{profile.specialist.contact_email || "—"}</p>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

/* ─── Patient Card ─── */

function PatientCard({
  patient,
  woundCounts,
  newObsCount,
  hasFever,
  onViewWounds,
  onEdit,
}: {
  patient: Patient;
  woundCounts: { total: number; active: number; healed: number };
  newObsCount: number;
  hasFever: boolean;
  onViewWounds: () => void;
  onEdit: () => void;
}) {
  const { total, active, healed } = woundCounts;
  const age = calculateAge(patient.birth_date);
  const smoking = formatSmoking(patient.smoking_status);
  const alcohol = formatAlcohol(patient.alcohol_consumption);

  return (
    <div className="border border-border rounded-xl bg-muted/5 overflow-hidden">
      {/* Top row: name + new obs indicator */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <p className="font-bold text-base text-foreground truncate">{patient.name || "Paciente sem nome"}</p>
          {hasFever && (
            <span className="flex-shrink-0 flex items-center gap-1 text-[10px] font-bold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded-md uppercase">
              <Thermometer className="w-2.5 h-2.5" />
              FEBRE
            </span>
          )}
          {newObsCount > 0 && (
            <span className="flex-shrink-0 flex items-center gap-1 text-[10px] font-bold text-status-success bg-status-success/10 px-1.5 py-0.5 rounded-md uppercase animate-in fade-in">
              <Bell className="w-2.5 h-2.5" />
              NOVO REGISTRO
            </span>
          )}
        </div>

        {/* Clinical info grid — compact chips */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {age !== null && (
            <Chip icon={<Calendar className="w-2.5 h-2.5" />} text={`${age}a`} />
          )}
          {patient.gender && (
            <Chip text={formatGender(patient.gender)} />
          )}
          {(patient.city || patient.state) && (
            <Chip icon={<MapPin className="w-2.5 h-2.5" />} text={`${patient.city || ''}${patient.state ? `-${patient.state}` : ''}`} />
          )}
          {patient.height != null && (
            <Chip icon={<Ruler className="w-2.5 h-2.5" />} text={`${patient.height}m`} />
          )}
          {patient.weight != null && (
            <Chip icon={<Weight className="w-2.5 h-2.5" />} text={`${patient.weight}kg`} />
          )}
          {smoking && (
            <Chip icon={<Wind className="w-2.5 h-2.5" />} text={smoking} />
          )}
          {alcohol && (
            <Chip icon={<Wine className="w-2.5 h-2.5" />} text={alcohol} />
          )}
          {patient.comorbidities && patient.comorbidities.length > 0 && (
            <>
              {patient.comorbidities.map((c: Comorbidity) => (
                <Chip key={c.concept_id} text={c.name} />
              ))}
            </>
          )}
        </div>
      </div>

      {/* Bottom row: actions */}
      <div className="grid grid-cols-2 border-t border-border">
        <button
          onClick={(e) => { e.stopPropagation(); onViewWounds(); }}
          className="flex items-center justify-center gap-2 py-3 text-sm font-medium text-primary hover:bg-primary/5 transition-colors active:bg-primary/10 border-r border-border"
        >
          <Activity className="w-4 h-4" />
          Ver Feridas
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          className="flex items-center justify-center gap-2 py-3 text-sm font-medium text-primary hover:bg-primary/5 transition-colors active:bg-primary/10"
        >
          <Pencil className="w-4 h-4" />
          Editar
        </button>
      </div>
    </div>
  );
}

/* ─── Compact Chip ─── */

function Chip({ icon, text }: { icon?: React.ReactNode; text: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-sm font-medium bg-muted/60 text-muted-foreground border border-border/40 whitespace-nowrap">
      {icon}
      {text}
    </span>
  );
}


