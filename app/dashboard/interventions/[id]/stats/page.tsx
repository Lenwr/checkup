import { supabaseServer } from "@/lib/supabase/server";
import { percent, countBy, countMulti, toChartData } from "@/lib/analytics";
import BarChartCard from "./BartChartCard";

// ----------- ORDERS (pour garder l’ordre “questionnaire”) -----------

const ORDER_Q1_AVANT = [
  "Très bien informé·e",
  "Plutôt informé·e",
  "Peu informé·e",
  "Pas du tout informé·e",
];

const ORDER_Q2_AVANT = [
  "Favorable",
  "Plutôt favorable",
  "Indécis·e",
  "Plutôt opposé·e",
  "Opposé·e",
];

const ORDER_Q3_AVANT = ["Oui", "Non"];
const ORDER_Q4_AVANT = ["Oui", "Non"];

const ORDER_Q5_AVANT = [
  "Manque d’information",
  "Peur / appréhension",
  "Raisons religieuses ou culturelles",
  "Manque de discussion avec les proches",
  "Méfiance vis-à-vis du système médical",
  "Sujet trop éloigné de mes préoccupations",
  "Autre",
];

const ORDER_Q1_APRES = [
  "D’apprendre des choses nouvelles",
  "De mieux comprendre le don d’organes",
  "De faire évoluer mon point de vue",
  "Non",
];

const ORDER_Q2_APRES = [
  "Plus favorable qu’avant",
  "Inchangée",
  "Plus réservée qu’avant",
];

const ORDER_Q3_APRES = [
  "Du don d’organes",
  "De la greffe",
  "Du rôle des familles",
  "Des idées reçues autour du don",
];

const ORDER_Q4_APRES = ["Oui", "Peut-être", "Non"];
const ORDER_Q5_APRES = ["Oui", "Non"];

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

  // ✅ AVANT : on prend toutes les questions
  const { data: avant } = await sb
    .from("reponses_avant")
    .select("q1_info_level, q2_position, q3_consentement, q4_discussion, q5_reticences, q5_autre")
    .eq("intervention_id", id);

  // ✅ APRÈS : on prend toutes les questions
  const { data: apres } = await sb
    .from("reponses_apres")
    .select("q1_apports, q2_position, q3_comprehension, q4_aisance, q5_suivre, email")
    .eq("intervention_id", id);

  const nbAvant = avant?.length ?? 0;
  const nbApres = apres?.length ?? 0;

  const completion = percent(nbApres, nbAvant);

  // ✅ Comparaison (MVP demandé)
  const favorablesAvant = (avant ?? []).filter(
    (r) => r.q2_position === "Favorable" || r.q2_position === "Plutôt favorable"
  ).length;
  const pctFavorablesAvant = percent(favorablesAvant, nbAvant);

  const plusFavorablesApres = (apres ?? []).filter(
    (r) => r.q2_position === "Plus favorable qu’avant"
  ).length;
  const pctPlusFavorablesApres = percent(plusFavorablesApres, nbApres);

  const deltaPoints = pctPlusFavorablesApres - pctFavorablesAvant;

  // ----------- COUNTS (1 par question) -----------

  // AVANT
  const q1AvantCounts = countBy(avant ?? [], "q1_info_level");
  const q2AvantCounts = countBy(avant ?? [], "q2_position");
  const q3AvantCounts = countBy(avant ?? [], "q3_consentement");
  const q4AvantCounts = countBy(avant ?? [], "q4_discussion");
  const q5AvantCounts = countMulti(avant ?? [], "q5_reticences");

  // APRÈS
  const q1ApresCounts = countBy(apres ?? [], "q1_apports");
  const q2ApresCounts = countBy(apres ?? [], "q2_position");
  const q3ApresCounts = countMulti(apres ?? [], "q3_comprehension");
  const q4ApresCounts = countBy(apres ?? [], "q4_aisance");
  const q5ApresCounts = countBy(apres ?? [], "q5_suivre");

  // ----------- CHART DATA -----------

  // AVANT
  const q1AvantData = toChartData(q1AvantCounts, ORDER_Q1_AVANT);
  const q2AvantData = toChartData(q2AvantCounts, ORDER_Q2_AVANT);
  const q3AvantData = toChartData(q3AvantCounts, ORDER_Q3_AVANT);
  const q4AvantData = toChartData(q4AvantCounts, ORDER_Q4_AVANT);
  const q5AvantData = toChartData(q5AvantCounts, ORDER_Q5_AVANT);

  // APRÈS
  const q1ApresData = toChartData(q1ApresCounts, ORDER_Q1_APRES);
  const q2ApresData = toChartData(q2ApresCounts, ORDER_Q2_APRES);
  const q3ApresData = toChartData(q3ApresCounts, ORDER_Q3_APRES);
  const q4ApresData = toChartData(q4ApresCounts, ORDER_Q4_APRES);
  const q5ApresData = toChartData(q5ApresCounts, ORDER_Q5_APRES);

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

      {/* KPI */}
      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <Card title="Participants (MVP)" value={nbAvant} />
        <Card title="Réponses AVANT" value={nbAvant} />
        <Card title="Réponses APRÈS" value={nbApres} />
        <Card title="Taux de complétion" value={`${completion}%`} />
      </div>

      {/* Comparaison */}
      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-medium">Comparaison AVANT / APRÈS</h2>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Metric title="% Favorables AVANT" value={`${pctFavorablesAvant}%`} />
          <Metric title="% Plus favorables APRÈS" value={`${pctPlusFavorablesApres}%`} />
          <Metric
            title="Évolution"
            value={`${deltaPoints > 0 ? "+" : ""}${deltaPoints} pts`}
          />
        </div>

        <p className="mt-4 text-sm text-slate-500">
          Calcul MVP : Favorable + Plutôt favorable (AVANT) vs “Plus favorable qu’avant” (APRÈS).
        </p>
      </section>

      {/* ✅ AVANT : 5 graphs */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold">Résultats — AVANT l’intervention</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <BarChartCard title="AVANT — Q1 Niveau d’info" data={q1AvantData} total={nbAvant} />
          <BarChartCard title="AVANT — Q2 Position" data={q2AvantData} total={nbAvant} />
          <BarChartCard title="AVANT — Q3 Consentement présumé" data={q3AvantData} total={nbAvant} />
          <BarChartCard title="AVANT — Q4 Discussion avec proches" data={q4AvantData} total={nbAvant} />
          <BarChartCard title="AVANT — Q5 Réticences (multi)" data={q5AvantData} total={nbAvant} />
        </div>
      </section>

      {/* ✅ APRÈS : 5 graphs */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold">Résultats — APRÈS l’intervention</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <BarChartCard title="APRÈS — Q1 Apports" data={q1ApresData} total={nbApres} />
          <BarChartCard title="APRÈS — Q2 Position après" data={q2ApresData} total={nbApres} />
          <BarChartCard title="APRÈS — Q3 Compréhension (multi)" data={q3ApresData} total={nbApres} />
          <BarChartCard title="APRÈS — Q4 Aisance" data={q4ApresData} total={nbApres} />
          <BarChartCard title="APRÈS — Q5 Suivre Greff’Up" data={q5ApresData} total={nbApres} />
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
