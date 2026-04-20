import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

async function createAccompagnement(formData: FormData) {
  "use server";

  const supabase = await supabaseServer();

  const reference = String(formData.get("reference") ?? "").trim();
  const ageRaw = String(formData.get("age") ?? "").trim();
  const situation = String(formData.get("situation") ?? "").trim();
  const date_premier_contact = String(formData.get("date_premier_contact") ?? "").trim();
  const canal_premier_contact = String(formData.get("canal_premier_contact") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!reference || !situation) {
    throw new Error("La référence et la situation sont obligatoires.");
  }

  const age = ageRaw ? Number(ageRaw) : null;

  const { data, error } = await supabase
    .from("accompagnements")
    .insert({
      reference,
      age,
      situation,
      date_premier_contact: date_premier_contact || null,
      canal_premier_contact: canal_premier_contact || null,
      notes: notes || null,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error("Impossible de créer la fiche accompagnement.");
  }

  redirect(`/dashboard/accompagnements/${data.id}`);
}

export default function NouveauAccompagnementPage() {
  return (
    <main className="mx-auto max-w-3xl">
      {/* Header */}
      <section className="mb-8">
        <Link
          href="/dashboard/accompagnements"
          className="inline-flex items-center text-sm font-medium text-[color:var(--muted)] transition hover:text-[var(--foreground)]"
        >
          ← Retour aux accompagnements
        </Link>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight">
          Nouvel accompagnement
        </h1>

        <p className="mt-2 text-[color:var(--muted)]">
          Crée une nouvelle fiche pour suivre une personne accompagnée.
        </p>
      </section>

      {/* Form */}
      <form
        action={createAccompagnement}
        className="rounded-3xl border border-black/10 bg-white/85 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.08)] backdrop-blur-sm md:p-8"
      >
        <div className="grid gap-6">
          {/* Reference */}
          <div className="space-y-2">
            <label htmlFor="reference" className="text-sm font-medium">
              Référence / nom affiché *
            </label>
            <input
              id="reference"
              name="reference"
              type="text"
              placeholder="Ex: Accompagnement #001"
              required
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[color:var(--greff-400)]"
            />
          </div>

          {/* Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Age */}
            <div className="space-y-2">
              <label htmlFor="age" className="text-sm font-medium">
                Âge
              </label>
              <input
                id="age"
                name="age"
                type="number"
                min={0}
                max={120}
                placeholder="Ex: 34"
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[color:var(--greff-400)]"
              />
            </div>

            {/* Situation */}
            <div className="space-y-2">
              <label htmlFor="situation" className="text-sm font-medium">
                Situation *
              </label>
              <select
                id="situation"
                name="situation"
                required
                defaultValue=""
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[color:var(--greff-400)]"
              >
                <option value="" disabled>
                  Sélectionner une situation
                </option>
                <option value="greffe">Greffe</option>
                <option value="attente_greffe">En attente de greffe</option>
                <option value="proche_parent">Proche / parent</option>
              </select>
            </div>
          </div>

          {/* Date + Canal */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="date_premier_contact" className="text-sm font-medium">
                Date du premier contact
              </label>
              <input
                id="date_premier_contact"
                name="date_premier_contact"
                type="date"
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[color:var(--greff-400)]"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="canal_premier_contact" className="text-sm font-medium">
                Canal du premier contact
              </label>
              <select
                id="canal_premier_contact"
                name="canal_premier_contact"
                defaultValue=""
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[color:var(--greff-400)]"
              >
                <option value="">Sélectionner un canal</option>
                <option value="telephone">Téléphone</option>
                <option value="mail">Mail</option>
                <option value="visio">Visio</option>
                <option value="physique">Physique</option>
                <option value="autre">Autre</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-medium">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={5}
              placeholder="Contexte, remarques, éléments utiles..."
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[color:var(--greff-400)]"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-black/10 pt-6 sm:flex-row sm:justify-end">
          <Link
            href="/dashboard/accompagnements"
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
            Créer la fiche
          </button>
        </div>
      </form>
    </main>
  );
}