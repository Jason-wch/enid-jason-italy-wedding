/** Normalize a name for case/space-insensitive matching. */
export function normalizeName(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, " ");
}
