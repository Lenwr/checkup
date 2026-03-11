import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import DeleteFormButton from "./DeleteFormButton";

export default async function FormsPage() {
  const sb = supabaseServer();

  const { data: forms, error } = await sb
    .from("forms")
    .select("id, name, slug, kind, is_active, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return <main className="p-6">Erreur chargement formulaires</main>;
  }

  const safeForms = forms ?? [];

  return (
    <main className="mx-auto max-w-6xl p-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Formulaires</h1>

        <Link
          href="/dashboard/forms/new"
          className="rounded-md border px-4 py-2"
        >
          + Nouveau formulaire
        </Link>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {safeForms.map((form) => (
              <tr key={form.id} className="border-t">
                <td className="px-4 py-3 font-medium">{form.name}</td>
                <td className="px-4 py-3 font-mono text-slate-500">
                  {form.slug}
                </td>
                <td className="px-4 py-3 uppercase">{form.kind}</td>
                <td className="px-4 py-3">
                  {form.is_active ? "Actif" : "Inactif"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/dashboard/forms/${form.id}`}
                      className="hover:underline"
                    >
                      Ouvrir →
                    </Link>

                    <DeleteFormButton id={form.id} name={form.name} />
                  </div>
                </td>
              </tr>
            ))}

            {safeForms.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                  Aucun formulaire pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}