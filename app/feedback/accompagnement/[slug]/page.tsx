"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

type FormValues = {
  q1_utilite: "Très utile" | "Utile" | "Peu utile" | "Pas utile";
  q2_ressenti: "Rassuré(e)" | "Mieux informé(e)" | "Toujours inquiet(e)" | "Autre";
  q2_autre?: string;
  q3_prochain_sujet?: string;
  q4_mieux_accompagne: "Non" | "Un peu" | "Oui" | "Beaucoup";
  q5_poursuivre: "Oui" | "Peut-être" | "Non";
};

export default function FeedbackAccompagnementPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { register, handleSubmit, watch, formState } = useForm<FormValues>({
    defaultValues: {
      q1_utilite: "Utile",
      q2_ressenti: "Mieux informé(e)",
      q4_mieux_accompagne: "Oui",
      q5_poursuivre: "Oui",
      q3_prochain_sujet: "",
      q2_autre: "",
    },
    mode: "onChange",
  });

  const q2 = watch("q2_ressenti");
  const showAutre = q2 === "Autre";

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/public/accompagnement-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slug,
          ...values,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data?.ok) {
        setErrorMsg(data?.error ?? "Erreur lors de l’envoi.");
        setLoading(false);
        return;
      }

      router.push("/merci");
    } catch {
      setErrorMsg("Erreur réseau. Réessaie.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--background)]">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute -top-44 left-1/2 h-[720px] w-[980px] -translate-x-1/2 rounded-full blur-3xl opacity-30"
          style={{
            background:
              "radial-gradient(circle at center, rgba(126,211,33,0.45) 0%, rgba(27,94,32,0.20) 45%, transparent 75%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(17,24,39,0.6) 1px, transparent 1px)",
            backgroundSize: "18px 18px",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl px-6 py-10 md:py-14">
        {/* Hero */}
        <div className="mb-8 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-4 py-1 text-xs font-medium text-[color:var(--muted)] backdrop-blur">
            🤝 Retour d’expérience
          </span>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
            Comment s’est passé cet accompagnement ?
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-[color:var(--muted)] md:text-base">
            Ton retour nous aide à améliorer le suivi proposé par Greff’Up.
            Réponses anonymes, en moins d’une minute.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm">
            {errorMsg}
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="rounded-3xl border border-black/10 bg-white/85 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.10)] backdrop-blur-sm md:p-8"
        >
          <div className="space-y-8">
            {/* Q1 */}
            <QuestionBlock index="1" title="Ce rendez-vous t’a semblé :">
              {(["Très utile", "Utile", "Peu utile", "Pas utile"] as const).map((v) => (
                <OptionCard key={v}>
                  <input
                    type="radio"
                    value={v}
                    {...register("q1_utilite", { required: true })}
                    className="mt-1 h-4 w-4 accent-[var(--greff-600)]"
                  />
                  <span>{v}</span>
                </OptionCard>
              ))}
            </QuestionBlock>

            {/* Q2 */}
            <QuestionBlock index="2" title="Après cet échange, tu te sens plutôt :">
              {(["Rassuré(e)", "Mieux informé(e)", "Toujours inquiet(e)", "Autre"] as const).map((v) => (
                <OptionCard key={v}>
                  <input
                    type="radio"
                    value={v}
                    {...register("q2_ressenti", { required: true })}
                    className="mt-1 h-4 w-4 accent-[var(--greff-600)]"
                  />
                  <span>{v}</span>
                </OptionCard>
              ))}

              {showAutre && (
                <div className="mt-3">
                  <label className="mb-2 block text-sm font-medium">
                    Précise “Autre”
                  </label>
                  <input
                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[color:var(--greff-400)]"
                    placeholder="Écris ta réponse..."
                    {...register("q2_autre")}
                  />
                </div>
              )}
            </QuestionBlock>

            {/* Q3 */}
            <QuestionBlock
              index="3"
              title="Y a-t-il un sujet que tu aimerais approfondir lors d’un prochain échange ?"
              hint="Réponse libre"
            >
              <textarea
                rows={5}
                placeholder="Ex: démarches, ressenti émotionnel, organisation, compréhension du parcours..."
                {...register("q3_prochain_sujet")}
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[color:var(--greff-400)]"
              />
            </QuestionBlock>

            {/* Q4 */}
            <QuestionBlock index="4" title="Te sens-tu mieux accompagné(e) après ce rendez-vous ?">
              {(["Non", "Un peu", "Oui", "Beaucoup"] as const).map((v) => (
                <OptionCard key={v}>
                  <input
                    type="radio"
                    value={v}
                    {...register("q4_mieux_accompagne", { required: true })}
                    className="mt-1 h-4 w-4 accent-[var(--greff-600)]"
                  />
                  <span>{v}</span>
                </OptionCard>
              ))}
            </QuestionBlock>

            {/* Q5 */}
            <QuestionBlock index="5" title="Souhaites-tu poursuivre ce type d’accompagnement ?">
              {(["Oui", "Peut-être", "Non"] as const).map((v) => (
                <OptionCard key={v}>
                  <input
                    type="radio"
                    value={v}
                    {...register("q5_poursuivre", { required: true })}
                    className="mt-1 h-4 w-4 accent-[var(--greff-600)]"
                  />
                  <span>{v}</span>
                </OptionCard>
              ))}
            </QuestionBlock>
          </div>

          <div className="mt-10 border-t border-black/10 pt-6">
            <button
              type="submit"
              disabled={loading || !formState.isValid}
              className="group relative w-full overflow-hidden rounded-2xl px-4 py-3 font-semibold text-white shadow-md transition disabled:opacity-50"
              style={{
                background:
                  "linear-gradient(135deg, var(--greff-600) 0%, var(--greff-500) 55%, var(--greff-400) 100%)",
              }}
            >
              <span className="relative z-10">
                {loading ? "Envoi..." : "Envoyer mon retour"}
              </span>
              <span
                className="absolute inset-0 opacity-0 transition group-hover:opacity-100"
                style={{
                  background:
                    "linear-gradient(135deg, var(--greff-700) 0%, var(--greff-600) 55%, var(--greff-500) 100%)",
                }}
              />
            </button>

            <p className="mt-3 text-center text-xs text-[color:var(--muted)]">
              Réponses anonymes • merci pour ton retour
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}

function QuestionBlock({
  index,
  title,
  hint,
  children,
}: {
  index: string;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-2xl border border-black/5 bg-white/60 p-5">
      <div>
        <div className="mb-2 inline-flex items-center rounded-full bg-[var(--greff-50)] px-3 py-1 text-xs font-semibold text-[var(--greff-700)]">
          Question {index}
        </div>
        <h2 className="text-base font-semibold tracking-tight md:text-lg">
          {title}
        </h2>
        {hint ? (
          <p className="mt-1 text-sm text-[color:var(--muted)]">{hint}</p>
        ) : null}
      </div>

      <div className="space-y-3">{children}</div>
    </section>
  );
}

function OptionCard({ children }: { children: React.ReactNode }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm transition hover:border-[var(--greff-300)] hover:bg-[var(--greff-50)]">
      {children}
    </label>
  );
}