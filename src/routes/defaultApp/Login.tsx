import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GoogleButton from 'react-google-button';

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-primary">
      <img
        src="/wounds.svg"
        alt="Logo Cicatrizando"
        className="w-64 h-64 object-contain"
      />
      <div className="mt-40">
        <GoogleButton label="Entrar com o Google" onClick={login} />
      </div>
    </div>
  );
};

export default LoginPage;
