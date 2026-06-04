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
  const baseHeaders: HeadersInit = {
    'ngrok-skip-browser-warning': 'true',
  };

  if (!token) {
    return baseHeaders;
  }
  return {
    ...baseHeaders,
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
        'ngrok-skip-browser-warning': 'true',
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

/**
 * A wrapper around fetch that automatically handles token refresh on 401 errors
 */
export const authenticatedFetch = async (
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> => {
  const authHeaders = getAuthHeaders();
  const headers: Record<string, string> = {
    ...(authHeaders as Record<string, string>),
    ...(init?.headers as Record<string, string> || {}),
  };

  // Automatically add Content-Type: application/json if NOT FormData
  if (!(init?.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  // First attempt
  let response = await fetch(input, {
    ...init,
    headers,
  });

  // If unauthorized, try to refresh token and retry once
  if (response.status === 401) {
    const newAccessToken = await refreshAccessToken();
    
    if (newAccessToken) {
      // Get fresh auth headers with new token
      const freshAuthHeaders = getAuthHeaders();
      const freshHeaders = {
        ...headers,
        ...(freshAuthHeaders as Record<string, string>),
      };

      // Retry with new token
      response = await fetch(input, {
        ...init,
        headers: freshHeaders,
      });
    }
  }

  return response;
};
