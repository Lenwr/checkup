import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";

export default async function InterventionsPage() {
  const sb = supabaseServer();

  const { data } = await sb
    .from("interventions")
    .select("id, slug, date, etablissement, lieu, type_public, created_at")
    .order("created_at", { ascending: false });

  const interventions = data ?? [];

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            Interventions
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Suivi des actions de sensibilisation Greff’Up
          </p>
        </div>

        <Link
          href="/dashboard/interventions/new"
          className="rounded-xl bg-greff-600 px-5 py-3 text-sm font-medium text-black shadow-sm hover:bg-greff-700 transition"
        >
          + Nouvelle intervention
        </Link>
      </div>

      {/* LISTE */}
      <div className="mt-8 grid gap-4">
        {interventions.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-slate-500">
              Aucune intervention enregistrée.
            </p>
          </div>
        )}

        {interventions.map((it) => (
          <Link
            key={it.id}
            href={`/dashboard/interventions/${it.id}`}
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-greff-300 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-lg font-medium group-hover:text-greff-600 transition">
                  {it.etablissement}
                </div>

                <div className="mt-1 text-sm text-slate-500">
                  {it.lieu}
                </div>
              </div>

              <div className="rounded-full bg-greff-50 px-3 py-1 text-xs font-medium text-greff-700">
                {it.type_public}
              </div>
            </div>

            <div className="mt-4 text-sm text-slate-500">
              {it.date} • slug: {it.slug}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
