"use client";

import { useState, useEffect, useRef } from "react";
import { fetchWounds, fetchObservations } from "@/lib/api";
import { lastCheckKey, patientSeenKey, woundSeenKey } from "@/lib/storage-keys";
import type { Wound, Patient, Observation } from "@/lib/types";

interface NotificationState {
  allWounds: Wound[];
  newObservationsCount: number;
  patientNewObsMap: Record<number, number>;
  patientHasFever: Record<number, boolean>;
  patientWoundMap: Record<number, { total: number; active: number; healed: number }>;
  isLoading: boolean;
  thresholdRef: React.MutableRefObject<string>;
}

export function useSpecialistNotifications(
  profileId: number,
  patients: Patient[]
): NotificationState {
  const [allWounds, setAllWounds] = useState<Wound[]>([]);
  const [newObservationsCount, setNewObservationsCount] = useState(0);
  const [patientNewObsMap, setPatientNewObsMap] = useState<Record<number, number>>({});
  const [patientHasFever, setPatientHasFever] = useState<Record<number, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const thresholdRef = useRef("");

  const storageKey = lastCheckKey(profileId);

  useEffect(() => {
    if (patients.length === 0) {
      setIsLoading(false);
      return;
    }

    const navEntry = performance.getEntriesByType?.("navigation")?.[0] as PerformanceNavigationTiming | undefined;
    const isReload = navEntry?.type === "reload";

    const loadAll = async () => {
      // 1. Fetch all wounds
      const results = await Promise.allSettled(
        patients.map((p) => fetchWounds(p.id))
      );
      const wounds: Wound[] = [];
      results.forEach((r) => {
        if (r.status === "fulfilled") wounds.push(...r.value);
      });
      setAllWounds(wounds);

      // 2. Read last-seen timestamp
      const raw = typeof window !== "undefined"
        ? localStorage.getItem(storageKey)
        : null;

      let lastCheck: Date;
      if (!raw) {
        lastCheck = new Date();
        if (typeof window !== "undefined") {
          localStorage.setItem(storageKey, lastCheck.toISOString());
        }
      } else {
        lastCheck = new Date(raw);
      }
      thresholdRef.current = lastCheck.toISOString();

      // 3. Fetch observations for all wounds
      // TODO: Replace with a backend aggregate endpoint
      // (e.g. GET /specialist/dashboard-stats/?since=...)
      // to avoid N×M requests for larger patient panels.
      const obsResults = await Promise.allSettled(
        wounds.map(w => fetchObservations(w.id))
      );

      // 4. Count new observations
      let totalNew = 0;
      const perPatient: Record<number, number> = {};
      const feverMap: Record<number, boolean> = {};

      const woundPatientMap: Record<number, number> = {};
      wounds.forEach(w => { woundPatientMap[w.id] = w.patient; });

      wounds.forEach((w, idx) => {
        const r = obsResults[idx];
        if (r.status !== "fulfilled") return;
        const patientId = woundPatientMap[w.id];

        const patientSeenRaw = typeof window !== "undefined"
          ? localStorage.getItem(patientSeenKey(profileId, patientId))
          : null;
        const woundSeenRaw = typeof window !== "undefined"
          ? localStorage.getItem(woundSeenKey(profileId, w.id))
          : null;
        const threshold = new Date(Math.max(
          lastCheck.getTime(),
          patientSeenRaw ? new Date(patientSeenRaw).getTime() : 0,
          woundSeenRaw ? new Date(woundSeenRaw).getTime() : 0
        ));

        r.value.forEach((obs: Observation) => {
          if (new Date(obs.created_at) > threshold) {
            totalNew++;
            perPatient[patientId] = (perPatient[patientId] || 0) + 1;
            if (obs.fever_24h) {
              feverMap[patientId] = true;
            }
          }
        });
      });

      setNewObservationsCount(totalNew);
      setPatientNewObsMap(perPatient);
      setPatientHasFever(feverMap);

      // 5. Store arrival time only if not a refresh
      if (typeof window !== "undefined" && !isReload) {
        localStorage.setItem(storageKey, new Date().toISOString());
      }
      setIsLoading(false);
    };

    loadAll();
  }, [patients, storageKey, profileId]);

  // Per-patient wound counts
  const patientWoundMap: Record<number, { total: number; active: number; healed: number }> = {};
  patients.forEach((p) => {
    patientWoundMap[p.id] = { total: 0, active: 0, healed: 0 };
  });
  allWounds.forEach((w) => {
    if (patientWoundMap[w.patient]) {
      patientWoundMap[w.patient].total++;
      if (w.is_healed) {
        patientWoundMap[w.patient].healed++;
      } else {
        patientWoundMap[w.patient].active++;
      }
    }
  });

  return {
    allWounds,
    newObservationsCount,
    patientNewObsMap,
    patientHasFever,
    patientWoundMap,
    isLoading,
    thresholdRef,
  };
}
