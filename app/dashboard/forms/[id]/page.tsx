import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import AddQuestionForm from "./AddQuestionForm";
import DeleteFormButton from "../DeleteFormButton";

export default async function FormDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sb = supabaseServer();

  const { data: form, error } = await sb
    .from("forms")
    .select(`
      id,
      name,
      slug,
      description,
      kind,
      is_active,
      created_at,
      form_questions (
        id,
        label,
        field_key,
        type,
        required,
        sort_order,
        placeholder,
        help_text,
        min_value,
        max_value,
        step_value,
        allow_other,
        options
      )
    `)
    .eq("id", id)
    .single();

  if (error || !form) {
    return <main className="p-6">Formulaire introuvable</main>;
  }

  const questions = [...(form.form_questions ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order
  );

  return (
    <main className="mx-auto max-w-5xl p-6">
    <div className="flex items-start justify-between gap-4">
  <div>
    <h1 className="text-2xl font-semibold">{form.name}</h1>
    <p className="mt-1 text-sm text-slate-500">
      slug: <span className="font-mono">{form.slug}</span> • type:{" "}
      <span className="uppercase">{form.kind}</span> •{" "}
      {form.is_active ? "Actif" : "Inactif"}
    </p>
    {form.description && (
      <p className="mt-3 text-sm text-slate-600">{form.description}</p>
    )}
  </div>

  <div className="flex items-center gap-3">
    <Link href="/dashboard/forms" className="rounded-md border px-4 py-2">
      ← Retour liste
    </Link>
    <DeleteFormButton id={form.id} name={form.name} variant="detail" />
  </div>
</div>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-medium">Questions existantes</h2>

        {questions.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">Aucune question pour le moment.</p>
        ) : (
          <div className="mt-4 overflow-hidden rounded-xl border">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-600">
                <tr>
                  <th className="px-4 py-3">Ordre</th>
                  <th className="px-4 py-3">Question</th>
                  <th className="px-4 py-3">Field key</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Requis</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((q) => (
                  <tr key={q.id} className="border-t align-top">
                    <td className="px-4 py-3">{q.sort_order}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{q.label}</div>
                      {q.help_text && (
                        <div className="mt-1 text-xs text-slate-500">{q.help_text}</div>
                      )}
                      {Array.isArray(q.options) && q.options.length > 0 && (
                        <div className="mt-2 text-xs text-slate-500">
                          Options :{" "}
                          {q.options
                            .map((opt: { label: string; value: string }) => opt.label)
                            .join(", ")}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-500">{q.field_key}</td>
                    <td className="px-4 py-3 uppercase">{q.type}</td>
                    <td className="px-4 py-3">{q.required ? "Oui" : "Non"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-medium">Ajouter une question</h2>
        <AddQuestionForm formId={form.id} />
      </section>
    </main>
  );
}