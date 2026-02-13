type Row = Record<string, any>;

export function percent(part: number, total: number) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

export function countBy<T extends Row>(rows: T[], key: keyof T) {
  const out: Record<string, number> = {};
  for (const r of rows) {
    const v = String(r[key] ?? "");
    out[v] = (out[v] ?? 0) + 1;
  }
  return out;
}

export function toChartData(counts: Record<string, number>, order: string[]) {
  return order.map((label) => ({ label, value: counts[label] ?? 0 }));
}

// ✅ Pour les champs "choix multiples" stockés en array (text[] / json array)
export function countMulti<T extends Record<string, any>>(rows: T[], key: keyof T) {
  const out: Record<string, number> = {};
  for (const r of rows) {
    const arr = r[key] as unknown;
    if (!Array.isArray(arr)) continue;

    for (const item of arr) {
      const label = String(item ?? "—");
      out[label] = (out[label] ?? 0) + 1;
    }
  }
  return out;
}

export function toRows(
  counts: Record<string, number>,
  order?: string[]
) {
  const keys = order?.length ? order : Object.keys(counts).sort();
  return keys.map((label) => ({ label, value: counts[label] ?? 0 }));
}