import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import CheckIcon from "@/components/ui/new/CheckIcon";
import AppHeader from "@/components/ui/common/AppHeader";



export default function PatientRegistered() {
  const navigate = useNavigate();

  const handleProceed = () => {
    navigate("/patient/menu");
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-white p-4 pb-32 overflow-auto">    
      <div className="mb-[16px] mt-[50px]">
        <AppHeader title="Cadastro Finalizado" />
      </div>

      <div className="px-6 py-8 flex flex-col items-center">
                
        <div className="w-[90%] bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-center mb-6">
            <CheckIcon size={30} />
          </div>
          <p className="text-[#0120AC] text-center font-normal mb-4">
            Seu cadastro foi finalizado com sucesso ! Clique no botão para acessar o aplicativo !
            </p>
        </div>

        {/* Proceed Button */}
        <Button 
          className=" bg-[#0120AC] text-white rounded-[20px] px-8"
          onClick={handleProceed}
        >
          Cicatrizando
        </Button>
      </div>
    </div>
  );
}

