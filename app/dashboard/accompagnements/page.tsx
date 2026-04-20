import Link from "next/link";
import { supabaseServer } from "../../../lib/supabase/server";

type Accompagnement = {
  id: string;
  reference: string;
  age: number | null;
  situation: "greffe" | "attente_greffe" | "proche_parent";
  date_premier_contact: string | null;
  created_at: string;
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

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("fr-FR");
}

export default async function AccompagnementsPage() {
  const supabase = await supabaseServer();

  const { data, error } = await supabase
    .from("accompagnements")
    .select("id, reference, age, situation, date_premier_contact, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Accompagnements</h1>
          <p className="mt-2 text-[color:var(--muted)]">
            Suivi des personnes accompagnées
          </p>
        </div>

        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
          Erreur lors du chargement des accompagnements.
        </div>
      </main>
    );
  }

  const accompagnements = (data ?? []) as Accompagnement[];

  return (
    <main className="space-y-8">
      <section className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Accompagnements</h1>
          <p className="mt-2 text-[color:var(--muted)]">
            Suivi des personnes accompagnées Greff’Up
          </p>
        </div>

        <Link
          href="/dashboard/accompagnements/nouveau"
          className="inline-flex items-center justify-center rounded-2xl px-5 py-3 font-semibold text-white shadow-md transition"
          style={{
            background:
              "linear-gradient(135deg, var(--greff-600) 0%, var(--greff-500) 55%, var(--greff-400) 100%)",
          }}
        >
          + Nouvel accompagnement
        </Link>
      </section>

      {accompagnements.length === 0 ? (
        <section className="rounded-3xl border border-black/10 bg-white/80 p-10 text-center shadow-[0_20px_50px_rgba(0,0,0,0.08)] backdrop-blur-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-black/10 bg-white shadow-sm">
            <span className="text-2xl">🤝</span>
          </div>

          <h2 className="mt-5 text-xl font-semibold tracking-tight">
            Aucun accompagnement pour le moment
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-[color:var(--muted)]">
            Crée une première fiche pour commencer le suivi des personnes accompagnées.
          </p>

          <Link
            href="/dashboard/accompagnements/nouveau"
            className="mt-6 inline-flex items-center justify-center rounded-2xl border border-black/10 bg-white px-5 py-3 font-semibold text-[var(--greff-600)] transition hover:bg-[var(--greff-50)]"
          >
            Créer une fiche
          </Link>
        </section>
      ) : (
        <section className="space-y-4">
          {accompagnements.map((item) => (
            <Link
              key={item.id}
              href={`/dashboard/accompagnements/${item.id}`}
              className="block rounded-3xl border border-black/10 bg-white/85 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.08)] backdrop-blur-sm transition hover:-translate-y-0.5 hover:shadow-[0_24px_70px_rgba(0,0,0,0.10)]"
            >
              <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <h2 className="truncate text-xl font-semibold tracking-tight">
                      {item.reference}
                    </h2>

                    <span className="rounded-full border border-black/10 bg-[var(--greff-50)] px-3 py-1 text-xs font-medium text-[var(--greff-700)]">
                      {formatSituation(item.situation)}
                    </span>
                  </div>

                  <div className="mt-3 grid gap-2 text-sm text-[color:var(--muted)] md:grid-cols-3">
                    <p>
                      <span className="font-medium text-[var(--foreground)]">Âge :</span>{" "}
                      {item.age ?? "—"}
                    </p>
                    <p>
                      <span className="font-medium text-[var(--foreground)]">Premier contact :</span>{" "}
                      {formatDate(item.date_premier_contact)}
                    </p>
                    <p>
                      <span className="font-medium text-[var(--foreground)]">Créé le :</span>{" "}
                      {formatDate(item.created_at)}
                    </p>
                  </div>
                </div>

                <div className="shrink-0">
                  <span className="inline-flex items-center rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-medium text-[var(--foreground)] shadow-sm">
                    Ouvrir la fiche →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </section>
      )}
    </main>
  );
}