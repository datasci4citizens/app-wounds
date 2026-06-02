"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchObservations, Observation } from "@/lib/api";
import { useUserStore } from "@/store/userStore";
import { ChevronLeft, Activity, Calendar, User, Clock, Loader2, MessageSquare, Thermometer, Droplets, ZoomIn } from "lucide-react";
import { ImageViewer } from "@/components/ImageViewer";

function WoundDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const woundId = searchParams.get("id");
  const { user: currentUser } = useUserStore();
  
  const [observations, setObservations] = useState<Observation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const loadObservations = async () => {
      if (!woundId) return;
      try {
        const data = await fetchObservations(parseInt(woundId));
        setObservations(data);
      } catch (err) {
        console.error("Error loading observations:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadObservations();
  }, [woundId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg flex flex-col flex-1 relative">
      <header className="sticky top-0 z-20 flex items-center h-16 px-4 bg-background border-b border-border pt-safe">
          <button 
              onClick={() => router.back()}
              className="p-2 -ml-2 rounded-full hover:bg-muted active:bg-accent text-foreground transition-colors"
          >
              <ChevronLeft className="w-6 h-6" />
          </button>
          <h2 className="ml-2 font-bold text-foreground">Histórico da Ferida</h2>
          <button 
              onClick={() => router.push(`/add-observation?woundId=${woundId}`)}
              className="ml-auto bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1.5 rounded-lg active:scale-95 transition-transform"
          >
              NOVO REGISTRO
          </button>
      </header>

      <main className="flex-1 px-6 py-8">
        {observations.length > 0 ? (
            <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
              {observations.map((obs, idx) => (
                <div key={obs.id} className="relative flex items-start gap-6 group">
                  {/* Timeline dot */}
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-background border-2 border-primary shrink-0 shadow-sm z-10 group-hover:scale-110 transition-transform">
                      <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  
                  {/* Content Card */}
                  <div className="flex-1 bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
                      <div className="flex justify-between items-start border-b border-border/50 pb-3">
                          <div>
                              <p className="text-sm font-bold text-foreground">
                                  {new Date(obs.created_at).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}
                              </p>
                              <div className="flex items-center gap-1.5 mt-1">
                                  <Clock className="w-3 h-3 text-muted-foreground" />
                                  <p className="text-[10px] text-muted-foreground uppercase font-medium">
                                      {new Date(obs.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                              </div>
                          </div>
                          <div className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {obs.author_role === 'Pr' ? 'ESPECIALISTA' : 'PACIENTE'}
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                          <MetricItem label="Dor" value={`${obs.pain_level}/10`} color="text-status-error" />
                          <MetricItem label="Exsudato" value={obs.exudate_amount} />
                          <MetricItem label="Tecido" value={obs.tissue_type} />
                          <MetricItem label="Trocas/Dia" value={obs.dressing_changes.toString()} />
                      </div>

                      <div className="space-y-2 pt-3 border-t border-border/50">
                          <div className="flex items-center gap-2">
                              <Thermometer className={`w-3.5 h-3.5 ${obs.fever_24h ? 'text-status-error' : 'text-status-success'}`} />
                              <span className="text-xs font-medium">Febre (24h): {obs.fever_24h ? 'Sim' : 'Não'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                              <Droplets className="w-3.5 h-3.5 text-blue-500" />
                              <span className="text-xs font-medium">{obs.exudate_type}</span>
                          </div>
                      </div>

                      {obs.image && (
                          <div 
                            onClick={() => setSelectedImage(obs.image)}
                            className="relative w-full aspect-video rounded-xl overflow-hidden border border-border bg-muted group cursor-zoom-in"
                          >
                              <img 
                                  src={obs.image} 
                                  alt="Foto da Ferida" 
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                              />
                              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <div className="bg-black/50 p-2 rounded-full backdrop-blur-sm">
                                      <ZoomIn className="w-6 h-6 text-white" />
                                  </div>
                              </div>
                          </div>
                      )}

                      {obs.extra_notes && !(currentUser?.role === 'Pa' && obs.author_role === 'Pr') && (
                          <div className="bg-muted/30 p-3 rounded-xl">
                              <div className="flex items-center gap-1.5 mb-1">
                                  <MessageSquare className="w-3 h-3 text-muted-foreground" />
                                  <span className="text-[10px] font-bold uppercase text-muted-foreground">Notas</span>
                              </div>
                              <p className="text-xs text-foreground italic">"{obs.extra_notes}"</p>
                          </div>
                      )}
                      
                      {obs.patient_guidelines && (
                          <div className="bg-primary/5 p-3 rounded-xl border border-primary/10">
                              <span className="text-[10px] font-bold uppercase text-primary">Orientações</span>
                              <p className="text-xs text-foreground mt-1">{obs.patient_guidelines}</p>
                          </div>
                      )}
                  </div>
                </div>
              ))}
            </div>
        ) : (
            <div className="py-20 text-center space-y-3">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto opacity-50">
                  <Activity className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="font-bold text-foreground">Sem registros</p>
              <p className="text-sm text-muted-foreground px-8">Nenhuma observação clínica foi registrada para esta ferida ainda.</p>
            </div>
        )}
        </main>

        {/* Full Image Viewer Overlay */}
        {selectedImage && (
        <ImageViewer 
          src={selectedImage} 
          onClose={() => setSelectedImage(null)} 
        />
        )}
        </div>
        );
        }
export default function WoundDetailPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background items-center">
      <title>Histórico da Ferida - Cicatrizando</title>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }>
        <WoundDetailContent />
      </Suspense>
    </div>
  );
}

function MetricItem({ label, value, color = "text-primary" }: { label: string, value: string, color?: string }) {
    return (
        <div>
            <span className="text-[10px] font-bold uppercase text-muted-foreground block mb-0.5">{label}</span>
            <span className={`text-sm font-bold ${color}`}>{value}</span>
        </div>
    );
}
