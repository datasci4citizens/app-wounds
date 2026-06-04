import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Capacitor } from '@capacitor/core';
import { SocialLogin } from '@capgo/capacitor-social-login';
import { useUserStore, UserRole, isSpecialist } from '@/store/userStore';
import { useAuthStore } from '@/store/authStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;

interface BackendLoginResponse {
  access: string;
  refresh: string;
  email: string;
  full_name: string;
  registration_complete: boolean;
  role: string | null;
}

const mapRoleDisplayToCode = (roleDisplay: string | null): UserRole => {
  if (roleDisplay === 'specialist') return 'Pr';
  if (roleDisplay === 'patient') return 'Pa';
  return null;
};

export const useGoogleLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();
  const setUser = useUserStore((state) => state.setUser);
  const setTokens = useAuthStore((state) => state.setTokens);

  useEffect(() => {
    SocialLogin.initialize({
      google: {
        webClientId: GOOGLE_CLIENT_ID,
        mode: 'offline', // Returns serverAuthCode for backend exchange
      },
    })
      .then(() => setIsInitialized(true))
      .catch((error) => console.error('Failed to initialize SocialLogin:', error));
  }, []);

  const exchangeAuthCode = useCallback(async (authCode: string): Promise<BackendLoginResponse> => {
    // For mobile platforms (Android/iOS), the redirect_uri must be an empty string
    // For web, it typically uses the origin or 'postmessage' (default in backend)
    const isNative = Capacitor.isNativePlatform();
    const payload: any = { auth_code: authCode };
    if (isNative) {
      payload.redirect_uri = '';
    } else {
      payload.redirect_uri = window.location.origin + window.location.pathname;
    }

    const response = await fetch(`${API_URL}/auth/google/`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      const errorData = errorText ? JSON.parse(errorText).detail : null;
      throw new Error(errorData || `Erro ao autenticar com Google (${response.status})`);
    }

    return response.json();
  }, []);

  const handleLoginSuccess = useCallback((data: BackendLoginResponse) => {
    setTokens({ access: data.access, refresh: data.refresh });
    
    const role = mapRoleDisplayToCode(data.role);
    setUser({
      email: data.email,
      fullName: data.full_name,
      role,
      registrationComplete: data.registration_complete,
    });

    if (!data.registration_complete) {
      if (!role) router.push('/role-selection');
      else if (isSpecialist(role)) router.push('/register-specialist');
      else router.push('/');
    } else {
      router.push('/');
    }
  }, [router, setTokens, setUser]);

  const signInWithGoogle = useCallback(async () => {
    setIsLoading(true);
    try {
      const { result } = await SocialLogin.login({
        provider: 'google',
        options: { scopes: ['email', 'profile'] },
      });

      if (result.responseType !== 'offline' || !result.serverAuthCode) {
        throw new Error('No auth code received from Google');
      }

      const data = await exchangeAuthCode(result.serverAuthCode);
      handleLoginSuccess(data);
    } catch (error) {
      console.error('Google login error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [exchangeAuthCode, handleLoginSuccess]);

  return { signInWithGoogle, isLoading, isInitialized };
};
