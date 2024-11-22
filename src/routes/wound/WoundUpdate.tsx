import * as z from "zod";
import DatePicker from "@/components/common/DatePicker.tsx";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { isAfter, isBefore, startOfDay } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import exudateAmounts from '@/localdata/exudate-amount.json'
import exudateTypes from '@/localdata/exudate-type.json'
import tissueTypes from '@/localdata/tissue-type.json'

const FormSchema = z.object({
    temperature: z.number().min(0),
    date: z.date().nullable().refine(date => date !== null, {message: "Data de começo é obrigatória"}),
    painLevel: z.number().min(0).max(10),
    exudateAmount: z.string().optional(),
    exudateType: z.string().optional(),
    tissueType: z.string().optional(),
});

type WoundFormValues = z.infer<typeof FormSchema>;

export default function WoundUpdate() {
    const form = useForm<WoundFormValues>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            woundSize: 0,
            date: new Date(),
            painLevel: 0,
            exudateAmount: "",
            exudateType: "",
            tissueType: "",
        },
    });

    const onSubmit = (data: WoundFormValues) => {
        console.log(data);
    };

    return (
        <div className="flex flex-col w-full h-full items-center">
            <div className="text-black text-2xl font-semibold leading-loose">Atualização ferida</div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}
                      className="flex-1 max-h-screen w-full mx-auto p-8 space-y-6 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="woundSize"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Tamanho*</FormLabel>
                                    <div className="flex items-center space-x-2">
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="20"
                                                {...field}
                                                onChange={e => field.onChange(parseFloat(e.target.value))}
                                            />
                                        </FormControl>
                                        <span className="text-black text-base font-normal">cm²</span>
                                    </div>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
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

                    <div className="flex flex-col items-center justify-center space-y-6 !mt-8">
                        <Button type="submit" onClick={() => console.log("Add more info clicked")}>
                            Adicionar mais informações
                        </Button>

                        <Button type="submit" onClick={() => console.log("Add photo clicked")}>
                            Adicionar foto
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
};