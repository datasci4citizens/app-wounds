import { useNavigate } from "react-router-dom";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form.tsx";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "@/components/ui/textarea.tsx";
import { Button } from "@/components/ui/button.tsx";
import { useWoundUpdate } from "@/routes/wound/AddUpdate/context-provider/WoundUpdateProvider.tsx";
import useSWRMutation from "swr/mutation";
import { getBaseURL, postRequest } from "@/data/common/HttpExtensions.ts";

const FormSchema = z.object({
    extraNotes: z.string().optional(),
    guidelines: z.string().optional(),
});

type ConductFormValues = z.infer<typeof FormSchema>;

export default function WoundAddUpdateConduct() {
    const navigate = useNavigate();
    const {woundUpdate, setWoundUpdate} = useWoundUpdate();

    const {trigger: postTrigger} = useSWRMutation(getBaseURL("/tracking-records/"), postRequest);

    const form = useForm<ConductFormValues>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            extraNotes: "",
            guidelines: "",
        }
    });

    const onSubmit = async (data: ConductFormValues) => {
        const updatedWoundUpdate = {
            ...woundUpdate,
            extra_notes: data.extraNotes || "",
            guidelines_to_patient: data.guidelines || "",
        };

        setWoundUpdate(updatedWoundUpdate);
        await postTrigger(updatedWoundUpdate);

        navigate('/wound/detail', {state: {wound_id: updatedWoundUpdate.wound_id}})
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
