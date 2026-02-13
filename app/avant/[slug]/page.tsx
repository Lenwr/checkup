"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

type FormValues = {
  q1_info_level: string;
  q2_position: string;
  q3_consentement: "Oui" | "Non";
  q4_discussion: "Oui" | "Non";
  q5_reticences: string[];
  q5_autre?: string;
};

const Q5_OPTIONS = [
  "Manque d’information",
  "Peur / appréhension",
  "Raisons religieuses ou culturelles",
  "Manque de discussion avec les proches",
  "Méfiance vis-à-vis du système médical",
  "Sujet trop éloigné de mes préoccupations",
  "Autre",
] as const;

export default function AvantPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { register, handleSubmit, watch, formState } = useForm<FormValues>({
    defaultValues: {
      q5_reticences: [],
      q3_consentement: "Non",
      q4_discussion: "Non",
    },
    mode: "onChange",
  });

  const reticences = watch("q5_reticences");
  const showAutre = useMemo(() => reticences?.includes("Autre"), [reticences]);

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/public/avant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, ...values }),
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
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold">👉 Avant de commencer – votre avis compte</h1>
      <p className="mt-2 text-muted-foreground">Réponses anonymes – moins d’1 minute</p>

      {errorMsg && (
        <div className="mt-4 rounded-md border p-3 text-sm">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-8">
        {/* Q1 */}
        <section className="space-y-3">
          <h2 className="font-medium">1️⃣ Avant aujourd’hui, diriez-vous que vous êtes :</h2>
          {[
            "Très bien informé·e",
            "Plutôt informé·e",
            "Peu informé·e",
            "Pas du tout informé·e",
          ].map((v) => (
            <label key={v} className="flex gap-2">
              <input type="radio" value={v} {...register("q1_info_level", { required: true })} />
              <span>{v}</span>
            </label>
          ))}
        </section>

        {/* Q2 */}
        <section className="space-y-3">
          <h2 className="font-medium">2️⃣ Aujourd’hui, concernant le don d’organes, vous vous situez plutôt :</h2>
          {[
            "Favorable",
            "Plutôt favorable",
            "Indécis·e",
            "Plutôt opposé·e",
            "Opposé·e",
          ].map((v) => (
            <label key={v} className="flex gap-2">
              <input type="radio" value={v} {...register("q2_position", { required: true })} />
              <span>{v}</span>
            </label>
          ))}
        </section>

        {/* Q3 */}
        <section className="space-y-3">
          <h2 className="font-medium">
            3️⃣ Saviez-vous qu’en France, le don d’organes repose sur le principe du consentement présumé ?
          </h2>
          {(["Oui", "Non"] as const).map((v) => (
            <label key={v} className="flex gap-2">
              <input type="radio" value={v} {...register("q3_consentement", { required: true })} />
              <span>{v}</span>
            </label>
          ))}
        </section>

        {/* Q4 */}
        <section className="space-y-3">
          <h2 className="font-medium">4️⃣ As-tu déjà parlé du don d’organes avec tes proches ?</h2>
          {(["Oui", "Non"] as const).map((v) => (
            <label key={v} className="flex gap-2">
              <input type="radio" value={v} {...register("q4_discussion", { required: true })} />
              <span>{v}</span>
            </label>
          ))}
        </section>

        {/* Q5 */}
        <section className="space-y-3">
          <h2 className="font-medium">
            5️⃣ Quelles sont les raisons qui peuvent expliquer des réticences vis-à-vis du don d’organes ?
          </h2>
          <p className="text-sm text-muted-foreground">Plusieurs réponses possibles</p>

          {Q5_OPTIONS.map((v) => (
            <label key={v} className="flex gap-2">
              <input type="checkbox" value={v} {...register("q5_reticences")} />
              <span>{v}</span>
            </label>
          ))}

          {showAutre && (
            <div className="mt-2">
              <label className="block text-sm font-medium">Précise “Autre”</label>
              <input
                className="mt-1 w-full rounded-md border p-2"
                placeholder="Ton texte…"
                {...register("q5_autre")}
              />
            </div>
          )}
        </section>

        <button
          type="submit"
          disabled={loading || !formState.isValid}
          className="w-full rounded-md border px-4 py-3 font-medium"
        >
          {loading ? "Envoi..." : "Valider mes réponses"}
        </button>
      </form>
    </main>
  );
}
