import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { QrCode } from "lucide-react";

export default function PatientSignUp() {
  const navigate = useNavigate();

  return (
    <div className='container mx-auto  min-h-screen items-center  p-4'>    
        <CardContent className="p-8 flex flex-col items-center gap-6">
          <h1 className="text-xl font-bold text-center">QR code</h1>
          <p className="text-center text-sm text-gray-600">
            Para prosseguir com o cadastro, fotografe o código fornecido pelo profissional.
          </p>

          <div className="border border-gray-200 rounded-md w-40 h-40 flex items-center justify-center">
            <QrCode className="text-gray-400 w-12 h-12" />
          </div>

          <Button className="w-full text-white" onClick={() => navigate("/patient-registered")}>
            Prosseguir
          </Button>
        </CardContent>
    </div>
  );
}
