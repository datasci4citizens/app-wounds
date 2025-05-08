import { BandageIcon } from "@/components/ui/new/bandage-logo/BandageIcon";
import { QrCodeIcon } from "@/components/ui/new/QrCodeIcon";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/new/Button";

export default function PatientSignUp() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center min-h-screen bg-white p-4">
      <div className="mt-[68px] mb-16">
        <BandageIcon theme="purple" size={0.5} />
      </div>

      <div className="flex flex-col items-center gap-6">
        <h1 className="text-[#0120AC] text-xl mb-12">QR code</h1>
        
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
    </div>
  );
}
