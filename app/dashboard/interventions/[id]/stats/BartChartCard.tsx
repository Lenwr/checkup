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

export default function BarChartCard({
  title,
  data,
  total,
}: {
  title: string;
  data: Datum[];
  total: number;
}) {
  return (
    <section className="rounded-md border p-4">
      <h3 className="font-medium">{title}</h3>

      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" interval={0} tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} />
            <Tooltip
              formatter={(v: any) => {
                const n = Number(v);
                return [`${n} (${pct(n, total)}%)`, "Réponses"];
              }}
              labelFormatter={(label) => `Option: ${label}`}
            />
            <Bar dataKey="value" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        Total: {total}
      </p>
    </section>
  );
}
