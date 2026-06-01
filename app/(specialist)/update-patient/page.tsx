"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authenticatedFetch } from "@/store/authStore";
import { ChevronLeft, Loader2, Save } from "lucide-react";
import { PatientForm, PatientFormData } from "@/components/PatientForm";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function UpdatePatientContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  
  const [initialData, setInitialData] = useState<PatientFormData | null>(null);
  const [initialComorbidities, setInitialComorbidities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const response = await authenticatedFetch(`${API_URL}/specialist/patient/update/${id}/`);
        if (response.ok) {
          const data = await response.json();
          setInitialData({
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

  const handleSubmit = async (formData: PatientFormData) => {
    setError(null);
    setIsSubmitting(true);

    try {
      const requestBody = {
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
        if (errorData.error) throw new Error(errorData.error);
        if (errorData.state) throw new Error(`Estado: ${errorData.state.join(', ')}`);
        if (errorData.detail) throw new Error(errorData.detail);
        throw new Error('Erro ao atualizar paciente. Verifique os dados e tente novamente.');
      }

      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
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

          {initialData && (
            <PatientForm
              initialData={initialData}
              initialComorbidities={initialComorbidities}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              submitLabel="Salvar Alterações"
              submitIcon={<Save className="w-5 h-5" />}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default function UpdatePatientPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-background"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <UpdatePatientContent />
    </Suspense>
  );
}
