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

const woundFormSchema = z.object({
    region: z.string({required_error: "Região da ferida é obrigatória"}),
    subregion: z.string({required_error: "Localização da ferida é obrigatória"}),
    type: z.string({required_error: "Tipo da ferida é obrigatório"}),
    is_active: z.boolean({required_error: "Atividade da ferida é obrigatória"}),
    start_date: z.date().nullable().refine(date => date !== null, {message: "Data de começo é obrigatória"}),
});

type WoundFormValues = z.infer<typeof woundFormSchema>;

export default function WoundCreate() {
    const navigate = useNavigate();
    const location = useLocation();
    const patient_id = location.state?.patient_id as number;
    console.log("Patient ID:", patient_id);

    const form = useForm<WoundFormValues>({
        resolver: zodResolver(woundFormSchema),
        defaultValues: {
            region: '',
            subregion: '',
            type: '',
            start_date: undefined,
            is_active: true,
        },
    });

    const apiUrl = `${import.meta.env.VITE_SERVER_URL}/wounds/`;
    console.log("API URL:", apiUrl);

    const onSubmit = async (data: WoundFormValues) => {
        try {
            const accessToken = localStorage.getItem('access_token');

            if (!accessToken) {
                console.error('Access token is missing');
                return;
            }

            const payload = {
                patient_id: patient_id, // Ensure this matches the expected format
                region: data.region,
                subregion: data.subregion || null,
                type: data.type,
                start_date: new Date().toISOString(),
                end_date: null, // Assuming no end date is provided
                image_id: null, // Assuming no image is provided
                is_active: true,
            };

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error('Failed to create wound');

            const result = await response.json();
            console.log('Wound created successfully:', result);
            return navigate('/specialist/patient/wounds', { state: { patient_id } });
        } catch (error) {
            console.error('Error creating wound:', error);
            throw error;
        }
    };

    const [selectedRegion, setSelectedRegion] = useState<WoundRegionKey | "">("");

    return (
        <div className="flex flex-col w-full h-full items-center">
            <div className="text-black text-2xl font-semibold leading-loose">Adicionar ferida</div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}
                      className="flex-1 max-h-screen w-full mx-auto p-8 space-y-6 overflow-y-auto">
                    <FormField
                        control={form.control}
                        name="region"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Região da ferida</FormLabel>
                                <Select
                                    onValueChange={(value) => {
                                        field.onChange(value);
                                        setSelectedRegion(value as WoundRegionKey);
                                        // Reset wound_location when region changes
                                        form.setValue('subregion', '');
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
                        name="subregion"
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
                        name="type"
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