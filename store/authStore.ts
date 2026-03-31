import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AuthTokens {
  access: string;
  refresh: string;
}

interface AuthState {
  tokens: AuthTokens | null;
  setTokens: (tokens: AuthTokens | null) => void;
  clearTokens: () => void;
  getAccessToken: () => string | null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      tokens: null,
      setTokens: (tokens) => set({ tokens }),
      clearTokens: () => set({ tokens: null }),
      getAccessToken: () => get().tokens?.access ?? null,
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

/**
 * Helper function to get authorization headers for API calls
 */
export const getAuthHeaders = (): HeadersInit => {
  const token = useAuthStore.getState().getAccessToken();
  if (!token) {
    return {
      'Content-Type': 'application/json',
    };
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

/**
 * Helper function to refresh the access token using the refresh token
 */
export const refreshAccessToken = async (): Promise<string | null> => {
  const { tokens, setTokens, clearTokens } = useAuthStore.getState();
  
  if (!tokens?.refresh) {
    clearTokens();
    return null;
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: tokens.refresh }),
    });

    if (!response.ok) {
      clearTokens();
      return null;
    }

    const data = await response.json();
    setTokens({
      access: data.access,
      refresh: tokens.refresh,
    });
    
    return data.access;
  } catch (error) {
    console.error('Error refreshing token:', error);
    clearTokens();
    return null;
  }
};
