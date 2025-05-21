import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import GoogleButton from 'react-google-button';
import axios from 'axios';
import { BandageIcon } from '@/components/ui/new/bandage-logo/BandageIcon';

//DEPRECIATED - NOT CURRENTLY IN USE

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

const LoginPage = () => {
  const navigate = useNavigate();

  const login = useGoogleLogin({
    redirect_uri: 'postmessage',
    onSuccess: async ({ code }) => {
      try {
        // Envia o código para o backend
        const response = await axios.post<LoginResponse>(
          `${import.meta.env.VITE_SERVER_URL}/auth/login/google/`,
          { code }
        );
        
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
            console.error("Unknown role:", role);
        }
        
      } catch (err) {
        console.error("Login failed:", err);
      }
    },
    flow: 'auth-code',
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="mb-8">
        <BandageIcon theme="default" size={1.5} />
      </div>
      <h1 className="text-[#0120AC] text-xl">Login</h1>

      <div className="mt-40">
        <GoogleButton
          label=""
          onClick={login}
          style={{
            width: "100px",
            height: "52px",
            backgroundColor: "transparent",
            border: "1px solid #00000033",
            borderRadius: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        />
      </div>
    </div>
  );
};

export default LoginPage;
