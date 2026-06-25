"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, Save, Camera, X, Image as ImageIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Camera as CapacitorCamera, CameraResultType, CameraSource } from "@capacitor/camera";
import { Capacitor } from "@capacitor/core";

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
  image_blob?: Blob | null;
}

interface ObservationFormProps {
  onSubmit: (data: FormData) => void;
  isSubmitting: boolean;
  authorRole: 'Pr' | 'Pa' | null;
  fieldErrors?: Record<string, string[]>;
}

export function ObservationForm({
  onSubmit,
  isSubmitting,
  authorRole,
  fieldErrors = {}
}: ObservationFormProps) {
  const isNative = Capacitor.isNativePlatform();

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
    patient_guidelines: "",
    image_blob: null
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const takePhoto = async () => {
    try {
      const image = await CapacitorCamera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: isNative ? CameraSource.Prompt : CameraSource.Photos,
        promptLabelHeader: "Foto da Ferida",
        promptLabelPhoto: "Escolher da Galeria",
        promptLabelPicture: "Tirar Foto"
      });

      if (image.webPath) {
        setImagePreview(image.webPath);
        
        // Convert to Blob for upload
        const response = await fetch(image.webPath);
        const blob = await response.blob();
        setFormData(prev => ({ ...prev, image_blob: blob }));
      }
    } catch (err) {
      console.error("Camera error:", err);
    }
  };

  const removePhoto = () => {
    setImagePreview(null);
    setFormData(prev => ({ ...prev, image_blob: null }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create FormData for multipart upload
    const data = new FormData();
    data.append("pain_level", formData.pain_level.toString());
    data.append("exudate_amount", formData.exudate_amount);
    data.append("exudate_type", formData.exudate_type);
    data.append("tissue_type", formData.tissue_type);
    data.append("dressing_changes", formData.dressing_changes.toString());
    data.append("periwound_skin", formData.periwound_skin);
    data.append("wound_edge", formData.wound_edge);
    data.append("fever_24h", formData.fever_24h.toString());
    data.append("extra_notes", formData.extra_notes);
    data.append("patient_guidelines", formData.patient_guidelines);
    
    if (formData.image_blob) {
      data.append("image", formData.image_blob, "observation.jpg");
    }

    onSubmit(data);
  };

  const getErrorClass = (field: string) => {
    return fieldErrors?.[field] 
      ? "border-destructive focus-visible:ring-destructive bg-destructive/5" 
      : "border-border";
  };

  const ErrorMsg = ({ field }: { field: string }) => {
    if (!fieldErrors?.[field]) return null;
    return <p className="text-destructive text-xs mt-1 font-medium ml-1">{fieldErrors[field][0]}</p>;
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
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
            className={`w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary ${fieldErrors?.pain_level ? 'ring-2 ring-destructive ring-offset-2' : ''}`}
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
        <ErrorMsg field="pain_level" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Exudate Amount */}
        <div className="space-y-2">
            <Label className="text-xs font-bold uppercase text-muted-foreground ml-1">Qtd. Exsudato</Label>
            <select name="exudate_amount" value={formData.exudate_amount} onChange={handleChange} className={`flex h-12 w-full rounded-xl border bg-background px-4 py-2 text-sm shadow-sm ${getErrorClass('exudate_amount')}`} disabled={isSubmitting}>
                <option value="Nenhum">Nenhum</option>
                <option value="Pouco">Pouco</option>
                <option value="Médio">Médio</option>
                <option value="Muito">Muito</option>
            </select>
            <ErrorMsg field="exudate_amount" />
        </div>

        {/* Exudate Type */}
        <div className="space-y-2">
            <Label className="text-xs font-bold uppercase text-muted-foreground ml-1">Tipo Exsudato</Label>
            <select name="exudate_type" value={formData.exudate_type} onChange={handleChange} className={`flex h-12 w-full rounded-xl border bg-background px-4 py-2 text-sm shadow-sm ${getErrorClass('exudate_type')}`} disabled={isSubmitting}>
                <option value="Seroso">Seroso</option>
                <option value="Purulento">Purulento</option>
                <option value="Sanguinolento">Sanguinolento</option>
                <option value="Serosanguinolento">Serosanguinolento</option>
                <option value="Ausente">Ausente</option>
            </select>
            <ErrorMsg field="exudate_type" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Tissue Type */}
        <div className="space-y-2">
            <Label className="text-xs font-bold uppercase text-muted-foreground ml-1">Tipo Tecido</Label>
            <select name="tissue_type" value={formData.tissue_type} onChange={handleChange} className={`flex h-12 w-full rounded-xl border bg-background px-4 py-2 text-sm shadow-sm ${getErrorClass('tissue_type')}`} disabled={isSubmitting}>
                <option value="Cicatrizado">Cicatrizado</option>
                <option value="Epitelização">Epitelização</option>
                <option value="Granulação">Granulação</option>
                <option value="Desvitalizado">Desvitalizado</option>
                <option value="Necrótico">Necrótico</option>
            </select>
            <ErrorMsg field="tissue_type" />
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
                className={`flex h-12 w-full rounded-xl border bg-background px-4 py-2 text-sm shadow-sm ${getErrorClass('dressing_changes')}`}
                required
                disabled={isSubmitting}
            />
            <ErrorMsg field="dressing_changes" />
        </div>
      </div>

      {/* Periwound Skin */}
      <div className="space-y-2">
          <Label className="text-xs font-bold uppercase text-muted-foreground ml-1">Pele ao redor</Label>
          <select name="periwound_skin" value={formData.periwound_skin} onChange={handleChange} className={`flex h-12 w-full rounded-xl border bg-background px-4 py-2 text-sm shadow-sm ${getErrorClass('periwound_skin')}`} disabled={isSubmitting}>
              <option value="Inchaço/Edema">Inchaço/Edema</option>
              <option value="Eritema menor que 2 cm">Eritema menor que 2 cm</option>
              <option value="Eritema maior que 2 cm">Eritema maior que 2 cm</option>
          </select>
          <ErrorMsg field="periwound_skin" />
      </div>

      {/* Wound Edge */}
      <div className="space-y-2">
          <Label className="text-xs font-bold uppercase text-muted-foreground ml-1">Bordas da ferida</Label>
          <select name="wound_edge" value={formData.wound_edge} onChange={handleChange} className={`flex h-12 w-full rounded-xl border bg-background px-4 py-2 text-sm shadow-sm ${getErrorClass('wound_edge')}`} disabled={isSubmitting}>
              <option value="Indefinidas, não visíveis claramente">Indefinidas, não visíveis</option>
              <option value="Definidas, contorno claramente visível, aderidas, niveladas com a base da ferida">Definidas, aderidas, niveladas</option>
              <option value="Bem definidas, não aderidas à base da ferida">Bem definidas, não aderidas</option>
              <option value="Bem definidas, não aderidas à base, enrolada, espessada">Bem definidas, não aderidas, enroladas</option>
              <option value="Bem definidas, fibróticas, com crostas e/ou hiperqueratose.">Bem definidas, fibróticas/crostas</option>
          </select>
          <ErrorMsg field="wound_edge" />
      </div>

      {/* Fever Toggle */}
      <div className="space-y-2">
        <div className={`flex items-center justify-between p-4 bg-muted/20 border rounded-xl ${fieldErrors?.fever_24h ? 'border-destructive bg-destructive/5' : 'border-border'}`}>
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
        <ErrorMsg field="fever_24h" />
      </div>

      {/* Notes */}
      <div className="space-y-2">
          <Label className="text-xs font-bold uppercase text-muted-foreground ml-1">Anotações Extras</Label>
          <textarea 
            name="extra_notes" 
            value={formData.extra_notes} 
            onChange={handleChange}
            placeholder="Algum detalhe adicional..."
            className={`w-full h-24 rounded-xl border bg-background p-4 text-sm shadow-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 ${getErrorClass('extra_notes')}`}
            disabled={isSubmitting}
          />
          <ErrorMsg field="extra_notes" />
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
                className={`w-full h-24 rounded-xl border bg-primary/5 p-4 text-sm shadow-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 ${fieldErrors?.patient_guidelines ? 'border-destructive bg-destructive/5' : 'border-primary/20'}`}
                disabled={isSubmitting}
            />
            <ErrorMsg field="patient_guidelines" />
          </div>
      )}

      {/* Photo Capture Section */}
      <div className="space-y-3">
          <Label className="text-xs font-bold uppercase text-muted-foreground ml-1">Foto da Ferida</Label>
          
          {imagePreview ? (
              <div className={`relative w-full aspect-square rounded-2xl overflow-hidden border bg-muted group ${fieldErrors?.image ? 'border-destructive ring-2 ring-destructive ring-offset-2' : 'border-border'}`}>
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={removePhoto}
                    className="absolute top-3 right-3 p-2 bg-black/50 text-white rounded-full backdrop-blur-md active:scale-90 transition-transform"
                    disabled={isSubmitting}
                  >
                      <X className="w-5 h-5" />
                  </button>
              </div>
          ) : (
              <button 
                type="button"
                onClick={takePhoto}
                disabled={isSubmitting}
                className={`w-full aspect-square flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed bg-muted/30 text-muted-foreground active:bg-muted transition-colors ${fieldErrors?.image ? 'border-destructive bg-destructive/5 text-destructive' : 'border-border'}`}
              >
                  <div className={`p-4 bg-background rounded-full shadow-sm border ${fieldErrors?.image ? 'border-destructive text-destructive' : 'border-border'}`}>
                    {isNative ? (
                        <Camera className={`w-8 h-8 ${fieldErrors?.image ? 'text-destructive' : 'text-primary'}`} />
                    ) : (
                        <ImageIcon className={`w-8 h-8 ${fieldErrors?.image ? 'text-destructive' : 'text-primary'}`} />
                    )}
                  </div>
                  <span className="text-xs font-bold uppercase tracking-tight">
                    {isNative ? "Capturar Imagem" : "Selecionar Imagem"}
                  </span>
                  <span className="text-[10px] opacity-70">
                    {isNative ? "Câmera ou Galeria" : "Escolher arquivo do computador"}
                  </span>
              </button>
          )}
          <ErrorMsg field="image" />
      </div>

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
