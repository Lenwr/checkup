import { supabaseServer } from "@/lib/supabase/server";
import NewInterventionForm from "./NewInterventionForm";

export default async function NewInterventionPage() {
  const sb = supabaseServer();

  const { data: forms, error } = await sb
    .from("forms")
    .select("id, name, slug, kind, is_active")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) {
    return <main className="p-6">Erreur chargement formulaires</main>;
  }

  const avantForms = (forms ?? []).filter((form) => form.kind === "avant");
  const apresForms = (forms ?? []).filter((form) => form.kind === "apres");

  return (
    <NewInterventionForm
      avantForms={avantForms}
      apresForms={apresForms}
    />
  );
}