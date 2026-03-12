import { supabaseServer } from "@/lib/supabase/server";
import { toQrDataUrl } from "@/lib/supabase/qr";
import DeleteInterventionButton from "./DeleteInterventionButton";
import EditFormsInline from "./EditFormsInline";
import Link from "next/link";

type FormRef = {
  id: string;
  name: string;
  slug: string;
  kind: "avant" | "apres" | "autre";
};

function firstForm(value: FormRef | FormRef[] | null | undefined): FormRef | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

export default async function InterventionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const sb = supabaseServer();

  const { data: it, error } = await sb
    .from("interventions")
    .select(`
      id,
      slug,
      date,
      etablissement,
      type_public,
      lieu,
      avant_form:avant_form_id ( id, name, slug, kind ),
      apres_form:apres_form_id ( id, name, slug, kind )
    `)
    .eq("id", id)
    .single();

  if (error || !it) {
    return <main className="p-6">Intervention introuvable</main>;
  }

  const { data: forms } = await sb
    .from("forms")
    .select("id, name, slug, kind")
    .eq("is_active", true)
    .order("name");

  const avantForm = firstForm(it.avant_form as FormRef | FormRef[] | null);
  const apresForm = firstForm(it.apres_form as FormRef | FormRef[] | null);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

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

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-semibold">{it.etablissement}</h1>

      <p className="mt-1 text-muted-foreground">
        {it.date} • {it.lieu} • {it.type_public} • slug: {it.slug}
      </p>

      {/* 🔧 MODIFICATION FORMULAIRES */}
      <div className="mt-6">
        <EditFormsInline
          interventionId={it.id}
          avantFormId={avantForm?.id ?? null}
          apresFormId={apresForm?.id ?? null}
          forms={forms ?? []}
        />
      </div>

      {/* QR CODES */}
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <section className="rounded-md border p-4">
          <h2 className="font-medium">QR — AVANT</h2>

          {avantUrl && qrAvant ? (
            <>
              <p className="mt-1 break-all text-sm text-muted-foreground">
                {avantUrl}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                Formulaire : {avantForm?.name}
              </p>

              <a href={qrAvant} download={`qr-avant-${it.slug}.png`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="mt-4 cursor-pointer" src={qrAvant} alt="QR Avant" />
              </a>
            </>
          ) : (
            <p className="mt-2 text-sm text-slate-500">
              Aucun formulaire AVANT lié.
            </p>
          )}
        </section>

        <section className="rounded-md border p-4">
          <h2 className="font-medium">QR — APRÈS</h2>

          {apresUrl && qrApres ? (
            <>
              <p className="mt-1 break-all text-sm text-muted-foreground">
                {apresUrl}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                Formulaire : {apresForm?.name}
              </p>

              <a href={qrApres} download={`qr-apres-${it.slug}.png`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="mt-4 cursor-pointer" src={qrApres} alt="QR Après" />
              </a>
            </>
          ) : (
            <p className="mt-2 text-sm text-slate-500">
              Aucun formulaire APRÈS lié.
            </p>
          )}
        </section>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={`/dashboard/interventions/${it.id}/stats`}
          className="rounded-md border px-4 py-2"
        >
          📊 Voir stats
        </Link>

        <Link
          href="/dashboard/interventions"
          className="rounded-md border px-4 py-2"
        >
          ← Retour liste
        </Link>
      </div>

      <DeleteInterventionButton id={it.id} variant="detail" />
    </main>
  );
}