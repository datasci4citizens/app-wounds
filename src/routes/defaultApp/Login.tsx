import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import GoogleButton from 'react-google-button';
import AppHeader from '@/components/ui/common/AppHeader';
import axios from 'axios';

const LoginPage = () => {
  const navigate = useNavigate();

  const login = useGoogleLogin({
    onSuccess: async ({ code }) => {
      try {
        // Envia o código para o backend
        const tokenRes = await axios.post(`${import.meta.env.VITE_SERVER_URL}/auth/login/google/`, {
          code,
        }, { withCredentials: true });

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <AppHeader title="Login" />

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
