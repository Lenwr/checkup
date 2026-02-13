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

  return (
    <main className="mx-auto max-w-5xl p-6">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-semibold">
            {it?.etablissement ?? "Intervention"}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {it?.date} • {it?.lieu} • {it?.type_public}
          </p>
        </div>

        <a className="rounded-md border px-4 py-2" href={`/dashboard/interventions/${id}`}>
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
      <section className="mt-8 rounded-md border p-5">
        <h2 className="text-lg font-medium">Comparaison AVANT / APRÈS</h2>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Metric title="Favorables AVANT" value={`${pctFavorablesAvant}%`} />
          <Metric title="Plus favorables APRÈS" value={`${pctPlusFavorablesApres}%`} />
          <Metric title="Évolution" value={`${deltaPoints > 0 ? "+" : ""}${deltaPoints} pts`} />
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          Calcul MVP : (Favorable + Plutôt favorable) AVANT vs “Plus favorable qu’avant” APRÈS.
        </p>
      </section>

      {/* Graphiques */}
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <BarChartCard title="AVANT — Position sur le don (Q2)" data={q2AvantData} total={nbAvant} />
        <BarChartCard title="AVANT — Niveau d’info (Q1)" data={q1AvantData} total={nbAvant} />
        <BarChartCard title="APRÈS — Position après sensibilisation (Q2)" data={q2ApresData} total={nbApres} />
        <BarChartCard title="APRÈS — Aisance pour en parler (Q4)" data={q4ApresData} total={nbApres} />
      </div>
    </main>
  );
}

function Card({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-md border p-4">
      <div className="text-sm text-muted-foreground">{title}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-md border p-4">
      <div className="text-sm text-muted-foreground">{title}</div>
      <div className="mt-2 text-xl font-semibold">{value}</div>
    </div>
  );
}
