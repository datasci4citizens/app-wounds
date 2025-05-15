import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import GoogleButton from 'react-google-button';
import axios from 'axios';
import { BandageIcon } from '@/components/ui/new/bandage-logo/BandageIcon';

const LoginPage = () => {
  const navigate = useNavigate();

  const login = useGoogleLogin({
    redirect_uri: 'postmessage',
    onSuccess: async ({ code }) => {
      try {
        // Envia o código para o backend
        const tokenRes = await axios.post(`${import.meta.env.VITE_SERVER_URL}/auth/login/google/`, {
          code,
        });

        const access = tokenRes.data.access;

        // Usa o token para consultar a role
        const userRes = await axios.get(`${import.meta.env.VITE_SERVER_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${access}` }
        });

        const role = userRes.data.role;
        localStorage.setItem("user_role", role);

        if (role === "specialist") {
          navigate("/specialist-menu");
        } else if (role === "patient") {
          navigate("/patient-menu");
        } else {
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
