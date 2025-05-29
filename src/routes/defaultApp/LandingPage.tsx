import { useNavigate } from "react-router-dom";
import { BandageIcon } from "@/components/ui/new/bandage-logo/BandageIcon";
import { CicatrizandoSvg } from "@/components/ui/new/cicatrizando-logo/CicatrizandoSvg";
import { useGoogleLogin } from "@react-oauth/google";
import { Capacitor } from "@capacitor/core";
import axios from "axios";
import { GoogleAuthButton } from "@/components/ui/new/general/GoogleAuthButton";
import { Browser } from '@capacitor/browser';

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
  profile_completion_required: boolean;
}


const LandingPage = () => {
  const navigate = useNavigate();
  console.log("Arrived at landing page")
  console.log("Platform: ", navigator.userAgent);
  
  const isNative = Capacitor.isNativePlatform();
  console.log("Is native platform:", isNative);

  // Handle OAuth success response
  const handleAuthSuccess = async (code: string) => {
    console.log("Received code:", code);
    try {
      console.log(import.meta.env.VITE_SERVER_URL);
      // Send the code to the backend
      const response = await axios.post<LoginResponse>(
        `${import.meta.env.VITE_SERVER_URL}/auth/login/google/`,
        { code }
      );
      console.log("Login successful:", response.data);
      
      const { 
        access, 
        refresh, 
        provider_data, 
        profile_completion_required,
        role
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
          if (provider_data?.provider_name) {
            localStorage.setItem("provider_name", provider_data.provider_name);
          }
          
          // Check if profile completion is required
          if (profile_completion_required) {
            navigate("/specialist-signup");
          } else {
            navigate("/specialist/menu");
          }
          break;
        case "patient":
          // Handle patient role (no effect for now)
          console.log("User is a patient, no specific action taken");
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
    console.log("Starting native auth flow");
    try {
      // Get the OAuth URL
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      const redirectUri = encodeURIComponent(`${import.meta.env.VITE_SERVER_URL}/auth/callback/`);
      const scope = encodeURIComponent('email profile');
      const responseType = 'code';
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}`;
      
      // Open browser for authentication
      await Browser.open({ url: authUrl });
      
      // For native platforms, we need to handle the redirect manually
      // The user will need to copy the code from the browser
    } catch (err) {
      console.error("Native auth error:", err);
    }
  };

  // Web platform authentication
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      console.log("OAuth success:", tokenResponse);
      const code = tokenResponse.code;
      await handleAuthSuccess(code);
    },
    flow: 'auth-code',
    ux_mode: 'popup',
  });
  
  // Combined login function that handles both platforms
  const handleLogin = () => {
    if (isNative) {
      handleNativeAuth();
    } else {
      login();
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
