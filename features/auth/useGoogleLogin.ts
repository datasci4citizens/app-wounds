import { useState } from 'react';
import { useGoogleLogin as useGoogleOAuth } from '@react-oauth/google';
import { useRouter } from 'next/navigation';
import { useUserStore, UserRole, isSpecialist } from '@/store/userStore';
import { useAuthStore } from '@/store/authStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Response from server-wounds Google login endpoint
 * POST /auth/google/
 */
interface GoogleLoginResponse {
  access: string;
  refresh: string;
  email: string;
  full_name: string;
  registration_complete: boolean;
  role: string | null; // "specialist", "patient", or null
}

/**
 * Maps the role display name from backend to the role code
 */
const mapRoleDisplayToCode = (roleDisplay: string | null): UserRole => {
  if (!roleDisplay) return null;
  if (roleDisplay === 'specialist') return 'Pr';
  if (roleDisplay === 'patient') return 'Pa';
  return null;
};

export const useGoogleLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const setUser = useUserStore((state) => state.setUser);
  const setTokens = useAuthStore((state) => state.setTokens);

  const googleLogin = useGoogleOAuth({
    flow: 'auth-code',
    onSuccess: async (codeResponse) => {
      setIsLoading(true);
      try {
        // Exchange the auth code for JWT token via Django backend
        // Endpoint matches server-wounds: POST /auth/google/
        const response = await fetch(`${API_URL}/auth/google/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            auth_code: codeResponse.code
          }),
        });

        if (!response.ok) {
          const responseText = await response.text().catch(() => '');
          let errorData: Record<string, unknown> = {};
          try {
            errorData = responseText ? JSON.parse(responseText) : {};
          } catch {
            // Response is not JSON
          }
          console.error('Login failed - status:', response.status);
          console.error('Login failed - statusText:', response.statusText);
          console.error('Login failed - responseText:', responseText);
          console.error('Login failed - url:', `${API_URL}/auth/google/`);
          throw new Error(errorData.detail as string || `Erro ao autenticar com Google (${response.status})`);
        }

        const data: GoogleLoginResponse = await response.json();

        // Store JWT tokens
        setTokens({
          access: data.access,
          refresh: data.refresh,
        });

        // Map role display name to code
        const role = mapRoleDisplayToCode(data.role);

        // Store user data
        setUser({
          email: data.email,
          fullName: data.full_name,
          role,
          registrationComplete: data.registration_complete,
        });

        // Route based on registration status and role
        if (!data.registration_complete) {
          // User needs to complete registration
          if (!role) {
            // No role selected yet
            router.push('/role-selection');
          } else if (isSpecialist(role)) {
            // Specialist needs to complete profile
            router.push('/register-specialist');
          } else {
            // Patient role - currently goes to timeline
            router.push('/timeline');
          }
        } else {
          router.push('/');
        }

      } catch (error) {
        if (error instanceof TypeError) {
          // Network errors (CORS, server down, etc.)
          console.error('Network error during login:', {
            message: error.message,
            apiUrl: API_URL,
            hint: 'Check if the Django backend is running and CORS is configured',
          });
        } else {
          console.error('Erro no login com Google:', error);
        }
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      console.error('Erro no login com Google');
      setIsLoading(false);
    },
  });

  const signInWithGoogle = () => {
    setIsLoading(true);
    googleLogin();
  };

  return { signInWithGoogle, isLoading };
};
