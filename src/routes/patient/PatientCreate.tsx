import React, { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form.tsx";
import { useForm } from "react-hook-form";
import DatePicker from "@/components/common/DatePicker.tsx";
import { isAfter, isBefore, startOfDay } from "date-fns";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { cn } from "@/lib/utils.ts";
import { Check, ChevronDown, Plus, X } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, } from "@/components/ui/command"

// Import the frequency data
import smokeFrequency from '@/localdata/smoke-frequency.json';
import drinkFrequency from '@/localdata/drink-frequency.json';


const FormSchema = z.object({
    name: z.string().min(1, "Campo obrigatório"),
    phone_number: z.string().optional(),
    email: z.string().min(1, "Campo obrigatório").email("Endereço de e-mail inválido"),
    birthday: z.date().nullable().refine(date => date !== null, {message: "Campo obrigatório"}),
    hospital_id:
        z.string().optional(),
    height:
        z.string().optional(),
    weight:
        z.string().optional(),
    comorbidities:
        z.array(z.string()).optional(), // Ensure this matches your data type
    other_comorbidities:
        z.array(z.string()).optional(), // Ensure this matches your data type
    smoker:
        z.string().optional(),
    drink_frequency:
        z.string().optional()
})

const comorbidities = [
    {id: "diabetes_1", label: "Diabete tipo 1"},
    {id: "high_blood_pressure", label: "Hipertensão"},
    {id: "diabetes_2", label: "Diabete tipo 2"},
    {id: "obesity", label: "Obesidade"},
    {id: "hyperlipoproteinemia", label: "Hiperlipoproteinemia"},
    {id: "avc", label: "AVC"},
] as const

const otherComorbiditiesInitialValue = [
    {id: "asthma", label: "Asma"},
    {id: "chronic_kidney_disease", label: "Doença renal crônica"},
    {id: "copd", label: "DPOC (Doença Pulmonar Obstrutiva Crônica)"},
    {id: "heart_failure", label: "Insuficiência cardíaca"},
    {id: "arthritis", label: "Artrite"},
];

const PatientCreate = () => {
    const [showOptional, setShowOptional] = useState(false);

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            name: "",
            phone_number: "",
            email: "",
            birthday: null,
            hospital_id: "",
            height: "",
            weight: "",
            comorbidities: [],
            other_comorbidities: [],
            smoker: ""
        },
    })

    const onToggleShowOptional = async () => {
        const isValid = await form.trigger();

        if (isValid) {
            setShowOptional(!showOptional);
        }
    };

    const onSubmit = (data: z.infer<typeof FormSchema>) => {
        console.log(data);
        // Handle form submission
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
                        <OptionalInfoFields form={form}/>
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

function PatientInfoFields({form}) {
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

function OptionalInfoFields({form}) {
    const [otherComorbidities, setOtherComorbidities] = useState(otherComorbiditiesInitialValue);
    const [selectedComorbidity, setSelectedComorbidity] = useState([]);
    const [otherComorbitiesInputValue, setOtherComorbitiesInputValue] = useState("");
    const [otherComorbitiesOpen, setOtherComorbitiesOpen] = useState(false); // Local state for popover open/close

    const handleSelect = (comorbidity) => {
        if (!selectedComorbidity.includes(comorbidity)) {
            setSelectedComorbidity([...selectedComorbidity, comorbidity]);
        }
    };

    const handleRemove = (comorbidityToRemove) => {
        setSelectedComorbidity((prevSelected) =>
            prevSelected.filter((comorbidity) => comorbidity !== comorbidityToRemove)
        );
    };

    const handleAddComorbidity = () => {
        const newComorbidity = {
            id: otherComorbitiesInputValue.toLowerCase().replace(/\s+/g, "_"),
            label: otherComorbitiesInputValue,
        };

        setOtherComorbidities([...otherComorbidities, newComorbidity]);
        handleSelect(otherComorbitiesInputValue);
        setOtherComorbitiesInputValue(""); // Clear the input value after adding
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
                                            placeholder="1,70"
                                            {...field}
                                            value={field.value as number}
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
                                            placeholder="70"
                                            {...field}
                                            value={field.value as number}
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
                name="comorbities"
                render={() => (
                    <FormItem>
                        <div className="mb-4">
                            <FormLabel>Comorbidades</FormLabel>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {comorbidities.map((comorbidity) => (

                                <FormField
                                    key={comorbidity.id}
                                    control={form.control}
                                    name="comorbidities"
                                    render={({field}) => {
                                        return (
                                            <FormItem
                                                key={comorbidity.id}
                                                className="flex flex-row items-start space-x-3 space-y-0"
                                            >
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value?.includes(comorbidity.id)}
                                                        onCheckedChange={(checked) => {
                                                            return checked
                                                                ? field.onChange([...field.value, comorbidity.id])
                                                                : field.onChange(
                                                                    field.value?.filter(
                                                                        (value) => value !== comorbidity.id
                                                                    )
                                                                )
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                    {comorbidity.label}
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
                        <Popover open={otherComorbitiesOpen}
                                 onOpenChange={setOtherComorbitiesOpen}>
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
                                        value={otherComorbitiesInputValue}
                                        onValueChange={setOtherComorbitiesInputValue}
                                    />
                                    <CommandList>
                                        <CommandEmpty>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                onClick={() => {
                                                    handleAddComorbidity(otherComorbitiesInputValue)
                                                }}
                                                className="flex w-full items"
                                            >
                                                <Plus className="h-4 w-4"/>
                                                <span
                                                    className="ms-2">Adicionar {otherComorbitiesInputValue}</span>
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
                name="smoker"
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

export default PatientCreate;
