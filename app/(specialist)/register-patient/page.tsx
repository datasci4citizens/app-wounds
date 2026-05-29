"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authenticatedFetch } from "@/store/authStore";
import { ChevronLeft, CheckCircle2 } from "lucide-react";
import { PatientForm, PatientFormData } from "@/components/PatientForm";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function RegisterPatientPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      const response = await authenticatedFetch(`${API_URL}/specialist/patient/register/`, {
        method: "POST",
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.error) throw new Error(errorData.error);
        if (errorData.state) throw new Error(`Estado: ${errorData.state.join(', ')}`);
        if (errorData.detail) throw new Error(errorData.detail);
        throw new Error('Erro ao cadastrar paciente. Verifique os dados e tente novamente.');
      }

      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsSubmitting(false);
    }
  };

  const initialData: PatientFormData = {
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
  };

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background items-center">
      <title>Cadastrar Paciente - Cicatrizando</title>
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
              Cadastrar Paciente
            </h1>
            <p className="text-sm text-muted-foreground">
              Preencha os dados do paciente para vinculá-lo à sua conta.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm">
              {error}
            </div>
          )}

          <PatientForm
            initialData={initialData}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitLabel="Cadastrar"
            submitIcon={<CheckCircle2 className="w-5 h-5" />}
          />
        </main>
      </div>
    </div>
  );
}
