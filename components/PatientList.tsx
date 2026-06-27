"use client";

import { useState, useMemo } from "react";
import { Users, Search, Activity, Pencil, Bell, Thermometer, Calendar, Ruler, Weight, Wind, Wine, MapPin } from "lucide-react";
import type { Patient, Comorbidity } from "@/lib/types";
import { calculateAge, formatGender, formatSmoking, formatAlcohol } from "@/lib/format";

interface PatientListProps {
  patients: Patient[];
  patientWoundMap: Record<number, { total: number; active: number; healed: number }>;
  patientNewObsMap: Record<number, number>;
  patientHasFever: Record<number, boolean>;
  onViewWounds: (patient: Patient) => void;
  onEdit: (patient: Patient) => void;
}

export function PatientList({
  patients,
  patientWoundMap,
  patientNewObsMap,
  patientHasFever,
  onViewWounds,
  onEdit,
}: PatientListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPatients = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    let list = [...patients].sort((a, b) => {
      const aFever = patientHasFever[a.id] ? 1 : 0;
      const bFever = patientHasFever[b.id] ? 1 : 0;
      if (aFever !== bFever) return bFever - aFever;
      const aNew = patientNewObsMap[a.id] || 0;
      const bNew = patientNewObsMap[b.id] || 0;
      if (aNew !== bNew) return bNew - aNew;
      const aActive = patientWoundMap[a.id]?.active || 0;
      const bActive = patientWoundMap[b.id]?.active || 0;
      if (aActive !== bActive) return bActive - aActive;
      return (a.name || '').localeCompare(b.name || '');
    });

    if (query) {
      list = list.filter((p) => (p.name || '').toLowerCase().includes(query));
    }

    return list;
  }, [patients, patientWoundMap, patientNewObsMap, patientHasFever, searchQuery]);

  const INITIAL_LIMIT = 5;

  return (
    <section className="bg-white dark:bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
      <div className="flex items-center gap-3 p-4 border-b border-border bg-muted/30">
        <Users className="w-5 h-5 text-primary" />
        <h2 className="font-bold text-foreground">Meus Pacientes</h2>
        <span className="ml-auto text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          {patients.length}
        </span>
      </div>

      <div className="px-4 pt-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar paciente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring transition-all"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground">
              Limpar
            </button>
          )}
        </div>
        {searchQuery && (
          <p className="text-[10px] text-muted-foreground mt-2 ml-1">
            {filteredPatients.length} de {patients.length} paciente{patients.length !== 1 ? 's' : ''} encontrado{filteredPatients.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      <div className="p-4">
        {filteredPatients.length > 0 ? (
          <div className={`space-y-3 ${filteredPatients.length > INITIAL_LIMIT && !searchQuery ? 'max-h-[420px] overflow-y-auto no-scrollbar' : ''}`}>
            {filteredPatients.map((p) => (
              <PatientCard
                key={p.id}
                patient={p}
                woundCounts={patientWoundMap[p.id] || { total: 0, active: 0, healed: 0 }}
                newObsCount={patientNewObsMap[p.id] || 0}
                hasFever={patientHasFever[p.id] || false}
                onViewWounds={() => onViewWounds(p)}
                onEdit={() => onEdit(p)}
              />
            ))}
          </div>
        ) : (
          <div className="py-8 text-center space-y-2">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto">
              <Search className="w-6 h-6 text-muted-foreground opacity-50" />
            </div>
            <p className="font-medium text-foreground">
              {searchQuery ? "Nenhum paciente encontrado" : "Nenhum paciente cadastrado"}
            </p>
            <p className="text-xs text-muted-foreground">
              {searchQuery ? "Tente outro termo de busca." : "Comece adicionando seu primeiro paciente."}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function PatientCard({
  patient,
  woundCounts,
  newObsCount,
  hasFever,
  onViewWounds,
  onEdit,
}: {
  patient: Patient;
  woundCounts: { total: number; active: number; healed: number };
  newObsCount: number;
  hasFever: boolean;
  onViewWounds: () => void;
  onEdit: () => void;
}) {
  const age = calculateAge(patient.birth_date);
  const smoking = formatSmoking(patient.smoking_status);
  const alcohol = formatAlcohol(patient.alcohol_consumption);

  const parts: React.ReactNode[] = [];

  if (age !== null) parts.push(<span key="age" className="inline-flex items-center gap-1"><Calendar className="w-3 h-3" /> {age}a</span>);
  if (patient.gender) parts.push(<span key="gender">{formatGender(patient.gender)}</span>);
  if (patient.city || patient.state) parts.push(<span key="loc" className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" /> {patient.city || ''}{patient.state ? ` - ${patient.state}` : ''}</span>);
  if (patient.height != null) parts.push(<span key="h" className="inline-flex items-center gap-1"><Ruler className="w-3 h-3" /> {patient.height}m</span>);
  if (patient.weight != null) parts.push(<span key="w" className="inline-flex items-center gap-1"><Weight className="w-3 h-3" /> {patient.weight}kg</span>);
  if (smoking) parts.push(<span key="smoke" className="inline-flex items-center gap-1"><Wind className="w-3 h-3" /> {smoking}</span>);
  if (alcohol) parts.push(<span key="alc" className="inline-flex items-center gap-1"><Wine className="w-3 h-3" /> {alcohol}</span>);
  if (patient.comorbidities && patient.comorbidities.length > 0) {
    parts.push(<span key="comorb">{patient.comorbidities.map((c: Comorbidity) => c.name).join(', ')}</span>);
  }

  return (
    <div className="border border-border rounded-xl bg-muted/5 overflow-hidden">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <p className="font-bold text-base text-foreground truncate">{patient.name || "Paciente sem nome"}</p>
          {hasFever && (
            <span className="flex-shrink-0 flex items-center gap-1 text-[10px] font-bold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded-md uppercase">
              <Thermometer className="w-2.5 h-2.5" />
              FEBRE
            </span>
          )}
          {newObsCount > 0 && (
            <span className="flex-shrink-0 flex items-center gap-1 text-[10px] font-bold text-status-success bg-status-success/10 px-1.5 py-0.5 rounded-md uppercase animate-in fade-in">
              <Bell className="w-2.5 h-2.5" />
              NOVO REGISTRO
            </span>
          )}
        </div>

        {/* Clinical info — dot-separated, wraps to fill width */}
        {parts.length > 0 && (
          <p className="text-sm text-muted-foreground leading-relaxed mt-2 flex flex-wrap items-center gap-x-1">
            {parts.reduce((acc, part, i) => (
              <>{acc}{i > 0 && <Dot />}{part}</>
            ), null as React.ReactNode)}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 border-t border-border">
        <button onClick={(e) => { e.stopPropagation(); onViewWounds(); }}
          className="flex items-center justify-center gap-2 py-3 text-sm font-medium text-primary hover:bg-primary/5 transition-colors active:bg-primary/10 border-r border-border">
          <Activity className="w-4 h-4" />
          Ver Feridas
        </button>
        <button onClick={(e) => { e.stopPropagation(); onEdit(); }}
          className="flex items-center justify-center gap-2 py-3 text-sm font-medium text-primary hover:bg-primary/5 transition-colors active:bg-primary/10">
          <Pencil className="w-4 h-4" />
          Editar
        </button>
      </div>
    </div>
  );
}

function Dot() {
  return <span className="mx-1 text-muted-foreground/40 select-none">·</span>;
}
