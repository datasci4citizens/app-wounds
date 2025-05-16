import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function PatientRegistered() {
  const navigate = useNavigate();

  return (
    <div className='container mx-auto  min-h-screen items-center  p-4'>    
        <CardContent className="p-8 flex flex-col items-center gap-6">
          <h1 className="text-xl font-bold text-center">Cadastro Pronto</h1>
          <p className="text-center text-sm text-gray-600">
            Seu cadastro foi finalizado com sucesso ! Clique no botão entrar !
          </p>

          <Button className="w-full text-white" onClick={() => navigate("/login")}>
            Entrar
          </Button>
        </CardContent>
    </div>
  );
}
