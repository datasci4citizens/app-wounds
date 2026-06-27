import { useSearchParams } from 'next/navigation';

/**
 * Read a numeric search param (e.g. `?id=42`) safely.
 * Returns `null` if the param is missing, empty, or non-numeric.
 */
export function useNumericParam(key: string): number | null {
  const searchParams = useSearchParams();
  const raw = searchParams.get(key);
  if (!raw) return null;
  const num = parseInt(raw, 10);
  return isNaN(num) ? null : num;
}
