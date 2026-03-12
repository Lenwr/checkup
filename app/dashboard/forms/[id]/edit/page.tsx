import { supabaseServer } from "@/lib/supabase/server";
import EditInterventionForm from "./EditInterventionForm";

export default async function EditInterventionPage({
  params,
}: {
  params: { id: string };
}) {
  const sb = supabaseServer();

  const { data: intervention } = await sb
    .from("interventions")
    .select(`
      id,
      slug,
      etablissement,
      date,
      lieu,
      type_public,
      avant_form_id,
      apres_form_id
    `)
    .eq("id", params.id)
    .single();

  const { data: forms } = await sb
    .from("forms")
    .select("id, name, slug, kind")
    .eq("is_active", true)
    .order("name");

  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="text-2xl font-semibold">Modifier intervention</h1>

      <EditInterventionForm
        intervention={intervention}
        forms={forms ?? []}
      />
    </main>
  );
}