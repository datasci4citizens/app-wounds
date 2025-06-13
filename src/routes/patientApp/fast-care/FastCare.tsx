
import { WaveBackgroundLayout } from "@/components/ui/new/wave/WaveBackground";
import PageTitleWithBackButton from "@/components/shared/PageTitleWithBackButton";
import { PatientIcon } from "@/components/ui/new/PatientIcon";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";



export default function FastCare() {
  const navigate = useNavigate();

  const handleProceed = () => {
    navigate("/patient/fast-care/immediate-attention");
  };

  return (
    <WaveBackgroundLayout className="bg-[#F9FAFB]">
      <div className="flex justify-center items-center mt-6 mb-6">
        <PatientIcon size={0.6} borderRadius="50%" />
      </div>  

      <PageTitleWithBackButton 
        title={"Solicitar avaliação rápida"} 
        backPath="/patient/menu"
      />      

      <div className="px-6 py-8 flex flex-col items-center">
        {/* Big Alert Sign */}
        <div className="flex justify-center mb-6">
          <AlertTriangle size={80} className="text-red-600" />
        </div>

        {/* Card with warning text */}
        <div className="w-[90%] bg-white rounded-lg shadow-md p-6 mb-8">
          <p className="text-red-600 text-justify font-normal">
            Este aplicativo não substitui atendimento de urgência ou emergência. Se você estiver com dor intensa, febre ou sinais de infecção grave, procure um hospital imediatamente.
          </p>
        </div>

        {/* Proceed Button */}
        <Button 
          className=" bg-[#0120AC] text-white rounded-[20px] px-8"
          onClick={handleProceed}
        >
          Prosseguir
        </Button>
      </div>
    </WaveBackgroundLayout>
  );
}
