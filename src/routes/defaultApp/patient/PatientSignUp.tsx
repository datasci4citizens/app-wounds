import { Html5Qrcode } from "html5-qrcode";
import { useNavigate } from 'react-router-dom'
import { useEffect, useState, useRef } from "react";
import { Keyboard, Camera } from 'lucide-react'
import AppHeader from "@/components/ui/common/AppHeader";
import { QrCodeIcon } from "@/components/ui/new/QrCodeIcon";
import { postRequest, getBaseURL } from "@/data/common/HttpExtensions";
import { UserContextProvider, useUser } from "@/lib/hooks/use-user";
import "./qrcode-scanner.css";
import axios from "axios";

// Componente wrapper para fornecer o contexto do usuário
export default function PatientSignUpQrCodeWrapper() {
  return (
    <UserContextProvider>
      <PatientSignUpQrCode />
    </UserContextProvider>
  );
}

function PatientSignUpQrCode() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const navigate = useNavigate();
  const qrRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerRef = useRef<HTMLDivElement>(null);
  
  // Obter o email do usuário do contexto
  const { email, isLoading: userLoading } = useUser();
  
  const handleSubmitCode = async (code: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Obter o email do localStorage se não estiver disponível no contexto
      const userEmail = email || localStorage.getItem('user_email');
      
      if (!userEmail) {
        setError('Email do usuário não encontrado.');
        return;
      }
      
      const patient_id = await postRequest(
        getBaseURL(`/auth/patient-bind/`), 
        { arg: { code, email: userEmail } }
      );
      const tokenjwt = localStorage.getItem("access_token");
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/patients/${patient_id}/`,
        { headers: { Authorization: `Bearer ${tokenjwt}` } }
      );
      
      localStorage.setItem('patient_id', patient_id.toString());
      localStorage.setItem('patient_name', response.data.name);
      localStorage.setItem('user_role', "patient");
      navigate('/patient-registered');
    } catch (err : any) {
      console.log(err.message)
      if (err.message == 'Request failed with status 404: "Codigo invalido"') {
        console.error("Erro ao validar código")
        setError('Erro ao validar o código. Tente novamente.')
      } else {
        console.error('Erro na requisição:', err)
        setError('Erro ao processar o código. Verifique sua conexão.');
      }
      
    } finally {
      setLoading(false);
    }
  };

  const startScanner = async () => {
    try {
      setScanning(true);
      
      // Pequeno atraso para garantir que o elemento DOM esteja pronto
      setTimeout(async () => {
        if (!scannerContainerRef.current) return;
        
        try {
          const html5QrCode = new Html5Qrcode("qr-reader");
          qrRef.current = html5QrCode;
          
          await html5QrCode.start(
            { facingMode: "environment" },
            {
              fps: 10,
              qrbox: { width: 180, height: 180 },
            },
            (decodedText) => {
              setScanResult(decodedText);
              stopScanner();
              handleSubmitCode(decodedText);
            },
            (errorMessage) => {
              console.log(errorMessage);
            }
          );
        } catch (innerErr) {
          console.error("Erro ao iniciar scanner:", innerErr);
          setError("Não foi possível acessar a câmera");
          setScanning(false);
        }
      }, 100);
    } catch (err) {
      console.error("Erro ao iniciar scanner:", err);
      setError("Não foi possível acessar a câmera");
      setScanning(false);
    }
  };

  const stopScanner = () => {
    if (qrRef.current && qrRef.current.isScanning) {
      qrRef.current.stop()
        .then(() => {
          setScanning(false);
        })
        .catch((err) => {
          console.error("Erro ao parar scanner:", err);
        });
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup scanner when component unmounts
      if (qrRef.current && qrRef.current.isScanning) {
        qrRef.current.stop().catch(console.error);
      }
    };
  }, []);

  // Mostrar mensagem de carregamento enquanto obtém os dados do usuário
  if (userLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-[#0120AC]">Carregando informações do usuário...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-white p-4 pb-32 overflow-auto">    
      <div className="mb-[16px] mt-[50px]">
        <AppHeader title="QR code" />
      </div>
 
      <div className="flex flex-col items-center mb-6">
        <div className="mb-4">
          <QrCodeIcon/>
        </div>
        <span className="w-[328px] text-justify font-normal text-[14px] leading-[24px] text-[#1A3BCC]">
            Para prosseguir com o cadastro, fotografe o código fornecido pelo profissional. Clique em Abrir Câmera para ler o QrCode.
        </span>
      </div>

      <div className="w-full max-w-md flex flex-col gap-4 items-center">
        <div className="w-4/5" ref={scannerContainerRef}>
          {scanResult ? (
            <div className="text-center bg-white rounded-md p-4 shadow-sm border border-[#A6BBFF]">
              <p className="text-[#0120AC] font-semibold mb-2">Leitura bem-sucedida!</p>
              <p className="text-[#1A3BCC] break-all">
                {scanResult}
              </p>
              {error && (
                <>
                  <p className="text-red-500 text-sm mt-2">{error}</p>
                  <button 
                    onClick={() => {
                      setScanResult(null);
                      setError(null);
                      setTimeout(startScanner, 500);
                    }} 
                    className="px-5 py-2 mt-3 rounded-full bg-[#0120AC] text-white text-sm font-medium"
                  >
                    Tentar novamente
                  </button>
                </>
              )}
              {loading && <p className="text-[#0120AC] text-sm mt-2">Processando...</p>}
            </div>
          ) : (
            <>
              {scanning ? (
                <div className="bg-white rounded-md p-4 shadow-sm border border-[#A6BBFF] flex flex-col items-center">
                  <div id="qr-reader" className="w-full h-[200px]"></div>
                  
                  <div className="mt-4 flex flex-col w-full">
                    <button 
                      onClick={stopScanner} 
                      className="px-5 py-3 rounded-full bg-[#0120AC] text-white text-sm font-medium flex items-center justify-center mb-3"
                    >
                      <Camera className="mr-2 h-5 w-5" />
                      <span>Fechar câmera</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col w-full items-center">
                  <button 
                    onClick={startScanner} 
                      className="px-5 py-3 rounded-full bg-[#0120AC] text-white text-sm font-medium flex items-center justify-center mb-3"
                  >
                    <Camera className="mr-2 h-5 w-5" />
                    <span>Abrir câmera</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <button
          className="px-5 py-3 rounded-full bg-white border border-[#0120AC] text-[#0120AC] text-sm font-medium flex items-center justify-center"
          onClick={() => {
            stopScanner();
            navigate("/patient-signup-token");
          }}
          disabled={loading}
        >
          <Keyboard className="mr-2 h-5 w-5"/>
          <span>Digitar código manualmente</span>
        </button>
      </div>
    </div>   
  );
}