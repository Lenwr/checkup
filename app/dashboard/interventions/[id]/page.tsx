import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { percent } from "@/lib/analytics";
import { toQrDataUrl } from "@/lib/supabase/qr";

export default async function DashboardHome() {
  const sb = supabaseServer();

  // 1️⃣ Récupérer interventions
  const { data: interventions } = await sb
    .from("interventions")
    .select("id, slug, etablissement, date, lieu, type_public")
    .order("date", { ascending: false });

  const safeInterventions = interventions ?? [];
  const ids = safeInterventions.map((i) => i.id);

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

  // 4️⃣ Générer les QR codes pour chaque intervention
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const qrEntries = await Promise.all(
    safeInterventions.map(async (it) => {
      const avantUrl = `${baseUrl}/avant/${it.slug}`;
      const apresUrl = `${baseUrl}/apres/${it.slug}`;

      const [qrAvant, qrApres] = await Promise.all([
        toQrDataUrl(avantUrl),
        toQrDataUrl(apresUrl),
      ]);

      return [
        it.id,
        {
          avantUrl,
          apresUrl,
          qrAvant,
          qrApres,
        },
      ] as const;
    })
  );

  const qrMap = Object.fromEntries(qrEntries);

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <h1 className="text-2xl font-semibold">Vue générale</h1>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3">Établissement</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">AVANT</th>
              <th className="px-4 py-3">APRÈS</th>
              <th className="px-4 py-3">Complétion</th>
              <th className="px-4 py-3">QR AVANT</th>
              <th className="px-4 py-3">QR APRÈS</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {safeInterventions.map((it) => {
              const nbAvant = avantMap[it.id] ?? 0;
              const nbApres = apresMap[it.id] ?? 0;
              const completion = percent(nbApres, nbAvant);
              const qr = qrMap[it.id];

              return (
                <tr key={it.id} className="border-t align-top">
                  <td className="px-4 py-3 font-medium">
                    <div>{it.etablissement}</div>
                    <div className="mt-1 text-xs text-slate-500">
                      {it.lieu} • {it.type_public}
                    </div>
                    <div className="mt-1 text-xs text-slate-400 font-mono">
                      {it.slug}
                    </div>
                  </td>

                  <td className="px-4 py-3 text-slate-500">{it.date}</td>

                  <td className="px-4 py-3">{nbAvant}</td>
                  <td className="px-4 py-3">{nbApres}</td>
                  <td className="px-4 py-3">{completion}%</td>

                  <td className="px-4 py-3">
                    {qr && (
                      <div className="flex flex-col gap-2">
                        <a
                          href={qr.avantUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-blue-600 hover:underline break-all"
                        >
                          Ouvrir lien
                        </a>

                        <a
                          href={qr.qrAvant}
                          download={`qr-avant-${it.slug}.png`}
                          className="inline-block"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={qr.qrAvant}
                            alt={`QR AVANT ${it.etablissement}`}
                            className="h-20 w-20 cursor-pointer rounded border"
                          />
                        </a>
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    {qr && (
                      <div className="flex flex-col gap-2">
                        <a
                          href={qr.apresUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-blue-600 hover:underline break-all"
                        >
                          Ouvrir lien
                        </a>

                        <a
                          href={qr.qrApres}
                          download={`qr-apres-${it.slug}.png`}
                          className="inline-block"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={qr.qrApres}
                            alt={`QR APRÈS ${it.etablissement}`}
                            className="h-20 w-20 cursor-pointer rounded border"
                          />
                        </a>
                      </div>
                    )}
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

            {safeInterventions.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-slate-500">
                  Aucune intervention trouvée.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}