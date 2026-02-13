import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";

export default async function InterventionsPage() {
  const sb = supabaseServer();
  const { data } = await sb
    .from("interventions")
    .select("id, slug, date, etablissement, lieu, type_public, created_at")
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-4xl p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Interventions</h1>
        <Link className="rounded-md border px-4 py-2" href="/dashboard/interventions/new">
          + Nouvelle intervention
        </Link>
      </div>

      <div className="mt-6 space-y-3">
        {(data ?? []).map((it) => (
          <Link
            key={it.id}
            href={`/dashboard/interventions/${it.id}`}
            className="block rounded-md border p-4 hover:bg-black/5"
          >
            <div className="font-medium">{it.etablissement} — {it.lieu}</div>
            <div className="text-sm text-muted-foreground">
              {it.date} • {it.type_public} • slug: {it.slug}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
