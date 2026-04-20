"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

type FormValues = {
  q1_apports: string;
  q2_position: string;
  q3_comprehension: string[];
  q4_aisance: string;
  q5_suivre: "Oui" | "Non";
  email?: string;
};

const Q3_OPTIONS = [
  "Du don d’organes",
  "De la greffe",
  "Du rôle des familles",
  "Des idées reçues autour du don",
] as const;

export default function ApresPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const storageKey = `greffup_apres_submitted_${slug}`;

  const { register, handleSubmit, watch, formState } = useForm<FormValues>({
    defaultValues: { q3_comprehension: [], q5_suivre: "Non" },
    mode: "onChange",
  });

  useEffect(() => {
    const alreadySubmitted = sessionStorage.getItem(storageKey);

    if (alreadySubmitted === "true") {
      router.replace("/merci");
    }
  }, [router, storageKey]);

  const suivre = watch("q5_suivre");
  const showEmail = useMemo(() => suivre === "Oui", [suivre]);

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/public/apres", {
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

      sessionStorage.setItem(storageKey, "true");
      router.replace("/merci");
    } catch {
      setErrorMsg("Erreur réseau. Réessaie.");
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold">👉 Et maintenant ?</h1>
      <p className="mt-2 text-muted-foreground">Merci pour votre participation</p>

      {errorMsg && (
        <div className="mt-4 rounded-md border p-3 text-sm">{errorMsg}</div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-8">
        <section className="space-y-3">
          <h2 className="font-medium">
            1️⃣ Cette intervention vous a-t-elle appris de nouvelles choses ?
          </h2>
          {[
            "D’apprendre des choses nouvelles",
            "De mieux comprendre le don d’organes",
            "De faire évoluer mon point de vue",
            "Non",
          ].map((v) => (
            <label key={v} className="flex gap-2">
              <input
                type="radio"
                value={v}
                {...register("q1_apports", { required: true })}
              />
              <span>{v}</span>
            </label>
          ))}
        </section>

        <section className="space-y-3">
          <h2 className="font-medium">
            2️⃣ Après cette sensibilisation, votre position sur le don d’organes est :
          </h2>
          {["Plus favorable qu’avant", "Inchangée", "Plus réservée qu’avant"].map((v) => (
            <label key={v} className="flex gap-2">
              <input
                type="radio"
                value={v}
                {...register("q2_position", { required: true })}
              />
              <span>{v}</span>
            </label>
          ))}
        </section>

        <section className="space-y-3">
          <h2 className="font-medium">3️⃣ Avez-vous une meilleure compréhension :</h2>
          <p className="text-sm text-muted-foreground">Choix multiples possibles</p>

          {Q3_OPTIONS.map((v) => (
            <label key={v} className="flex gap-2">
              <input type="checkbox" value={v} {...register("q3_comprehension")} />
              <span>{v}</span>
            </label>
          ))}
        </section>

        <section className="space-y-3">
          <h2 className="font-medium">
            4️⃣ Pensez-vous être plus à l’aise pour en parler avec vos proches ?
          </h2>
          {["Oui", "Peut-être", "Non"].map((v) => (
            <label key={v} className="flex gap-2">
              <input
                type="radio"
                value={v}
                {...register("q4_aisance", { required: true })}
              />
              <span>{v}</span>
            </label>
          ))}
        </section>

        <section className="space-y-3">
          <h2 className="font-medium">
            5️⃣ Souhaitez-vous en savoir plus ou suivre les actions de Greff’Up ?
          </h2>
          {(["Oui", "Non"] as const).map((v) => (
            <label key={v} className="flex gap-2">
              <input
                type="radio"
                value={v}
                {...register("q5_suivre", { required: true })}
              />
              <span>{v}</span>
            </label>
          ))}

          {showEmail && (
            <div className="mt-2">
              <label className="block text-sm font-medium">
                Email (optionnel) — si vous le souhaitez
              </label>
              <input
                className="mt-1 w-full rounded-md border p-2"
                placeholder="email@exemple.com"
                type="email"
                {...register("email")}
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