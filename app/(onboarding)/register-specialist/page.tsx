"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/userStore";
import { useAuthStore, getAuthHeaders } from "@/store/authStore";
import { ChevronLeft, CheckCircle2, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

/**
 * Request body for specialist registration
 * POST /auth/register/specialist/
 */
interface SpecialistRegistrationRequest {
  name: string;
  birth_date: string; // YYYY-MM-DD format
  state: string; // 2-letter Brazilian state code
  city: string;
  professional_id: string;
  contact_phone?: string;
  contact_email?: string;
}

export default function RegisterSpecialistPage() {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const setRegistrationComplete = useUserStore((state) => state.setRegistrationComplete);
  
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    birthDate: "",
    state: "",
    city: "",
    professionalId: "",
    professionalPhone: "",
    professionalEmail: user?.email || "",
  });

  const [states, setStates] = useState<IBGEState[]>([]);
  const [cities, setCities] = useState<IBGECity[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar estados ao carregar a página
  useEffect(() => {
    fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome")
      .then((res) => res.json())
      .then((data) => setStates(data))
      .catch((err) => console.error("Erro ao buscar estados:", err));
  }, []);

  // Buscar cidades quando o estado muda
  useEffect(() => {
    if (formData.state) {
      setIsLoadingCities(true);
      fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${formData.state}/municipios?orderBy=nome`)
        .then((res) => res.json())
        .then((data) => {
          setCities(data);
          // Se o estado mudou, reseta a cidade
          setFormData(prev => ({ ...prev, city: "" }));
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
    
    setFormData((prev) => ({ ...prev, professionalPhone: formatted }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Prepare request body matching server-wounds API
      const requestBody: SpecialistRegistrationRequest = {
        name: formData.fullName,
        birth_date: formData.birthDate, // Already in YYYY-MM-DD format from date input
        state: formData.state.toUpperCase(),
        city: formData.city,
        professional_id: formData.professionalId,
        contact_phone: formData.professionalPhone || undefined,
        contact_email: formData.professionalEmail || undefined,
      };

      // Call the specialist registration endpoint
      // POST /auth/register/specialist/
      const response = await fetch(`${API_URL}/auth/register/specialist/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Handle validation errors from Django
        if (errorData.state) {
          throw new Error(`Estado: ${errorData.state.join(', ')}`);
        }
        if (errorData.professional_id) {
          throw new Error(`ID Profissional: ${errorData.professional_id.join(', ')}`);
        }
        if (errorData.detail) {
          throw new Error(errorData.detail);
        }
        
        throw new Error('Erro ao completar cadastro. Tente novamente.');
      }

      // Update user state to reflect completed registration
      setRegistrationComplete(true);

      // Navigate to specialist dashboard
      router.push("/");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao registrar especialista:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background items-center">
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
              Complete seu perfil
            </h1>
            <p className="text-sm text-muted-foreground">
              Precisamos de mais algumas informações para configurar sua conta de especialista.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm">
              {error}
            </div>
          )}

          <form id="specialist-form" onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-xs text-muted-foreground uppercase tracking-wider font-semibold ml-1">
                Nome Completo
              </Label>
              <Input 
                id="fullName" 
                name="fullName"
                placeholder="Digite seu nome completo" 
                value={formData.fullName}
                onChange={handleChange}
                required
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
                required
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
                    required
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
                    required
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
              <Label htmlFor="professionalId" className="text-xs text-muted-foreground uppercase tracking-wider font-semibold ml-1">
                Registro Profissional (COREN/CRM)
              </Label>
              <Input 
                id="professionalId" 
                name="professionalId"
                placeholder="Ex: COREN-SP 123456" 
                value={formData.professionalId}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                className="bg-white dark:bg-card border-transparent shadow-sm h-14 rounded-2xl px-5"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="professionalPhone" className="text-xs text-muted-foreground uppercase tracking-wider font-semibold ml-1">
                Telefone Profissional
              </Label>
              <Input 
                id="professionalPhone" 
                name="professionalPhone"
                type="tel"
                placeholder="(00) 00000-0000" 
                value={formData.professionalPhone}
                onChange={handlePhoneChange}
                maxLength={15}
                disabled={isSubmitting}
                className="bg-white dark:bg-card border-transparent shadow-sm h-14 rounded-2xl px-5"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="professionalEmail" className="text-xs text-muted-foreground uppercase tracking-wider font-semibold ml-1">
                E-mail Profissional
              </Label>
              <Input 
                id="professionalEmail" 
                name="professionalEmail"
                type="email"
                placeholder="email@exemplo.com" 
                value={formData.professionalEmail}
                onChange={handleChange}
                disabled={isSubmitting}
                className="bg-white dark:bg-card border-transparent shadow-sm h-14 rounded-2xl px-5"
              />
            </div>
          </form>
        </main>

        {/* Footer fixo para o botão principal */}
        <footer className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background to-transparent pb-[calc(env(safe-area-inset-bottom)+24px)] pt-12 pointer-events-none">
          <button
            type="submit"
            form="specialist-form"
            disabled={isSubmitting}
            className="w-full h-14 flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold text-base rounded-2xl active:scale-[0.98] transition-transform shadow-md pointer-events-auto disabled:opacity-50 disabled:active:scale-100"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <CheckCircle2 className="w-5 h-5" />
            )}
            {isSubmitting ? "Salvando..." : "Concluir"}
          </button>
        </footer>
      </div>
    </div>
  );
}
