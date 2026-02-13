import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { percent } from "@/lib/analytics";

export default async function DashboardHome() {
  const sb = supabaseServer();

  // 1️⃣ Récupérer interventions
  const { data: interventions } = await sb
    .from("interventions")
    .select("id, etablissement, date, lieu, type_public")
    .order("date", { ascending: false });

  const ids = (interventions ?? []).map((i) => i.id);

  // 2️⃣ Compter AVANT par intervention
  const { data: avantCounts } = await sb
    .from("reponses_avant")
    .select("intervention_id")
    .in("intervention_id", ids);

  // 3️⃣ Compter APRÈS par intervention
  const { data: apresCounts } = await sb
    .from("reponses_apres")
    .select("intervention_id")
    .in("intervention_id", ids);

  const countByIntervention = (rows: any[]) =>
    rows.reduce((acc: Record<string, number>, row: any) => {
      acc[row.intervention_id] = (acc[row.intervention_id] ?? 0) + 1;
      return acc;
    }, {});

  const avantMap = countByIntervention(avantCounts ?? []);
  const apresMap = countByIntervention(apresCounts ?? []);

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="text-2xl font-semibold">Vue générale</h1>

      {/* TABLEAU */}
      <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3">Établissement</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">AVANT</th>
              <th className="px-4 py-3">APRÈS</th>
              <th className="px-4 py-3">Complétion</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {(interventions ?? []).map((it) => {
              const nbAvant = avantMap[it.id] ?? 0;
              const nbApres = apresMap[it.id] ?? 0;
              const completion = percent(nbApres, nbAvant);

              return (
                <tr key={it.id} className="border-t">
                  <td className="px-4 py-3 font-medium">
                    {it.etablissement}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {it.date}
                  </td>
                  <td className="px-4 py-3">{nbAvant}</td>
                  <td className="px-4 py-3">{nbApres}</td>
                  <td className="px-4 py-3">
                    {completion}%
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/interventions/${it.id}/stats`}
                      className="text-greff-600 hover:underline"
                    >
                      Voir stats →
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}
