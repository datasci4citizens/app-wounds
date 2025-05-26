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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import DatePicker from "@/components/common/DatePicker"; // Assuming path from WoundCreate
import { cn } from "@/lib/utils"; // Standard utility for shadcn/ui projects
import { isAfter } from "date-fns";

// Define interface for user data
interface UserData {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  authenticated: boolean;
}

// Define Zod schema for form validation
const specialistSignUpSchema = z.object({
  fullName: z.string().min(1, "Nome completo é obrigatório"),
  dateOfBirth: z.date({ required_error: "Data de nascimento é obrigatória" }),
  email: z.string().email("Email inválido").min(1, "Email é obrigatório"),
  state: z.string().min(1, "Estado é obrigatório"),
  city: z.string().min(1, "Cidade é obrigatória"),
  specialistCode: z.string().min(1, "Código do profissional é obrigatório"),
});

type SpecialistSignUpFormValues = z.infer<typeof specialistSignUpSchema>;

const brazilianStates = [
  { value: "AC", label: "AC" }, { value: "AL", label: "AL" }, { value: "AP", label: "AP" },
  { value: "AM", label: "AM" }, { value: "BA", label: "BA" }, { value: "CE", label: "CE" },
  { value: "DF", label: "DF" }, { value: "ES", label: "ES" }, { value: "GO", label: "GO" },
  { value: "MA", label: "MA" }, { value: "MT", label: "MT" }, { value: "MS", label: "MS" },
  { value: "MG", label: "MG" }, { value: "PA", label: "PA" }, { value: "PB", label: "PB" },
  { value: "PR", label: "PR" }, { value: "PE", label: "PE" }, { value: "PI", label: "PI" },
  { value: "RJ", label: "RJ" }, { value: "RN", label: "RN" }, { value: "RS", label: "RS" },
  { value: "RO", label: "RO" }, { value: "RR", label: "RR" }, { value: "SC", label: "SC" },
  { value: "SP", label: "SP" }, { value: "SE", label: "SE" }, { value: "TO", label: "TO" }
];

// To make the select placeholder look like the input placeholder
const selectTriggerStyle = "placeholder:text-[#edebeb] placeholder:text-xs";

// Custom placeholder component for Select
const SelectPlaceholder = ({ text, className }: { text: string, className?: string }) => (
  <span className={cn("text-xs text-[#edebeb]", className)}>
    {text}
  </span>
);


export default function SpecialistSignUp() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const form = useForm<SpecialistSignUpFormValues>({
    resolver: zodResolver(specialistSignUpSchema),
    defaultValues: {
      fullName: "",
      dateOfBirth: undefined,
      email: "",
      state: "",
      city: "",
      specialistCode: "",
    },
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("access_token");
        
        if (!token) {
          console.error("No access token found");
          setIsLoading(false);
          return;
        }
        
        const response = await axios.get<UserData>(
          `${import.meta.env.VITE_SERVER_URL}/auth/me/`, 
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        const userData = response.data;
        
        // Construct full name from first_name and last_name
        const fullName = `${userData.first_name || ''} ${userData.last_name || ''}`.trim();
        
        // Update form with fetched data using react-hook-form's reset
        form.reset({
          ...form.getValues(), // Keep existing values if any (though defaultValues are likely fine)
          fullName: fullName || "",
          email: userData.email || "",
          // dateOfBirth remains undefined unless fetched, which is fine
        });

        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [form]);

  const onSubmit = async (data: SpecialistSignUpFormValues) => {
    if (!acceptedTerms) {
      alert("Você precisa aceitar os termos para continuar.");
      return;
    }

    try {
      // Here you would send the form data to your backend
      // For example:
      // const token = localStorage.getItem("access_token");
      // await axios.post(`${import.meta.env.VITE_SERVER_URL}/specialist/profile/`, formData, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      
      // For now, just store in localStorage
      // If dateOfBirth is a Date object, JSON.stringify will convert it to ISO string.
      // If a specific format like YYYY-MM-DD is needed for an API, format it here:
      // const payload = {
      //   ...data,
      //   dateOfBirth: data.dateOfBirth ? data.dateOfBirth.toISOString().split('T')[0] : undefined,
      // };
      localStorage.setItem("specialist_info", JSON.stringify(data)); 
      
      // Navigate to specialist menu after successful submission
      navigate("/specialist/menu");
    } catch (error) {
      console.error("Failed to submit form:", error);
    }
  };

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
          {/* Regular Header - will scroll with content */}
          <div className="z-10 bg-[#F9FAFB] pb-6 px-6 pt-4">
            <AppHeader title="Informações pessoais" />
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 px-6 pb-6 bg-[#F9FAFB]">
              <div className="w-full max-w-md mx-auto space-y-4" style={{fontFamily: "Roboto, sans-serif"}}>
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Nome completo</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nome completo"
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
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de nascimento</FormLabel>
                      <FormControl>
                        <DatePicker
                          field={field}
                          disabled={(date) => isAfter(date, new Date())} // Prevent selecting future dates
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Email"
                          type="email"
                          {...field}
                          readOnly
                          className={cn(fieldState.error && "border-destructive focus-visible:ring-destructive")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value} // Ensure value is controlled
                        >
                          <SelectTrigger
                            className={cn(
                              selectTriggerStyle, // Apply placeholder-like styles
                              fieldState.error && "border-destructive focus-visible:ring-destructive",
                              !field.value && "text-xs text-[#edebeb]" // Apply placeholder color if no value
                            )}
                          >
                            {field.value ? <SelectValue placeholder="Estado" /> : <SelectPlaceholder text="Estado" />}
                          </SelectTrigger>
                          <SelectContent>
                            {brazilianStates.map(state => (
                              <SelectItem key={state.value} value={state.value}>{state.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Cidade</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Cidade"
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
                      <FormLabel>Código do profissional</FormLabel>
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

                {/* Termos e Condições */}
                <div className="mt-8">
                  <TermsWithPopup onChange={setAcceptedTerms} />
                </div>

                {/* Next button */}
                <div className="mt-10 flex justify-center mb-10">
                  <Button
                    type="submit"
                    className="text-white text-sm w-[216px]"
                    disabled={!acceptedTerms || form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? "Enviando..." : "Próximo"}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </WaveBackgroundLayout>
    </div>
  );
}