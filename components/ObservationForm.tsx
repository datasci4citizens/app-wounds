"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, Save } from "lucide-react";
import { Label } from "@/components/ui/label";

export interface ObservationFormData {
  pain_level: number;
  exudate_amount: string;
  exudate_type: string;
  tissue_type: string;
  dressing_changes: number;
  periwound_skin: string;
  wound_edge: string;
  fever_24h: boolean;
  extra_notes: string;
  patient_guidelines: string;
}

interface ObservationFormProps {
  onSubmit: (data: ObservationFormData) => void;
  isSubmitting: boolean;
  authorRole: 'Pr' | 'Pa' | null;
}

export function ObservationForm({
  onSubmit,
  isSubmitting,
  authorRole
}: ObservationFormProps) {
  const [formData, setFormData] = useState<ObservationFormData>({
    pain_level: 0,
    exudate_amount: "Nenhum",
    exudate_type: "Ausente",
    tissue_type: "Granulação",
    dressing_changes: 1,
    periwound_skin: "Inchaço/Edema",
    wound_edge: "Indefinidas, não visíveis claramente",
    fever_24h: false,
    extra_notes: "",
    patient_guidelines: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Pain Level */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
            <Label className="text-xs font-bold uppercase text-muted-foreground ml-1">Nível de Dor ({formData.pain_level}/10)</Label>
            <span className="text-[10px] font-medium text-muted-foreground italic">(0: sem dor, 10: dor máxima)</span>
        </div>
        <input 
            type="range" 
            name="pain_level" 
            min="0" 
            max="10" 
            step="1" 
            value={formData.pain_level} 
            onChange={handleChange}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            style={{
                backgroundSize: `${formData.pain_level * 10}% 100%`,
                backgroundImage: 'linear-gradient(#3b82f6, #3b82f6)',
                backgroundRepeat: 'no-repeat'
            }}
            disabled={isSubmitting}
        />
        <div className="flex justify-between px-1 text-[10px] font-bold text-muted-foreground">
            <span>0</span><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span>8</span><span>9</span><span>10</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Exudate Amount */}
        <div className="space-y-2">
            <Label className="text-xs font-bold uppercase text-muted-foreground ml-1">Qtd. Exsudato</Label>
            <select name="exudate_amount" value={formData.exudate_amount} onChange={handleChange} className="flex h-12 w-full rounded-xl border border-border bg-background px-4 py-2 text-sm shadow-sm" disabled={isSubmitting}>
                <option value="Nenhum">Nenhum</option>
                <option value="Pouco">Pouco</option>
                <option value="Médio">Médio</option>
                <option value="Muito">Muito</option>
            </select>
        </div>

        {/* Exudate Type */}
        <div className="space-y-2">
            <Label className="text-xs font-bold uppercase text-muted-foreground ml-1">Tipo Exsudato</Label>
            <select name="exudate_type" value={formData.exudate_type} onChange={handleChange} className="flex h-12 w-full rounded-xl border border-border bg-background px-4 py-2 text-sm shadow-sm" disabled={isSubmitting}>
                <option value="Seroso">Seroso</option>
                <option value="Purulento">Purulento</option>
                <option value="Sanguinolento">Sanguinolento</option>
                <option value="Serosanguinolento">Serosanguinolento</option>
                <option value="Ausente">Ausente</option>
            </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Tissue Type */}
        <div className="space-y-2">
            <Label className="text-xs font-bold uppercase text-muted-foreground ml-1">Tipo Tecido</Label>
            <select name="tissue_type" value={formData.tissue_type} onChange={handleChange} className="flex h-12 w-full rounded-xl border border-border bg-background px-4 py-2 text-sm shadow-sm" disabled={isSubmitting}>
                <option value="Cicatrizado">Cicatrizado</option>
                <option value="Epitelização">Epitelização</option>
                <option value="Granulação">Granulação</option>
                <option value="Desvitalizado">Desvitalizado</option>
                <option value="Necrótico">Necrótico</option>
            </select>
        </div>

        {/* Dressing Changes */}
        <div className="space-y-2">
            <Label className="text-xs font-bold uppercase text-muted-foreground ml-1">Trocas/Dia</Label>
            <input 
                type="number" 
                name="dressing_changes" 
                min="0" 
                value={formData.dressing_changes} 
                onChange={handleChange}
                className="flex h-12 w-full rounded-xl border border-border bg-background px-4 py-2 text-sm shadow-sm"
                required
                disabled={isSubmitting}
            />
        </div>
      </div>

      {/* Periwound Skin */}
      <div className="space-y-2">
          <Label className="text-xs font-bold uppercase text-muted-foreground ml-1">Pele ao redor</Label>
          <select name="periwound_skin" value={formData.periwound_skin} onChange={handleChange} className="flex h-12 w-full rounded-xl border border-border bg-background px-4 py-2 text-sm shadow-sm" disabled={isSubmitting}>
              <option value="Inchaço/Edema">Inchaço/Edema</option>
              <option value="Eritema menor que 2 cm">Eritema menor que 2 cm</option>
              <option value="Eritema maior que 2 cm">Eritema maior que 2 cm</option>
          </select>
      </div>

      {/* Wound Edge */}
      <div className="space-y-2">
          <Label className="text-xs font-bold uppercase text-muted-foreground ml-1">Bordas da ferida</Label>
          <select name="wound_edge" value={formData.wound_edge} onChange={handleChange} className="flex h-12 w-full rounded-xl border border-border bg-background px-4 py-2 text-sm shadow-sm" disabled={isSubmitting}>
              <option value="Indefinidas, não visíveis claramente">Indefinidas, não visíveis</option>
              <option value="Definidas, contorno claramente visível, aderidas, niveladas com a base da ferida">Definidas, aderidas, niveladas</option>
              <option value="Bem definidas, não aderidas à base da ferida">Bem definidas, não aderidas</option>
              <option value="Bem definidas, não aderidas à base, enrolada, espessada">Bem definidas, não aderidas, enroladas</option>
              <option value="Bem definidas, fibróticas, com crostas e/ou hiperqueratose.">Bem definidas, fibróticas/crostas</option>
          </select>
      </div>

      {/* Fever Toggle */}
      <div className="flex items-center justify-between p-4 bg-muted/20 border border-border rounded-xl">
          <Label className="text-sm font-bold text-foreground">Febre nas últimas 24h?</Label>
          <input 
            type="checkbox" 
            name="fever_24h" 
            checked={formData.fever_24h} 
            onChange={handleChange}
            className="w-5 h-5 accent-primary"
            disabled={isSubmitting}
          />
      </div>

      {/* Notes */}
      <div className="space-y-2">
          <Label className="text-xs font-bold uppercase text-muted-foreground ml-1">Anotações Extras</Label>
          <textarea 
            name="extra_notes" 
            value={formData.extra_notes} 
            onChange={handleChange}
            placeholder="Algum detalhe adicional..."
            className="w-full h-24 rounded-xl border border-border bg-background p-4 text-sm shadow-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
            disabled={isSubmitting}
          />
      </div>

      {/* Specialist only guidelines */}
      {authorRole === 'Pr' && (
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase text-primary ml-1">Orientações passadas ao paciente</Label>
            <textarea 
                name="patient_guidelines" 
                value={formData.patient_guidelines} 
                onChange={handleChange}
                placeholder="O que foi conversado na consulta..."
                className="w-full h-24 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm shadow-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                disabled={isSubmitting}
            />
          </div>
      )}

      <div className="pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-14 flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold text-base rounded-2xl active:scale-[0.98] transition-transform shadow-md disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Salvar Observação
        </button>
      </div>
    </form>
  );
}
