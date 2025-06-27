
import { WaveBackgroundLayout } from "@/components/ui/new/wave/WaveBackground";
import PageTitleWithBackButton from "@/components/shared/PageTitleWithBackButton";
import { PatientIcon } from "@/components/ui/new/PatientIcon";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import CheckIcon from "@/components/ui/new/CheckIcon";

// This was left unused since it needs refinement. Open points:
// - What it should be called
// - Communication model (messaging, push notification, whatsapp, email etc)
// - Reponse time SLAs

export default function FastCareConfirmation() {
  const navigate = useNavigate();

  const handleProceed = () => {
    navigate("/patient/menu");
  };

  return (
    <WaveBackgroundLayout className="bg-[#F9FAFB]">
      <div className="flex justify-center items-center mt-6 mb-6">
        <PatientIcon size={0.6} borderRadius="50%" />
      </div>  

      <PageTitleWithBackButton 
        title={"Solicitação enviada com sucesso!"} 
        backPath="/patient/menu"
      />      

      <div className="px-6 py-8 flex flex-col items-center">
                
        <div className="w-[90%] bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-center mb-6">
            <CheckIcon size={30} />
          </div>
          <p className="text-[#0120AC] text-center font-normal mb-4">
                Sua solicitação de avaliação foi enviada ao profissional responsável.          
            </p>
            <p className="text-[#0120AC] text-left font-normal text-xs">
                Em breve, você será notificado assim que ela for analisada.           
             </p>

        </div>

        {/* Proceed Button */}
        <Button 
          className=" bg-[#0120AC] text-white rounded-[20px] px-8"
          onClick={handleProceed}
        >
          Entendi
        </Button>
      </div>
    </WaveBackgroundLayout>
  );
}
