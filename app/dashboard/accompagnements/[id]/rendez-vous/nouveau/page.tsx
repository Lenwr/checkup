import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

function randomSuffix(length = 6) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

async function createRendezVous(formData: FormData) {
  "use server";

  const supabase = await supabaseServer();

  const accompagnement_id = String(formData.get("accompagnement_id") ?? "").trim();
  const reference = String(formData.get("reference") ?? "").trim();

  const date_rendez_vous = String(formData.get("date_rendez_vous") ?? "").trim();
  const type_echange = String(formData.get("type_echange") ?? "").trim();
  const dureeRaw = String(formData.get("duree_minutes") ?? "").trim();
  const theme_principal = String(formData.get("theme_principal") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!accompagnement_id || !reference || !date_rendez_vous || !type_echange) {
    throw new Error("Champs obligatoires manquants.");
  }

  const duree_minutes = dureeRaw ? Number(dureeRaw) : null;

  const baseSlug = slugify(`${reference}-${date_rendez_vous}`);
  const slug_feedback = `${baseSlug}-${randomSuffix(6)}`;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  const public_url = baseUrl
    ? `${baseUrl}/feedback/accompagnement/${slug_feedback}`
    : null;

  const { error } = await supabase.from("accompagnement_rendez_vous").insert({
    accompagnement_id,
    date_rendez_vous,
    type_echange,
    duree_minutes,
    theme_principal: theme_principal || null,
    notes: notes || null,
    slug_feedback,
    public_url,
  });

  if (error) {
    throw new Error("Impossible de créer le rendez-vous.");
  }

  redirect(`/dashboard/accompagnements/${accompagnement_id}`);
}

type Accompagnement = {
  id: string;
  reference: string;
  situation: "greffe" | "attente_greffe" | "proche_parent";
};

function formatSituation(value: Accompagnement["situation"]) {
  switch (value) {
    case "greffe":
      return "Greffe";
    case "attente_greffe":
      return "En attente de greffe";
    case "proche_parent":
      return "Proche / parent";
    default:
      return value;
  }
}

export default async function NouveauRendezVousPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await supabaseServer();

  const { data, error } = await supabase
    .from("accompagnements")
    .select("id, reference, situation")
    .eq("id", id)
    .single();

  if (error || !data) {
    notFound();
  }

  const accompagnement = data as Accompagnement;

  return (
    <main className="mx-auto max-w-3xl">
      {/* Header */}
      <section className="mb-8">
        <Link
          href={`/dashboard/accompagnements/${accompagnement.id}`}
          className="inline-flex items-center text-sm font-medium text-[color:var(--muted)] transition hover:text-[var(--foreground)]"
        >
          ← Retour à la fiche
        </Link>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">
            Nouveau rendez-vous
          </h1>

          <span className="rounded-full border border-black/10 bg-[var(--greff-50)] px-3 py-1 text-xs font-medium text-[var(--greff-700)]">
            {formatSituation(accompagnement.situation)}
          </span>
        </div>

        <p className="mt-2 text-[color:var(--muted)]">
          Ajouter un échange pour <span className="font-medium text-[var(--foreground)]">{accompagnement.reference}</span>
        </p>
      </section>

      {/* Form */}
      <form
        action={createRendezVous}
        className="rounded-3xl border border-black/10 bg-white/85 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.08)] backdrop-blur-sm md:p-8"
      >
        <input type="hidden" name="accompagnement_id" value={accompagnement.id} />
        <input type="hidden" name="reference" value={accompagnement.reference} />

        <div className="grid gap-6">
          {/* Date */}
          <div className="space-y-2">
            <label htmlFor="date_rendez_vous" className="text-sm font-medium">
              Date et heure du rendez-vous *
            </label>
            <input
              id="date_rendez_vous"
              name="date_rendez_vous"
              type="datetime-local"
              required
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[color:var(--greff-400)]"
            />
          </div>

          {/* Type + durée */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="type_echange" className="text-sm font-medium">
                Type d’échange *
              </label>
              <select
                id="type_echange"
                name="type_echange"
                required
                defaultValue=""
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[color:var(--greff-400)]"
              >
                <option value="" disabled>
                  Sélectionner un type
                </option>
                <option value="telephone">Téléphone</option>
                <option value="visio">Visio</option>
                <option value="physique">Physique</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="duree_minutes" className="text-sm font-medium">
                Durée (minutes)
              </label>
              <input
                id="duree_minutes"
                name="duree_minutes"
                type="number"
                min={0}
                placeholder="Ex: 45"
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[color:var(--greff-400)]"
              />
            </div>
          </div>

          {/* Theme */}
          <div className="space-y-2">
            <label htmlFor="theme_principal" className="text-sm font-medium">
              Thème principal
            </label>
            <input
              id="theme_principal"
              name="theme_principal"
              type="text"
              placeholder="Ex: compréhension du parcours, échange émotionnel, questions pratiques..."
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[color:var(--greff-400)]"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-medium">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={6}
              placeholder="Résumé du rendez-vous, éléments marquants, prochains points à aborder..."
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[color:var(--greff-400)]"
            />
          </div>
        </div>

        {/* Info block */}
        <div className="mt-8 rounded-2xl border border-black/10 bg-[var(--greff-50)] p-4 text-sm text-[var(--greff-700)]">
          Un lien public de feedback sera généré automatiquement après création du rendez-vous.
        </div>

        {/* Footer */}
        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-black/10 pt-6 sm:flex-row sm:justify-end">
          <Link
            href={`/dashboard/accompagnements/${accompagnement.id}`}
            className="inline-flex items-center justify-center rounded-2xl border border-black/10 bg-white px-5 py-3 font-medium text-[var(--foreground)] transition hover:bg-[var(--greff-50)]"
          >
            Annuler
          </Link>

          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-2xl px-5 py-3 font-semibold text-white shadow-md transition"
            style={{
              background:
                "linear-gradient(135deg, var(--greff-600) 0%, var(--greff-500) 55%, var(--greff-400) 100%)",
            }}
          >
            Créer le rendez-vous
          </button>
        </div>
      </form>
    </main>
  );
}