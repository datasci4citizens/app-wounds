import AppHeader from "@/components/ui/common/AppHeader";
import { Button } from "@/components/ui/new/Button";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { TermsWithPopup } from "@/components/ui/new/general/TermsWithPopup";
import { WaveBackgroundLayout } from "@/components/ui/new/wave/WaveBackground";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils"; // Standard utility for shadcn/ui projects
import { Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";


// Define Zod schema for form validation
const specialistSignUpSchema = z.object({
  specialty: z.string().min(1, "Especialidade é obrigatória"),
  specialistCode: z.string().min(1, "Código do profissional é obrigatório"),
});

type SpecialistSignUpFormValues = z.infer<typeof specialistSignUpSchema>;


export default function SpecialistSignUpDetails() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const form = useForm<SpecialistSignUpFormValues>({
    resolver: zodResolver(specialistSignUpSchema),
    defaultValues: {
      specialty: "",
      specialistCode: "",
    },
  });

  useEffect(() => {
    setIsLoading(false);
  }, [form]);


  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col">
      <WaveBackgroundLayout className="flex-1 bg-[#F9FAFB] overflow-y-auto">
        <div className="flex flex-col min-h-full bg-[#F9FAFB]">
          <div className="z-10 bg-[#F9FAFB] pb-6 px-6 pt-4">
            <AppHeader title="Informações profissionais" />
          </div>

          <Form {...form}>
            <form className="flex-1 px-6 pb-6 bg-[#F9FAFB]">
              <div className="w-full max-w-md mx-auto space-y-4" style={{fontFamily: "Roboto, sans-serif"}}>
                <FormField
                  control={form.control}
                  name="specialty"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center gap-2">
                        <FormLabel>Especialidade</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <button 
                              type="button"
                              className="rounded-full bg-muted p-1 hover:bg-muted/80 transition-colors"
                              aria-label="Informações sobre especialidade"
                            >
                              <Info size={14} className="text-muted-foreground" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent 
                            className="bg-[#0120AC] text-white rounded-xl p-4 text-center w-80 text-sm shadow-md border-none opacity-90"
                            side="bottom"
                            align="start" 
                            alignOffset={80} 
                            sideOffset={5}
                          >
                            <p>Informe sua especialidade médica ou profissional da saúde.</p>
                          </PopoverContent>
                        </Popover>
                      </div>
                      <FormControl>
                        <Input
                          placeholder="Especialidade"
                          {...field}
                          className={cn(fieldState.error && "border-destructive focus-visible:ring-destructive")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="specialistCode"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center gap-2">
                        <FormLabel>Código do profissional</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <button 
                              type="button"
                              className="rounded-full bg-muted p-1 hover:bg-muted/80 transition-colors"
                              aria-label="Informações sobre código do profissional"
                            >
                              <Info size={14} className="text-muted-foreground" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent 
                            className="bg-[#0120AC] text-white rounded-xl p-4 text-center w-80 text-sm shadow-md border-none opacity-90"
                            side="bottom"
                            align="start" 
                            alignOffset={80} 
                            sideOffset={5}
                          >
                            <p>Código de uso único para o profissional.</p>
                          </PopoverContent>
                        </Popover>
                      </div>
                      <FormControl>
                        <Input
                          placeholder="Código do profissional"
                          {...field}
                          className={cn(fieldState.error && "border-destructive focus-visible:ring-destructive")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="absolute bottom-10 left-0 right-0 w-full px-6">
                  {/* Termos e Condições */}
                  <div className="flex justify-center mt-4 px-6">
                    <TermsWithPopup onChange={setAcceptedTerms} />
                  </div>

                  {/* Next button */}
                  <div className="flex justify-center mt-6 mb-6">
                    <Button
                      type="button"
                      className="text-white text-sm w-[216px]"
                      disabled={!acceptedTerms || isSubmitting}
                      onClick={() => {
                        try {
                          form.trigger().then(async (valid) => {
                            if (valid) {
                              // Get current form data
                              const detailsData = form.getValues();               
                              const prevData = localStorage.getItem("specialist_info");
                              const formData = prevData ? JSON.parse(prevData) : {};
                              
                              // Format data according to the required API payload format
                              const payload = {
                                specialist_name: formData.fullName || "",
                                email: formData.email || "",
                                birthday: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString().split('T')[0] : null,
                                speciality: detailsData.specialty || null,
                                city: formData.city || null,
                                state: formData.state || null,
                                specialist_character: detailsData.specialistCode || null
                              };
                              
                              try {
                                // Set button to loading state
                                setIsSubmitting(true);
                                
                                // Get token from localStorage
                                const token = localStorage.getItem("access_token");
                                
                                if (!token) {
                                  console.error("No access token found");
                                  return;
                                }
                                
                                // Make POST request to /specialist endpoint
                                const response = await axios.post(
                                  `${import.meta.env.VITE_SERVER_URL}/specialists/`,
                                  payload,
                                  {
                                    headers: {
                                      Authorization: `Bearer ${token}`,
                                      'Content-Type': 'application/json'
                                    }
                                  }
                                );
                                
                                // Update storage with combined data including API response
                                const combinedData = { ...payload, ...response.data };
                                localStorage.setItem("specialist_info", JSON.stringify(combinedData));
                                
                                // Navigate to login after successful API call
                                navigate("/");
                              } catch (apiError) {
                                console.error("API request failed:", apiError);
                                alert("Erro ao enviar dados para o servidor. Por favor tente novamente.");
                              } finally {
                                setIsSubmitting(false);
                              }
                            } else {
                              console.log("Form validation failed");
                            }
                          });
                        } catch (error) {
                          console.error("Error in form submission:", error);
                        }
                      }}
                    >
                      {isSubmitting ? "Enviando..." : "Cadastrar"}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </WaveBackgroundLayout>
    </div>
  );
}