import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import DatePicker from "@/components/common/DatePicker";
import { useNavigate } from "react-router-dom";
import { isBefore, isAfter, startOfDay } from "date-fns";
import { useState, useEffect } from "react";
import { WaveBackgroundLayout } from "@/components/ui/new/wave/WaveBackground";
import { ProfessionalIcon } from "@/components/ui/new/ProfessionalIcon";
import { Button } from "@/components/ui/new/Button";
import useSWRMutation from "swr/mutation";
import { getBaseURL, getRequest, postRequest } from "@/data/common/HttpExtensions";
import { Checkbox } from "@/components/ui/new/general/Checkbox";
import { Plus, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import smokeFrequency from "@/localdata/smoke-frequency.json";
import drinkFrequency from "@/localdata/drink-frequency.json";

const patientSchema = z.object({
  name: z.string().min(1, "Campo obrigatório"),
  phone_number: z.string().optional(),
  sex: z.string().min(1, "Campo obrigatório"),
  email: z.string().min(1, "Campo obrigatório").email("Email inválido"),
  birthday: z.date({ required_error: "Campo obrigatório" }),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "Você precisa aceitar os termos.",
  }),
});

type PatientFormData = z.infer<typeof patientSchema>;

const otherComorbiditiesInitialValue = [
  { id: "asthma", label: "Asma" },
  { id: "chronic_kidney_disease", label: "Doença renal crônica" },
  { id: "copd", label: "DPOC (Doença Pulmonar Obstrutiva Crônica)" },
  { id: "heart_failure", label: "Insuficiência cardíaca" },
  { id: "arthritis", label: "Artrite" },
];

interface Comorbidity {
  cid11_code: string;
  name: string;
  comorbidity_id: number;
}

export default function PatientCreateRedesign() {
  const navigate = useNavigate();
  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: "",
      phone_number: "",
      sex: "",
      email: "",
      birthday: undefined,
      acceptTerms: false,
    },
  });

  const [loading, setLoading] = useState(false);
  const [showOptional, setShowOptional] = useState(false);
  const [selectedComorbidity, setSelectedComorbidity] = useState<string[]>([]);
  const [otherComorbidities, setOtherComorbidities] = useState(otherComorbiditiesInitialValue);
  const [comorbiditiesInput, setComorbiditiesInput] = useState("");
  const [popoverOpen, setPopoverOpen] = useState(false);

  // SWR to fetch comorbidities list
  const { data: comorbiditiesData, trigger: fetchComorbidities } = useSWRMutation<Comorbidity[]>(
    getBaseURL("/comorbidities/"),
    getRequest
  );

  useEffect(() => {
    fetchComorbidities();
  }, []);

  const allFieldsValid = form.watch("name") &&
    form.watch("sex") &&
    form.watch("email") &&
    form.watch("birthday") &&
    form.watch("acceptTerms");

  const handleNext = async () => {
    const isValid = await form.trigger();
    if (isValid) {
      const data = form.getValues();
      console.log("Dados do paciente:", data); // <-- imprime no terminal
      navigate("/specialist/patient/create-details");
    }
  };

  const toggleOptional = async () => {
    setShowOptional(!showOptional);
  };

 const handleAddComorbidity = () => {
  if (!comorbiditiesInput.trim()) return;

  const selectedItem = otherComorbidities.find((item) => item.id === comorbiditiesInput);

  if (!selectedItem) return;

  if (selectedComorbidity.includes(selectedItem.id)) return; // já foi adicionada

  const updated = [...selectedComorbidity, selectedItem.id];
  setSelectedComorbidity(updated);
  form.setValue("other_comorbidities", updated);
  setComorbiditiesInput(""); // limpa a seleção
};


  return (
    <div className="fixed inset-0 flex flex-col">
      <WaveBackgroundLayout className="flex-1 bg-[#F9FAFB] overflow-y-auto pb-10">
        <div className="w-full max-w-[430px] mx-auto px-6">
          <div className="flex justify-center mb-4">
            <ProfessionalIcon size={0.6} borderRadius="50%" />
          </div>
          <h1 className="text-center text-[#0120AC] text-xl font-semibold mb-6">
            Cadastro de paciente
          </h1>

          <Form {...form}>
            <form className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#0120AC]">Nome completo</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nome completo"
                        className="placeholder:text-[#A6BBFF] bg-white text-[#0120AC] border-none focus:ring-0 focus:outline-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#0120AC]">Telefone</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="(00) 00000-0000"
                        className="placeholder:text-[#A6BBFF] bg-white text-[#0120AC] border-none focus:ring-0 focus:outline-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sex"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#0120AC]">Sexo</FormLabel>
                    <div className="flex gap-6 mt-2">
                      <label className="flex items-center gap-2 text-sm text-[#0120AC]">
                        <input
                          type="radio"
                          value="female"
                          checked={field.value === "female"}
                          onChange={() => field.onChange("female")}
                          className="accent-[#0120AC] w-4 h-4"
                        />
                        Feminino
                      </label>
                      <label className="flex items-center gap-2 text-sm text-[#0120AC]">
                        <input
                          type="radio"
                          value="male"
                          checked={field.value === "male"}
                          onChange={() => field.onChange("male")}
                          className="accent-[#0120AC] w-4 h-4"
                        />
                        Masculino
                      </label>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#0120AC]">Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Email"
                        type="email"
                        className="placeholder:text-[#A6BBFF] bg-white text-[#0120AC] border-none focus:ring-0 focus:outline-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="birthday"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#0120AC] ">Data de nascimento</FormLabel>
                    <DatePicker
                      field={field}
                      disabled={(date) =>
                        isBefore(date, new Date("1900-01-01")) ||
                        isAfter(date, startOfDay(new Date()))
                      }
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {showOptional && (
                <>
                  <div className="flex gap-4">
                    <FormField
                      control={form.control}
                      name="height"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#0120AC]">Altura</FormLabel>
                          <div className="flex items-center gap-1">
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="1.70"
                                className="w-[80px] placeholder:text-[#A6BBFF] bg-white text-[#0120AC] border border-[#A6BBFF] rounded-md"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <span className="text-[#0120AC]">m</span>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#0120AC]">Peso</FormLabel>
                          <div className="flex items-center gap-1">
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="70"
                                className="w-[80px] placeholder:text-[#A6BBFF] bg-white text-[#0120AC] border-[#A6BBFF] rounded-md"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <span className="text-[#0120AC]">Kg</span>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>


                  {/* Comorbidades */}
                  <FormField
                    control={form.control}
                    name="comorbidities"
                    render={() => (
                      <FormItem>
                        <FormLabel className="text-[#0120AC]">Comorbidades</FormLabel>
                        <div className="grid grid-cols-2 gap-2">
                          {comorbiditiesData?.map((item) => (
                            <FormField
                              key={item.comorbidity_id}
                              control={form.control}
                              name="comorbidities"
                              render={({ field }) => (
                                <FormItem className="flex items-center gap-2">
                                  <Checkbox
                                    checked={field.value?.includes(item.comorbidity_id)}
                                    onCheckedChange={(checked) =>
                                      checked
                                        ? field.onChange([...(field.value ?? []), item.comorbidity_id])
                                        : field.onChange(
                                            field.value?.filter((id) => id !== item.comorbidity_id)
                                          )
                                    }
                                  />
                                  <FormLabel className="font-normal">{item.name}</FormLabel>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Outras comorbidades */}
                  <FormField
                    control={form.control}
                    name="other_comorbidities"
                    render={() => (
                      <FormItem>
                        <FormLabel className="text-[#0120AC]">Outras comorbidades</FormLabel>
                        
                        {/* Select + botão */}
                        <div className="flex items-center w-full gap-2">
                        <Select value={comorbiditiesInput} onValueChange={setComorbiditiesInput}>
                            <FormControl>
                              <SelectTrigger className="w-full text-[#0120AC] border-[#A6BBFF]">
                               <SelectValue
                                  placeholder="Selecione uma comorbidade"
                                  className="text-[#0120AC] placeholder:text-[#A6BBFF]"
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {otherComorbidities.map((item) => (
                                <SelectItem key={item.id} value={item.id}>
                                  {item.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Button
                            type="button"
                            onClick={handleAddComorbidity}
                            className="bg-[#0120AC] text-white w-auto px-3 py-1 rounded"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Tags exibidas abaixo */}
                        <div className="mt-3 flex flex-wrap gap-2">
                          {selectedComorbidity.map((itemId) => {
                            const label = otherComorbidities.find((c) => c.id === itemId)?.label || itemId;
                            return (
                                <Button
                                  key={itemId}
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="h-6 max-w-full rounded-full px-3 text-xs flex items-center space-x-2 border-[#0120AC] text-[#0120AC] overflow-hidden"
                                  onClick={() => {
                                    const newSelected = selectedComorbidity.filter((id) => id !== itemId);
                                    setSelectedComorbidity(newSelected);
                                    form.setValue("other_comorbidities", newSelected);
                                  }}
                                >
                                  <span className="truncate max-w-[150px] whitespace-nowrap">{label}</span>
                                  <X className="h-3 w-3" />
                                </Button>
                            );
                          })}
                        </div>
                      </FormItem>
                    )}
                  />


                  {/* Fumo */}
                  <FormField
                    control={form.control}
                    name="smoke_frequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#0120AC]">Fumante</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger  className="w-full bg-white border-[#A6BBFF] text-[#0120AC] placeholder:text-[#A6BBFF] focus:ring-0 focus:outline-none">
                              <SelectValue placeholder="Selecione a frequência de fumo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(smokeFrequency).map(([key, val]) => (
                              <SelectItem key={key} value={key}>
                                {val}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  {/* Bebida */}
                  <FormField
                    control={form.control}
                    name="drink_frequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#0120AC]">Bebida alcoólica</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger  className="w-full bg-white border-[#A6BBFF] text-[#0120AC] placeholder:text-[#A6BBFF] focus:ring-0 focus:outline-none">
                              <SelectValue  placeholder="Selecione a frequência" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(drinkFrequency).map(([key, val]) => (
                              <SelectItem key={key} value={key}>
                                {val}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </>
              )}

              <FormField
                control={form.control}
                name="acceptTerms"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={field.value === true}
                        onChange={() => field.onChange(!field.value)}
                        className="accent-[#0120AC] w-4 h-4"
                      />
                      <FormLabel className="text-sm font-normal text-[#0120AC]">
                        Concordo em participar da pesquisa
                      </FormLabel>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              

              {/* Botoes */}
              <div className="flex flex-col items-center space-y-4 mt-6">
                <Button
                  type="button"
                  className="w-[220px] border border-[#0120AC] text-[#0120AC] bg-white rounded-[20px]"
                  onClick={toggleOptional}
                >
                  {showOptional ? "Ocultar opcionais" : "Adicionar opcionais"}
                </Button>

                <Button
                  type="button"
                  className="w-[160px] bg-[#0120AC] text-white rounded-[20px]"
                  disabled={loading || !allFieldsValid}
                  onClick={handleNext}
                >
                  Cadastrar
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </WaveBackgroundLayout>
    </div>
  );
}
