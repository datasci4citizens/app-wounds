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
  alcoholConsumption: string[];
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

  // Alcohol consumption value groups
  const DOSES_VALUES = ['LT21_M', 'GT21_M', 'LT14_F', 'GT14_F'];
  const LATAS_VALUES = ['LT13_M', 'GT13_M', 'LT9_F', 'GT9_F'];
  const ALL_DRINKING_VALUES = [...DOSES_VALUES, ...LATAS_VALUES];

  const handleAlcoholNone = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      alcoholConsumption: checked ? ['NONE'] : prev.alcoholConsumption.filter((v) => v !== 'NONE'),
    }));
  };

  const handleAlcoholEx = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target;
    setFormData((prev) => {
      if (checked) {
        return {
          ...prev,
          alcoholConsumption: [
            ...prev.alcoholConsumption.filter((v) => v === 'NONE' || !ALL_DRINKING_VALUES.includes(v)),
            'EX',
          ],
        };
      } else {
        return { ...prev, alcoholConsumption: prev.alcoholConsumption.filter((v) => v !== 'EX') };
      }
    });
  };

  const handleAlcoholDosesRadio = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      alcoholConsumption: [
        ...prev.alcoholConsumption.filter((v) => !DOSES_VALUES.includes(v)),
        value,
      ],
    }));
  };

  const handleAlcoholLatasRadio = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      alcoholConsumption: [
        ...prev.alcoholConsumption.filter((v) => !LATAS_VALUES.includes(v)),
        value,
      ],
    }));
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
          <Input name="fullName" value={formData.fullName} onChange={handleChange} className="bg-white dark:bg-card border-transparent shadow-sm h-14 rounded-2xl px-5" disabled={isSubmitting} />
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold ml-1">Data de Nascimento</Label>
          <Input name="birthDate" type="date" value={formData.birthDate} onChange={handleChange} className="bg-white dark:bg-card border-transparent shadow-sm h-14 rounded-2xl px-5 min-h-14" disabled={isSubmitting} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold ml-1">Estado (UF)</Label>
            <select name="state" value={formData.state} onChange={handleChange} disabled={isSubmitting} className="flex h-14 w-full appearance-none rounded-2xl border border-transparent bg-white dark:bg-card px-5 py-2 text-base font-medium shadow-sm disabled:opacity-50">
              <option value="" disabled>UF</option>
              {states.map(s => <option key={s.id} value={s.sigla}>{s.sigla}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold ml-1">Cidade</Label>
            <select name="city" value={formData.city} onChange={handleChange} disabled={!formData.state || isLoadingCities || isSubmitting} className="flex h-14 w-full appearance-none rounded-2xl border border-transparent bg-white dark:bg-card px-5 py-2 text-base font-medium shadow-sm disabled:opacity-50">
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
          <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold ml-1">Tabagismo</Label>
          <select name="smokingStatus" value={formData.smokingStatus} onChange={handleChange} disabled={isSubmitting} className="flex h-14 w-full appearance-none rounded-2xl border border-transparent bg-white dark:bg-card px-5 py-2 text-base font-medium shadow-sm disabled:opacity-50">
            <option value="">Selecione</option>
            <option value="NEVER">Não tabagista</option>
            <option value="LT10">Menos de 10 cigarros/dia</option>
            <option value="GT10">Mais de 10 cigarros/dia</option>
            <option value="EX">Ex-tabagista</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold ml-1">Consumo de álcool</Label>
          <div className="space-y-3 bg-white dark:bg-card rounded-2xl p-4 shadow-sm">
            {/* Não bebe — exclusive: clears everything else */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.alcoholConsumption.includes('NONE')}
                onChange={handleAlcoholNone}
                disabled={isSubmitting}
                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm font-medium">Não bebe</span>
            </label>

            {/* Ex-etilista — clears drinking volumes when checked */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.alcoholConsumption.includes('EX')}
                onChange={handleAlcoholEx}
                disabled={isSubmitting || formData.alcoholConsumption.includes('NONE')}
                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm font-medium">Ex-etilista</span>
            </label>

            {/* Doses — radio group, mutually exclusive within */}
            {(formData.gender === 'M' || formData.gender === 'F') && !formData.alcoholConsumption.includes('NONE') && !formData.alcoholConsumption.includes('EX') && (
              <div className="border-t border-border/50 pt-3 mt-1">
                <p className="text-xs text-muted-foreground mb-2 font-semibold">Doses (por semana):</p>
                {formData.gender === 'M' ? (
                  <>
                    <label className="flex items-center gap-3 cursor-pointer py-0.5">
                      <input
                        type="radio"
                        name="alcohol-doses"
                        value="LT21_M"
                        checked={formData.alcoholConsumption.includes('LT21_M')}
                        onChange={handleAlcoholDosesRadio}
                        disabled={isSubmitting || formData.alcoholConsumption.includes('EX')}
                        className="w-5 h-5 border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm">Menos de 21 doses/sem</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer py-0.5">
                      <input
                        type="radio"
                        name="alcohol-doses"
                        value="GT21_M"
                        checked={formData.alcoholConsumption.includes('GT21_M')}
                        onChange={handleAlcoholDosesRadio}
                        disabled={isSubmitting || formData.alcoholConsumption.includes('EX')}
                        className="w-5 h-5 border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm">Mais de 21 doses/sem</span>
                    </label>
                  </>
                ) : (
                  <>
                    <label className="flex items-center gap-3 cursor-pointer py-0.5">
                      <input
                        type="radio"
                        name="alcohol-doses"
                        value="LT14_F"
                        checked={formData.alcoholConsumption.includes('LT14_F')}
                        onChange={handleAlcoholDosesRadio}
                        disabled={isSubmitting || formData.alcoholConsumption.includes('EX')}
                        className="w-5 h-5 border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm">Menos de 14 doses/sem</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer py-0.5">
                      <input
                        type="radio"
                        name="alcohol-doses"
                        value="GT14_F"
                        checked={formData.alcoholConsumption.includes('GT14_F')}
                        onChange={handleAlcoholDosesRadio}
                        disabled={isSubmitting || formData.alcoholConsumption.includes('EX')}
                        className="w-5 h-5 border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm">Mais de 14 doses/sem</span>
                    </label>
                  </>
                )}
              </div>
            )}

            {/* Latas — radio group, mutually exclusive within */}
            {(formData.gender === 'M' || formData.gender === 'F') && !formData.alcoholConsumption.includes('NONE') && !formData.alcoholConsumption.includes('EX') && (
              <div className="border-t border-border/50 pt-3 mt-1">
                <p className="text-xs text-muted-foreground mb-2 font-semibold">Latas (por semana):</p>
                {formData.gender === 'M' ? (
                  <>
                    <label className="flex items-center gap-3 cursor-pointer py-0.5">
                      <input
                        type="radio"
                        name="alcohol-latas"
                        value="LT13_M"
                        checked={formData.alcoholConsumption.includes('LT13_M')}
                        onChange={handleAlcoholLatasRadio}
                        disabled={isSubmitting || formData.alcoholConsumption.includes('EX')}
                        className="w-5 h-5 border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm">Menos de 13 latas/sem</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer py-0.5">
                      <input
                        type="radio"
                        name="alcohol-latas"
                        value="GT13_M"
                        checked={formData.alcoholConsumption.includes('GT13_M')}
                        onChange={handleAlcoholLatasRadio}
                        disabled={isSubmitting || formData.alcoholConsumption.includes('EX')}
                        className="w-5 h-5 border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm">Mais de 13 latas/sem</span>
                    </label>
                  </>
                ) : (
                  <>
                    <label className="flex items-center gap-3 cursor-pointer py-0.5">
                      <input
                        type="radio"
                        name="alcohol-latas"
                        value="LT9_F"
                        checked={formData.alcoholConsumption.includes('LT9_F')}
                        onChange={handleAlcoholLatasRadio}
                        disabled={isSubmitting || formData.alcoholConsumption.includes('EX')}
                        className="w-5 h-5 border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm">Menos de 9 latas/sem</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer py-0.5">
                      <input
                        type="radio"
                        name="alcohol-latas"
                        value="GT9_F"
                        checked={formData.alcoholConsumption.includes('GT9_F')}
                        onChange={handleAlcoholLatasRadio}
                        disabled={isSubmitting || formData.alcoholConsumption.includes('EX')}
                        className="w-5 h-5 border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm">Mais de 9 latas/sem</span>
                    </label>
                  </>
                )}
              </div>
            )}

            {/* Gender not set — instructional message */}
            {(!formData.gender || (formData.gender !== 'M' && formData.gender !== 'F')) && !formData.alcoholConsumption.includes('NONE') && (
              <div className="border-t border-border/50 pt-3 mt-1">
                <p className="text-xs text-muted-foreground">
                  Selecione o sexo acima para definir as opções de consumo.
                </p>
              </div>
            )}
          </div>
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
