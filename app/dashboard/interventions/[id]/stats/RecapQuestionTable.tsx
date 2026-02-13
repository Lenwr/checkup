import { percent } from "@/lib/analytics";

type Row = { label: string; value: number };

export default function RecapQuestionTable({
  title,
  total,
  rows,
}: {
  title: string;
  total: number;
  rows: Row[];
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-medium">{title}</h3>
        <div className="text-xs text-slate-500">Total: {total}</div>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-2 text-left font-medium">Réponse</th>
              <th className="px-4 py-2 text-right font-medium">Nb</th>
              <th className="px-4 py-2 text-right font-medium">%</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label} className="border-t border-slate-200">
                <td className="px-4 py-2">{r.label}</td>
                <td className="px-4 py-2 text-right tabular-nums">{r.value}</td>
                <td className="px-4 py-2 text-right tabular-nums">
                  {percent(r.value, total)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
