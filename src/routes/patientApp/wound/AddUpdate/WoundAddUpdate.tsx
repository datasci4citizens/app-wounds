import * as z from "zod";
import { Button } from "@/components/ui/button.tsx";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select.tsx";
import { PainSlider } from "@/components/ui/pain-slider.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import type { UseFormReturn } from "react-hook-form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import exudateAmounts from '@/localdata/exudate-amount.json'
import exudateTypes from '@/localdata/exudate-type.json'
import { Switch } from "@/components/ui/switch.tsx";
import { useLocation, useNavigate } from "react-router-dom";
import { useWoundUpdate } from "@/routes/patientApp/wound/AddUpdate/context-provider/WoundUpdateProvider.tsx";
import { WaveBackgroundLayout } from "@/components/ui/new/wave/WaveBackground";
import { PatientIcon } from "@/components/ui/new/PatientIcon";
import PageTitleWithBackButton from "@/components/shared/PageTitleWithBackButton";
import { ArrowLeft } from "lucide-react";


const FormSchema = z.object({
    woundWidth: z.string().min(1, "Campo obrigatório"),
    woundLength: z.string().min(1, "Campo obrigatório"),
    painLevel: z.number().min(0).max(10),
    dressingChanges: z.string().min(1, "Campo obrigatório"),
    pusColor: z.string().min(1, "Campo obrigatório"),
    hadFever: z.boolean(),
    additionalNotes: z.string().optional(),
});

type WoundFormValues = z.infer<typeof FormSchema>;

export default function WoundAddUpdate() {
    const navigate = useNavigate();
    const location = useLocation();
    const woundId = location.state?.wound_id as number;
    const patient_id = location.state?.patient_id as number;
    const {setWoundUpdate} = useWoundUpdate();

    const form = useForm<WoundFormValues>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            woundWidth: "",
            woundLength: "",
            painLevel: 0,
            dressingChanges: "",
            pusColor: "",
            hadFever: false,
            additionalNotes: "",
        },
    });




    const onSubmit = async (data: WoundFormValues) => {
        try {
            console.log("woundId recebido:", woundId);
            console.log("Payload após atualização:", {
                ...form.getValues(),
                wound_id: woundId
            });

            await setWoundUpdate((prev) => ({
                ...prev,
                width: parseInt(data.woundWidth),
                length: parseInt(data.woundLength),
                pain_level: data.painLevel.toString(),
                dressing_changes_per_day: data.dressingChanges,
                exudate_type: data.pusColor,
                had_fever: data.hadFever,
                extra_notes: data.additionalNotes ?? "",
                track_date: new Date().toISOString().split('T')[0],
                wound_id: woundId,
            }));

            // Extrair o patient_id do location.state
            const patient_id = location.state?.patient_id;
            console.log("WoundAddUpdate - Navegando para Image com patient_id:", patient_id);

            // Verificar se patient_id está definido antes de navegar
            if (!patient_id) {
                console.error("patient_id não está definido ao navegar de WoundAddUpdate para WoundAddUpdateImage");
            }

            // Passar tanto patient_id quanto wound_id para a próxima tela
            return navigate('/patient/wound/add-update/image', { 
                state: { 
                    patient_id, 
                    wound_id: woundId 
                } 
            });
        } catch (error) {
            console.error('Error submitting form:', error);
            throw error;
        }
    };

    return (
        <>
        <WaveBackgroundLayout className="absolute inset-0 overflow-auto">
                <div className="flex flex-col w-full min-h-full items-center px-6">
                {/* Header with Patient Icon */}
                <div className="flex justify-center items-center mt-6 mb-6">
                    <PatientIcon size={0.6} borderRadius="50%" />
                </div>
                <PageTitleWithBackButton 
                    title="Atualização de ferida"
                    backPath="/patient/wounds"
                    onBackClick={() => navigate('/patient/wounds', { state: { patient_id } })}
                    className="mb-6 [&>h1]:text-lg [&>h1]:font-medium"
                />
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <WoundFields form={form}/>

                        <div className="flex justify-center !mt-8">
                            <Button 
                                type="submit"
                                className="py-1 px-6 text-xs bg-[#0120AC] text-white font-normal rounded-full flex items-center gap-1 w-[216px]"
                            >
                                Adicionar foto
                                <ArrowLeft className="h-3.5 w-3.5 rotate-180" />
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </WaveBackgroundLayout>
        
        

        </>
    );
};

function WoundFields({form}: { form: UseFormReturn<z.infer<typeof FormSchema>> }) {
    return (
        <div className="space-y-6">
            {/* Tamanho da ferida */}
            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="woundWidth"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel className="text-[#0120AC] font-medium">Largura*</FormLabel>
                            <div className="flex items-center space-x-2">
                                <FormControl>
                                    <Input
                                        type="number"
                                        placeholder="20"
                                        {...field}
                                        className="bg-white border-[#A6BBFF] rounded-lg placeholder:text-[#A6BBFF]"
                                    />
                                </FormControl>
                                <span className="text-[#0120AC] text-base font-normal">cm</span>
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
                            <FormLabel className="text-[#0120AC] font-medium">Altura*</FormLabel>
                            <div className="flex items-center space-x-2">
                                <FormControl>
                                    <Input
                                        type="number"
                                        placeholder="20"
                                        {...field}
                                        className="bg-white border-[#A6BBFF] rounded-lg placeholder:text-[#A6BBFF]"
                                    />
                                </FormControl>
                                <span className="text-[#0120AC] text-base font-normal">cm</span>
                            </div>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
            </div>

            {/* Nível de dor */}
            <FormField
                control={form.control}
                name="painLevel"
                render={({field}) => (
                    <FormItem>
                        <FormLabel className="text-[#0120AC] font-medium">
                            Nível da dor: 
                            <span 
                                style={{
                                    color: field.value === 0 ? '#0120AC' : field.value <= 4 ? '#FFD700' : field.value <= 7 ? '#FFA500' : '#FF0000',
                                    fontWeight: 'bold',
                                    marginLeft: '4px'
                                }}
                            >
                                {field.value}
                            </span>
                        </FormLabel>
                        <FormControl>
                            <div className="space-y-2">
                                <PainSlider
                                    min={0}
                                    max={10}
                                    step={1}
                                    value={[field.value]}
                                    onValueChange={(vals) => field.onChange(vals[0])}
                                />
                                <div className="flex justify-between font-semibold text-sm text-[#0120AC]">
                                    <span>0</span>
                                    <span>10</span>
                                </div>
                            </div>
                        </FormControl>
                        <FormMessage/>
                    </FormItem>
                )}
            />

            {/* Quantidade de trocas de curativo */}
            <FormField
                control={form.control}
                name="dressingChanges"
                render={({field}) => (
                    <FormItem>
                        <FormLabel className="text-[#0120AC] font-medium">Quantidade de trocas de curativo no dia*</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                                <SelectTrigger className="bg-white border-[#A6BBFF] rounded-lg text-[#0120AC]">
                                    <SelectValue placeholder="Selecione a quantidade" />
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

            {/* Cor do pus */}
            <FormField
                control={form.control}
                name="pusColor"
                render={({field}) => (
                    <FormItem>
                        <FormLabel className="text-[#0120AC] font-medium">Cor do pus*</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                                <SelectTrigger className="bg-white border-[#A6BBFF] rounded-lg text-[#0120AC]">
                                    <SelectValue placeholder="Selecione a cor" />
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

            {/* Toggle febre */}
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
                            <FormLabel className="text-sm text-[#0120AC] font-medium">Teve febre nas últimas 24 horas?</FormLabel>
                        </div>
                    </FormItem>
                )}
            />

            {/* Campo de texto adicional */}
            <FormField
                control={form.control}
                name="additionalNotes"
                render={({field}) => (
                    <FormItem>
                        <FormLabel className="text-[#0120AC] font-medium">Deseja relatar algo mais ao especialista?</FormLabel>
                        <FormControl>
                            <Textarea
                                placeholder="Digite aqui suas observações..."
                                {...field}
                                className="bg-white border-[#A6BBFF] rounded-lg placeholder:text-[#A6BBFF] min-h-[100px]"
                            />
                        </FormControl>
                        <FormMessage/>
                    </FormItem>
                )}
            />
        </div>
    )
}