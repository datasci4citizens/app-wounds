"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, authenticatedFetch } from "@/store/authStore";
import { Loader2 } from "lucide-react";
import { SpecialistDashboard } from "@/components/SpecialistDashboard";
import { PatientDashboard } from "@/components/PatientDashboard";
import { PatientProfileReview } from "@/components/PatientProfileReview";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AppHome() {
  const router = useRouter();
  const tokens = useAuthStore((state) => state.tokens);
  const [profile, setProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);

  // Force re-fetch after review
  const [refreshKey, setRefreshKey] = useState(0);

  // Wait for Zustand to hydrate from localStorage
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    if (!tokens?.access) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch current user profile
        const response = await authenticatedFetch(`${API_URL}/auth/me/`, {
          method: "GET",
        });

        if (!response.ok) {
          if (response.status === 401) {
            router.push("/login");
            return;
          }
          throw new Error(`Failed to fetch profile (${response.status})`);
        }

        const profileData = await response.json();

        // If specialist, fetch their patients list
        if (profileData.role === 'specialist') {
          const patientsRes = await authenticatedFetch(`${API_URL}/specialist/patients/`);
          if (patientsRes.ok) {
            const patientsData = await patientsRes.json();
            setPatients(patientsData);
          }
          setProfile(profileData);
        }
        
        // If patient, fetch their extended profile
        else if (profileData.role === 'patient') {
            const patientRes = await authenticatedFetch(`${API_URL}/patient/me/`);
            if (patientRes.ok) {
                const patientData = await patientRes.json();
                setProfile({ ...profileData, patient: patientData });
            } else {
                setProfile(profileData);
            }
        } else {
            setProfile(profileData);
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router, tokens, isHydrated, refreshKey]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6 text-center">
        <p className="text-destructive mb-4">{error}</p>
        <button
          onClick={() => router.push("/login")}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
        >
          Ir para Login
        </button>
      </div>
    );
  }

  if (!profile) return null;

  // Smart Registration Flow for Patients
  if (profile.role === "patient" && !profile.registration_complete) {
    return (
      <PatientProfileReview 
        profile={profile} 
        title="Complete seu Cadastro"
        description="Por favor, revise e complete as informações abaixo para começar a usar o aplicativo."
        submitLabel="Confirmar e Entrar"
        onComplete={() => setRefreshKey(k => k + 1)} 
      />
    );
  }

  // Role Dispatcher
  if (profile.role === "specialist" && profile.registration_complete) {
    return <SpecialistDashboard profile={profile} patients={patients} />;
  }

  if (profile.role === "patient" && profile.registration_complete) {
    return <PatientDashboard profile={profile} />;
  }

  // Fallback for users without role or registration incomplete
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6 text-center">
      <h1 className="text-2xl font-bold text-primary mb-2 text-center">Aguardando Aprovação</h1>
      <p className="text-muted-foreground mb-6">
        Sua conta está em análise ou aguardando vinculação por um especialista.
      </p>
      <button
        onClick={() => router.push("/login")}
        className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold"
      >
        Voltar para Login
      </button>
    </div>
  );
}
