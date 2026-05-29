"use client";

import { useState } from "react";
import { authenticatedFetch } from "@/store/authStore";
import { CheckCircle2 } from "lucide-react";
import { PatientForm, PatientFormData } from "@/components/PatientForm";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface PatientProfileReviewProps {
  profile: any;
  onComplete: () => void;
  title?: string;
  description?: string;
  submitLabel?: string;
}

export function PatientProfileReview({ 
  profile, 
  onComplete,
  title = "Confirme seus dados",
  description = "Por favor, revise e complete as informações abaixo para começar.",
  submitLabel = "Confirmar e Entrar"
}: PatientProfileReviewProps) {
  const patient = profile.patient || {};
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialData: PatientFormData = {
    fullName: profile.name || "",
    birthDate: profile.birth_date || "",
    state: profile.state || "",
    city: profile.city || "",
    contactPhone: patient.contact_phone || "",
    contactEmail: patient.contact_email || profile.email || "",
    gender: patient.gender || "",
    height: patient.height?.toString() || "",
    weight: patient.weight?.toString() || "",
    comorbidities: patient.comorbidities?.map((c: any) => c.concept_id) || [],
    smokingStatus: patient.smoking_status || "",
    alcoholConsumption: patient.alcohol_consumption || "",
  };

  const handleSubmit = async (formData: PatientFormData) => {
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
              {title}
            </h1>
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm">
              {error}
            </div>
          )}

          <PatientForm
            initialData={initialData}
            initialComorbidities={patient.comorbidities || []}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitLabel={submitLabel}
            submitIcon={<CheckCircle2 className="w-5 h-5" />}
          />
        </main>
      </div>
    </div>
  );
}
