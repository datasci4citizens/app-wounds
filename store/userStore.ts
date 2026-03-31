import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Role values matching Django backend WoundsUser model
export type UserRole = 'Pr' | 'Pa' | null; // Pr = Provider/Specialist, Pa = Patient

// Role display labels for UI
export const ROLE_DISPLAY: Record<string, string> = {
  'Pr': 'Especialista',
  'Pa': 'Paciente',
};

interface User {
  email: string;
  fullName: string;
  role: UserRole;
  registrationComplete: boolean;
}

interface UserState {
  user: User | null;
  setUser: (user: User | null) => void;
  setRole: (role: UserRole) => void;
  setRegistrationComplete: (complete: boolean) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      setRole: (role) => set((state) => ({ 
        user: state.user ? { ...state.user, role } : null 
      })),
      setRegistrationComplete: (complete) => set((state) => ({
        user: state.user ? { ...state.user, registrationComplete: complete } : null
      })),
      clearUser: () => set({ user: null }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

/**
 * Helper to check if the user is a specialist/provider
 */
export const isSpecialist = (role: UserRole): boolean => role === 'Pr';

/**
 * Helper to check if the user is a patient
 */
export const isPatient = (role: UserRole): boolean => role === 'Pa';

/**
 * Get the display name for a role
 */
export const getRoleDisplay = (role: UserRole): string => {
  if (!role) return '';
  return ROLE_DISPLAY[role] || '';
};
