import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/new/general/Checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form.tsx";
import type { UseFormReturn } from "react-hook-form";
import { useForm } from "react-hook-form";
import DatePicker from "@/components/common/DatePicker.tsx";
import { isAfter, isBefore, startOfDay } from "date-fns";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { cn } from "@/lib/utils.ts";
import { Check, ChevronDown, Plus, X } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, } from "@/components/ui/command"
import useSWRMutation from "swr/mutation";
import { getBaseURL, getRequest} from "@/data/common/HttpExtensions.ts";
import { useNavigate } from "react-router-dom";

import smokeFrequency from '@/localdata/smoke-frequency.json';
import drinkFrequency from '@/localdata/drink-frequency.json';

export interface PatientPayload {
    name: string;
    gender?: string;
    birthday?: string;
    email: string;
    hospital_registration?: string;
    phone_number?: string;
    height?: number;
    weight?: number;
    smoke_frequency?: string;
    drink_frequency?: string;
    accept_tcle?: boolean;
    comorbidities?: number[];
    comorbidities_to_add?: string[];
}

const PatientFormSchema = z.object({
    name: z.string().min(1, "Campo obrigatório"),
    phone_number: z.string().optional(),
    sex: z.string().min(1, "Campo obrigatório"),
    email: z.string().min(1, "Campo obrigatório").email("Endereço de e-mail inválido"),
    birthday: z.date().nullable().refine(date => date !== null, {message: "Campo obrigatório"}),
    hospital_id: z.string().optional(),
    height: z.number().optional(),
    weight: z.number().optional(),
    comorbidities:
        z.array(z.number()).optional(), // Ensure this matches your data type
    other_comorbidities:
        z.array(z.string()).optional(), // Ensure this matches your data type
    smoke_frequency:
        z.string().optional(),
    drink_frequency:
        z.string().optional()
})

const otherComorbiditiesInitialValue = [
    {id: "asthma", label: "Asma"},
    {id: "chronic_kidney_disease", label: "Doença renal crônica"},
    {id: "copd", label: "DPOC (Doença Pulmonar Obstrutiva Crônica)"},
    {id: "heart_failure", label: "Insuficiência cardíaca"},
    {id: "arthritis", label: "Artrite"},
];

interface Comorbidities {
    cid11_code: string,
    name: string,
    comorbidity_id: number
}

type PatientFormValues = z.infer<typeof PatientFormSchema>;

export default function PatientCreate() {
    const navigate = useNavigate();
    const {
        data: comorbiditiesData, trigger: getComorbiditiesTrigger,
    } = useSWRMutation<Comorbidities[]>(getBaseURL("/comorbidities/"), getRequest);

    useEffect(() => {
        getComorbiditiesTrigger();
    }, [getComorbiditiesTrigger]);

    const [showOptional, setShowOptional] = useState(false);

    const form = useForm<PatientFormValues>({
        resolver: zodResolver(PatientFormSchema),
        defaultValues: {
            name: "",
            phone_number: "",
            sex: "",
            email: "",
            birthday: undefined,
            hospital_id: "",
            height: 0,
            weight: 0,
            comorbidities: [],
            other_comorbidities: [],
            smoke_frequency: "",
            drink_frequency: "",
        },
    })

    const onToggleShowOptional = async () => {
        const isValid = await form.trigger();

        if (isValid) {
            setShowOptional(!showOptional);
        }
    };

    const onSubmit = async (data: PatientFormValues) => {
        try {
            const payload: PatientPayload = {
                name: data.name,
                gender: data.sex,
                birthday: data.birthday ? data.birthday.toISOString().split('T')[0] : "",
                email: data.email,
                hospital_registration: data.hospital_id,
                phone_number: data.phone_number,
                height: data.height,
                weight: data.weight,
                smoke_frequency: data.smoke_frequency,
                drink_frequency: data.drink_frequency,
                accept_tcle: true,
                comorbidities: data.comorbidities,
                comorbidities_to_add: data.other_comorbidities,
            };

            console.log('Sending payload:', payload);
            //await postTrigger(payload);
            return navigate("/patient/create/qrcode", { state: "1234" });
        } catch (error) {
            console.error('Error submitting form:', error);
            throw error;
        }
    };

    return (
        <div className="flex flex-col w-full h-full items-center">
            <div className="text-black text-2xl font-semibold leading-loose">Cadastro de paciente</div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}
                      className="flex-1 max-h-screen w-full mx-auto p-8 space-y-6 overflow-y-auto">

                    {!showOptional ? (
                        <PatientInfoFields form={form}/>
                    ) : (
                        <OptionalInfoFields form={form} comorbiditiesData={comorbiditiesData || []}/>
                    )}

                    <Button type="button" className="w-full bg-sky-900" onClick={onToggleShowOptional}>
                        {showOptional ? 'Ocultar opcionais' : 'Adicionar opcionais'}
                    </Button>

                    <Button type="submit" className="w-full bg-sky-900">
                        Cadastrar
                    </Button>
                </form>
            </Form>
        </div>
    );
};

function PatientInfoFields({form}: { form: UseFormReturn<PatientFormValues> }) {
    return (
        <div className="space-y-6">
            <FormField
                control={form.control}
                name="name"
                render={({field}) => (
                    <FormItem>
                        <FormLabel>Nome*</FormLabel>
                        <FormControl>
                            <Input {...field} placeholder="Nome"/>
                        </FormControl>
                        <FormMessage/>
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="phone_number"
                render={({field}) => (
                    <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                            <Input {...field} placeholder="(00) 00000-0000"/>
                        </FormControl>
                        <FormMessage/>
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="sex"
                render={({field}) => (
                    <FormItem>
                        <div className="mb-4">
                            <FormLabel>Sexo*</FormLabel>
                        </div>
                        <div className="grid grid-cols-2">
                            <div className="flex items-center space-x-2">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value === "female"}
                                        onCheckedChange={(checked) =>
                                            field.onChange(checked ? "female" : null)
                                        }
                                    />
                                </FormControl>
                                <FormLabel className="font-normal">Feminino</FormLabel>
                            </div>
                            <div className="flex items-center space-x-2">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value === "male"}
                                        onCheckedChange={(checked) =>
                                            field.onChange(checked ? "male" : null)
                                        }
                                    />
                                </FormControl>
                                <FormLabel className="font-normal">Masculino</FormLabel>
                            </div>
                        </div>
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="email"
                render={({field}) => (
                    <FormItem>
                        <FormLabel>Email*</FormLabel>
                        <FormControl>
                            <Input {...field} type="email" placeholder="Email"/>
                        </FormControl>
                        <FormMessage/>
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="birthday"
                render={({field}) => (
                    <FormItem>
                        <FormLabel>Data de nascimento*</FormLabel>
                        <DatePicker
                            field={field}
                            disabled={(date) => {
                                const today = startOfDay(new Date());
                                return (isBefore(date, new Date("1900-01-01")) || isAfter(date, today));
                                // isAfter(date, subYears(today, 18))
                            }}
                        />
                        <FormMessage/>
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="hospital_id"
                render={({field}) => (
                    <FormItem>
                        <FormLabel>Cadastro do hospital</FormLabel>
                        <FormControl>
                            <Input {...field} placeholder="Número do cadastro"/>
                        </FormControl>
                        <FormMessage/>
                    </FormItem>
                )}
            />
        </div>
    )
}

function OptionalInfoFields({form, comorbiditiesData = []}: {
    form: UseFormReturn<PatientFormValues>,
    comorbiditiesData: Comorbidities[]
}) {
    const [otherComorbidities, setOtherComorbidities] = useState(otherComorbiditiesInitialValue);
    const [selectedComorbidity, setSelectedComorbidity] = useState<string[]>([]);
    const [otherComorbiditiesInputValue, setOtherComorbiditiesInputValue] = useState("");
    const [otherComorbiditiesOpen, setOtherComorbiditiesOpen] = useState(false); // Local state for popover open/close

    const handleSelect = (comorbidity: string) => {
        if (!selectedComorbidity.includes(comorbidity)) {
            setSelectedComorbidity([...selectedComorbidity, comorbidity]);
        }
    };

    const handleRemove = (comorbidityToRemove: string) => {
        setSelectedComorbidity((prevSelected) =>
            prevSelected.filter((comorbidity) => comorbidity !== comorbidityToRemove)
        );
    };

    const handleAddComorbidity = (otherComorbiditiesInputValue: string) => {
        const newComorbidity = {
            id: otherComorbiditiesInputValue.toLowerCase().replace(/\s+/g, "_"),
            label: otherComorbiditiesInputValue,
        };

        setOtherComorbidities([...otherComorbidities, newComorbidity]);
        handleSelect(otherComorbiditiesInputValue);
        setOtherComorbiditiesInputValue(""); // Clear the input value after adding
    };

    return (
        <div className="space-y-6">
            <div className="flex space-x-4">
                <div className="flex-1">
                    <FormField
                        control={form.control}
                        name={"height"}
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Altura</FormLabel>
                                <div className="flex items-center space-x-2">
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="1.70"
                                            {...field}
                                            value={field.value}
                                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                        />
                                    </FormControl>
                                    <span className="text-black text-base font-medium">m</span>
                                </div>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                </div>
                <div className="flex-1">
                    <FormField
                        control={form.control}
                        name={"weight"}
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Peso</FormLabel>
                                <div className="flex items-center space-x-2">
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="70"
                                            {...field}
                                            value={field.value}
                                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                        />
                                    </FormControl>
                                    <span className="text-black text-base font-medium">Kg</span>
                                </div>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                </div>
            </div>

            <FormField
                control={form.control}
                name="comorbidities"
                render={() => (
                    <FormItem>
                        <div className="mb-4">
                            <FormLabel>Comorbidades</FormLabel>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {comorbiditiesData.map((comorbidity) => (
                                <FormField
                                    key={comorbidity.comorbidity_id}
                                    control={form.control}
                                    name="comorbidities"
                                    render={({field}) => {
                                        return (
                                            <FormItem
                                                className="flex flex-row items-start space-x-3 space-y-0"
                                            >
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value?.includes(comorbidity.comorbidity_id)}
                                                        onCheckedChange={(checked) => {
                                                            return checked
                                                                ? field.onChange([...(field.value ?? []), comorbidity.comorbidity_id])
                                                                : field.onChange(
                                                                    field.value?.filter(
                                                                        (value) => value !== comorbidity.comorbidity_id
                                                                    )
                                                                )
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                    {comorbidity.name}
                                                </FormLabel>
                                            </FormItem>
                                        )
                                    }}
                                />
                            ))}
                        </div>
                        <FormMessage/>
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="other_comorbidities"
                render={({field}) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>Outras Comorbidades</FormLabel>
                        <Popover open={otherComorbiditiesOpen}
                                 onOpenChange={setOtherComorbiditiesOpen}>
                            <PopoverTrigger asChild>
                                <FormControl>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        role="combobox"
                                        className={cn(
                                            "justify-between",
                                            !field.value && "text-muted-foreground"
                                        )}
                                    >
                                        Selecione uma comorbidade
                                        <ChevronDown
                                            className="ml-2 h-4 w-4 shrink-0 opacity-50"/>
                                    </Button>
                                </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-screen px-6 z-30" align="start">
                                <Command>
                                    <CommandInput
                                        placeholder="Procure comorbidades"
                                        value={otherComorbiditiesInputValue}
                                        onValueChange={setOtherComorbiditiesInputValue}
                                    />
                                    <CommandList>
                                        <CommandEmpty>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                onClick={() => {
                                                    handleAddComorbidity(otherComorbiditiesInputValue)
                                                }}
                                                className="flex w-full items"
                                            >
                                                <Plus className="h-4 w-4"/>
                                                <span
                                                    className="ms-2">Adicionar {otherComorbiditiesInputValue}</span>
                                            </Button>
                                        </CommandEmpty>
                                        <CommandGroup>
                                            {otherComorbidities.map((comorbidity) => (
                                                <CommandItem
                                                    value={comorbidity.label}
                                                    key={comorbidity.id}
                                                    onSelect={() => {
                                                        const currentValues = form.getValues("other_comorbidities") || [];
                                                        const newValue = currentValues.includes(comorbidity.id)
                                                            ? currentValues.filter((id) => id !== comorbidity.id)
                                                            : [...currentValues, comorbidity.id];

                                                        form.setValue("other_comorbidities", newValue);
                                                        handleSelect(comorbidity.label);
                                                        // setOpen(false)
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            selectedComorbidity.includes(comorbidity.label)
                                                                ? "opacity-100"
                                                                : "opacity-0"
                                                        )}
                                                    />
                                                    {comorbidity.label}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {selectedComorbidity.map((comorbidity) => (
                                <Button
                                    key={comorbidity}
                                    type="button"
                                    onClick={() => {
                                        handleRemove(comorbidity)
                                    }}
                                    className="text-white h-6 rounded-full px-3 py-2 flex items-center space-x-2"
                                >
                                    <span className="text-xs font-normal">{comorbidity}</span>
                                    <X className="h-4 w-4"/>
                                </Button>
                            ))}
                        </div>
                        <FormMessage/>
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="smoke_frequency"
                render={({field}) => (
                    <FormItem>
                        <FormLabel>Fumante</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione a frequência de fumo"/>
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {Object.entries(smokeFrequency).map(([key, value]) => (
                                    <SelectItem key={key} value={key}>{value}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage/>
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="drink_frequency"
                render={({field}) => (
                    <FormItem>
                        <FormLabel>Bebida alcoólica</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione a frequência"/>
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {Object.entries(drinkFrequency).map(([key, value]) => (
                                    <SelectItem key={key} value={key}>{value}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage/>
                    </FormItem>
                )}
            />
        </div>
    )
}
