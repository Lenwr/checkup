import { supabaseServer } from "@/lib/supabase/server";
import { percent, countBy, toChartData } from "@/lib/analytics";
import BarChartCard from "./BartChartCard";

const ORDER_Q2_AVANT = [
  "Favorable",
  "Plutôt favorable",
  "Indécis·e",
  "Plutôt opposé·e",
  "Opposé·e",
];

const ORDER_Q1_AVANT = [
  "Très bien informé·e",
  "Plutôt informé·e",
  "Peu informé·e",
  "Pas du tout informé·e",
];

const ORDER_Q2_APRES = [
  "Plus favorable qu’avant",
  "Inchangée",
  "Plus réservée qu’avant",
];

const ORDER_Q4_APRES = ["Oui", "Peut-être", "Non"];

type Row = { label: string; value: number };

function toTableRows(counts: Record<string, number>, order?: string[]): Row[] {
  const labels = order?.length ? order : Object.keys(counts).sort();
  return labels.map((label) => ({ label, value: counts[label] ?? 0 }));
}

function RecapTable({
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
            {rows.length === 0 && (
              <tr className="border-t border-slate-200">
                <td className="px-4 py-3 text-sm text-slate-500" colSpan={3}>
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

export default async function InterventionStatsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const sb = supabaseServer();

  const { data: it } = await sb
    .from("interventions")
    .select("id, slug, date, etablissement, lieu, type_public")
    .eq("id", id)
    .single();

  const { data: avant } = await sb
    .from("reponses_avant")
    .select("q2_position, q1_info_level")
    .eq("intervention_id", id);

  const { data: apres } = await sb
    .from("reponses_apres")
    .select("q2_position, q4_aisance")
    .eq("intervention_id", id);

  const nbAvant = avant?.length ?? 0;
  const nbApres = apres?.length ?? 0;

  const completion = percent(nbApres, nbAvant);

  const favorablesAvant = (avant ?? []).filter(
    (r) => r.q2_position === "Favorable" || r.q2_position === "Plutôt favorable"
  ).length;
  const pctFavorablesAvant = percent(favorablesAvant, nbAvant);

  const plusFavorablesApres = (apres ?? []).filter(
    (r) => r.q2_position === "Plus favorable qu’avant"
  ).length;
  const pctPlusFavorablesApres = percent(plusFavorablesApres, nbApres);

  const deltaPoints = pctPlusFavorablesApres - pctFavorablesAvant;

  // ✅ Distributions pour graphs
  const q2AvantCounts = countBy(avant ?? [], "q2_position");
  const q1AvantCounts = countBy(avant ?? [], "q1_info_level");
  const q2ApresCounts = countBy(apres ?? [], "q2_position");
  const q4ApresCounts = countBy(apres ?? [], "q4_aisance");

  const q2AvantData = toChartData(q2AvantCounts, ORDER_Q2_AVANT);
  const q1AvantData = toChartData(q1AvantCounts, ORDER_Q1_AVANT);
  const q2ApresData = toChartData(q2ApresCounts, ORDER_Q2_APRES);
  const q4ApresData = toChartData(q4ApresCounts, ORDER_Q4_APRES);

  // ✅ Rows pour tables
  const q1AvantRows = toTableRows(q1AvantCounts, ORDER_Q1_AVANT);
  const q2AvantRows = toTableRows(q2AvantCounts, ORDER_Q2_AVANT);
  const q2ApresRows = toTableRows(q2ApresCounts, ORDER_Q2_APRES);
  const q4ApresRows = toTableRows(q4ApresCounts, ORDER_Q4_APRES);

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-semibold">
            {it?.etablissement ?? "Intervention"}
          </h1>
          <p className="mt-1 text-slate-500">
            {it?.date} • {it?.lieu} • {it?.type_public}
          </p>
        </div>

        <a
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm hover:bg-black/5"
          href={`/dashboard/interventions/${id}`}
        >
          ← Retour
        </a>
      </div>

      {/* Cards KPI */}
      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <Card title="Réponses AVANT" value={nbAvant} />
        <Card title="Réponses APRÈS" value={nbApres} />
        <Card title="Taux de complétion" value={`${completion}%`} />
        <Card title="% Favorables AVANT" value={`${pctFavorablesAvant}%`} />
      </div>

      {/* Comparaison */}
      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-medium">Comparaison AVANT / APRÈS</h2>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Metric title="Favorables AVANT" value={`${pctFavorablesAvant}%`} />
          <Metric title="Plus favorables APRÈS" value={`${pctPlusFavorablesApres}%`} />
          <Metric
            title="Évolution"
            value={`${deltaPoints > 0 ? "+" : ""}${deltaPoints} pts`}
          />
        </div>

        <p className="mt-4 text-sm text-slate-500">
          Calcul MVP : Favorable + Plutôt favorable (AVANT) vs “Plus favorable qu’avant” (APRÈS).
        </p>
      </section>

      {/* Graphiques */}
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <BarChartCard
          title="AVANT — Position sur le don (Q2)"
          data={q2AvantData}
          total={nbAvant}
        />
        <BarChartCard
          title="AVANT — Niveau d’info (Q1)"
          data={q1AvantData}
          total={nbAvant}
        />
        <BarChartCard
          title="APRÈS — Position après sensibilisation (Q2)"
          data={q2ApresData}
          total={nbApres}
        />
        <BarChartCard
          title="APRÈS — Aisance pour en parler (Q4)"
          data={q4ApresData}
          total={nbApres}
        />
      </div>

      {/* ✅ RECAP TABLEAUX */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold">Récapitulatif (tableau)</h2>
        <p className="mt-1 text-sm text-slate-500">
          Nombre et pourcentages par réponse — pour une lecture rapide.
        </p>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <RecapTable title="AVANT — Q1 Niveau d’info" total={nbAvant} rows={q1AvantRows} />
          <RecapTable title="AVANT — Q2 Position" total={nbAvant} rows={q2AvantRows} />
          <RecapTable title="APRÈS — Q2 Position" total={nbApres} rows={q2ApresRows} />
          <RecapTable title="APRÈS — Q4 Aisance" total={nbApres} rows={q4ApresRows} />
        </div>
      </section>
    </main>
  );
}

function Card({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="mt-2 text-xl font-semibold">{value}</div>
    </div>
  );
}
