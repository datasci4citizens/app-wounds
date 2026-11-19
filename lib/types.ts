// ─── Shared type definitions for the Cicatrizando app ───

/** A comorbidity/condition from the SNOMED-based terminology system */
export interface Comorbidity {
  concept_id: string;
  code: string;
  name: string;
}

/** Smoking status values from the backend */
export type SmokingStatus = 'NEVER' | 'LT10' | 'GT10' | 'EX';

/** Alcohol consumption values from the backend */
export type AlcoholConsumption =
  | 'NONE' | 'EX'
  | 'LT21_M' | 'GT21_M'
  | 'LT13_M' | 'GT13_M'
  | 'LT14_F' | 'GT14_F'
  | 'LT9_F' | 'GT9_F';

/** Specialist professional data (nested in UserProfile from /auth/me/) */
export interface Specialist {
  id: number;
  professional_id: string;
  contact_phone: string;
  contact_email: string;
}

/** A specialist assigned to a patient (patient perspective) */
export interface AssignedSpecialist {
  id: number;
  name: string;
  professional_id: string;
  contact_phone?: string;
  contact_email?: string;
}

/** A patient record as returned by the specialist's patient list endpoint */
export interface Patient {
  id: number;
  name: string;
  birth_date: string | null;
  state: string | null;
  city: string | null;
  gender: 'M' | 'F' | null;
  height: number | null;
  weight: number | null;
  smoking_status: SmokingStatus | null;
  alcohol_consumption: AlcoholConsumption | AlcoholConsumption[] | null;
  comorbidities: Comorbidity[];
  contact_phone: string | null;
  contact_email: string | null;
  /** Optional aggregate counts provided by the backend */
  wounds_count?: number;
  active_wounds_count?: number;
  /** Specialists assigned to this patient (patient perspective) */
  assigned_specialists?: AssignedSpecialist[];
}

/** The full authenticated user profile from GET /auth/me/ */
export interface UserProfile {
  id: number;
  email: string;
  name: string | null;
  birth_date: string | null;
  state: string | null;
  city: string | null;
  role: 'specialist' | 'patient' | null;
  registration_complete: boolean;
  specialist?: Specialist | null;
  /** Present when the user is a patient */
  patient?: Patient | null;
}

/**
 * Mapeia o role retornado pela API (/auth/me/, 'specialist'|'patient') para o
 * tipo usado internamente pelo frontend ('Pr'|'Pa', espelhando o banco Django).
 *
 * Fonte da verdade para checks de UI e privacidade: UserRole ('Pr'/'Pa') do store.
 * UserProfile.role é apenas a representação da resposta da API.
 */
export const mapApiRoleToStoreRole = (role: 'specialist' | 'patient' | null): 'Pr' | 'Pa' | null => {
  if (role === 'specialist') return 'Pr';
  if (role === 'patient') return 'Pa';
  return null;
};

/** A wound record from the /wounds/ endpoint */
export interface Wound {
  id: number;
  patient: number;
  patient_name: string;
  etiology: string;
  location: string;
  created_at: string;
  is_healed: boolean;
}

/** An observation record from /wounds/{id}/observations/ */
export interface Observation {
  id: number;
  wound: number;
  author: number;
  author_name: string;
  author_role: string;
  created_at: string;
  pain_level: number;
  pain_increased?: boolean;
  odor_change?: boolean;
  has_exudate?: boolean;
  exudate_increased?: boolean;
  change_in_exudate_color?: boolean;
  exudate_color?: string;
  has_swelling?: boolean;
  redness_increased?: boolean;
  exudate_amount: string;
  exudate_type: string;
  tissue_type: string;
  dressing_changes: number | null;
  periwound_skin: string;
  wound_edge: string;
  fever_24h: boolean;
  extra_notes: string | null;
  patient_guidelines: string | null;
  image: string | null;
}
