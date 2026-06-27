import { create } from 'zustand';

interface NavigationContext {
  specialistId: number | null;
  threshold: string | null;
  setContext: (ctx: { specialistId: number; threshold: string }) => void;
  clearContext: () => void;
}

/**
 * Transient navigation context for specialist pages.
 * Stores specialistId and notification threshold so they don't pollute the URL.
 * Cleared automatically on next setContext call.
 */
export const useNavigationContext = create<NavigationContext>((set) => ({
  specialistId: null,
  threshold: null,
  setContext: (ctx) => set({ specialistId: ctx.specialistId, threshold: ctx.threshold }),
  clearContext: () => set({ specialistId: null, threshold: null }),
}));
