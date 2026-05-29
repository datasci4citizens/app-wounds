"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchWounds, Wound, createWound } from "@/lib/api";
import { ChevronLeft, Plus, Activity, MapPin, Loader2, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PatientWoundsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientId = searchParams.get("id");
  
  const [wounds, setWounds] = useState<Wound[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [newWound, setNewWound] = useState({
    etiology: "",
    location: ""
  });

  const loadWounds = async () => {
    if (!patientId) return;
    try {
      const data = await fetchWounds(parseInt(patientId));
      setWounds(data);
    } catch (err) {
      console.error("Error loading wounds:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWounds();
  }, [patientId]);

  const handleCreateWound = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) return;
    setIsSubmitting(true);
    try {
      await createWound({
        patient: parseInt(patientId),
        etiology: newWound.etiology,
        location: newWound.location
      });
      setIsAdding(false);
      setNewWound({ etiology: "", location: "" });
      loadWounds();
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

  return (
    <div className="flex flex-col min-h-screen bg-background items-center">
      <title>Feridas do Paciente - Cicatrizando</title>
      <div className="w-full max-w-lg flex flex-col flex-1 relative">
        <header className="sticky top-0 z-20 flex items-center justify-between h-16 px-4 bg-background border-b border-border pt-safe">
          <div className="flex items-center">
            <button 
                onClick={() => router.back()}
                className="p-2 -ml-2 rounded-full hover:bg-muted active:bg-accent text-foreground transition-colors"
            >
                <ChevronLeft className="w-6 h-6" />
            </button>
            <h2 className="ml-2 font-bold text-foreground">Feridas do Paciente</h2>
          </div>
          {!isAdding && (
              <button 
                onClick={() => setIsAdding(true)}
                className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
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
                        <select 
                            value={newWound.etiology} 
                            onChange={(e) => setNewWound(prev => ({ ...prev, etiology: e.target.value }))}
                            required
                            className="flex h-12 w-full rounded-xl border border-border bg-background px-4 py-2 text-sm shadow-sm"
                        >
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
                        <select 
                            value={newWound.location} 
                            onChange={(e) => setNewWound(prev => ({ ...prev, location: e.target.value }))}
                            required
                            className="flex h-12 w-full rounded-xl border border-border bg-background px-4 py-2 text-sm shadow-sm"
                        >
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
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full h-12 bg-primary text-primary-foreground font-bold rounded-xl flex items-center justify-center gap-2 mt-4 active:scale-95 transition-transform disabled:opacity-50"
                    >
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                        Salvar Ferida
                    </button>
                  </form>
              </section>
          ) : null}

          <div className="space-y-4">
            {wounds.length > 0 ? (
                wounds.map(w => (
                    <div key={w.id} onClick={() => router.push(`/wound-detail?id=${w.id}`)} className="p-4 bg-card border border-border rounded-2xl shadow-sm hover:bg-muted/10 transition-colors cursor-pointer active:scale-[0.98]">
                        <div className="flex justify-between items-start mb-3">
                            <h3 className="font-bold text-primary text-lg">{w.etiology}</h3>
                            {w.is_healed ? (
                                <span className="text-[10px] bg-status-success/10 text-status-success px-2 py-1 rounded-full font-bold uppercase">Cicatrizada</span>
                            ) : (
                                <span className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-full font-bold uppercase">Em Tratamento</span>
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
                    <p className="text-sm text-muted-foreground px-8">Este paciente ainda não possui feridas cadastradas para acompanhamento.</p>
                </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
