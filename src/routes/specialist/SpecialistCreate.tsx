// import { useEffect, useState } from 'react';
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Checkbox } from "@/components/ui/checkbox"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form.tsx";
// import type { UseFormReturn } from "react-hook-form";
// import { useForm } from "react-hook-form";
// import DatePicker from "@/components/common/DatePicker.tsx";
// import { isAfter, isBefore, startOfDay } from "date-fns";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
// import { cn } from "@/lib/utils.ts";
// import { Check, ChevronDown, Plus, X } from "lucide-react";
// import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, } from "@/components/ui/command"
//
// // Import the frequency data
// import smokeFrequency from '@/localdata/smoke-frequency.json';
// import drinkFrequency from '@/localdata/drink-frequency.json';
// import useSWRMutation from "swr/mutation";
// import { getRequest, postRequest } from "@/data/common/HttpExtensions.ts";
// import { useNavigate } from "react-router-dom";
//
// export interface SpecialistPayload {
//     name: string;
//     email: string;
//     state: string;
//     city: string;
//     specialty: string;
//     birthday?: string
// }
//
// const FormSchema = z.object({
//     name: z.string().min(1, "Campo obrigatório"),
//     email: z.string().min(1, "Campo obrigatório").email("Endereço de e-mail inválido"),
//     birthday: z.date().nullable().refine(date => date !== null, {message: "Campo obrigatório"}),
//     state: z.string().min(1, "Campo obrigatório"),
//     city: z.string().min(1, "Campo obrigatório"),
//     specialty: z.string().min(1, "Campo obrigatório"),
// })
//
// type SpecialistFormValues = z.infer<typeof FormSchema>;
//
//
// export function SpecialistCreate() {
//     const navigate = useNavigate();
//     const {trigger: postTrigger} = useSWRMutation(getBaseURL("/patients/"), postRequest);
//
//     const form = useForm<SpecialistFormValues>({
//         resolver: zodResolver(FormSchema),
//         defaultValues: {
//             name: "",
//             email: "",
//             state: "",
//             city: "",
//             specialty: "",
//             birthday: undefined
//         },
//     })
//
//     const onSubmit = async (data: SpecialistFormValues) => {
//         try {
//             const payload: SpecialistPayload = {
//                 name: data.name,
//                 email: data.email,
//                 state: data.state,
//                 city: data.city,
//                 specialty: data.specialty,
//                 birthday: data.birthday ? data.birthday.toISOString().split('T')[0] : "",
//             };
//
//             console.log('Sending payload:', payload);
//             await postTrigger(payload);
//             return navigate("/patient/list")
//         } catch (error) {
//             console.error('Error submitting form:', error);
//             throw error;
//         }
//     };
//
//     return (
//         <div className="flex flex-col w-full h-full items-center">
//             <div className="text-black text-2xl font-semibold leading-loose">Cadastro de paciente</div>
//             <Form {...form}>
//                 <form onSubmit={form.handleSubmit(onSubmit)}
//                       className="flex-1 max-h-screen w-full mx-auto p-8 space-y-6 overflow-y-auto">
//
//                     <FormField
//                         control={form.control}
//                         name="name"
//                         render={({field}) => (
//                             <FormItem>
//                                 <FormLabel>Nome*</FormLabel>
//                                 <FormControl>
//                                     <Input {...field} placeholder="Nome"/>
//                                 </FormControl>
//                                 <FormMessage/>
//                             </FormItem>
//                         )}
//                     />
//
//                     <FormField
//                         control={form.control}
//                         name="phone_number"
//                         render={({field}) => (
//                             <FormItem>
//                                 <FormLabel>Telefone</FormLabel>
//                                 <FormControl>
//                                     <Input {...field} placeholder="(00) 00000-0000"/>
//                                 </FormControl>
//                                 <FormMessage/>
//                             </FormItem>
//                         )}
//                     />
//
//                     <FormField
//                         control={form.control}
//                         name="sex"
//                         render={({field}) => (
//                             <FormItem>
//                                 <div className="mb-4">
//                                     <FormLabel>Sexo*</FormLabel>
//                                 </div>
//                                 <div className="grid grid-cols-2">
//                                     <div className="flex items-center space-x-2">
//                                         <FormControl>
//                                             <Checkbox
//                                                 checked={field.value === "female"}
//                                                 onCheckedChange={(checked) =>
//                                                     field.onChange(checked ? "female" : null)
//                                                 }
//                                             />
//                                         </FormControl>
//                                         <FormLabel className="font-normal">Feminino</FormLabel>
//                                     </div>
//                                     <div className="flex items-center space-x-2">
//                                         <FormControl>
//                                             <Checkbox
//                                                 checked={field.value === "male"}
//                                                 onCheckedChange={(checked) =>
//                                                     field.onChange(checked ? "male" : null)
//                                                 }
//                                             />
//                                         </FormControl>
//                                         <FormLabel className="font-normal">Masculino</FormLabel>
//                                     </div>
//                                 </div>
//                             </FormItem>
//                         )}
//                     />
//
//                     <FormField
//                         control={form.control}
//                         name="email"
//                         render={({field}) => (
//                             <FormItem>
//                                 <FormLabel>Email*</FormLabel>
//                                 <FormControl>
//                                     <Input {...field} type="email" placeholder="Email"/>
//                                 </FormControl>
//                                 <FormMessage/>
//                             </FormItem>
//                         )}
//                     />
//
//                     <FormField
//                         control={form.control}
//                         name="birthday"
//                         render={({field}) => (
//                             <FormItem>
//                                 <FormLabel>Data de nascimento*</FormLabel>
//                                 <DatePicker
//                                     field={field}
//                                     disabled={(date) => {
//                                         const today = startOfDay(new Date());
//                                         return (isBefore(date, new Date("1900-01-01")) || isAfter(date, today));
//                                         // isAfter(date, subYears(today, 18))
//                                     }}
//                                 />
//                                 <FormMessage/>
//                             </FormItem>
//                         )}
//                     />
//
//                     <FormField
//                         control={form.control}
//                         name="hospital_id"
//                         render={({field}) => (
//                             <FormItem>
//                                 <FormLabel>Cadastro do hospital</FormLabel>
//                                 <FormControl>
//                                     <Input {...field} placeholder="Número do cadastro"/>
//                                 </FormControl>
//                                 <FormMessage/>
//                             </FormItem>
//                         )}
//                     />
//
//
//                     <Button type="submit" className="w-full bg-sky-900">
//                         Cadastrar
//                     </Button>
//                 </form>
//             </Form>
//         </div>
//     );
// };
