import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/new/Button";
import { BandageIcon } from "@/components/ui/new/BandageIcon";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="w-24 h-24 mb-8">
        <BandageIcon theme="default" />
      </div>
      
      <div className="mt-32 flex flex-col gap-4 items-center">
        <Button
          className="text-white text-sm w-[216px]"
          onClick={() => navigate("/login")}
        >
          Cadastre-se
        </Button>

        <Button
          variant="outline"
          className="text-sm w-[216px]"
          onClick={() => navigate("/role-selection")}
        >
          Entrar
        </Button>
      </div>
    </div>
  );
};

export default LandingPage;
