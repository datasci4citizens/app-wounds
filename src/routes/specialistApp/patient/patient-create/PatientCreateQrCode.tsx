import { QRCode } from 'react-qr-code'
import { useLocation } from 'react-router-dom'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '../../../../components/ui/card.tsx'

export default function PatientCreateQrCode() {
  const location = useLocation()
  const code = location.state || ''

  return (
    <div className='container mx-auto flex min-h-screen items-center justify-center p-4'>
      <CardContent className="p-8 flex flex-col items-center gap-6">
          <h1 className="text-xl font-bold text-center">QR code</h1>

          <QRCode value={code} size={200} />

          <h1 className='text-l font-bold text-center break-words'>{code}</h1>

          <p className="text-center text-sm text-gray-600">
            Este código é único e deve ser utilizado apenas uma vez, em até 30 minutos. 
            Após o uso, ele se tornará inválido.
          </p>
      </CardContent>
    </div>
  )
}
