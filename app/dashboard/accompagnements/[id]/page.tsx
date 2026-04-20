import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { supabaseServer } from "@/lib/supabase/server";
import DeleteAccompagnementButton from "./_components/DeleteAccompagnementButton";

type Accompagnement = {
  id: string;
  reference: string;
  age: number | null;
  situation: "greffe" | "attente_greffe" | "proche_parent";
  date_premier_contact: string | null;
  canal_premier_contact: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type RendezVous = {
  id: string;
  date_rendez_vous: string;
  type_echange: "visio" | "telephone" | "physique";
  duree_minutes: number | null;
  theme_principal: string | null;
  notes: string | null;
  slug_feedback: string;
  public_url: string | null;
  created_at: string;
};

type Feedback = {
  id: string;
  rendez_vous_id: string;
  q1_utilite: "Très utile" | "Utile" | "Peu utile" | "Pas utile";
  q2_ressenti: "Rassuré(e)" | "Mieux informé(e)" | "Toujours inquiet(e)" | "Autre";
  q2_autre: string | null;
  q3_prochain_sujet: string | null;
  q4_mieux_accompagne: "Non" | "Un peu" | "Oui" | "Beaucoup";
  q5_poursuivre: "Oui" | "Peut-être" | "Non";
  created_at: string;
};

async function deleteAccompagnement(formData: FormData) {
  "use server";

  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    throw new Error("ID manquant.");
  }

  const supabase = await supabaseServer();

  const { data: rdvs, error: rdvsError } = await supabase
    .from("accompagnement_rendez_vous")
    .select("id")
    .eq("accompagnement_id", id);

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

    const { error: rdvDeleteError } = await supabase
      .from("accompagnement_rendez_vous")
      .delete()
      .eq("accompagnement_id", id);

    if (rdvDeleteError) {
      throw new Error("Impossible de supprimer les rendez-vous.");
    }
  }

  const { error: accompagnementDeleteError } = await supabase
    .from("accompagnements")
    .delete()
    .eq("id", id);

  if (accompagnementDeleteError) {
    throw new Error("Impossible de supprimer l’accompagnement.");
  }

  redirect("/dashboard/accompagnements");
}

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

function formatCanal(value: string | null) {
  if (!value) return "—";

  switch (value) {
    case "telephone":
      return "Téléphone";
    case "mail":
      return "Mail";
    case "visio":
      return "Visio";
    case "physique":
      return "Physique";
    case "autre":
      return "Autre";
    default:
      return value;
  }
}

function formatTypeEchange(value: RendezVous["type_echange"]) {
  switch (value) {
    case "visio":
      return "Visio";
    case "telephone":
      return "Téléphone";
    case "physique":
      return "Physique";
    default:
      return value;
  }
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("fr-FR");
}

function formatDateTime(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function AccompagnementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await supabaseServer();

  const [
    { data: accompagnement, error: accompagnementError },
    { data: rendezVous, error: rendezVousError },
  ] = await Promise.all([
    supabase.from("accompagnements").select("*").eq("id", id).single(),
    supabase
      .from("accompagnement_rendez_vous")
      .select("*")
      .eq("accompagnement_id", id)
      .order("date_rendez_vous", { ascending: false }),
  ]);

  if (accompagnementError || !accompagnement) {
    notFound();
  }

  if (rendezVousError) {
    return (
      <main className="space-y-6">
        <div>
          <Link
            href="/dashboard/accompagnements"
            className="inline-flex items-center text-sm font-medium text-[color:var(--muted)] transition hover:text-[var(--foreground)]"
          >
            ← Retour aux accompagnements
          </Link>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight">
            {accompagnement.reference}
          </h1>
        </div>

        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
          Erreur lors du chargement des rendez-vous.
        </div>
      </main>
    );
  }

  const item = accompagnement as Accompagnement;
  const rdvs = (rendezVous ?? []) as RendezVous[];

  const rdvIds = rdvs.map((rdv) => rdv.id);

  const { data: feedbacksData, error: feedbacksError } =
    rdvIds.length > 0
      ? await supabase
          .from("accompagnement_feedbacks")
          .select("*")
          .in("rendez_vous_id", rdvIds)
          .order("created_at", { ascending: false })
      : { data: [], error: null };

  if (feedbacksError) {
    return (
      <main className="space-y-6">
        <div>
          <Link
            href="/dashboard/accompagnements"
            className="inline-flex items-center text-sm font-medium text-[color:var(--muted)] transition hover:text-[var(--foreground)]"
          >
            ← Retour aux accompagnements
          </Link>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight">
            {item.reference}
          </h1>
        </div>

        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
          Erreur lors du chargement des feedbacks.
        </div>
      </main>
    );
  }

  const feedbacks = (feedbacksData ?? []) as Feedback[];

  const feedbacksByRdv = new Map<string, Feedback[]>();
  for (const feedback of feedbacks) {
    const current = feedbacksByRdv.get(feedback.rendez_vous_id) ?? [];
    current.push(feedback);
    feedbacksByRdv.set(feedback.rendez_vous_id, current);
  }

  const totalFeedbacks = feedbacks.length;

  return (
    <main className="space-y-8">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Link
            href="/dashboard/accompagnements"
            className="inline-flex items-center text-sm font-medium text-[color:var(--muted)] transition hover:text-[var(--foreground)]"
          >
            ← Retour aux accompagnements
          </Link>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight">
              {item.reference}
            </h1>

            <span className="rounded-full border border-black/10 bg-[var(--greff-50)] px-3 py-1 text-xs font-medium text-[var(--greff-700)]">
              {formatSituation(item.situation)}
            </span>
          </div>

          <p className="mt-2 text-[color:var(--muted)]">
            Fiche accompagnement et historique des échanges
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href={`/dashboard/accompagnements/${item.id}/rendez-vous/nouveau`}
            className="inline-flex items-center justify-center rounded-2xl px-5 py-3 font-semibold text-white shadow-md transition"
            style={{
              background:
                "linear-gradient(135deg, var(--greff-600) 0%, var(--greff-500) 55%, var(--greff-400) 100%)",
            }}
          >
            + Ajouter un rendez-vous
          </Link>

          <form action={deleteAccompagnement}>
            <input type="hidden" name="id" value={item.id} />
            <DeleteAccompagnementButton />
          </form>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <InfoCard label="Âge" value={item.age ? String(item.age) : "—"} />
        <InfoCard label="Situation" value={formatSituation(item.situation)} />
        <InfoCard
          label="Premier contact"
          value={formatDate(item.date_premier_contact)}
        />
        <InfoCard
          label="Canal"
          value={formatCanal(item.canal_premier_contact)}
        />
        <InfoCard label="Feedbacks reçus" value={String(totalFeedbacks)} />
      </section>

      <section className="rounded-3xl border border-black/10 bg-white/85 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.08)] backdrop-blur-sm">
        <h2 className="text-lg font-semibold tracking-tight">Notes</h2>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[color:var(--muted)]">
          {item.notes?.trim() || "Aucune note pour le moment."}
        </p>
      </section>

      <section className="rounded-3xl border border-black/10 bg-white/85 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.08)] backdrop-blur-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              Historique des rendez-vous
            </h2>
            <p className="mt-1 text-sm text-[color:var(--muted)]">
              {rdvs.length} rendez-vous enregistré{rdvs.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {rdvs.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-black/10 bg-white/60 p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-black/10 bg-white shadow-sm">
              <span className="text-xl">🗓️</span>
            </div>

            <h3 className="mt-4 text-base font-semibold">
              Aucun rendez-vous pour le moment
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-[color:var(--muted)]">
              Ajoute un premier rendez-vous pour commencer le suivi et générer un futur lien de feedback.
            </p>

            <Link
              href={`/dashboard/accompagnements/${item.id}/rendez-vous/nouveau`}
              className="mt-5 inline-flex items-center justify-center rounded-2xl border border-black/10 bg-white px-5 py-3 font-medium text-[var(--foreground)] transition hover:bg-[var(--greff-50)]"
            >
              Ajouter un rendez-vous
            </Link>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {rdvs.map((rdv) => {
              const rdvFeedbacks = feedbacksByRdv.get(rdv.id) ?? [];

              return (
                <article
                  key={rdv.id}
                  className="rounded-2xl border border-black/10 bg-white p-5 transition hover:border-[var(--greff-300)]"
                >
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-base font-semibold tracking-tight">
                          {rdv.theme_principal?.trim() || "Rendez-vous sans thème précisé"}
                        </h3>

                        <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium text-[color:var(--muted)]">
                          {formatTypeEchange(rdv.type_echange)}
                        </span>
                      </div>

                      <div className="mt-3 grid gap-2 text-sm text-[color:var(--muted)] md:grid-cols-3">
                        <p>
                          <span className="font-medium text-[var(--foreground)]">Date :</span>{" "}
                          {formatDateTime(rdv.date_rendez_vous)}
                        </p>
                        <p>
                          <span className="font-medium text-[var(--foreground)]">Durée :</span>{" "}
                          {rdv.duree_minutes ? `${rdv.duree_minutes} min` : "—"}
                        </p>
                        <p>
                          <span className="font-medium text-[var(--foreground)]">Slug feedback :</span>{" "}
                          {rdv.slug_feedback}
                        </p>
                      </div>

                      {rdv.notes?.trim() ? (
                        <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[color:var(--muted)]">
                          {rdv.notes}
                        </p>
                      ) : null}

                      <div className="mt-5 border-t border-black/10 pt-5">
                        <div className="flex items-center justify-between gap-3">
                          <h4 className="text-sm font-semibold tracking-tight">
                            Feedback reçu
                          </h4>
                          <span className="rounded-full border border-black/10 bg-[var(--greff-50)] px-3 py-1 text-xs font-medium text-[var(--greff-700)]">
                            {rdvFeedbacks.length} réponse{rdvFeedbacks.length > 1 ? "s" : ""}
                          </span>
                        </div>

                        {rdvFeedbacks.length === 0 ? (
                          <div className="mt-3 rounded-2xl border border-dashed border-black/10 bg-[var(--greff-50)] px-4 py-3 text-sm text-[var(--greff-700)]">
                            Aucun feedback reçu pour ce rendez-vous.
                          </div>
                        ) : (
                          <div className="mt-4 space-y-4">
                            {rdvFeedbacks.map((feedback) => (
                              <div
                                key={feedback.id}
                                className="rounded-2xl border border-black/10 bg-[var(--greff-50)]/50 p-4"
                              >
                                <div className="grid gap-3 md:grid-cols-2">
                                  <FeedbackItem
                                    label="Utilité"
                                    value={feedback.q1_utilite}
                                  />
                                  <FeedbackItem
                                    label="Ressenti"
                                    value={
                                      feedback.q2_ressenti === "Autre" && feedback.q2_autre
                                        ? `Autre — ${feedback.q2_autre}`
                                        : feedback.q2_ressenti
                                    }
                                  />
                                  <FeedbackItem
                                    label="Mieux accompagné(e)"
                                    value={feedback.q4_mieux_accompagne}
                                  />
                                  <FeedbackItem
                                    label="Poursuivre l’accompagnement"
                                    value={feedback.q5_poursuivre}
                                  />
                                </div>

                                {feedback.q3_prochain_sujet?.trim() ? (
                                  <div className="mt-4 rounded-xl border border-black/10 bg-white px-4 py-3">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted)]">
                                      Sujet à approfondir
                                    </p>
                                    <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">
                                      {feedback.q3_prochain_sujet}
                                    </p>
                                  </div>
                                ) : null}

                                <p className="mt-3 text-xs text-[color:var(--muted)]">
                                  Reçu le {formatDateTime(feedback.created_at)}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col gap-3 xl:w-[190px]">
                      {rdv.public_url ? (
                        <>
                          <div className="rounded-2xl border border-black/10 bg-white p-3 shadow-sm">
                            <div className="flex justify-center">
                              <QRCodeSVG
                                value={rdv.public_url}
                                size={128}
                                level="M"
                                includeMargin
                              />
                            </div>

                            <p className="mt-3 text-center text-xs text-[color:var(--muted)]">
                              Scanner pour répondre
                            </p>
                          </div>

                          <a
                            href={rdv.public_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--greff-50)]"
                          >
                            Ouvrir le lien public
                          </a>
                        </>
                      ) : (
                        <span className="inline-flex items-center justify-center rounded-2xl border border-black/10 bg-[var(--greff-50)] px-4 py-2 text-sm font-medium text-[var(--greff-700)]">
                          Aucun lien public
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl border border-black/10 bg-white/85 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.08)] backdrop-blur-sm">
      <p className="text-sm text-[color:var(--muted)]">{label}</p>
      <p className="mt-2 text-lg font-semibold tracking-tight">{value}</p>
    </div>
  );
}

function FeedbackItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-black/10 bg-white px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--muted)]">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-[var(--foreground)]">
        {value}
      </p>
    </div>
  );
}