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
import { Button } from "@/components/ui/button";
import useSWRMutation from "swr/mutation";
import { getBaseURL, getRequest, postRequest } from "@/data/common/HttpExtensions";
import { Checkbox } from "@/components/ui/new/general/Checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Check, Plus, X } from "lucide-react";
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
      localStorage.setItem("patient_info", JSON.stringify(data));
      navigate("/specialist/patient/create-details");
    }
  };

  const toggleOptional = async () => {
    setShowOptional(!showOptional);
  };

  const handleAddComorbidity = () => {
    if (!comorbiditiesInput.trim()) return;
    const newItem = {
      id: comorbiditiesInput.toLowerCase().replace(/\s+/g, "_"),
      label: comorbiditiesInput.trim(),
    };
    setOtherComorbidities((prev) => [...prev, newItem]);
    setSelectedComorbidity((prev) => [...prev, newItem.id]);
    setComorbiditiesInput("");
    // Also update form field for other_comorbidities
    const current = form.getValues("other_comorbidities") || [];
    form.setValue("other_comorbidities", [...current, newItem.id]);
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
              {/* === PARTE 1 (SEU FORMULARIO ATUAL) === */}
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
                    <FormLabel className="text-[#0120AC]">Data de nascimento</FormLabel>
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

              {/* === PARTE 2: FORMULÁRIO OPCIONAL APARECENDO AO CLICAR NO BOTAO === */}
              {showOptional && (
                <>
                  {/* Altura / Peso */}
                  <div className="flex gap-4">
                    <FormField
                      control={form.control}
                      name="height"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Altura</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="1.70"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="weight"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Peso</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="70"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
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
                        <FormLabel>Comorbidades</FormLabel>
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
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Outras comorbidades</FormLabel>
                        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                          <PopoverTrigger asChild>
                            <Button type="button" variant="outline">
                              Adicionar outra
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[300px]">
                            <Command>
                              <CommandInput
                                placeholder="Pesquisar"
                                value={comorbiditiesInput}
                                onValueChange={setComorbiditiesInput}
                              />
                              <CommandList>
                                <CommandEmpty>
                                  <Button
                                    type="button"
                                    onClick={handleAddComorbidity}
                                    className="w-full flex items-center justify-center gap-2"
                                  >
                                    <Plus className="h-4 w-4" />
                                    Adicionar {comorbiditiesInput}
                                  </Button>
                                </CommandEmpty>
                                <CommandGroup>
                                  {otherComorbidities.map((item) => (
                                    <CommandItem
                                      key={item.id}
                                      onSelect={() => {
                                        const current = form.getValues("other_comorbidities") || [];
                                        const updated = current.includes(item.id)
                                          ? current.filter((v) => v !== item.id)
                                          : [...current, item.id];
                                        form.setValue("other_comorbidities", updated);
                                        setSelectedComorbidity(updated);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          selectedComorbidity.includes(item.id)
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      {item.label}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>

                        {/* Tags */}
                        <div className="mt-2 flex flex-wrap gap-2">
                          {selectedComorbidity.map((item) => (
                            <Button
                              key={item}
                              type="button"
                              onClick={() => {
                                const newSelected = selectedComorbidity.filter((v) => v !== item);
                                setSelectedComorbidity(newSelected);
                                form.setValue("other_comorbidities", newSelected);
                              }}
                              className="rounded-full h-6 px-3 text-xs flex items-center space-x-2"
                            >
                              <span>{item}</span>
                              <X className="h-4 w-4" />
                            </Button>
                          ))}
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
                        <FormLabel>Fumante</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
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
                        <FormLabel>Bebida alcoólica</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a frequência" />
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
                  Próximo
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </WaveBackgroundLayout>
    </div>
  );
}
