// ─── Centralized localStorage key generators ───
// All notification-related keys use these functions to avoid typos and
// ensure consistency across the dashboard, patient-wounds, and wound-detail pages.

type Id = string | number;

/** Global timestamp: when the specialist last visited the dashboard */
export const lastCheckKey = (specialistId: Id) =>
  `specialist_last_check_${specialistId}`;

/** Per-patient dismissal: when the specialist last viewed this patient's wounds */
export const patientSeenKey = (specialistId: Id, patientId: Id) =>
  `specialist_seen_patient_${specialistId}_${patientId}`;

/** Per-wound dismissal: when the specialist last viewed this specific wound */
export const woundSeenKey = (specialistId: Id, woundId: Id) =>
  `specialist_seen_wound_${specialistId}_${woundId}`;
