import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/new/Button";
import { BandageIcon } from "@/components/ui/new/bandage-logo/BandageIcon";
import { LogoSvg } from "@/components/ui/new/LogoSvg";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="mb-8">
        <BandageIcon theme="default" size={1.5} />
      </div>

      <LogoSvg className="mb-8" width={216} height={20} />
      
      <div className="mt-32 flex flex-col gap-4 items-center">
        <Button
          className="text-white text-sm w-[216px]"
          onClick={() => navigate("/role-selection")}
        >
          Cadastre-se
        </Button>

        <span className="text-[#0120AC] text-sm font-medium">ou</span>

        <Button
          variant="outline"
          className="text-sm w-[216px]"
          onClick={() => navigate("/login")}
        >
          Entrar
        </Button>
      </div>
    </div>
  );
};

export default LandingPage;
