import { QrCodeIcon } from "@/components/ui/new/QrCodeIcon";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/ui/common/AppHeader";

export default function PatientSignUp() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center min-h-screen bg-white p-4">
      <div className="mb-[16px] mt-[68px]">
        <AppHeader title="QR Code" />
      </div>
        
        <p className="text-center text-sm text-gray-600 max-w-md p-4">
          Para prosseguir com o cadastro, fotografe o código fornecido pelo
          profissional.
        </p>
        
        <div className="flex items-center justify-center mb-4">
          <QrCodeIcon size={0.8} />
        </div>
        
        <div className="w-full max-w-md flex flex-col items-center">
          <button
            className="px-6 py-3 rounded-full bg-[#0120AC] text-white text-sm"
            onClick={() => navigate("/patient-registered")}
          >
            Prosseguir
          </button>
        </div>
    </div>
  );
}
