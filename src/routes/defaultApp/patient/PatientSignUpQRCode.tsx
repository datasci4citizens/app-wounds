import { Html5QrcodeScanner } from "html5-qrcode";
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from "react";
import { Camera, Keyboard } from 'lucide-react'
import { Button } from '../../../components/ui/button.tsx'
import { Card,
    CardHeader,
    CardTitle,
    CardContent, } from '../../../components/ui/card.tsx'

export default function PatientSignUpQrCode() {
  const [scanResult, setScanResult] = useState(null);
  const navigate = useNavigate()
  
    const handleNavigate = (path: string) => {
      navigate(path)
    }

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", {
      qrbox: {
        width: 250,
        height: 250,
      },
      fps: 5,
    },
  false);

    scanner.render(success, error);

    function success(result: any) {
      scanner.clear();
      setScanResult(result);
    }

    function error(err: any) {
      console.warn(err);
    }
  }, []);

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center font-bold text-2xl">
            Escaneie o QR Code
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          {scanResult ? (
            <div className="text-center">
              <p className="text-green-600 font-semibold">Leitura bem-sucedida!</p>
              <a href={scanResult} className="text-blue-500 underline break-all">
                {scanResult}
              </a>
            </div>
          ) : (
            <div id="reader" className="w-full" />
          )}
        </CardContent>
        <Button 
            onClick={() => handleNavigate('/patient-signup-token')}
            className='flex w-full items-center justify-center space-x-2'
          >
            <Keyboard className="mr-2 h-5 w-5" />
            <span>Digitar código manualmente</span>
          </Button>
      </Card>
    </div>
  );
}
