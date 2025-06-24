import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form.tsx";
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import DatePicker from "@/components/common/DatePicker.tsx";
import { isAfter, isBefore, startOfDay } from "date-fns";
import { useLocation, useNavigate } from "react-router-dom";
import { LoadingScreen, type LoadingScreenHandle } from '@/components/ui/new/loading/LoadingScreen';
import { WaveBackgroundLayout } from "@/components/ui/new/wave/WaveBackground";
import PageTitleWithBackButton from "@/components/shared/PageTitleWithBackButton";
import { ArrowLeft } from "lucide-react";

// Importações dos dados necessários
import woundRegion from '@/localdata/wound-location.json'
import woundTypes from '@/localdata/wound-type.json'
import { ProfessionalIcon } from '@/components/ui/new/ProfessionalIcon';
import { useUser } from '@/lib/hooks/use-user';

// Tipos e interfaces
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

// Componente para exibir mensagens de alerta simples
function AlertMessage({ type, message }: { type: 'error' | 'success', message: string }) {
    const bgColor = type === 'error' ? 'bg-red-100 border-red-400 text-red-700' : 'bg-green-100 border-green-400 text-green-700';
    
    return (
        <div className={`border ${bgColor} px-4 py-3 rounded relative mb-4`} role="alert">
            <span className="block sm:inline">{message}</span>
        </div>
    );
}

// Melhorar o schema para validação da data
const woundFormSchema = z.object({
    region: z.string({required_error: "Região da ferida é obrigatória"}),
    subregion: z.string({required_error: "Localização da ferida é obrigatória"}),
    type: z.string({required_error: "Tipo da ferida é obrigatório"}),
    // Melhoria na validação de data
    start_date: z.date({
        required_error: "Data de começo é obrigatória",
        invalid_type_error: "Formato de data inválido"
    })
    .refine(date => {
        // Verificar se é uma data válida
        return date instanceof Date && !isNaN(date.getTime());
    }, {
        message: "Data inválida"
    })
    .refine(date => {
        // Verificar se não está no futuro
        return !isAfter(date, new Date());
    }, {
        message: "A data não pode ser no futuro"
    })
    .refine(date => {
        // Verificar se não é muito antiga (antes de 1900)
        return !isBefore(date, new Date("1900-01-01"));
    }, {
        message: "A data não pode ser anterior a 1900"
    }),
});

type WoundFormValues = z.infer<typeof woundFormSchema>;

export default function WoundCreate() {
    const navigate = useNavigate();
    const location = useLocation();
    const user = useUser();

    console.log("User data:", user);

    const loadingRef = useRef<LoadingScreenHandle>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Estado para mensagens de alerta
    const [alertMessage, setAlertMessage] = useState<{type: 'error' | 'success', message: string} | null>(null);
    
    const patient_id = location.state?.patient_id as number;
    console.log("Patient ID:", patient_id);

    // Verificar se o patient_id existe
    if (!patient_id) {
        setAlertMessage({
            type: 'error',
            message: "ID do paciente não encontrado. Por favor, selecione um paciente."
        });
        
        // Redirecionar para a lista de pacientes após um breve atraso
        setTimeout(() => {
            navigate('/specialist/patient/list');
        }, 2000);
        
        return (
            <WaveBackgroundLayout className="absolute inset-0 overflow-auto">
                <div className="flex flex-col w-full min-h-full items-center p-4 pt-8">
                    <PageTitleWithBackButton 
                        title="Adicionar nova ferida"
                        backPath="/specialist/patient/list"
                        className="mb-6"
                    />
                    <AlertMessage type="error" message="ID do paciente não encontrado. Por favor, selecione um paciente." />
                    <p className="text-gray-500 mt-4">Redirecionando para a lista de pacientes...</p>
                </div>
            </WaveBackgroundLayout>
        );
    }

    const form = useForm<WoundFormValues>({
        resolver: zodResolver(woundFormSchema),
        defaultValues: {
            region: '',
            subregion: '',
            type: '',
            start_date: undefined,
        },
    });

    const apiUrl = `${import.meta.env.VITE_SERVER_URL}/wounds/`;
    console.log("API URL:", apiUrl);

    // Modificação no onSubmit para pegar o specialist_id corretamente
    const onSubmit = async (data: WoundFormValues) => {
        // Evitar múltiplos envios
        if (isSubmitting) return;
        
        setIsSubmitting(true);
        setAlertMessage(null); // Limpar qualquer mensagem anterior
        
        // Mostrar tela de carregamento
        loadingRef.current?.show();
        
        try {
            const accessToken = localStorage.getItem('access_token');
            
            // Obter dados do especialista do localStorage
            const specialistDataString = localStorage.getItem('specialist_data');
            let specialistId = null;
            
            if (specialistDataString) {
                try {
                    const specialistData = JSON.parse(specialistDataString);
                    specialistId = specialistData.specialist_id;
                    console.log("Specialist ID from localStorage:", specialistId);
                } catch (e) {
                    console.error("Erro ao analisar specialist_data:", e);
                }
            }
            
            if (!specialistId) {
                console.warn("specialist_id não encontrado no localStorage, continuando sem ele");
            }

            // Validação adicional da data antes de formatar
            if (!data.start_date) {
                loadingRef.current?.hide();
                setAlertMessage({
                    type: 'error',
                    message: "Data de início é obrigatória"
                });
                setIsSubmitting(false);
                return;
            }
            
            // Garantir que temos uma data válida e formatada corretamente
            let formattedStartDate: string;
            try {
                // Certificar que estamos enviando uma data no formato ISO sem informação de timezone
                // ou com o timezone zero (UTC)
                const dateObj = new Date(data.start_date);
                const splitResult = dateObj.toISOString().split('T');
                formattedStartDate = splitResult[0] || '';
            } catch (error) {
                loadingRef.current?.hide();
                setAlertMessage({
                    type: 'error',
                    message: "Formato de data inválido. Use DD/MM/YYYY."
                });
                setIsSubmitting(false);
                return;
            }

            const payload = {
                patient_id: patient_id,
                region: (data.region + " " + data.subregion).trim(),
                type: data.type, // Corrigido para 'type' em vez de 'wound_type'
                start_date: formattedStartDate,
                end_date: null,
                image_id: null,
                is_active: true,
                specialist_id: specialistId
            };

            console.log("Enviando payload:", payload);

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            // Garantir um tempo mínimo de carregamento para melhor feedback visual
            const minimumLoadingTime = 500;
            const startTime = Date.now();

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const elapsedTime = Date.now() - startTime;
                const remainingTime = Math.max(0, minimumLoadingTime - elapsedTime);
                
                // Aguardar um tempo mínimo antes de esconder o loading
                setTimeout(() => {
                    loadingRef.current?.hide();
                    setIsSubmitting(false);
                    
                    // Mostrar mensagem de erro apropriada
                    switch (response.status) {
                        case 400:
                            setAlertMessage({
                                type: 'error',
                                message: errorData.detail || "Os dados fornecidos são inválidos."
                            });
                            break;
                        case 401:
                            setAlertMessage({
                                type: 'error',
                                message: "Sua sessão expirou. Por favor, faça login novamente."
                            });
                            setTimeout(() => navigate('/login'), 2000);
                            break;
                        default:
                            setAlertMessage({
                                type: 'error',
                                message: "Ocorreu um erro ao criar a ferida. Tente novamente."
                            });
                    }
                }, remainingTime);
                
                return;
            }

            const result = await response.json();
            console.log('Wound created successfully:', result);
            
            // CORREÇÃO: Verificar o campo wound_id em vez de id
            if (!result.wound_id) {
                console.error('API response missing wound ID:', result);
                alert('Erro: ID da ferida não encontrado na resposta da API.');
                loadingRef.current?.hide();
                setIsSubmitting(false);
                return;
            }

            // CORREÇÃO: Usar o nome correto do campo na resposta
            const createdWoundId = result.wound_id;
            console.log('Created wound ID:', createdWoundId);

            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, minimumLoadingTime - elapsedTime);
            
            // Aguardar o tempo mínimo antes de navegar
            setTimeout(() => {
                loadingRef.current?.hide();
                setAlertMessage({
                    type: 'success',
                    message: "Ferida criada com sucesso. Prosseguindo para o próximo passo."
                });
                
                // Navegar para a próxima tela após um breve delay para a mensagem ser vista
                setTimeout(() => {
                    // ADICIONAL: Verificar antes de navegar se ainda temos o ID
                    if (!createdWoundId) {
                        console.error("Trying to navigate but wound_id is still missing");
                        alert("Erro ao obter ID da ferida. Tente novamente.");
                        setIsSubmitting(false);
                        return;
                    }

                    console.log("Navegando com wound_id:", createdWoundId);
                    
                    navigate('/specialist/wound/add-update', { 
                        state: { 
                            patient_id, 
                            wound_id: createdWoundId 
                        } 
                    });
                    
                    // Verificação adicional para garantir que os dados estão sendo passados
                    console.log("Navigation state:", { patient_id, wound_id: createdWoundId });
                }, 1000);
            }, remainingTime);
            
        } catch (error) {
            console.error('Error creating wound:', error);
            
            // Esconder tela de carregamento
            loadingRef.current?.hide();
            setIsSubmitting(false);
            
            setAlertMessage({
                type: 'error',
                message: "Ocorreu um erro inesperado. Verifique sua conexão e tente novamente."
            });
        }
    };

    const [selectedRegion, setSelectedRegion] = useState<WoundRegionKey | "">("");

    return (
        <>
            {/* Removido estilo global que não é suportado neste contexto */}
            <WaveBackgroundLayout className="absolute inset-0 overflow-auto">
                <div className="flex flex-col w-full min-h-full items-center px-6">
                    {/* Header with Professional Icon */}
                    <div className="flex justify-center items-center mt-6 mb-6">
                        <ProfessionalIcon size={0.6} borderRadius="50%" />
                    </div>
                    <PageTitleWithBackButton 
                        title="Adicionar nova ferida"
                        onBackClick={() => navigate('/specialist/patient/wounds', { state: { patient_id } })}
                        className="mb-6 [&>h1]:text-lg [&>h1]:font-medium"
                    />
                    
                    {/* Exibir mensagens de alerta quando necessário */}
                    {alertMessage && (
                        <div className="w-full px-4">
                            <AlertMessage type={alertMessage.type} message={alertMessage.message} />
                        </div>
                    )}
                    
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} 
                              className="w-full max-w-md mx-auto space-y-4" 
                              style={{fontFamily: "Roboto, sans-serif"}}>
                            <FormField
                                control={form.control}
                                name="region"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel className="text-[#0120AC] font-medium">Região da ferida</FormLabel>
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
                                                <SelectTrigger className="bg-white text-sm border-[#0120AC] rounded-lg">
                                                    <SelectValue 
                                                        placeholder="Selecione a região" 
                                                        style={{color: field.value ? 'inherit' : '#A6BBFF'}}
                                                    />
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
                                        <FormLabel className="text-[#0120AC] font-medium">Localização da ferida</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            disabled={!selectedRegion}
                                            value={field.value || ""}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="bg-white text-sm border-[#0120AC] rounded-lg">
                                                    <SelectValue 
                                                        placeholder="Selecione a localização"
                                                        style={{color: field.value ? 'inherit' : '#A6BBFF'}}
                                                    />
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
                                        <FormLabel className="text-[#0120AC] font-medium">Tipo da ferida</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-white text-sm border-[#0120AC] rounded-lg">
                                                    <SelectValue 
                                                        placeholder="Selecione o tipo"
                                                        style={{color: field.value ? 'inherit' : '#A6BBFF'}}
                                                    />
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
                                        <FormLabel className="text-[#0120AC] font-medium">Data de começo</FormLabel>
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
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Botão de submissão no estilo do design do Figma */}
                            <div className="mt-10 flex justify-center mb-10" style={{ marginTop: "60px" }}>
                                <Button 
                                    type="submit" 
                                    className="py-1 px-6 text-xs bg-[#0120AC] text-white font-normal rounded-full flex items-center gap-1 w-[216px]"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? "Enviando..." : "Continuar"}
                                    <ArrowLeft className="h-3.5 w-3.5 rotate-180" />
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </WaveBackgroundLayout>
            
            {/* Componente LoadingScreen */}
            <LoadingScreen ref={loadingRef} />
        </>
    );
}