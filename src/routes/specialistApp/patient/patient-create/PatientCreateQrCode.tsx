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
      <Card className='w-full max-w-md'>
        <CardHeader>
          <CardTitle className='text-center font-bold text-2xl'>
            QR Code de Cadastro
          </CardTitle>
        </CardHeader>
        <CardContent className='flex flex-col items-center space-y-4'>
          <QRCode value={code} size={200} />
          <h1 className='text-xl font-bold text-center break-words'>{code}</h1>
        </CardContent>
      </Card>
    </div>
  )
}
