"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getAuthHeaders, authenticatedFetch } from "@/store/authStore";
import { ChevronLeft, CheckCircle2, Loader2, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AsyncComorbiditySearch } from "@/components/AsyncComorbiditySearch";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Tipos para a API do IBGE
interface IBGEState {
  id: number;
  sigla: string;
  nome: string;
}

interface IBGECity {
  id: number;
  nome: string;
}

interface PatientRegistrationRequest {
  google_email: string;
  name: string;
  birth_date: string; // YYYY-MM-DD format
  state: string; // 2-letter Brazilian state code
  city: string;
  contact_phone?: string;
  contact_email: string;
  gender?: string | null;
  height?: number | null;
  weight?: number | null;
  comorbidities?: string[];
  smoking_status?: string | null;
  alcohol_consumption?: string | null;
}

export default function UpdatePatientPage() {
  const router = useRouter();
  const { id } = useParams();
  
  const [formData, setFormData] = useState<{
    fullName: string;
    birthDate: string;
    state: string;
    city: string;
    contactPhone: string;
    contactEmail: string;
    gender: string;
    height: string;
    weight: string;
    comorbidities: string[];
    smokingStatus: string;
    alcoholConsumption: string;
  }>({
    fullName: "",
    birthDate: "",
    state: "",
    city: "",
    contactPhone: "",
    contactEmail: "",
    gender: "",
    height: "",
    weight: "",
    comorbidities: [],
    smokingStatus: "",
    alcoholConsumption: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [initialComorbidities, setInitialComorbidities] = useState<any[]>([]);

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const response = await authenticatedFetch(`${API_URL}/specialist/patient/update/${id}/`);
        if (response.ok) {
          const data = await response.json();
          setFormData({
            fullName: data.name || "",
            birthDate: data.birth_date || "",
            state: data.state || "",
            city: data.city || "",
            contactPhone: data.contact_phone || "",
            contactEmail: data.contact_email || "",
            gender: data.gender || "",
            height: data.height?.toString() || "",
            weight: data.weight?.toString() || "",
            comorbidities: data.comorbidities?.map((c: any) => c.concept_id) || [],
            smokingStatus: data.smoking_status || "",
            alcoholConsumption: data.alcohol_consumption || "",
          });
          setInitialComorbidities(data.comorbidities || []);
        } else {
          setError("Erro ao carregar dados do paciente.");
        }
      } catch (err) {
        console.error("Error fetching patient data:", err);
        setError("Erro de conexão ao carregar dados.");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchPatientData();
    }
  }, [id]);


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
          setFormData(prev => ({ ...prev, city: "" }));
        })
        .catch((err) => console.error("Erro ao buscar cidades:", err))
        .finally(() => setIsLoadingCities(false));
    } else {
      setCities([]);
    }
  }, [formData.state]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setError(null);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, "");
    if (v.length > 11) v = v.substring(0, 11);
    
    let formatted = v;
    if (v.length > 2) {
      formatted = `(${v.substring(0, 2)}) ${v.substring(2)}`;
    }
    if (v.length > 6) {
      if (v.length === 11) {
        formatted = `(${v.substring(0, 2)}) ${v.substring(2, 7)}-${v.substring(7)}`;
      } else {
        formatted = `(${v.substring(0, 2)}) ${v.substring(2, 6)}-${v.substring(6)}`;
      }
    }
    
    setFormData((prev) => ({ ...prev, contactPhone: formatted }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const requestBody: PatientRegistrationRequest = {
        google_email: formData.contactEmail,
        name: formData.fullName || undefined,
        birth_date: formData.birthDate || undefined,
        state: formData.state ? formData.state.toUpperCase() : undefined,
        city: formData.city || undefined,
        contact_phone: formData.contactPhone || undefined,
        contact_email: formData.contactEmail,
        gender: formData.gender || null,
        height: formData.height ? parseFloat(formData.height) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        comorbidities: formData.comorbidities,
        smoking_status: formData.smokingStatus || null,
        alcohol_consumption: formData.alcoholConsumption || null,
      };

      const response = await authenticatedFetch(`${API_URL}/specialist/patient/update/${id}/`, {
        method: "PUT",
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (errorData.error) {
          throw new Error(errorData.error);
        }
        if (errorData.state) {
          throw new Error(`Estado: ${errorData.state.join(', ')}`);
        }
        if (errorData.detail) {
          throw new Error(errorData.detail);
        }
        
        throw new Error('Erro ao atualizar paciente. Verifique os dados e tente novamente.');
      }

      // Navigate back to the dashboard upon successful registration
      router.push("/");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao registrar paciente:', err);
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
    <div className="flex flex-col min-h-[100dvh] bg-background items-center">
      <title>Atualizar Paciente - Cicatrizando</title>
      <div className="w-full max-w-lg flex flex-col flex-1 relative">
        {/* App Bar Fixo */}
        <header className="sticky top-0 z-10 flex items-center h-16 px-4 bg-background pt-safe">
          <button 
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-full hover:bg-muted active:bg-accent text-foreground transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        </header>

        {/* Conteúdo do Formulário */}
        <main className="flex-1 overflow-y-auto px-6 py-4 no-scrollbar pb-32">
          <div className="mb-8 space-y-2">
            <h1 className="text-2xl font-bold font-heading text-foreground">
              Atualizar Paciente
            </h1>
            <p className="text-sm text-muted-foreground">
              Atualize os dados do paciente.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm">
              {error}
            </div>
          )}

          <form id="patient-form" onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-xs text-muted-foreground uppercase tracking-wider font-semibold ml-1">
                Nome Completo
              </Label>
              <Input 
                id="fullName" 
                name="fullName"
                placeholder="Nome completo do paciente" 
                value={formData.fullName}
                onChange={handleChange}
                
                disabled={isSubmitting}
                className="bg-white dark:bg-card border-transparent shadow-sm h-14 rounded-2xl px-5"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthDate" className="text-xs text-muted-foreground uppercase tracking-wider font-semibold ml-1">
                Data de Nascimento
              </Label>
              <Input 
                id="birthDate" 
                name="birthDate"
                type="date" 
                value={formData.birthDate}
                onChange={handleChange}
                
                disabled={isSubmitting}
                className="bg-white dark:bg-card border-transparent shadow-sm h-14 rounded-2xl px-5 text-foreground min-h-14"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="state" className="text-xs text-muted-foreground uppercase tracking-wider font-semibold ml-1">
                  Estado (UF)
                </Label>
                <div className="relative">
                  <select
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    
                    disabled={isSubmitting}
                    className="flex h-14 w-full appearance-none rounded-2xl border border-transparent bg-white dark:bg-card px-5 py-2 text-base font-medium transition-colors focus-visible:border-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary shadow-sm disabled:opacity-50"
                  >
                    <option value="" disabled>Selecione</option>
                    {states.map((state) => (
                      <option key={state.id} value={state.sigla}>
                        {state.sigla}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="city" className="text-xs text-muted-foreground uppercase tracking-wider font-semibold ml-1">
                  Cidade
                </Label>
                <div className="relative">
                  <select
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    
                    disabled={!formData.state || isLoadingCities || isSubmitting}
                    className="flex h-14 w-full appearance-none rounded-2xl border border-transparent bg-white dark:bg-card px-5 py-2 text-base font-medium transition-colors focus-visible:border-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary shadow-sm disabled:opacity-50"
                  >
                    <option value="" disabled>
                      {isLoadingCities ? "Carregando..." : "Selecione"}
                    </option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.nome}>
                        {city.nome}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground">
                    {isLoadingCities ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactEmail" className="text-xs text-muted-foreground uppercase tracking-wider font-semibold ml-1">
                E-mail do Paciente (Obrigatório)
              </Label>
              <Input 
                id="contactEmail" 
                name="contactEmail"
                type="email"
                placeholder="email@exemplo.com" 
                value={formData.contactEmail}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                className="bg-white dark:bg-card border-transparent shadow-sm h-14 rounded-2xl px-5"
              />
              <p className="text-[10px] text-muted-foreground ml-1">Usado para o login do paciente no aplicativo.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPhone" className="text-xs text-muted-foreground uppercase tracking-wider font-semibold ml-1">
                Telefone / WhatsApp
              </Label>
              <Input 
                id="contactPhone" 
                name="contactPhone"
                type="tel"
                placeholder="(00) 00000-0000" 
                value={formData.contactPhone}
                onChange={handlePhoneChange}
                maxLength={15}
                disabled={isSubmitting}
                className="bg-white dark:bg-card border-transparent shadow-sm h-14 rounded-2xl px-5"
              />
            </div>

            <div className="space-y-6 pt-6 border-t border-border/50 mt-8 pb-4">
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-foreground">Informações Clínicas</h2>
                <p className="text-xs text-muted-foreground">Histórico médico e hábitos do paciente.</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="gender" className="text-xs text-muted-foreground uppercase tracking-wider font-semibold ml-1">
                  Sexo
                </Label>
                <div className="relative">
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="flex h-14 w-full appearance-none rounded-2xl border border-transparent bg-white dark:bg-card px-5 py-2 text-base font-medium transition-colors focus-visible:border-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary shadow-sm disabled:opacity-50"
                  >
                    <option value="">Selecione</option>
                    <option value="M">Masculino</option>
                    <option value="F">Feminino</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="height" className="text-xs text-muted-foreground uppercase tracking-wider font-semibold ml-1">
                    Altura (m)
                  </Label>
                  <Input 
                    id="height" 
                    name="height"
                    type="number"
                    step="0.01"
                    placeholder="1.70" 
                    value={formData.height}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="bg-white dark:bg-card border-transparent shadow-sm h-14 rounded-2xl px-5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight" className="text-xs text-muted-foreground uppercase tracking-wider font-semibold ml-1">
                    Peso (kg)
                  </Label>
                  <Input 
                    id="weight" 
                    name="weight"
                    type="number"
                    step="0.1"
                    placeholder="70.0" 
                    value={formData.weight}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="bg-white dark:bg-card border-transparent shadow-sm h-14 rounded-2xl px-5"
                  />
                </div>
              </div>

              <div className="space-y-3 relative z-50">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold ml-1">
                  Comorbidades
                </Label>
                <div className="grid grid-cols-1 gap-2">
                  <AsyncComorbiditySearch
                    selectedUris={formData.comorbidities}
                    initialItems={initialComorbidities}
                    onChange={(uris) => setFormData(prev => ({ ...prev, comorbidities: uris }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="smokingStatus" className="text-xs text-muted-foreground uppercase tracking-wider font-semibold ml-1">
                  Fumante
                </Label>
                <div className="relative">
                  <select
                    id="smokingStatus"
                    name="smokingStatus"
                    value={formData.smokingStatus}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="flex h-14 w-full appearance-none rounded-2xl border border-transparent bg-white dark:bg-card px-5 py-2 text-base font-medium transition-colors focus-visible:border-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary shadow-sm disabled:opacity-50"
                  >
                    <option value="">Selecione</option>
                    <option value="NEVER">Nunca fumou</option>
                    <option value="LT10">Menos de 10 cigarros por dia</option>
                    <option value="GT10">Mais de 10 cigarros por dia</option>
                    <option value="EX">Ex-tabagista</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="alcoholConsumption" className="text-xs text-muted-foreground uppercase tracking-wider font-semibold ml-1">
                  Consumo de Álcool
                </Label>
                <div className="relative">
                  <select
                    id="alcoholConsumption"
                    name="alcoholConsumption"
                    value={formData.alcoholConsumption}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="flex h-14 w-full appearance-none rounded-2xl border border-transparent bg-white dark:bg-card px-5 py-2 text-base font-medium transition-colors focus-visible:border-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary shadow-sm disabled:opacity-50"
                  >
                    <option value="">Selecione</option>
                    <option value="NONE">Não bebe</option>
                    <option value="EX">Ex-etilista</option>
                    
                    {formData.gender === 'M' && (
                      <>
                        <option value="LT21_M">Menos de 21 doses por semana</option>
                        <option value="GT21_M">Mais de 21 doses por semana</option>
                        <option value="LT13_M">Menos de 13 latas por semana</option>
                        <option value="GT13_M">Mais de 13 latas por semana</option>
                      </>
                    )}
                    {formData.gender === 'F' && (
                      <>
                        <option value="LT14_F">Menos de 14 doses por semana</option>
                        <option value="GT14_F">Mais de 14 doses por semana</option>
                        <option value="LT9_F">Menos de 9 latas por semana</option>
                        <option value="GT9_F">Mais de 9 latas por semana</option>
                      </>
                    )}
                    {!formData.gender && (
                      <>
                        <optgroup label="Homem">
                          <option value="LT21_M">Menos de 21 doses por semana</option>
                          <option value="GT21_M">Mais de 21 doses por semana</option>
                          <option value="LT13_M">Menos de 13 latas por semana</option>
                          <option value="GT13_M">Mais de 13 latas por semana</option>
                        </optgroup>
                        <optgroup label="Mulher">
                          <option value="LT14_F">Menos de 14 doses por semana</option>
                          <option value="GT14_F">Mais de 14 doses por semana</option>
                          <option value="LT9_F">Menos de 9 latas por semana</option>
                          <option value="GT9_F">Mais de 9 latas por semana</option>
                        </optgroup>
                      </>
                    )}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </main>

        {/* Footer fixo para o botão principal */}
        <footer className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background to-transparent pb-[calc(env(safe-area-inset-bottom)+24px)] pt-12 pointer-events-none">
          <button
            type="submit"
            form="patient-form"
            disabled={isSubmitting}
            className="w-full h-14 flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold text-base rounded-2xl active:scale-[0.98] transition-transform shadow-md pointer-events-auto disabled:opacity-50 disabled:active:scale-100"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {isSubmitting ? "Salvando..." : "Salvar Alterações"}
          </button>
        </footer>
      </div>
    </div>
  );
}
