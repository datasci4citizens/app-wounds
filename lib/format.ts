// ─── Shared formatting utilities for the Cicatrizando app ───

import type { SmokingStatus, AlcoholConsumption } from './types';

/** Format a YYYY-MM-DD date string to pt-BR locale (dd/mm/aaaa) */
export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return '—';
  return new Date(y, m - 1, d).toLocaleDateString('pt-BR');
}

/** Calculate age from a YYYY-MM-DD birth date */
export function calculateAge(birthDate: string | null): number | null {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  if (isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

/** Format gender code to display label */
export function formatGender(g: string | null): string {
  if (g === 'M') return 'Masc.';
  if (g === 'F') return 'Fem.';
  return '—';
}

/** Format smoking status to pt-BR label */
export function formatSmoking(status: SmokingStatus | null): string {
  switch (status) {
    case 'NEVER': return 'Não tabagista';
    case 'LT10': return '<10 cig/dia';
    case 'GT10': return '>10 cig/dia';
    case 'EX': return 'Ex-tabagista';
    default: return '';
  }
}

/** Format alcohol consumption to pt-BR label */
export function formatAlcohol(status: AlcoholConsumption | AlcoholConsumption[] | null): string {
  if (!status || (Array.isArray(status) && status.length === 0)) return '';
  const maps: Record<string, string> = {
    'NONE': 'Não bebe',
    'EX': 'Ex-etilista',
    'LT21_M': '<21 doses/sem',
    'GT21_M': '>21 doses/sem',
    'LT13_M': '<13 latas/sem',
    'GT13_M': '>13 latas/sem',
    'LT14_F': '<14 doses/sem',
    'GT14_F': '>14 doses/sem',
    'LT9_F': '<9 latas/sem',
    'GT9_F': '>9 latas/sem',
  };
  if (Array.isArray(status)) return status.map(s => maps[s] || s).join(', ');
  return maps[status] || status;
}

/** Format a raw phone number string to (XX) XXXXX-XXXX or (XX) XXXX-XXXX */
export function formatPhone(value: string): string {
  const v = value.replace(/\D/g, '').substring(0, 11);
  if (v.length <= 2) return v;
  if (v.length <= 7) return `(${v.substring(0, 2)}) ${v.substring(2)}`;
  if (v.length === 11) return `(${v.substring(0, 2)}) ${v.substring(2, 7)}-${v.substring(7)}`;
  return `(${v.substring(0, 2)}) ${v.substring(2, 6)}-${v.substring(6)}`;
}
