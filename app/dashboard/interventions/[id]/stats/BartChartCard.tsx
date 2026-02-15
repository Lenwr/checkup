"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

type Datum = { label: string; value: number };

function pct(value: number, total: number) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

// A, B, C, ... Z, AA, AB...
function toAlpha(i: number) {
  const A = "A".charCodeAt(0);
  let n = i;
  let s = "";
  do {
    s = String.fromCharCode(A + (n % 26)) + s;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return s;
}

export default function BarChartCard({
  title,
  data,
  total,
}: {
  title: string;
  data: Datum[];
  total: number;
}) {
  // On crée des "codes" courts pour l’axe X
  const coded = data.map((d, i) => ({
    ...d,
    code: toAlpha(i), // A, B, C...
  }));

  // Table triée (optionnel) pour lecture facile
  const sorted = [...coded].sort((a, b) => b.value - a.value);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-medium">{title}</h3>
        <div className="text-xs text-slate-500">Total: {total}</div>
      </div>

      {/* Graph */}
      <div className="mt-4 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={coded}
            margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            {/* ✅ Axe X = code court */}
            <XAxis dataKey="code" interval={0} tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} />
            {/* ✅ Tooltip = texte complet */}
            <Tooltip
              formatter={(v: any, _name: any, payload: any) => {
                const n = Number(v);
                const full = payload?.payload?.label ?? "";
                return [`${n} (${pct(n, total)}%)`, full];
              }}
              labelFormatter={(code) => `Option: ${code}`}
            />
            <Bar dataKey="value" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ✅ Table lisible (code + libellé complet) */}
      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-2 text-left font-medium">Code</th>
              <th className="px-4 py-2 text-left font-medium">Réponse</th>
              <th className="px-4 py-2 text-right font-medium">%</th>
              <th className="px-4 py-2 text-right font-medium">Nb</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr key={r.code} className="border-t border-slate-200">
                <td className="px-4 py-2 font-medium">{r.code}</td>
                <td className="px-4 py-2">{r.label}</td>
                <td className="px-4 py-2 text-right tabular-nums">
                  {pct(r.value, total)}%
                </td>
                <td className="px-4 py-2 text-right tabular-nums">{r.value}</td>
              </tr>
            ))}

            {sorted.length === 0 && (
              <tr className="border-t border-slate-200">
                <td className="px-4 py-3 text-sm text-slate-500" colSpan={4}>
                  Aucune donnée
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
