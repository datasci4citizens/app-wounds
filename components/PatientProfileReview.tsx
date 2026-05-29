"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authenticatedFetch } from "@/store/authStore";
import { ChevronLeft, CheckCircle2, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AsyncComorbiditySearch } from "@/components/AsyncComorbiditySearch";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface IBGEState {
  id: number;
  sigla: string;
  nome: string;
}

interface IBGECity {
  id: number;
  nome: string;
}

interface PatientProfileReviewProps {
  profile: any;
  onComplete: () => void;
}

export function PatientProfileReview({ profile, onComplete }: PatientProfileReviewProps) {
  const router = useRouter();
  const patient = profile.patient || {};
  
  const [formData, setFormData] = useState({
    fullName: profile.name || "",
    birthDate: profile.birth_date || "",
    state: profile.state || "",
    city: profile.city || "",
    contactPhone: patient.contact_phone || "",
    contactEmail: patient.contact_email || profile.email || "",
    gender: patient.gender || "",
    height: patient.height || "",
    weight: patient.weight || "",
    comorbidities: patient.comorbidities?.map((c: any) => c.name) || [],
    smokingStatus: patient.smoking_status || "",
    alcoholConsumption: patient.alcohol_consumption || "",
  });

  const [states, setStates] = useState<IBGEState[]>([]);
  const [cities, setCities] = useState<IBGECity[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome")
      .then((res) => res.json())
      .then((data) => setStates(data))
      .catch((err) => console.error("Erro ao buscar estados:", err));
  }, []);

  useEffect(() => {
    if (formData.state) {
      setIsLoadingCities(true);
      fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${formData.state}/municipios?orderBy=nome`)
        .then((res) => res.json())
        .then((data) => {
          setCities(data);
        })
        .catch((err) => console.error("Erro ao buscar cidades:", err))
        .finally(() => setIsLoadingCities(false));
    } else {
      setCities([]);
    }
  }, [formData.state]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, "");
    if (v.length > 11) v = v.substring(0, 11);
    let formatted = v;
    if (v.length > 2) formatted = `(${v.substring(0, 2)}) ${v.substring(2)}`;
    if (v.length > 6) {
      if (v.length === 11) formatted = `(${v.substring(0, 2)}) ${v.substring(2, 7)}-${v.substring(7)}`;
      else formatted = `(${v.substring(0, 2)}) ${v.substring(2, 6)}-${v.substring(6)}`;
    }
    setFormData((prev) => ({ ...prev, contactPhone: formatted }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const requestBody = {
        name: formData.fullName,
        birth_date: formData.birthDate,
        state: formData.state.toUpperCase(),
        city: formData.city,
        contact_phone: formData.contactPhone,
        contact_email: formData.contactEmail,
        gender: formData.gender || null,
        height: formData.height ? parseFloat(formData.height) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        comorbidities: formData.comorbidities,
        smoking_status: formData.smokingStatus || null,
        alcohol_consumption: formData.alcoholConsumption || null,
      };

      const response = await authenticatedFetch(`${API_URL}/Update/`, {
        method: "PATCH",
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar perfil. Verifique os campos e tente novamente.');
      }

      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background items-center">
      <title>Revisar Perfil - Cicatrizando</title>
      <div className="w-full max-w-lg flex flex-col flex-1 relative">
        <main className="flex-1 overflow-y-auto px-6 py-8 no-scrollbar pb-32">
          <div className="mb-8 space-y-2">
            <h1 className="text-2xl font-bold font-heading text-foreground">
              Confirme seus dados
            </h1>
            <p className="text-sm text-muted-foreground">
              Bem-vindo ao Cicatrizando! Por favor, revise e complete as informações abaixo para começar.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm">
              {error}
            </div>
          )}

          <form id="review-form" onSubmit={handleSubmit} className="space-y-5">
            {/* Basic Info */}
            <div className="space-y-4">
               <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold ml-1">Nome Completo</Label>
                  <Input name="fullName" value={formData.fullName} onChange={handleChange} required className="bg-white dark:bg-card border-transparent shadow-sm h-14 rounded-2xl px-5" />
               </div>
               <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold ml-1">Data de Nascimento</Label>
                  <Input name="birthDate" type="date" value={formData.birthDate} onChange={handleChange} required className="bg-white dark:bg-card border-transparent shadow-sm h-14 rounded-2xl px-5" />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold ml-1">Estado (UF)</Label>
                    <select name="state" value={formData.state} onChange={handleChange} required className="flex h-14 w-full appearance-none rounded-2xl border border-transparent bg-white dark:bg-card px-5 py-2 text-base font-medium shadow-sm">
                        <option value="" disabled>UF</option>
                        {states.map(s => <option key={s.id} value={s.sigla}>{s.sigla}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold ml-1">Cidade</Label>
                    <select name="city" value={formData.city} onChange={handleChange} required disabled={!formData.state || isLoadingCities} className="flex h-14 w-full appearance-none rounded-2xl border border-transparent bg-white dark:bg-card px-5 py-2 text-base font-medium shadow-sm">
                        <option value="" disabled>{isLoadingCities ? "..." : "Selecione"}</option>
                        {cities.map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}
                    </select>
                  </div>
               </div>
            </div>

            {/* Clinical Info */}
            <div className="space-y-4 pt-6 border-t border-border/50">
               <h2 className="text-lg font-bold text-foreground">Informações Clínicas</h2>
               <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold ml-1">Sexo</Label>
                  <select name="gender" value={formData.gender} onChange={handleChange} className="flex h-14 w-full appearance-none rounded-2xl border border-transparent bg-white dark:bg-card px-5 py-2 text-base font-medium shadow-sm">
                      <option value="">Selecione</option>
                      <option value="M">Masculino</option>
                      <option value="F">Feminino</option>
                  </select>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold ml-1">Altura (m)</Label>
                    <Input name="height" type="number" step="0.01" value={formData.height} onChange={handleChange} className="bg-white dark:bg-card border-transparent shadow-sm h-14 rounded-2xl px-5" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold ml-1">Peso (kg)</Label>
                    <Input name="weight" type="number" step="0.1" value={formData.weight} onChange={handleChange} className="bg-white dark:bg-card border-transparent shadow-sm h-14 rounded-2xl px-5" />
                  </div>
               </div>

               <div className="space-y-2 relative z-50">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold ml-1">Comorbidades</Label>
                  <AsyncComorbiditySearch
                    selectedUris={formData.comorbidities}
                    onChange={(uris) => setFormData(prev => ({ ...prev, comorbidities: uris }))}
                  />
               </div>

               <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold ml-1">Fumante</Label>
                  <select name="smokingStatus" value={formData.smokingStatus} onChange={handleChange} className="flex h-14 w-full appearance-none rounded-2xl border border-transparent bg-white dark:bg-card px-5 py-2 text-base font-medium shadow-sm">
                      <option value="">Selecione</option>
                      <option value="NEVER">Nunca fumou</option>
                      <option value="LT10">Menos de 10 cigarros/dia</option>
                      <option value="GT10">Mais de 10 cigarros/dia</option>
                      <option value="EX">Ex-tabagista</option>
                  </select>
               </div>

               <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold ml-1">Álcool</Label>
                  <select name="alcoholConsumption" value={formData.alcoholConsumption} onChange={handleChange} className="flex h-14 w-full appearance-none rounded-2xl border border-transparent bg-white dark:bg-card px-5 py-2 text-base font-medium shadow-sm">
                      <option value="">Selecione</option>
                      <option value="NONE">Não bebe</option>
                      <option value="EX">Ex-etilista</option>
                      <option value="LT21_M">Menos de 21 doses/sem (H)</option>
                      <option value="GT21_M">Mais de 21 doses/sem (H)</option>
                      <option value="LT14_F">Menos de 14 doses/sem (M)</option>
                      <option value="GT14_F">Mais de 14 doses/sem (M)</option>
                  </select>
               </div>
            </div>
          </form>
        </main>

        <footer className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background pb-[calc(env(safe-area-inset-bottom)+24px)] pt-12 pointer-events-none">
          <button
            type="submit"
            form="review-form"
            disabled={isSubmitting}
            className="w-full h-14 flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold text-base rounded-2xl active:scale-[0.98] transition-transform shadow-md pointer-events-auto disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
            {isSubmitting ? "Salvando..." : "Confirmar e Entrar"}
          </button>
        </footer>
      </div>
    </div>
  );
}
