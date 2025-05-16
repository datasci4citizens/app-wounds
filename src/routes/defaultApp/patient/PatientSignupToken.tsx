import {  useState } from "react";
import { Search } from 'lucide-react'
import { Button } from '../../../components/ui/button.tsx'
import { Card,
         CardHeader,
         CardTitle,
         CardContent, } from '../../../components/ui/card.tsx'

export default function PatientSignUpToken() {
  const [token, setToken] = useState('')
  const [error, setError] = useState('')

  const handleSearch = () => {
    if (token.length !== 8) {
      setError('O código deve ter 8 caracteres.')
      return
    }
    setError('')
    // TODO: Implement search logic here
    console.log(`Searching for token: ${token}`)
  }

  return (
    <div className='container mx-auto flex min-h-screen items-center justify-center p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader>
          <CardTitle className='text-center font-bold text-2xl'>Digite seu código</CardTitle>
        </CardHeader>
        <CardContent className='flex flex-col space-y-4'>
          <input
            type='text'
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder='Digite o código'
            className='border rounded p-2'
          />
          {error && <p className='text-red-500 text-sm'>{error}</p>}
          <Button onClick={handleSearch} className='flex items-center justify-center space-x-2'>
            <Search className='mr-2 h-5 w-5' />
            <span>Buscar</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
