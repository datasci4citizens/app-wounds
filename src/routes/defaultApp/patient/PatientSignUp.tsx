import { useNavigate } from 'react-router-dom'

import { Camera, Keyboard } from 'lucide-react'

import { Button } from '../../../components/ui/button.tsx'
import { Card,
         CardHeader,
         CardTitle,
         CardContent, } from '../../../components/ui/card.tsx'

export default function Menu() { // TODO: Remove
  const navigate = useNavigate()

  const handleNavigate = (path: string) => {
    navigate(path)
  }

  return (
    <div className='container mx-auto flex min-h-screen items-center justify-center p-4'>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className='text-center font-bold text-2xl'>Como deseja se cadastrar?</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4">
          <Button 
            onClick={() => handleNavigate('/patient-signup-qrcode')}
            className='flex w-full items-center justify-center space-x-2'
          >
            <Camera className="mr-2 h-5 w-5" />
            <span>Ler QR Code</span>
          </Button>
          <Button 
            onClick={() => handleNavigate('/patient-signup-token')}
            className='flex w-full items-center justify-center space-x-2'
          >
            <Keyboard className="mr-2 h-5 w-5" />
            <span>Digitar código</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}