"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authenticatedFetch } from "@/store/authStore";
import { handleApiResponse, ApiValidationError } from "@/lib/errors";
import { ChevronLeft, Loader2, Save } from "lucide-react";
import { PatientForm, PatientFormData } from "@/components/PatientForm";
import type { Comorbidity } from "@/lib/types";

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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

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
            comorbidities: data.comorbidities?.map((c: Comorbidity) => c.concept_id) || [],
            smokingStatus: data.smoking_status || "",
            alcoholConsumption: Array.isArray(data.alcohol_consumption) ? data.alcohol_consumption : [data.alcohol_consumption].filter(Boolean),
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
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const requestBody = {
        google_email: formData.contactEmail,
        name: formData.fullName,
        birth_date: formData.birthDate,
        state: formData.state ? formData.state.toUpperCase() : "",
        city: formData.city,
        contact_phone: formData.contactPhone,
        contact_email: formData.contactEmail,
        gender: formData.gender || null,
        height: formData.height ? parseFloat(formData.height) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        comorbidities: formData.comorbidities,
        smoking_status: formData.smokingStatus || null,
        alcohol_consumption: formData.alcoholConsumption,
      };

      const response = await authenticatedFetch(`${API_URL}/specialist/patient/update/${id}/`, {
        method: "PUT",
        body: JSON.stringify(requestBody),
      });

      await handleApiResponse(response, 'Erro ao atualizar paciente. Verifique os dados e tente novamente.');

      router.back();
    } catch (err) {
      if (err instanceof ApiValidationError) {
        setFieldErrors(err.fieldErrors);
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
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
            fieldErrors={fieldErrors}
          />
        )}
      </main>
    </div>
  );
}

export default function UpdatePatientPage() {
  return (
    <div className="flex flex-col min-h-[100dvh] bg-background items-center">
      <title>Atualizar Paciente - Cicatrizando</title>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }>
        <UpdatePatientContent />
      </Suspense>
    </div>
  );
}
