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