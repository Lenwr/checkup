import { supabaseServer } from "@/lib/supabase/server";
import { toQrDataUrl } from "../../../../lib/supabase/qr";
import DeleteInterventionButton from "./DeleteInterventionButton";
import Link from "next/link";

export default async function InterventionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const sb = supabaseServer();

  const { data: it, error } = await sb
    .from("interventions")
    .select("id, slug, date, etablissement, type_public, lieu")
    .eq("id", id)
    .single();

  if (error || !it) {
    return <main className="p-6">Intervention introuvable</main>;
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const avantUrl = `${baseUrl}/avant/${it.slug}`;
  const apresUrl = `${baseUrl}/apres/${it.slug}`;

  const [qrAvant, qrApres] = await Promise.all([
    toQrDataUrl(avantUrl),
    toQrDataUrl(apresUrl),
  ]);

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-semibold">{it.etablissement}</h1>

      <p className="mt-1 text-muted-foreground">
        {it.date} • {it.lieu} • {it.type_public} • slug: {it.slug}
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <section className="rounded-md border p-4">
          <h2 className="font-medium">QR — AVANT</h2>
          <p className="mt-1 text-sm text-muted-foreground break-all">{avantUrl}</p>

          <a href={qrAvant} download={`qr-avant-${it.slug}.png`} className="inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="mt-4 cursor-pointer" src={qrAvant} alt="QR Avant" />
          </a>
        </section>

        <section className="rounded-md border p-4">
          <h2 className="font-medium">QR — APRÈS</h2>
          <p className="mt-1 text-sm text-muted-foreground break-all">{apresUrl}</p>

          <a href={qrApres} download={`qr-apres-${it.slug}.png`} className="inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="mt-4 cursor-pointer" src={qrApres} alt="QR Après" />
          </a>
        </section>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={`/dashboard/interventions/${it.id}/stats`}
          className="rounded-md border px-4 py-2"
        >
          📊 Voir stats
        </Link>

        <Link href="/dashboard/interventions" className="rounded-md border px-4 py-2">
          ← Retour liste
        </Link>
      </div>

      {/* Suppression (variant détail) */}
      <DeleteInterventionButton id={it.id} variant="detail" />
    </main>
  );
}
