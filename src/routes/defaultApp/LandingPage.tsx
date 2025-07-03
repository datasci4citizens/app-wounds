import { useNavigate } from "react-router-dom";
import { BandageIcon } from "@/components/ui/new/bandage-logo/BandageIcon";
import { CicatrizandoSvg } from "@/components/ui/new/cicatrizando-logo/CicatrizandoSvg";
import { useGoogleLogin } from "@react-oauth/google";
import { Capacitor } from "@capacitor/core";
import axios from "axios";
import { GoogleAuthButton } from "@/components/ui/new/general/GoogleAuthButton";
import { Browser } from '@capacitor/browser';
import { App } from '@capacitor/app';
import { useEffect } from "react";
import { GoogleAuth } from "@codetrix-studio/capacitor-google-auth";

// Define interfaces for API responses
interface ProviderData {
  provider_name: string;
  // Add other provider fields if needed
}

interface LoginResponse {
  access: string;
  refresh: string;
  role: string;
  is_new_user: boolean;
  specialist_id: number | null;
  provider_id: number | null;
  specialist_data: any | null;
  provider_data: ProviderData | null;
  patient_data: {
    patient_id: number;
    patient_name: string;
  } | null;
  profile_completion_required: boolean;
}


const LandingPage = () => {
  const navigate = useNavigate();
  
  const isNative = Capacitor.isNativePlatform();

  // Handle OAuth success response
  const handleAuthSuccess = async (code: string, isToken: boolean) => {
    try {
      // Send the code to the backend with CORS headers
      let requestBody;
      if(isToken) {
        requestBody = {
          token: code,
          // Add any other necessary fields here
        };
      } else {
        requestBody = {
          code: code,
          // Add any other necessary fields here
        };
      }
      const response = await axios.post<LoginResponse>(
        `${import.meta.env.VITE_SERVER_URL}/auth/login/google/`,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          withCredentials: true
        }
      );
      
      const { 
        access, 
        refresh, 
        specialist_data, 
        patient_data,
        profile_completion_required,
        role,
      } = response.data;
      
      // Store tokens in localStorage
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
      localStorage.setItem("user_role", role);
      
      // Check role and handle navigation accordingly
      switch (role) {
        case "user":
          navigate("/role-selection");
          break;
        case "specialist":
          // Store provider name if available
          if (specialist_data?.specialist_name) {
            localStorage.setItem("provider_name", specialist_data.specialist_name);
          }
          
          if (specialist_data) {
            localStorage.setItem("specialist_data", JSON.stringify(specialist_data));
          }
          // Check if profile completion is required
          if (profile_completion_required) {
            navigate("/specialist-signup");
          } else {
            navigate("/specialist/menu");
          }
          break;
        case "patient":
          // Store patient data in localStorage
          if (patient_data) {
            localStorage.setItem("patient_id", String(patient_data.patient_id));
            localStorage.setItem("patient_name", patient_data.patient_name);
          }
          navigate("/patient/menu");
          break;
        default:
          navigate("/role-selection")
          console.error("Unknown role:", role);
      }
      
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  // Native platform authentication handler
  const handleNativeAuth = async () => {
    try {
      // Wrap GoogleAuth operations in try/catch blocks individually
      try {
        await GoogleAuth.signOut();
      } catch (signOutErr) {
        // Continue with sign in even if sign out fails
      }
      
      // Add a small delay before signing in to prevent app crashes
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const googleUser = await GoogleAuth.signIn();
      const idToken = googleUser.authentication.idToken;
      localStorage.removeItem("accessToken");

      await handleAuthSuccess(idToken, true);
    } catch (err: any) {
      const full = JSON.stringify(err, Object.getOwnPropertyNames(err));

      console.error("Erro ao logar (mobile):", err);
      // Use console.error instead of alert for better debugging
      console.error("Detalhes:", full);
    }
  };
  
  // Handle deep links for OAuth callback
  // Initialize GoogleAuth on component mount for native platforms
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      // Initialize GoogleAuth with proper configuration
      GoogleAuth.initialize({
        clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        scopes: ['profile', 'email'],
        grantOfflineAccess: true,
      });
    }
  }, []);

  useEffect(() => {
    const handleAppUrlOpen = async (data: { url: string }) => {
      
      if (data.url.includes('oauth2redirect')) {
        try {
          const url = new URL(data.url);
          const code = url.searchParams.get('code');
          const state = url.searchParams.get('state');
          const storedState = localStorage.getItem('oauth_state');
          
          if (state !== storedState) {
            console.error("State mismatch");
            return;
          }
          
          if (code) {
            try {
              await Browser.close();
            } catch (browserErr) {
            }
            await handleAuthSuccess(code, true);
          }
        } catch (err) {
          console.error("Error processing deep link:", err);
        }
      }
    };
    
    if (isNative) {
      App.addListener('appUrlOpen', handleAppUrlOpen);
    }
    
    return () => {
      if (isNative) {
        App.removeAllListeners();
      }
    };
  }, []);

  // Web platform authentication
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const code = tokenResponse.code;
      await handleAuthSuccess(code, false);
    },
    onError: (errorResponse) => {
      console.error("Google login error:", errorResponse);
      alert("Google login failed. Please try again.");
    },
    flow: 'auth-code',
    ux_mode: 'popup',
  });
  
  // Combined login function that handles both platforms
  const handleLogin = () => {
    try {
      if (isNative) {
          handleNativeAuth();
      } else {
        login();
      }
    } catch (err) {
      console.error("Login error:", err);
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="mb-8">
        <BandageIcon theme="default" size={1.5} />
      </div>
      <CicatrizandoSvg className="mb-8" width={216} height={20} />
      <div className="mt-32">
        <GoogleAuthButton onClick={handleLogin} />
      </div>
    </div>
  );
};

export default LandingPage;
