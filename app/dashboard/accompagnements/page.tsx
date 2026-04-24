import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import AccompagnementsList from "./_components/AccompagnementsList";
import NewAccompagnementButton from "./_components/NewAccompagnementButton";

type Accompagnement = {
  id: string;
  reference: string;
  age: number | null;
  situation: "greffe" | "attente_greffe" | "proche_parent";
  date_premier_contact: string | null;
  created_at: string;
};

async function deleteSelectedAccompagnements(formData: FormData) {
  "use server";

  const ids = formData
    .getAll("ids")
    .map((value) => String(value).trim())
    .filter(Boolean);

  if (ids.length === 0) return;

  const supabase = await supabaseServer();

  const { data: rdvs, error: rdvsError } = await supabase
    .from("accompagnement_rendez_vous")
    .select("id, accompagnement_id")
    .in("accompagnement_id", ids);

  if (rdvsError) {
    throw new Error("Impossible de récupérer les rendez-vous.");
  }

  const rdvIds = (rdvs ?? []).map((rdv) => rdv.id);

  if (rdvIds.length > 0) {
    const { error: feedbacksError } = await supabase
      .from("accompagnement_feedbacks")
      .delete()
      .in("rendez_vous_id", rdvIds);

    if (feedbacksError) {
      throw new Error("Impossible de supprimer les feedbacks.");
    }

    const { error: rdvsDeleteError } = await supabase
      .from("accompagnement_rendez_vous")
      .delete()
      .in("accompagnement_id", ids);

    if (rdvsDeleteError) {
      throw new Error("Impossible de supprimer les rendez-vous.");
    }
  }

  const { error: accompagnementsDeleteError } = await supabase
    .from("accompagnements")
    .delete()
    .in("id", ids);

  if (accompagnementsDeleteError) {
    throw new Error("Impossible de supprimer les accompagnements.");
  }

  redirect("/dashboard/accompagnements");
}

export default async function AccompagnementsPage() {
  const supabase = await supabaseServer();

  const { data, error } = await supabase
    .from("accompagnements")
    .select("id, reference, age, situation, date_premier_contact, created_at")
    .order("created_at", { ascending: false });

  console.log("ACCOMPAGNEMENTS DATA:", data);
  console.log("ACCOMPAGNEMENTS ERROR:", error);

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
          <h1 className="text-3xl font-semibold tracking-tight">
            Accompagnements
          </h1>
          <p className="mt-2 text-[color:var(--muted)]">
            Suivi des personnes accompagnées Greff’Up
          </p>
        </div>

        <NewAccompagnementButton />
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

          <div className="mt-6 flex justify-center">
            <NewAccompagnementButton />
          </div>
        </section>
      ) : (
        <AccompagnementsList
          accompagnements={accompagnements}
          deleteAction={deleteSelectedAccompagnements}
        />
      )}
    </main>
  );
}