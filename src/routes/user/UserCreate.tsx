import '../../globals.css'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import { Input } from '../../components/ui/input.tsx'
import { Switch } from '../../components/ui/switch.tsx'
import { Select,
         SelectContent,
         SelectItem,
         SelectTrigger,
         SelectValue } from '../../components/ui/select.tsx'
import { Textarea } from '../../components/ui/textarea.tsx'
import { Button } from '../../components/ui/button.tsx'

import { useForm } from 'react-hook-form'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '../../components/ui/form.tsx'

// import useSWR from 'swr'
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

// const fetcher = (...args) => fetch(...args).then(res => res.json())

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
  // const { data, mutate } = useSWR('http://localhost:8000/patients', fetcher)
  const { trigger, data, error } = useSWRMutation('http://localhost:8000/patients/', sendRequest)

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
    <div>
      <h1>Create User</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField control={form.control} name="name"
            render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="nome completo" {...field} />
              </FormControl>
            </FormItem>
          )} />
          <FormField control={form.control} name="email"
            render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input placeholder="e-mail" {...field} />
              </FormControl>
            </FormItem>
          )} />
          <FormField control={form.control} name="phone_number"
            render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone</FormLabel>
              <FormControl>
                <Input placeholder="telefone" {...field} />
              </FormControl>
            </FormItem>
          )} />
          {/* <FormField control={form.control} name="birthday"
            render={({ field }) => (
            <FormItem>
              <FormLabel>Data de Nascimento</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
            </FormItem>
          )} /> */}
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
              <FormControl>
                <Select {...field}>
                  <SelectTrigger>
                    <SelectValue placeholder="frequência" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never">Nunca</SelectItem>
                    <SelectItem value="sometimes">Às vezes</SelectItem>
                    <SelectItem value="often">Frequentemente</SelectItem>
                  </SelectContent>                  
                </Select>
              </FormControl>
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
    </div>
  )
}