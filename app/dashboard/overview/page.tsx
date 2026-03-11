import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { percent } from "@/lib/analytics";
import { toQrDataUrl } from "@/lib/supabase/qr";

type InterventionRow = {
  id: string;
  slug: string;
  etablissement: string;
  date: string;
  lieu: string;
  type_public: string;
  avant_form_id: string | null;
  apres_form_id: string | null;
};

type FormRow = {
  id: string;
  name: string;
  slug: string;
  kind: string;
};

type SubmissionRow = {
  intervention_id: string | null;
  form_id: string;
};

export default async function OverviewPage() {
  const sb = supabaseServer();

  const { data: interventionsData, error: interventionsError } = await sb
    .from("interventions")
    .select(
      "id, slug, etablissement, date, lieu, type_public, avant_form_id, apres_form_id"
    )
    .order("date", { ascending: false });

  if (interventionsError) {
    return <main className="p-6">Erreur chargement interventions</main>;
  }

  const interventions = (interventionsData ?? []) as InterventionRow[];
  const interventionIds = interventions.map((it) => it.id);

  const formIds = Array.from(
    new Set(
      interventions.flatMap((it) =>
        [it.avant_form_id, it.apres_form_id].filter(Boolean) as string[]
      )
    )
  );

  const { data: formsData, error: formsError } =
    formIds.length > 0
      ? await sb
          .from("forms")
          .select("id, name, slug, kind")
          .in("id", formIds)
      : { data: [], error: null };

  if (formsError) {
    return <main className="p-6">Erreur chargement formulaires</main>;
  }

  const forms = (formsData ?? []) as FormRow[];
  const formMap = Object.fromEntries(forms.map((form) => [form.id, form]));

  const { data: submissionsData, error: submissionsError } =
    interventionIds.length > 0
      ? await sb
          .from("form_submissions")
          .select("intervention_id, form_id")
          .in("intervention_id", interventionIds)
      : { data: [], error: null };

  if (submissionsError) {
    return <main className="p-6">Erreur chargement réponses</main>;
  }

  const submissions = (submissionsData ?? []) as SubmissionRow[];

  const countsByIntervention = submissions.reduce(
    (acc, row) => {
      if (!row.intervention_id) return acc;
      if (!acc[row.intervention_id]) {
        acc[row.intervention_id] = { avant: 0, apres: 0 };
      }

      const intervention = interventions.find((it) => it.id === row.intervention_id);
      if (!intervention) return acc;

      if (intervention.avant_form_id && row.form_id === intervention.avant_form_id) {
        acc[row.intervention_id].avant += 1;
      }

      if (intervention.apres_form_id && row.form_id === intervention.apres_form_id) {
        acc[row.intervention_id].apres += 1;
      }

      return acc;
    },
    {} as Record<string, { avant: number; apres: number }>
  );

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const qrEntries = await Promise.all(
    interventions.map(async (it) => {
      const avantForm = it.avant_form_id ? formMap[it.avant_form_id] : null;
      const apresForm = it.apres_form_id ? formMap[it.apres_form_id] : null;

      const avantUrl = avantForm?.slug
        ? `${baseUrl}/forms/${avantForm.slug}?intervention=${it.slug}`
        : null;

      const apresUrl = apresForm?.slug
        ? `${baseUrl}/forms/${apresForm.slug}?intervention=${it.slug}`
        : null;

      const [qrAvant, qrApres] = await Promise.all([
        avantUrl ? toQrDataUrl(avantUrl) : Promise.resolve(null),
        apresUrl ? toQrDataUrl(apresUrl) : Promise.resolve(null),
      ]);

      return [
        it.id,
        {
          avantUrl,
          apresUrl,
          qrAvant,
          qrApres,
          avantForm,
          apresForm,
        },
      ] as const;
    })
  );

  const qrMap = Object.fromEntries(qrEntries);

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Vue générale</h1>

        <Link
          href="/dashboard/interventions"
          className="rounded-md border px-4 py-2"
        >
          Voir interventions
        </Link>
      </div>

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
            {interventions.map((it) => {
              const counts = countsByIntervention[it.id] ?? { avant: 0, apres: 0 };
              const completion = percent(counts.apres, counts.avant);
              const qr = qrMap[it.id];

              return (
                <tr key={it.id} className="border-t align-top">
                  <td className="px-4 py-3 font-medium">
                    <div>{it.etablissement}</div>
                    <div className="mt-1 text-xs text-slate-500">
                      {it.lieu} • {it.type_public}
                    </div>
                    <div className="mt-1 font-mono text-xs text-slate-400">
                      {it.slug}
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-500">
                      <span className="rounded-full border px-2 py-1">
                        AVANT : {qr?.avantForm?.name ?? "—"}
                      </span>
                      <span className="rounded-full border px-2 py-1">
                        APRÈS : {qr?.apresForm?.name ?? "—"}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-slate-500">{it.date}</td>
                  <td className="px-4 py-3">{counts.avant}</td>
                  <td className="px-4 py-3">{counts.apres}</td>
                  <td className="px-4 py-3">{completion}%</td>

                  <td className="px-4 py-3">
                    {qr?.avantUrl && qr?.qrAvant ? (
                      <div className="flex flex-col gap-2">
                        <a
                          href={qr.avantUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="break-all text-xs text-blue-600 hover:underline"
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
                    ) : (
                      <span className="text-xs text-slate-400">Non défini</span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    {qr?.apresUrl && qr?.qrApres ? (
                      <div className="flex flex-col gap-2">
                        <a
                          href={qr.apresUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="break-all text-xs text-blue-600 hover:underline"
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
                    ) : (
                      <span className="text-xs text-slate-400">Non défini</span>
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

            {interventions.length === 0 && (
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