import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GoogleButton from 'react-google-button';
import AppHeader from '@/components/ui/common/AppHeader';

const LoginPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUserRole() {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/auth/me`, {
        credentials: "include",
      });
      const user = await res.json();
  
      localStorage.setItem("user_role", user.role);

      if (user.role === "specialist") {
        navigate("/specialist-menu");
      } else if (user.role === "patient") {
        navigate("/patient-menu");
      }
    }
  
    fetchUserRole();
  }, [navigate]); 

  function login() {
    window.location.href = `${import.meta.env.VITE_SERVER_URL}/auth/login/google`;
  }

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
