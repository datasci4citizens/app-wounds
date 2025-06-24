import * as z from "zod";
import DatePicker from "@/components/common/DatePicker.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select.tsx";
import { PainSlider } from "@/components/ui/pain-slider.tsx";
import { isAfter, isBefore, startOfDay } from "date-fns";
import type { UseFormReturn } from "react-hook-form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import exudateAmounts from '@/localdata/exudate-amount.json'
import exudateTypes from '@/localdata/exudate-type.json'
import woundEdges from '@/localdata/wound-edges.json'
import skinAround from '@/localdata/skin-around.json'
import tissueTypes from '@/localdata/tissue-type.json'
import { useState } from "react";
import { Switch } from "@/components/ui/switch.tsx";
import { useLocation, useNavigate } from "react-router-dom";
import { useWoundUpdate } from "@/routes/specialistApp/wound/AddUpdate/context-provider/WoundUpdateProvider.tsx";
import { WaveBackgroundLayout } from "@/components/ui/new/wave/WaveBackground";
import { ProfessionalIcon } from "@/components/ui/new/ProfessionalIcon";
import PageTitleWithBackButton from "@/components/shared/PageTitleWithBackButton";
import { ArrowLeft } from "lucide-react";


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
    const patient_id = location.state?.patient_id as number;
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
            console.log("woundId recebido:", woundId);
            console.log("Payload após atualização:", {
                ...form.getValues(),
                wound_id: woundId
            });

            await setWoundUpdate((prev) => ({
                ...prev,
                // Corrigir nomes de campos para corresponder à API
                width: parseInt(data.woundWidth), // Corrigido de wound_width
                length: parseInt(data.woundLength), // Corrigido de wound_length
                exudate_amount: data.exudateAmount ?? "",
                exudate_type: data.exudateType ?? "",
                tissue_type: data.tissueType ?? "",
                wound_edges: data.woundEdges ?? "",
                skin_around: data.skinAround ?? "", // Corrigido de skin_around_the_wound
                had_fever: data.hadFever ?? false, // Corrigido de had_a_fever
                pain_level: data.painLevel.toString(),
                dressing_changes_per_day: data.dressingChanges ?? "", // Corrigido de dressing_changer_per_day
                guidelines_to_patient: "",
                extra_notes: "",
                track_date: data.date ? data.date.toISOString().split('T')[0] : "",
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
            return navigate('/specialist/wound/add-update/image', { 
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
                {/* Header with Professional Icon */}
                <div className="flex justify-center items-center mt-6 mb-6">
                    <ProfessionalIcon size={0.6} borderRadius="50%" />
                </div>
                <PageTitleWithBackButton 
                    title="Atualização de ferida"
                    backPath="/specialist/patient/list"
                    onBackClick={() => navigate('/specialist/patient/wounds', { state: { patient_id } })}
                    className="mb-6 [&>h1]:text-lg [&>h1]:font-medium"
                />
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        {!showOptional ? (
                            <WoundsRequiredFields form={form}/>
                        ) : (
                            <WoundsOptionalFields form={form}/>
                        )}

                        <div className="flex flex-col items-center justify-center space-y-6 !mt-8">
                            <Button 
                                type="button" 
                                onClick={onToggleShowOptional}
                                className="py-1 px-6 text-xs bg-[#0120AC] text-white font-normal rounded-full"
                            >
                                {showOptional ? 'Ocultar mais informações' : 'Adicionar mais informações'}
                            </Button>

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
        
        
        <div className="flex flex-col w-full h-full items-center">
            <div className="text-black text-2xl font-semibold leading-loose">Atualização ferida</div>
            
        </div>
        </>
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
                        <FormLabel className="text-[#0120AC] font-medium">Data*</FormLabel>
                        <DatePicker
                            field={field}
                            disabled={(date) => {
                                const today = startOfDay(new Date());
                                return (isBefore(date, new Date("1900-01-01")) || isAfter(date, today));
                            }}
                            className="w-full text-left font-normal bg-white placeholder:text-[#A6BBFF] text-[#0120AC] hover:bg-white hover:text-[#0120AC] focus:bg-white focus:text-[#0120AC] border-[#0120AC] rounded-lg"
                            placeholderColor="#A6BBFF"
                            iconColor="#0120AC"
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
                            <FormLabel className="text-[#0120AC] font-medium">Largura*</FormLabel>
                            <div className="flex items-center space-x-2">
                                <FormControl>
                                    <Input
                                        type="number"
                                        placeholder="20"
                                        {...field}
                                        value={field.value}
                                        className="bg-white border-[#0120AC] rounded-lg placeholder:text-[#A6BBFF]"
                                        style={{color: field.value ? 'inherit' : '#A6BBFF'}}
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
                                        value={field.value}
                                        className="bg-white border-[#0120AC] rounded-lg placeholder:text-[#A6BBFF]"
                                        style={{color: field.value ? 'inherit' : '#A6BBFF'}}
                                    />
                                </FormControl>
                                <span className="text-[#0120AC] text-base font-normal">cm</span>
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
                            <FormLabel className="text-[#0120AC] font-medium">
                                Nível da dor: 
                                <span 
                                    style={{
                                        color: field.value === 0
                                            ? '#0120AC' // Azul para 0 (valor inicial)
                                            : field.value <= 4 
                                                ? '#FFD700' // Amarelo para 1-4
                                                : field.value <= 7 
                                                    ? '#FFA500' // Laranja para 5-7
                                                    : '#FF0000', // Vermelho para 8-10
                                        fontWeight: 'bold',
                                        marginLeft: '4px'
                                    }}
                                >
                                    {field.value}
                                </span>
                            </FormLabel>
                        </div>
                        <FormControl>
                            <div className="space-y-2">
                                <PainSlider
                                    min={0}
                                    max={10}
                                    step={1}
                                    value={[field.value]}
                                    onValueChange={(vals) => field.onChange(vals[0])}
                                    className="mt-2"
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

            <FormField
                control={form.control}
                name="exudateAmount"
                render={({field}) => (
                    <FormItem>
                        <FormLabel className="text-[#0120AC] font-medium">Quantidade exsudato</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                                <SelectTrigger className="bg-white border-[#0120AC] rounded-lg text-[#0120AC]">
                                    <SelectValue 
                                        placeholder="Selecione a quantidade"
                                        style={{color: field.value ? 'inherit' : '#A6BBFF'}}
                                    />
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
                        <FormLabel className="text-[#0120AC] font-medium">Tipo de exsudato</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                                <SelectTrigger className="bg-white border-[#0120AC] rounded-lg text-[#0120AC]">
                                    <SelectValue 
                                        placeholder="Selecione o tipo"
                                        style={{color: field.value ? 'inherit' : '#A6BBFF'}}
                                    />
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
                        <FormLabel className="text-[#0120AC] font-medium">Tipo de tecido</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                                <SelectTrigger className="bg-white border-[#0120AC] rounded-lg text-[#0120AC]">
                                    <SelectValue 
                                        placeholder="Selecione o tipo de tecido"
                                        style={{color: field.value ? 'inherit' : '#A6BBFF'}}
                                    />
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
                        <FormLabel className="text-[#0120AC] font-medium">Quantidade de trocas de curativo no dia</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                                <SelectTrigger className="bg-white border-[#0120AC] rounded-lg text-[#0120AC]">
                                    <SelectValue 
                                        placeholder="Selecione a quantidade"
                                        style={{color: field.value ? 'inherit' : '#A6BBFF'}}
                                    />
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
                        <FormLabel className="text-[#0120AC] font-medium">Pele ao redor da ferida</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                                <SelectTrigger className="bg-white border-[#0120AC] rounded-lg text-[#0120AC]">
                                    <SelectValue 
                                        placeholder="Selecione o estado da pele"
                                        style={{color: field.value ? 'inherit' : '#A6BBFF'}}
                                    />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {Object.entries(skinAround).map(([key, value]) => (
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
                        <FormLabel className="text-[#0120AC] font-medium">Bordas da ferida</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                                <SelectTrigger className="bg-white border-[#0120AC] rounded-lg text-[#0120AC]">
                                    <SelectValue 
                                        placeholder="Selecione o estado das bordas"
                                        style={{color: field.value ? 'inherit' : '#A6BBFF'}}
                                    />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent 
                                className="max-h-[50vh] overflow-y-auto w-[95vw] max-w-[400px]" 
                                position="popper"
                                sideOffset={5}
                                align="start"
                            >
                                {Object.entries(woundEdges).map(([key, value]) => (
                                    <SelectItem 
                                        key={key} 
                                        value={key}
                                        className="py-3"
                                    >
                                        <div 
                                            style={{
                                                whiteSpace: "break-spaces",
                                                overflowWrap: "break-word",
                                                wordBreak: "break-word",
                                                hyphens: "auto",
                                                lineHeight: "1.5" 
                                            }}
                                        >
                                            {value}
                                        </div>
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
                            <FormLabel className="text-sm text-[#0120AC] font-medium">Teve febre nas últimas 48 horas</FormLabel>
                        </div>
                    </FormItem>
                )}
            />
        </div>
    )
}