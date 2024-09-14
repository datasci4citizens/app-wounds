import useSWR from 'swr'
import '../../globals.css'

import { Card,
         CardHeader,
         CardTitle,
         CardContent } from '../../components/ui/card.tsx'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table.tsx'
import { Badge } from '../../components/ui/badge.tsx'

const fetcher = (...args) => fetch(...args).then(res => res.json())

export function DrinkFrequencyBadge({ frequency }) {
  const colorMap = {
    never: "bg-gray-200 text-gray-800",
    sometimes: "bg-yellow-200 text-yellow-800",
    often: "bg-red-200 text-red-800"
  }

  return (
    <Badge className={`${colorMap[frequency]} font-semibold`}>
      {frequency}
    </Badge>
  )
}

export default function UserList() {
  const { data, error, isLoading } = useSWR('http://localhost:8000/patients', fetcher)

  if (error) return <div>failed to load</div>
  if (isLoading) return <div>loading...</div>
 
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-[800px]">
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone Number</TableHead>
                <TableHead>Birthday</TableHead>
                <TableHead>Smoker</TableHead>
                <TableHead>Drink Frequency</TableHead>
                <TableHead>Accept TCLE</TableHead>
                <TableHead>Observations</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((user, index) => (
                <TableRow key={index}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.phone_number}</TableCell>
                  <TableCell>{new Date(user.birthday).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>{user.is_smoker ? 'Yes' : 'No'}</TableCell>
                  <TableCell>
                    <DrinkFrequencyBadge frequency={user.drink_frequency} />
                  </TableCell>
                  <TableCell>{user.accept_tcle ? 'Yes' : 'No'}</TableCell>
                  <TableCell className="max-w-xs truncate">{user.observations}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
