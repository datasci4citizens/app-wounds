import { useNavigate, useLocation } from "react-router-dom";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form.tsx";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "@/components/ui/textarea.tsx";
import { Button } from "@/components/ui/button.tsx";
import { useWoundUpdate } from "@/routes/specialistApp/wound/AddUpdate/context-provider/WoundUpdateProvider.tsx";

const FormSchema = z.object({
    extraNotes: z.string().optional(),
    guidelines: z.string().optional(),
});

type ConductFormValues = z.infer<typeof FormSchema>;

export default function WoundAddUpdateConduct() {
    const navigate = useNavigate();
    const location = useLocation();
    const { patient_id, wound_id: locationWoundId } = location.state || {};
    const { woundUpdate, setWoundUpdate } = useWoundUpdate();
    
    // Log para debug
    console.log("WoundAddUpdateConduct recebeu state:", location.state);
    console.log("WoundAddUpdateConduct - location wound_id:", locationWoundId);
    console.log("WoundAddUpdateConduct - context wound_id:", woundUpdate?.wound_id);
    
    // Use o wound_id do location state ou fallback para o do contexto
    const wound_id = locationWoundId || woundUpdate?.wound_id;
    
    console.log("WoundAddUpdateConduct - wound_id final:", wound_id);

    const apiUrl = `${import.meta.env.VITE_SERVER_URL}/tracking-records/`;

    const form = useForm<ConductFormValues>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            extraNotes: "",
            guidelines: "",
        }
    });

    const onSubmit = async (data: ConductFormValues) => {
        try {
            const accessToken = localStorage.getItem('access_token');

            if (!accessToken) {
                console.error('Access token is missing');
                return;
            }
            
            // Verificação explícita do wound_id (usando nossa variável combinada)
            if (!wound_id) {
                console.error('Wound ID is missing');
                alert("ID da ferida não encontrado. Por favor, tente novamente.");
                return;
            }
            
            // Certifique-se de que wound_id seja explicitamente definido no objeto final
            const updatedWoundUpdate = {
                ...woundUpdate,
                wound_id: Number(wound_id), // Garantir que seja um número
                extra_notes: data.extraNotes || "",
                guidelines_to_patient: data.guidelines || "",
            };

            // Verificação adicional para garantir que wound_id esteja presente
            console.log("Payload final:", updatedWoundUpdate);
            if (!updatedWoundUpdate.wound_id) {
                console.error("wound_id ainda está ausente após atualização");
                updatedWoundUpdate.wound_id = Number(wound_id);
            }

            setWoundUpdate(updatedWoundUpdate);
            
            // Make direct API call
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedWoundUpdate),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Failed to submit conduct:', errorData);
                throw new Error('Failed to submit conduct');
            }
            
            const result = await response.json();
            
            // Se temos um image_id no tracking record, atualizar a ferida principal
            if (result.image_id) {
                try {
                    // Chamar a API para atualizar o image_id na ferida principal
                    const updateWoundResponse = await fetch(`${import.meta.env.VITE_SERVER_URL}/wounds/${wound_id}/`, {
                        method: 'PATCH',
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            image_id: result.image_id
                        }),
                    });
                    
                    if (!updateWoundResponse.ok) {
                        console.warn('Não foi possível atualizar o image_id na ferida:', await updateWoundResponse.text());
                    }
                } catch (error) {
                    console.error('Erro ao atualizar image_id na ferida:', error);
                }
            }
            
            // Navigate to wound details page
            navigate('/specialist/patient/wounds', { state: { patient_id, wound_id } });
        } catch (error) {
            console.error("Error submitting conduct:", error);
            alert("Error submitting conduct. Please try again.");
        }
    }

    return (
        <div className="flex flex-col w-full h-full items-center">
            <div className="text-black text-2xl font-semibold leading-loose">Conduta</div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}
                      className="flex-1 max-h-screen w-full mx-auto p-8 space-y-6 overflow-y-auto">
                    <FormField
                        control={form.control}
                        name="extraNotes"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Anotações extras</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Anotações extra"
                                        className="resize-none"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="guidelines"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Orientações dadas ao paciente</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Conduta"
                                        className="resize-none"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <div className="flex flex-col items-center justify-center space-y-6 !mt-8">
                        <Button type="submit">
                            Enviar
                        </Button>
                    </div>

                </form>
            </Form>
        </div>
    );
}
;
