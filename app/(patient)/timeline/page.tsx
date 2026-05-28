"use client";

import { PatientDashboard } from "@/components/PatientDashboard";
import { useEffect, useState } from "react";
import { useAuthStore, authenticatedFetch } from "@/store/authStore";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function PatientTimelinePage() {
  const router = useRouter();
  const tokens = useAuthStore((state) => state.tokens);
  const [profile, setProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!tokens?.access) {
      router.push("/login");
      return;
    }

    const fetchPatientData = async () => {
      try {
        const response = await authenticatedFetch(`${API_URL}/auth/me/`);
        if (response.ok) {
          const profileData = await response.json();
          
          if (profileData.role === 'patient') {
            const patientRes = await authenticatedFetch(`${API_URL}/patient/me/`);
            if (patientRes.ok) {
                const patientData = await patientRes.json();
                setProfile({ ...profileData, patient: patientData });
            } else {
                setProfile(profileData);
            }
          } else {
              router.push("/");
          }
        }
      } catch (err) {
        console.error("Error fetching patient profile:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatientData();
  }, [tokens, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) return null;

  return <PatientDashboard profile={profile} />;
}
