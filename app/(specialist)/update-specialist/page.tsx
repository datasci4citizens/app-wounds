"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { authenticatedFetch } from "@/store/authStore";
import { handleApiResponse, ApiValidationError } from "@/lib/errors";
import { ChevronLeft, Loader2, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPhone } from "@/lib/format";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface IBGEState { id: number; sigla: string; nome: string; }
interface IBGECity { id: number; nome: string; }

interface SpecialistInitialData {
  name: string;
  email: string;
  birthDate: string;
  state: string;
  city: string;
  professionalId: string;
  professionalPhone: string;
  professionalEmail: string;
}

function UpdateSpecialistContent() {
  const router = useRouter();

  const [initialData, setInitialData] = useState<SpecialistInitialData | null>(null);
  const [states, setStates] = useState<IBGEState[]>([]);
  const [cities, setCities] = useState<IBGECity[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const getErrorClass = (field: string) => {
    return fieldErrors?.[field]
      ? "border-destructive focus-visible:ring-destructive bg-destructive/5"
      : "";
  };

  const ErrorMsg = ({ field }: { field: string }) => {
    if (!fieldErrors?.[field]) return null;
    return <p className="text-destructive text-xs mt-1 font-medium ml-1">{fieldErrors[field][0]}</p>;
  };

  // Fetch IBGE states
  useEffect(() => {
    fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome")
      .then(r => r.json())
      .then(setStates)
      .catch(err => console.error("Erro ao buscar estados:", err));
  }, []);

  // Fetch cities when state changes
  useEffect(() => {
    if (initialData?.state) {
      setIsLoadingCities(true);
      fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${initialData.state}/municipios?orderBy=nome`)
        .then(r => r.json())
        .then(data => { setCities(data); })
        .catch(err => console.error("Erro ao buscar cidades:", err))
        .finally(() => setIsLoadingCities(false));
    } else {
      setCities([]);
    }
  }, [initialData?.state]);

  // Load specialist profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await authenticatedFetch(`${API_URL}/auth/me/`);
        if (response.ok) {
          const data = await response.json();
          setInitialData({
            name: data.name || "",
            email: data.email || "",
            birthDate: data.birth_date || "",
            state: data.state || "",
            city: data.city || "",
            professionalId: data.specialist?.professional_id || "",
            professionalPhone: data.specialist?.contact_phone || "",
            professionalEmail: data.specialist?.contact_email || data.email || "",
          });
        } else {
          setError("Erro ao carregar dados do especialista.");
        }
      } catch (err) {
        console.error("Error fetching specialist data:", err);
        setError("Erro de conexão ao carregar dados.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!initialData) return;
    setError(null);
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const requestBody = {
        name: initialData.name,
        email: initialData.email,
        birth_date: initialData.birthDate,
        state: initialData.state.toUpperCase(),
        city: initialData.city,
        professional_id: initialData.professionalId,
        contact_phone: initialData.professionalPhone || null,
        contact_email: initialData.professionalEmail || null,
      };

      const response = await authenticatedFetch(`${API_URL}/Update/`, {
        method: "PATCH",
        body: JSON.stringify(requestBody),
      });

      await handleApiResponse(response, "Erro ao atualizar dados. Verifique e tente novamente.");

      router.back();
    } catch (err) {
      if (err instanceof ApiValidationError) {
        setFieldErrors(err.fieldErrors);
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg flex flex-col flex-1 relative">
      <header className="sticky top-0 z-10 flex items-center h-16 px-4 bg-background pt-safe">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 rounded-full hover:bg-muted active:bg-accent text-foreground transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-4 no-scrollbar pb-32">
        <div className="mb-8 space-y-2">
          <h1 className="text-2xl font-bold font-heading text-foreground">
            Atualizar Especialista
          </h1>
          <p className="text-sm text-muted-foreground">
            Atualize seus dados pessoais e profissionais.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm">
            {error}
          </div>
        )}

        {initialData && (
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs text-muted-foreground uppercase tracking-wider font-semibold ml-1">
                Nome Completo
              </Label>
              <Input
                id="name"
                value={initialData.name}
                onChange={(e) => setInitialData(prev => prev ? { ...prev, name: e.target.value } : null)}
                required
                disabled={isSubmitting}
                className={`bg-white dark:bg-card shadow-sm h-14 rounded-2xl px-5 ${getErrorClass("name")}`}
              />
              <ErrorMsg field="name" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs text-muted-foreground uppercase tracking-wider font-semibold ml-1">
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                value={initialData.email}
                onChange={(e) => setInitialData(prev => prev ? { ...prev, email: e.target.value } : null)}
                required
                disabled={isSubmitting}
                className={`bg-white dark:bg-card shadow-sm h-14 rounded-2xl px-5 ${getErrorClass("email")}`}
              />
              <ErrorMsg field="email" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthDate" className="text-xs text-muted-foreground uppercase tracking-wider font-semibold ml-1">
                Data de Nascimento
              </Label>
              <Input
                id="birthDate"
                type="date"
                value={initialData.birthDate}
                onChange={(e) => setInitialData(prev => prev ? { ...prev, birthDate: e.target.value } : null)}
                required
                disabled={isSubmitting}
                className={`bg-white dark:bg-card shadow-sm h-14 rounded-2xl px-5 text-foreground ${getErrorClass("birth_date")}`}
              />
              <ErrorMsg field="birth_date" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="state" className="text-xs text-muted-foreground uppercase tracking-wider font-semibold ml-1">
                  Estado (UF)
                </Label>
                <div className="relative">
                  <select
                    id="state"
                    value={initialData.state}
                    onChange={(e) => setInitialData(prev => prev ? { ...prev, state: e.target.value, city: "" } : null)}
                    required
                    disabled={isSubmitting}
                    className={`flex h-14 w-full appearance-none rounded-2xl border bg-white dark:bg-card px-5 py-2 text-base font-medium transition-colors focus-visible:border-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary shadow-sm disabled:opacity-50 ${getErrorClass("state")}`}
                  >
                    <option value="" disabled>Selecione</option>
                    {states.map((s) => (
                      <option key={s.id} value={s.sigla}>{s.sigla}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <ErrorMsg field="state" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city" className="text-xs text-muted-foreground uppercase tracking-wider font-semibold ml-1">
                  Cidade
                </Label>
                <div className="relative">
                  <select
                    id="city"
                    value={initialData.city}
                    onChange={(e) => setInitialData(prev => prev ? { ...prev, city: e.target.value } : null)}
                    required
                    disabled={!initialData.state || isLoadingCities || isSubmitting}
                    className={`flex h-14 w-full appearance-none rounded-2xl border bg-white dark:bg-card px-5 py-2 text-base font-medium transition-colors focus-visible:border-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary shadow-sm disabled:opacity-50 ${getErrorClass("city")}`}
                  >
                    <option value="" disabled>
                      {isLoadingCities ? "Carregando..." : "Selecione"}
                    </option>
                    {cities.map((c) => (
                      <option key={c.id} value={c.nome}>{c.nome}</option>
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
                <ErrorMsg field="city" />
              </div>
            </div>

            <div className="pt-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold ml-1 mb-3">
                Dados Profissionais
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="professionalId" className="text-xs text-muted-foreground uppercase tracking-wider font-semibold ml-1">
                Registro Profissional (COREN/CRM)
              </Label>
              <Input
                id="professionalId"
                value={initialData.professionalId}
                onChange={(e) => setInitialData(prev => prev ? { ...prev, professionalId: e.target.value } : null)}
                required
                disabled={isSubmitting}
                className={`bg-white dark:bg-card shadow-sm h-14 rounded-2xl px-5 ${getErrorClass("professional_id")}`}
              />
              <ErrorMsg field="professional_id" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="professionalPhone" className="text-xs text-muted-foreground uppercase tracking-wider font-semibold ml-1">
                Telefone Profissional
              </Label>
              <Input
                id="professionalPhone"
                type="tel"
                value={initialData.professionalPhone}
                onChange={(e) => setInitialData(prev => prev ? { ...prev, professionalPhone: formatPhone(e.target.value) } : null)}
                maxLength={15}
                placeholder="(00) 00000-0000"
                disabled={isSubmitting}
                className={`bg-white dark:bg-card shadow-sm h-14 rounded-2xl px-5 ${getErrorClass("contact_phone")}`}
              />
              <ErrorMsg field="contact_phone" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="professionalEmail" className="text-xs text-muted-foreground uppercase tracking-wider font-semibold ml-1">
                E-mail Profissional
              </Label>
              <Input
                id="professionalEmail"
                type="email"
                value={initialData.professionalEmail}
                onChange={(e) => setInitialData(prev => prev ? { ...prev, professionalEmail: e.target.value } : null)}
                placeholder="email@exemplo.com"
                disabled={isSubmitting}
                className={`bg-white dark:bg-card shadow-sm h-14 rounded-2xl px-5 ${getErrorClass("contact_email")}`}
              />
              <ErrorMsg field="contact_email" />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold text-base rounded-2xl active:scale-[0.98] transition-transform shadow-md disabled:opacity-50 disabled:active:scale-100 mt-6"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              {isSubmitting ? "Salvando..." : "Salvar Alterações"}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}

export default function UpdateSpecialistPage() {
  return (
    <div className="flex flex-col min-h-[100dvh] bg-background items-center">
      <title>Atualizar Especialista - Cicatrizando</title>
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        }
      >
        <UpdateSpecialistContent />
      </Suspense>
    </div>
  );
}
