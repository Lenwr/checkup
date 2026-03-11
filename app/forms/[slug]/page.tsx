import { supabaseServer } from "@/lib/supabase/server";
import DynamicForm from "./DynamicForm";

export default async function FormPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { intervention?: string };
}) {
  const sb = supabaseServer();

  const { data: form, error } = await sb
    .from("forms")
    .select(`
      id,
      slug,
      name,
      description,
      is_active,
      form_questions (
        id,
        label,
        field_key,
        type,
        required,
        options,
        sort_order,
        help_text,
        placeholder,
        min_value,
        max_value,
        step_value
      )
    `)
    .eq("slug", params.slug)
    .eq("is_active", true)
    .single();

  if (error || !form) {
    return <main className="p-6">Formulaire introuvable</main>;
  }

  const questions = [...(form.form_questions ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order
  );

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold">{form.name}</h1>

      {form.description && (
        <p className="mt-2 text-muted-foreground">{form.description}</p>
      )}

      <DynamicForm
        formSlug={form.slug}
        interventionSlug={searchParams.intervention ?? null}
        questions={questions}
      />
    </main>
  );
}