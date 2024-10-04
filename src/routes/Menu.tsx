import { useNavigate } from 'react-router-dom'

import { UserPlus, Users } from 'lucide-react'

import { Button } from '../components/ui/button.tsx'
import { Card,
         CardHeader,
         CardTitle,
         CardContent,
         CardDescription } from '../components/ui/card.tsx'

export default function Menu() {
  const navigate = useNavigate()

  const handleNavigate = (path: string) => {
    navigate(path)
  }

  return (
    <div className='container mx-auto flex min-h-screen items-center justify-center p-4'>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className='text-center font-bold text-2xl'>User Management</CardTitle>
          <CardDescription className="text-center">Choose an option to manage users</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4">
          <Button 
            onClick={() => handleNavigate('/user/list')}
            className='flex w-full items-center justify-center space-x-2'
          >
            <Users className="mr-2 h-5 w-5" />
            <span>List Users</span>
          </Button>
          <Button 
            onClick={() => handleNavigate('/user/create')}
            className='flex w-full items-center justify-center space-x-2'
          >
            <UserPlus className="mr-2 h-5 w-5" />
            <span>Add User</span>
          </Button>
          <Button 
            onClick={() => handleNavigate('/patient/create')}
            className='flex w-full items-center justify-center space-x-2'
          >
            <UserPlus className="mr-2 h-5 w-5" />
            <span>Add Patient</span>
          </Button>
          <Button 
            onClick={() => handleNavigate('/wound/create')}
            className='flex w-full items-center justify-center space-x-2'
          >
            <UserPlus className="mr-2 h-5 w-5" />
            <span>Add Wound</span>
          </Button>
          <Button 
            onClick={() => handleNavigate('/wound/update')}
            className='flex w-full items-center justify-center space-x-2'
          >
            <UserPlus className="mr-2 h-5 w-5" />
            <span>Update Wound</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}