"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchWounds, fetchObservations, createWound } from "@/lib/api";
import type { Wound, Observation } from "@/lib/types";
import { lastCheckKey, patientSeenKey, woundSeenKey } from "@/lib/storage-keys";
import { ChevronLeft, Plus, Activity, MapPin, Loader2, CheckCircle2, Bell, Thermometer } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function PatientWoundsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientId = searchParams.get("id");
  const specialistId = searchParams.get("specialistId");
  const sinceParam = searchParams.get("since");

  // Parse and validate patientId once
  const parsedPatientId = patientId ? parseInt(patientId) : null;
  const isInvalidId = patientId !== null && (parsedPatientId === null || isNaN(parsedPatientId));
  
  const [wounds, setWounds] = useState<Wound[]>([]);
  const [woundNewObs, setWoundNewObs] = useState<Record<number, number>>({});
  const [woundHasFever, setWoundHasFever] = useState<Record<number, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [newWound, setNewWound] = useState({
    etiology: "",
    location: ""
  });

  const isSpecialistView = !!patientId;

  const loadWounds = async (id: number | null) => {
    const data = await fetchWounds(id ?? undefined);
    setWounds(data);
  };

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchWounds(parsedPatientId ?? undefined);
        setWounds(data);

        // If specialist viewing, check for new observations per wound
        if (specialistId && data.length > 0) {
          const since = sinceParam ? new Date(sinceParam).getTime() : 0;
          const globalCheck = new Date(
            localStorage.getItem(lastCheckKey(specialistId)) || 0
          ).getTime();
          const patientSeen = new Date(
            localStorage.getItem(patientSeenKey(specialistId, patientId!)) || 0
          ).getTime();

          const obsResults = await Promise.allSettled(
            data.map(w => fetchObservations(w.id))
          );
          const counts: Record<number, number> = {};
          const feverMap: Record<number, boolean> = {};
          data.forEach((w, idx) => {
            const r = obsResults[idx];
            if (r.status !== "fulfilled") return;
            // Per-wound dismissal
            const woundSeen = new Date(
              localStorage.getItem(woundSeenKey(specialistId, w.id)) || 0
            ).getTime();
            const threshold = new Date(Math.max(since, woundSeen, patientSeen, globalCheck));
            const count = r.value.filter(
              (obs: Observation) => new Date(obs.created_at) > threshold
            ).length;
            if (count > 0) counts[w.id] = count;
            if (r.value.some(
              (obs: Observation) => new Date(obs.created_at) > threshold && obs.fever_24h
            )) {
              feverMap[w.id] = true;
            }
          });
          setWoundNewObs(counts);
          setWoundHasFever(feverMap);
        }
      } catch (err) {
        console.error("Error loading wounds:", err);
        setError(err instanceof Error ? err.message : "Erro ao carregar feridas.");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [patientId, specialistId, sinceParam]);

  const handleCreateWound = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedPatientId === null || isInvalidId) return;
    setIsSubmitting(true);
    try {
      await createWound({
        patient: parsedPatientId,
        etiology: newWound.etiology,
        location: newWound.location
      });
      setIsAdding(false);
      setNewWound({ etiology: "", location: "" });
      loadWounds(parsedPatientId);
    } catch (err) {
      console.error("Error creating wound:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isInvalidId) {
    return (
      <div className="w-full max-w-lg flex flex-col flex-1 relative">
        <header className="sticky top-0 z-20 flex items-center h-16 px-4 bg-background border-b border-border pt-safe">
          <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-muted active:bg-accent text-foreground transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h2 className="ml-2 font-bold text-foreground">Feridas do Paciente</h2>
        </header>
        <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center space-y-4">
          <div className="w-14 h-14 bg-destructive/10 rounded-full flex items-center justify-center">
            <Activity className="w-7 h-7 text-destructive" />
          </div>
          <p className="font-bold text-foreground">ID inválido</p>
          <p className="text-sm text-muted-foreground">O identificador do paciente não é válido.</p>
          <button onClick={() => router.back()} className="px-5 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-xl active:scale-95 transition-transform">
            Voltar
          </button>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-lg flex flex-col flex-1 relative">
        <header className="sticky top-0 z-20 flex items-center h-16 px-4 bg-background border-b border-border pt-safe">
          <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-muted active:bg-accent text-foreground transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h2 className="ml-2 font-bold text-foreground">Feridas do Paciente</h2>
        </header>
        <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center space-y-4">
          <div className="w-14 h-14 bg-destructive/10 rounded-full flex items-center justify-center">
            <Activity className="w-7 h-7 text-destructive" />
          </div>
          <p className="font-bold text-foreground">Erro ao carregar</p>
          <p className="text-sm text-muted-foreground">{error}</p>
          <button onClick={() => router.back()} className="px-5 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-xl active:scale-95 transition-transform">
            Voltar
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg flex flex-col flex-1 relative">
      <header className="sticky top-0 z-20 flex items-center justify-between h-16 px-4 bg-background border-b border-border pt-safe">
        <div className="flex items-center">
          <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-muted active:bg-accent text-foreground transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h2 className="ml-2 font-bold text-foreground">Feridas do Paciente</h2>
        </div>
        {isSpecialistView && !isAdding && (
          <button onClick={() => setIsAdding(true)} className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
            <Plus className="w-5 h-5" />
          </button>
        )}
      </header>

      <main className="flex-1 px-6 py-6 space-y-6">
        {isAdding ? (
          <section className="bg-card rounded-2xl p-6 border border-border shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-foreground">Nova Ferida</h3>
              <button onClick={() => setIsAdding(false)} className="text-xs text-muted-foreground hover:text-foreground underline">Cancelar</button>
            </div>
            <form onSubmit={handleCreateWound} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-muted-foreground ml-1">Etiologia</Label>
                <select value={newWound.etiology} onChange={(e) => setNewWound(prev => ({ ...prev, etiology: e.target.value }))} required className="flex h-12 w-full rounded-xl border border-border bg-background px-4 py-2 text-sm shadow-sm">
                  <option value="">Selecione a causa...</option>
                  <option value="Úlcera do pé diabético">Úlcera do pé diabético</option>
                  <option value="Lesão por pressão">Lesão por pressão</option>
                  <option value="Úlcera venosa">Úlcera venosa</option>
                  <option value="Úlcera arterial">Úlcera arterial</option>
                  <option value="Ferida por trauma">Ferida por trauma</option>
                  <option value="Ferida cirúrgica">Ferida cirúrgica</option>
                  <option value="Queimadura">Queimadura</option>
                  <option value="Skin tear">Skin tear</option>
                  <option value="Fístula">Fístula</option>
                  <option value="Ferida neoplásica">Ferida neoplásica</option>
                  <option value="Flebite">Flebite</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-muted-foreground ml-1">Localização</Label>
                <select value={newWound.location} onChange={(e) => setNewWound(prev => ({ ...prev, location: e.target.value }))} required className="flex h-12 w-full rounded-xl border border-border bg-background px-4 py-2 text-sm shadow-sm">
                  <option value="">Selecione o local...</option>
                  <option value="Anterior do joelho">Anterior do joelho</option>
                  <option value="Posterior do joelho">Posterior do joelho</option>
                  <option value="Abaixo do joelho, região posterior">Abaixo do joelho, região posterior</option>
                  <option value="Abaixo do joelho, região anterior">Abaixo do joelho, região anterior</option>
                  <option value="Acima do maleolo medial">Acima do maleolo medial</option>
                  <option value="Abaixo do maleolo medial">Abaixo do maleolo medial</option>
                  <option value="Acima do maleolo lateral">Acima do maleolo lateral</option>
                  <option value="Abaixo do maleolo lateral">Abaixo do maleolo lateral</option>
                  <option value="Região calcaneana">Região calcaneana</option>
                  <option value="Dorso do pé">Dorso do pé</option>
                  <option value="Planta do pé">Planta do pé</option>
                  <option value="Halux">Halux</option>
                  <option value="2ª Pododáctilo">2ª Pododáctilo</option>
                  <option value="3ª Pododáctilo">3ª Pododáctilo</option>
                  <option value="4ª Pododáctilo">4ª Pododáctilo</option>
                  <option value="5ª Pododáctilo">5ª Pododáctilo</option>
                </select>
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full h-12 bg-primary text-primary-foreground font-bold rounded-xl flex items-center justify-center gap-2 mt-4 active:scale-95 transition-transform disabled:opacity-50">
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                Salvar Ferida
              </button>
            </form>
          </section>
        ) : null}

        <div className="space-y-4">
          {wounds.length > 0 ? (
            wounds.map(w => (
              <div key={w.id} onClick={() => router.push(`/wound-detail?id=${w.id}${specialistId ? `&specialistId=${specialistId}` : ''}${patientId ? `&patientId=${patientId}` : ''}`)} className="p-4 bg-card border border-border rounded-2xl shadow-sm hover:bg-muted/10 transition-colors cursor-pointer active:scale-[0.98]">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <h3 className="font-bold text-primary text-lg truncate">{w.etiology}</h3>
                    {woundHasFever[w.id] && (
                      <span className="flex-shrink-0 flex items-center gap-1 text-[10px] font-bold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded-md uppercase">
                        <Thermometer className="w-2.5 h-2.5" />
                        FEBRE
                      </span>
                    )}
                    {woundNewObs[w.id] > 0 && (
                      <span className="flex-shrink-0 flex items-center gap-1 text-[10px] font-bold text-status-success bg-status-success/10 px-1.5 py-0.5 rounded-md uppercase">
                        <Bell className="w-2.5 h-2.5" />
                        NOVO REGISTRO
                      </span>
                    )}
                  </div>
                  {w.is_healed ? (
                    <span className="flex-shrink-0 text-[10px] bg-status-success/10 text-status-success px-2 py-1 rounded-full font-bold uppercase">Cicatrizada</span>
                  ) : (
                    <span className="flex-shrink-0 text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-full font-bold uppercase">Em Tratamento</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{w.location}</span>
                </div>
                <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Registrada em {new Date(w.created_at).toLocaleDateString('pt-BR')}</span>
                  <span className="text-xs font-bold text-primary flex items-center gap-1">Ver Histórico <ChevronLeft className="w-3 h-3 rotate-180" /></span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center space-y-3">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto opacity-50">
                <Activity className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="font-bold text-foreground">Nenhuma ferida registrada</p>
              <p className="text-sm text-muted-foreground px-8">
                {isSpecialistView
                  ? "Este paciente ainda não possui feridas cadastradas para acompanhamento."
                  : "Você ainda não possui feridas registradas."}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function PatientWoundsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background items-center">
      <title>Feridas do Paciente - Cicatrizando</title>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }>
        <PatientWoundsContent />
      </Suspense>
    </div>
  );
}
