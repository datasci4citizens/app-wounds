import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-primary">
      <img
        src="/wounds.svg"
        alt="Logo Cicatrizando"
        className="w-64 h-64 object-contain"
      />

      <div className="mt-32 flex flex-col gap-4 w-full px-10 max-w-sm">
        <Button
          className="w-full bg-sky-900 text-white text-lg py-6"
          onClick={() => navigate("/login")}
        >
          Entrar
        </Button>

        <Button
          variant="outline"
          className="w-full text-lg py-6 border-gray-300 bg-white text-sky-900"
          onClick={() => navigate("/role-selection")}
        >
          Cadastrar
        </Button>
      </div>
    </div>
  );
};

export default LandingPage;
