import '../../globals.css'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import { format } from 'date-fns'
import { cn } from '../../lib/utils.ts'

import { Card,
         CardHeader,
         CardTitle,
         CardContent } from '../../components/ui/card.tsx'
import { Input } from '../../components/ui/input.tsx'
import { Switch } from '../../components/ui/switch.tsx'
import { Select,
         SelectContent,
         SelectItem,
         SelectTrigger,
         SelectValue } from '../../components/ui/select.tsx'
import { Textarea } from '../../components/ui/textarea.tsx'
import { Button } from '../../components/ui/button.tsx'
import { Popover,
         PopoverContent,
         PopoverTrigger } from '../../components/ui/popover.tsx'
import { Calendar } from '../../components/ui/calendar.tsx'
import { Calendar as CalendarIcon } from "lucide-react"

import { useForm } from 'react-hook-form'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '../../components/ui/form.tsx'

import useSWRMutation from 'swr/mutation'

const formSchema = z.object({
  name: z.string().min(4, {
    message: "Nome muito pequeno.",
  }),
  email: z.string().email({
    message: "E-mail inválido.",
  }),
  phone_number: z.string().min(7, {
    message: "O telefone deve ter no mínimo 7 dígitos.",
  }),
  birthday: z.date(),
  is_smoker: z.boolean(),
  drink_frequency: z.enum(["never", "sometimes", "often"]),
  observations: z.string().optional(),
  accept_tcle: z.boolean()
})

async function sendRequest(url, { arg }: { arg: {
  name: string;
    email: string;
    phone_number: string;
    birthday: Date;
    is_smoker: boolean;
    drink_frequency: "never" | "sometimes" | "often";
    accept_tcle: boolean;
    observations?: string | undefined}}) {
  console.log('=== sending request to ===')
  console.log(url)
  return await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(arg)
  }).then(res => res.json())
}

export default function UserCreate() {
  const { trigger, data, error } = useSWRMutation('http://localhost:8000/patients', sendRequest)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone_number: "",
      birthday: new Date(),
      is_smoker: false,
      drink_frequency: "never",
      observations: "",
      accept_tcle: true
    },
  })
 
  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log('=== new values ===')
    console.log(values)
    const result = await trigger(values) 
    console.log('=== result ===')
    console.log(result)
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-[800px]">
        <CardHeader>
          <CardTitle>Cadastro de Usuário</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField control={form.control} name="name"
                render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite seu nome" {...field} />
                  </FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="email"
                render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite seu e-mail" {...field} />
                  </FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="phone_number"
                render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite seu telefone" {...field} />
                  </FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="birthday"
                render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Nascimento</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "dd/MM/yyyy")
                          ) : (
                            <span>Selecione uma data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </FormItem>
              )} />
              <FormField control={form.control} name="is_smoker"
                render={({ field }) => (
                <FormItem>
                  <FormLabel>Fumante</FormLabel>
                  <FormControl>
                    <Switch {...field} />
                  </FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="drink_frequency"
                        render={({ field }) => (
                <FormItem>
                  <FormLabel>Frequência de Bebida</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a frequência" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="never">Nunca</SelectItem>
                      <SelectItem value="sometimes">Às vezes</SelectItem>
                      <SelectItem value="often">Frequentemente</SelectItem>
                    </SelectContent>                  
                  </Select>
                </FormItem>
              )} />
              <FormField control={form.control} name="observations"
                render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea placeholder="observações" {...field} />
                  </FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="accept_tcle"
                render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Switch {...field} />                
                  </FormControl>
                  <FormLabel>Eu aceito os termos do contrato.</FormLabel>
                </FormItem>
              )} />
              <Button type="submit">Create</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}