"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AsyncComorbiditySearch } from "@/components/AsyncComorbiditySearch";

interface IBGEState {
  id: number;
  sigla: string;
  nome: string;
}

interface IBGECity {
  id: number;
  nome: string;
}

export interface PatientFormData {
  fullName: string;
  birthDate: string;
  state: string;
  city: string;
  contactPhone: string;
  contactEmail: string;
  gender: string;
  height: string;
  weight: string;
  comorbidities: string[];
  smokingStatus: string;
  alcoholConsumption: string;
}

interface PatientFormProps {
  initialData: PatientFormData;
  initialComorbidities?: any[];
  onSubmit: (data: PatientFormData) => void;
  isSubmitting: boolean;
  submitIcon?: React.ReactNode;
  submitLabel: string;
  emailRequired?: boolean;
}

export function PatientForm({
  initialData,
  initialComorbidities = [],
  onSubmit,
  isSubmitting,
  submitIcon,
  submitLabel,
  emailRequired = true,
}: PatientFormProps) {
  const [formData, setFormData] = useState<PatientFormData>(initialData);
  const [states, setStates] = useState<IBGEState[]>([]);
  const [cities, setCities] = useState<IBGECity[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  useEffect(() => {
    fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome")
      .then((res) => res.json())
      .then((data) => setStates(data))
      .catch((err) => console.error("Erro ao buscar estados:", err));
  }, []);

  useEffect(() => {
    if (formData.state) {
      setIsLoadingCities(true);
      fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${formData.state}/municipios?orderBy=nome`)
        .then((res) => res.json())
        .then((data) => {
          setCities(data);
          // If the selected city is not in the new list (e.g. state changed), clear it
          if (!data.some((c: IBGECity) => c.nome === formData.city)) {
              setFormData(prev => ({ ...prev, city: "" }));
          }
        })
        .catch((err) => console.error("Erro ao buscar cidades:", err))
        .finally(() => setIsLoadingCities(false));
    } else {
      setCities([]);
    }
  }, [formData.state]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, "");
    if (v.length > 11) v = v.substring(0, 11);
    let formatted = v;
    if (v.length > 2) formatted = `(${v.substring(0, 2)}) ${v.substring(2)}`;
    if (v.length > 6) {
      if (v.length === 11) formatted = `(${v.substring(0, 2)}) ${v.substring(2, 7)}-${v.substring(7)}`;
      else formatted = `(${v.substring(0, 2)}) ${v.substring(2, 6)}-${v.substring(6)}`;
    }
    setFormData((prev) => ({ ...prev, contactPhone: formatted }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form id="patient-form" onSubmit={handleSubmit} className="space-y-5">
      {/* Basic Info */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold ml-1">Nome Completo</Label>
          <Input name="fullName" value={formData.fullName} onChange={handleChange} required className="bg-white dark:bg-card border-transparent shadow-sm h-14 rounded-2xl px-5" disabled={isSubmitting} />
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold ml-1">Data de Nascimento</Label>
          <Input name="birthDate" type="date" value={formData.birthDate} onChange={handleChange} required className="bg-white dark:bg-card border-transparent shadow-sm h-14 rounded-2xl px-5 min-h-14" disabled={isSubmitting} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold ml-1">Estado (UF)</Label>
            <select name="state" value={formData.state} onChange={handleChange} required disabled={isSubmitting} className="flex h-14 w-full appearance-none rounded-2xl border border-transparent bg-white dark:bg-card px-5 py-2 text-base font-medium shadow-sm disabled:opacity-50">
                <option value="" disabled>UF</option>
                {states.map(s => <option key={s.id} value={s.sigla}>{s.sigla}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold ml-1">Cidade</Label>
            <select name="city" value={formData.city} onChange={handleChange} required disabled={!formData.state || isLoadingCities || isSubmitting} className="flex h-14 w-full appearance-none rounded-2xl border border-transparent bg-white dark:bg-card px-5 py-2 text-base font-medium shadow-sm disabled:opacity-50">
                <option value="" disabled>{isLoadingCities ? "..." : "Selecione"}</option>
                {cities.map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}
            </select>
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold ml-1">E-mail do Paciente {emailRequired && "(Obrigatório)"}</Label>
          <Input name="contactEmail" type="email" value={formData.contactEmail} onChange={handleChange} required={emailRequired} className="bg-white dark:bg-card border-transparent shadow-sm h-14 rounded-2xl px-5" disabled={isSubmitting} />
          <p className="text-[10px] text-muted-foreground ml-1">Usado para o login do paciente no aplicativo.</p>
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold ml-1">Telefone / WhatsApp</Label>
          <Input name="contactPhone" type="tel" value={formData.contactPhone} onChange={handlePhoneChange} maxLength={15} className="bg-white dark:bg-card border-transparent shadow-sm h-14 rounded-2xl px-5" disabled={isSubmitting} />
        </div>
      </div>

      {/* Clinical Info */}
      <div className="space-y-4 pt-6 border-t border-border/50">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-foreground">Informações Clínicas</h2>
          <p className="text-xs text-muted-foreground">Histórico médico e hábitos do paciente.</p>
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold ml-1">Sexo</Label>
          <select name="gender" value={formData.gender} onChange={handleChange} disabled={isSubmitting} className="flex h-14 w-full appearance-none rounded-2xl border border-transparent bg-white dark:bg-card px-5 py-2 text-base font-medium shadow-sm disabled:opacity-50">
              <option value="">Selecione</option>
              <option value="M">Masculino</option>
              <option value="F">Feminino</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold ml-1">Altura (m)</Label>
            <Input name="height" type="number" step="0.01" value={formData.height} onChange={handleChange} className="bg-white dark:bg-card border-transparent shadow-sm h-14 rounded-2xl px-5" disabled={isSubmitting} />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold ml-1">Peso (kg)</Label>
            <Input name="weight" type="number" step="0.1" value={formData.weight} onChange={handleChange} className="bg-white dark:bg-card border-transparent shadow-sm h-14 rounded-2xl px-5" disabled={isSubmitting} />
          </div>
        </div>

        <div className="space-y-2 relative z-50">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold ml-1">Comorbidades</Label>
          <AsyncComorbiditySearch
            selectedUris={formData.comorbidities}
            initialItems={initialComorbidities}
            onChange={(uris) => setFormData(prev => ({ ...prev, comorbidities: uris }))}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold ml-1">Fumante</Label>
          <select name="smokingStatus" value={formData.smokingStatus} onChange={handleChange} disabled={isSubmitting} className="flex h-14 w-full appearance-none rounded-2xl border border-transparent bg-white dark:bg-card px-5 py-2 text-base font-medium shadow-sm disabled:opacity-50">
              <option value="">Selecione</option>
              <option value="NEVER">Nunca fumou</option>
              <option value="LT10">Menos de 10 cigarros/dia</option>
              <option value="GT10">Mais de 10 cigarros/dia</option>
              <option value="EX">Ex-tabagista</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold ml-1">Álcool</Label>
          <select name="alcoholConsumption" value={formData.alcoholConsumption} onChange={handleChange} disabled={isSubmitting} className="flex h-14 w-full appearance-none rounded-2xl border border-transparent bg-white dark:bg-card px-5 py-2 text-base font-medium shadow-sm disabled:opacity-50">
              <option value="">Selecione</option>
              <option value="NONE">Não bebe</option>
              <option value="EX">Ex-etilista</option>
              
              {formData.gender === 'M' && (
                <>
                  <option value="LT21_M">Menos de 21 doses/sem</option>
                  <option value="GT21_M">Mais de 21 doses/sem</option>
                  <option value="LT13_M">Menos de 13 latas/sem</option>
                  <option value="GT13_M">Mais de 13 latas/sem</option>
                </>
              )}
              {formData.gender === 'F' && (
                <>
                  <option value="LT14_F">Menos de 14 doses/sem</option>
                  <option value="GT14_F">Mais de 14 doses/sem</option>
                  <option value="LT9_F">Menos de 9 latas/sem</option>
                  <option value="GT9_F">Mais de 9 latas/sem</option>
                </>
              )}
              {!formData.gender && (
                <>
                  <optgroup label="Homem">
                    <option value="LT21_M">Menos de 21 doses/sem</option>
                    <option value="GT21_M">Mais de 21 doses/sem</option>
                    <option value="LT13_M">Menos de 13 latas/sem</option>
                    <option value="GT13_M">Mais de 13 latas/sem</option>
                  </optgroup>
                  <optgroup label="Mulher">
                    <option value="LT14_F">Menos de 14 doses/sem</option>
                    <option value="GT14_F">Mais de 14 doses/sem</option>
                    <option value="LT9_F">Menos de 9 latas/sem</option>
                    <option value="GT9_F">Mais de 9 latas/sem</option>
                  </optgroup>
                </>
              )}
          </select>
        </div>
      </div>

      <div className="sticky bottom-0 left-0 right-0 p-6 -mx-6 bg-gradient-to-t from-background via-background pb-[calc(env(safe-area-inset-bottom)+24px)] pt-12 z-40 pointer-events-none mt-auto">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-14 flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold text-base rounded-2xl active:scale-[0.98] transition-transform shadow-md pointer-events-auto disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : submitIcon}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
