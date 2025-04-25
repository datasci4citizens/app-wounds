import * as z from "zod";
import DatePicker from "@/components/common/DatePicker.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select.tsx";
import { Slider } from "@/components/ui/slider.tsx";
import { isAfter, isBefore, startOfDay } from "date-fns";
import type { UseFormReturn } from "react-hook-form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import exudateAmounts from '@/localdata/exudate-amount.json'
import exudateTypes from '@/localdata/exudate-type.json'
import tissueTypes from '@/localdata/tissue-type.json'
import { useState } from "react";
import { Switch } from "@/components/ui/switch.tsx";
import { useLocation, useNavigate } from "react-router-dom";
import { useWoundUpdate } from "@/routes/patientApp/wound/AddUpdate/context-provider/WoundUpdateProvider.tsx";


const FormSchema = z.object({
    woundWidth: z.string().min(1, "Campo obrigatório"),
    woundLength: z.string().min(1, "Campo obrigatório"),
    date: z.date().nullable().refine(date => date !== null, {message: "Data de começo é obrigatória"}),
    painLevel: z.number().min(0).max(10),
    exudateAmount: z.string().optional(),
    exudateType: z.string().optional(),
    tissueType: z.string().optional(),
    dressingChanges: z.string().optional(),
    skinAround: z.string().optional(),
    woundEdges: z.string().optional(),
    hadFever: z.boolean().optional(),
});

type WoundFormValues = z.infer<typeof FormSchema>;

export default function WoundAddUpdate() {
    const navigate = useNavigate();
    const location = useLocation();
    const woundId = location.state?.wound_id as number;
    const {setWoundUpdate} = useWoundUpdate();

    const form = useForm<WoundFormValues>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            date: new Date(),
            painLevel: 0,
            exudateAmount: "",
            exudateType: "",
            tissueType: "",
            dressingChanges: "",
            skinAround: "",
            woundEdges: "",
            hadFever: false,
        },
    });


    const [showOptional, setShowOptional] = useState(false);
    const onToggleShowOptional = async () => {
        const isValid = await form.trigger();

        if (isValid) {
            setShowOptional(!showOptional);
        }
    };

    const onSubmit = async (data: WoundFormValues) => {
        try {
            await setWoundUpdate((prev) => ({
                ...prev,
                wound_width: parseInt(data.woundWidth),
                wound_length: parseInt(data.woundLength),
                exudate_amount: data.exudateAmount ?? "",
                exudate_type: data.exudateType ?? "",
                tissue_type: data.tissueType ?? "",
                wound_edges: data.woundEdges ?? "",
                skin_around_the_wound: data.skinAround ?? "",
                had_a_fever: data.hadFever ?? false,
                pain_level: data.painLevel.toString(),
                dressing_changes_per_day: data.dressingChanges ?? "",
                guidelines_to_patient: "",
                extra_notes: "",
                track_date: data.date ? data.date.toISOString().split('T')[0] : "",
                wound_id: woundId,
            }));

            return navigate('/wound/add-update/image');
        } catch (error) {
            console.error('Error submitting form:', error);
            throw error;
        }
    };

    return (
        <div className="flex flex-col w-full h-full items-center">
            <div className="text-black text-2xl font-semibold leading-loose">Atualização ferida</div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}
                      className="flex-1 max-h-screen w-full mx-auto p-8 space-y-6 overflow-y-auto">

                    {!showOptional ? (
                        <WoundsRequiredFields form={form}/>
                    ) : (
                        <WoundsOptionalFields form={form}/>
                    )}

                    <div className="flex flex-col items-center justify-center space-y-6 !mt-8">
                        <Button type="button" onClick={onToggleShowOptional}>
                            {showOptional ? 'Ocultar mais informações' : 'Adicionar mais informações'}
                        </Button>

                        <Button type="submit">
                            Adicionar foto
                        </Button>
                    </div>

                </form>
            </Form>
        </div>
    );
};

function WoundsRequiredFields({form}: { form: UseFormReturn<z.infer<typeof FormSchema>> }) {
    return (
        <div className="space-y-6">
            <FormField
                control={form.control}
                name="date"
                render={({field}) => (
                    <FormItem>
                        <FormLabel>Data*</FormLabel>
                        <DatePicker
                            field={field}
                            disabled={(date) => {
                                const today = startOfDay(new Date());
                                return (isBefore(date, new Date("1900-01-01")) || isAfter(date, today));
                            }}
                        />
                        <FormMessage/>
                    </FormItem>
                )}
            />

            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="woundWidth"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Largura*</FormLabel>
                            <div className="flex items-center space-x-2">
                                <FormControl>
                                    <Input
                                        type="number"
                                        placeholder="20"
                                        {...field}
                                        value={field.value}
                                    />
                                </FormControl>
                                <span className="text-black text-base font-normal">cm</span>
                            </div>
                            <FormMessage/>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="woundLength"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Altura*</FormLabel>
                            <div className="flex items-center space-x-2">
                                <FormControl>
                                    <Input
                                        type="number"
                                        placeholder="20"
                                        {...field}
                                        value={field.value}
                                    />
                                </FormControl>
                                <span className="text-black text-base font-normal">cm</span>
                            </div>
                            <FormMessage/>
                        </FormItem>
                    )}
                />

            </div>

            <FormField
                control={form.control}
                name="painLevel"
                render={({field}) => (
                    <FormItem>
                        <div className="flex items-center">
                            <FormLabel>Nível da dor: {field.value}</FormLabel>
                        </div>
                        <FormControl>
                            <div className="space-y-2">
                                <Slider
                                    min={0}
                                    max={10}
                                    step={1}
                                    value={[field.value]}
                                    onValueChange={(vals) => field.onChange(vals[0])}
                                    className="mt-2"
                                />
                                <div className="flex justify-between font-semibold text-sm">
                                    <span>0</span>
                                    <span>10</span>
                                </div>
                            </div>
                        </FormControl>
                        <FormMessage/>
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="exudateAmount"
                render={({field}) => (
                    <FormItem>
                        <FormLabel>Quantidade exsudato</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione a quantidade"/>
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {Object.entries(exudateAmounts).map(([key, value]) => (
                                    <SelectItem key={key} value={key}>
                                        {value}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage/>
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="exudateType"
                render={({field}) => (
                    <FormItem>
                        <FormLabel>Tipo de exsudato</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o tipo"/>
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {Object.entries(exudateTypes).map(([key, value]) => (
                                    <SelectItem key={key} value={key}>
                                        {value}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage/>
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="tissueType"
                render={({field}) => (
                    <FormItem>
                        <FormLabel>Tipo de tecido</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o tipo de tecido"/>
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {Object.entries(tissueTypes).map(([key, value]) => (
                                    <SelectItem key={key} value={key}>
                                        {value.type}
                                    </SelectItem>
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

function WoundsOptionalFields({form}: { form: UseFormReturn<z.infer<typeof FormSchema>> }) {
    return (
        <div className="space-y-6">
            <FormField
                control={form.control}
                name="dressingChanges"
                render={({field}) => (
                    <FormItem>
                        <FormLabel>Quantidade de trocas de curativo no dia</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione a quantidade"/>
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {Object.entries(exudateAmounts).map(([key, value]) => (
                                    <SelectItem key={key} value={key}>
                                        {value}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage/>
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="skinAround"
                render={({field}) => (
                    <FormItem>
                        <FormLabel>Pele ao redor da ferida</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o estado da pele"/>
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {Object.entries(exudateTypes).map(([key, value]) => (
                                    <SelectItem key={key} value={key}>
                                        {value}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage/>
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="woundEdges"
                render={({field}) => (
                    <FormItem>
                        <FormLabel>Bordas da ferida</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o estado da pele"/>
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {Object.entries(tissueTypes).map(([key, value]) => (
                                    <SelectItem key={key} value={key}>
                                        {value.type}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage/>
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="hadFever"
                render={({field}) => (
                    <FormItem>
                        <div className="flex items-center gap-3">
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <FormLabel className="text-sm">Teve febre nas últimas 48 horas</FormLabel>
                        </div>

                    </FormItem>
                )}
            />
        </div>
    )
}