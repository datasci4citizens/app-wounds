import { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form.tsx";
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import DatePicker from "@/components/common/DatePicker.tsx";
import { isAfter, isBefore, startOfDay } from "date-fns";
import { useLocation, useNavigate } from "react-router-dom";
import useSWRMutation from "swr/mutation";
import { getBaseURL, postRequest } from "@/data/common/HttpExtensions.ts";

import woundRegion from '@/localdata/wound-location.json'
import woundTypes from '@/localdata/wound-type.json'

type TwoCharString = `${string}${string}`;
type WoundRegionKey = TwoCharString;
type WoundLocationKey = TwoCharString;

interface WoundRegionData {
    [key: WoundRegionKey]: {
        description: string;
        subregions: {
            [key: WoundLocationKey]: string;
        };
    };
}

interface WoundPayload {
    wound_region: string;
    wound_subregion: string;
    wound_type: string;
    start_date?: string;
    end_date?: string;
    patient_id: number;
    specialist_id: number;
}

const woundFormSchema = z.object({
    wound_region: z.string({required_error: "Região da ferida é obrigatória"}),
    wound_location: z.string({required_error: "Localização da ferida é obrigatória"}),
    wound_type: z.string({required_error: "Tipo da ferida é obrigatório"}),
    start_date: z.date().nullable().refine(date => date !== null, {message: "Data de começo é obrigatória"}),
});

type WoundFormValues = z.infer<typeof woundFormSchema>;

export default function WoundCreate() {
    const navigate = useNavigate();
    const location = useLocation();
    const patient_id = location.state?.patient_id as number;

    const form = useForm<WoundFormValues>({
        resolver: zodResolver(woundFormSchema),
        defaultValues: {
            wound_region: '',
            wound_location: '',
            wound_type: '',
            start_date: undefined,
        },
    });

    const {trigger: postTrigger} = useSWRMutation(getBaseURL("/wounds/"), postRequest);
    const [selectedRegion, setSelectedRegion] = useState<WoundRegionKey | "">("");

    const onSubmit = async (data: WoundFormValues) => {
        try {
            console.log(data);
            const payload: WoundPayload = {
                wound_region: data.wound_region,
                wound_subregion: data.wound_location,
                wound_type: data.wound_type,
                start_date: data.start_date ? data.start_date.toISOString().split('T')[0] : "",
                end_date: data.start_date ? data.start_date.toISOString().split('T')[0] : "",
                patient_id: patient_id,
                specialist_id: 1
            };

            console.log('Sending payload:', payload);
            await postTrigger(payload);
            return navigate('/patient/wounds', {state: {patient_id}});
        } catch (error) {
            console.error('Error submitting form:', error);
            throw error;
        }
    };

    return (
        <div className="flex flex-col w-full h-full items-center">
            <div className="text-black text-2xl font-semibold leading-loose">Adicionar ferida</div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}
                      className="flex-1 max-h-screen w-full mx-auto p-8 space-y-6 overflow-y-auto">
                    <FormField
                        control={form.control}
                        name="wound_region"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Região da ferida</FormLabel>
                                <Select
                                    onValueChange={(value) => {
                                        field.onChange(value);
                                        setSelectedRegion(value as WoundRegionKey);
                                        // Reset wound_location when region changes
                                        form.setValue('wound_location', '');
                                    }}
                                    value={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione a região"/>
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {Object.entries(woundRegion as WoundRegionData).map(([key, value]) => (
                                            <SelectItem key={key} value={key}>
                                                {value.description}
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
                        name="wound_location"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Localização da ferida</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    disabled={!selectedRegion}
                                    value={field.value || ""}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione a localização"/>
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {selectedRegion &&
                                            (woundRegion as WoundRegionData)[selectedRegion]?.subregions &&
                                            Object.entries((woundRegion as WoundRegionData)[selectedRegion]?.subregions || {})
                                                .map(([key, value]) => (
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
                        name="wound_type"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Tipo da ferida</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione o tipo"/>
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {Object.entries(woundTypes).map(([key, label]) => (
                                            <SelectItem key={key} value={key}>
                                                {label}
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
                        name="start_date"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Data do começo*</FormLabel>
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

                    <Button type="submit" className="w-full bg-sky-900 !mt-8">
                        Adicionar
                    </Button>
                </form>
            </Form>
        </div>
    );
};