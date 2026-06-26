"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, authenticatedFetch } from "@/store/authStore";
import type { UserProfile, Patient } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface DashboardData {
  profile: UserProfile | null;
  patients: Patient[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useDashboardData(): DashboardData {
  const router = useRouter();
  const tokens = useAuthStore((state) => state.tokens);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Wait for Zustand hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Fetch profile + patients
  useEffect(() => {
    if (!isHydrated) return;

    if (!tokens?.access) {
      router.push("/login");
      return;
    }

    let cancelled = false;

    const fetchData = async () => {
      try {
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
        if (cancelled) return;

        if (profileData.role === 'specialist') {
          const patientsRes = await authenticatedFetch(`${API_URL}/specialist/patients/`);
          if (patientsRes.ok && !cancelled) {
            const patientsData = await patientsRes.json();
            setPatients(patientsData);
          }
          setProfile(profileData);
        } else if (profileData.role === 'patient') {
          const patientRes = await authenticatedFetch(`${API_URL}/patient/me/`);
          if (patientRes.ok && !cancelled) {
            const patientData = await patientRes.json();
            setProfile({ ...profileData, patient: patientData });
          } else {
            setProfile(profileData);
          }
        } else {
          setProfile(profileData);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error");
          console.error("Error fetching data:", err);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => { cancelled = true; };
  }, [router, tokens, isHydrated, refreshKey]);

  return {
    profile,
    patients,
    isLoading,
    error,
    refresh: () => setRefreshKey(k => k + 1),
  };
}
