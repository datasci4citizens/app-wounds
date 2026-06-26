import { authenticatedFetch } from "@/store/authStore";
import { handleApiResponse } from "@/lib/errors";
import type { Wound, Observation, Patient } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Re-export types for convenience
export type { Wound, Observation, Patient };

export const fetchWounds = async (patientId?: number): Promise<Wound[]> => {
  const url = patientId 
    ? `${API_URL}/wounds/?patient_id=${patientId}` 
    : `${API_URL}/wounds/`;
    
  const response = await authenticatedFetch(url);
  if (!response.ok) throw new Error("Failed to fetch wounds");
  return response.json();
};

export const fetchObservations = async (woundId: number): Promise<Observation[]> => {
  const response = await authenticatedFetch(`${API_URL}/wounds/${woundId}/observations/`);
  if (!response.ok) throw new Error("Failed to fetch observations");
  return response.json();
};

export const fetchPatientById = async (patientId: number): Promise<Patient> => {
  // Fetch all patients for the current specialist and find the one we need
  const response = await authenticatedFetch(`${API_URL}/specialist/patients/`);
  if (!response.ok) throw new Error("Failed to fetch patient");
  const patients: Patient[] = await response.json();
  const patient = patients.find((p) => p.id === patientId);
  if (!patient) throw new Error("Patient not found");
  return patient;
};

export const createWound = async (data: Partial<Wound>): Promise<Wound> => {
  const response = await authenticatedFetch(`${API_URL}/wounds/`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create wound");
  return response.json();
};

export const createObservation = async (woundId: number, data: FormData): Promise<Observation> => {
  const response = await authenticatedFetch(`${API_URL}/wounds/${woundId}/observations/`, {
    method: "POST",
    body: data,
    // Note: When body is FormData, browser automatically sets multipart/form-data and boundary.
    // authenticatedFetch needs to NOT set Content-Type to application/json in this case.
  });

  await handleApiResponse(response, "Failed to create observation");
  return response.json();
};
