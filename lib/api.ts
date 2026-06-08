import { authenticatedFetch } from "@/store/authStore";
import { handleApiResponse } from "@/lib/errors";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface Wound {
  id: number;
  patient: number;
  patient_name: string;
  etiology: string;
  location: string;
  created_at: string;
  is_healed: boolean;
}

export interface Observation {
  id: number;
  wound: number;
  author: number;
  author_name: string;
  author_role: string;
  created_at: string;
  pain_level: number;
  exudate_amount: string;
  exudate_type: string;
  tissue_type: string;
  dressing_changes: number;
  periwound_skin: string;
  wound_edge: string;
  fever_24h: boolean;
  extra_notes: string | null;
  patient_guidelines: string | null;
  image: string | null;
}

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
