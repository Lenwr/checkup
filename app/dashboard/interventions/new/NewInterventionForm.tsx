"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type FormOption = {
  id: string;
  name: string;
  slug: string;
  kind: string;
  is_active: boolean;
};

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

export default function NewInterventionForm({
  avantForms,
  apresForms,
}: {
  avantForms: FormOption[];
  apresForms: FormOption[];
}) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [etablissement, setEtablissement] = useState("");
  const [date, setDate] = useState("");
  const [typePublic, setTypePublic] = useState("");
  const [lieu, setLieu] = useState("");
  const [slug, setSlug] = useState("");

  const [avantFormId, setAvantFormId] = useState(avantForms[0]?.id ?? "");
  const [apresFormId, setApresFormId] = useState(apresForms[0]?.id ?? "");

  const suggestedSlug = useMemo(() => {
    const d = date ? date : "yyyy-mm-dd";
    const base = `${etablissement}-${d}`;
    return slugify(base);
  }, [etablissement, date]);

  const onEtablissementChange = (v: string) => {
    setEtablissement(v);
    if (!slug) setSlug(slugify(`${v}-${date || "yyyy-mm-dd"}`));
  };

  const onDateChange = (v: string) => {
    setDate(v);
    if (!slug || slug.includes("yyyy-mm-dd")) {
      setSlug(slugify(`${etablissement}-${v}`));
    }
  };

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErr(null);

    const payload = {
      slug: (slug || suggestedSlug).trim(),
      date,
      etablissement: etablissement.trim(),
      type_public: typePublic.trim(),
      lieu: lieu.trim(),
      avant_form_id: avantFormId,
      apres_form_id: apresFormId,
    };

    try {
      const res = await fetch("/api/admin/interventions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok) {
        const fieldErrors = data?.details?.fieldErrors ?? {};
        const firstFieldError =
          fieldErrors.slug?.[0] ||
          fieldErrors.date?.[0] ||
          fieldErrors.etablissement?.[0] ||
          fieldErrors.type_public?.[0] ||
          fieldErrors.lieu?.[0] ||
          fieldErrors.avant_form_id?.[0] ||
          fieldErrors.apres_form_id?.[0];

        setErr(firstFieldError ?? data?.error ?? "Erreur serveur");
        setLoading(false);
        return;
      }

      router.push(`/dashboard/interventions/${data.intervention.id}`);
      return;
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erreur réseau");
      setLoading(false);
      return;
    }
  }

  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="text-2xl font-semibold">Nouvelle intervention</h1>

      {err && <div className="mt-4 rounded-md border p-3 text-sm">{err}</div>}

      <form onSubmit={submit} className="mt-6 space-y-4">
        <input
          className="w-full rounded-md border p-2"
          name="etablissement"
          placeholder="Établissement"
          value={etablissement}
          onChange={(e) => onEtablissementChange(e.target.value)}
          required
        />

        <input
          className="w-full rounded-md border p-2"
          name="date"
          type="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          required
        />

        <input
          className="w-full rounded-md border p-2"
          name="type_public"
          placeholder="Type public (lycée, université...)"
          value={typePublic}
          onChange={(e) => setTypePublic(e.target.value)}
          required
        />

        <input
          className="w-full rounded-md border p-2"
          name="lieu"
          placeholder="Lieu"
          value={lieu}
          onChange={(e) => setLieu(e.target.value)}
          required
        />

        <div className="space-y-1">
          <input
            className="w-full rounded-md border p-2"
            name="slug"
            placeholder={`Slug (auto) ex: ${suggestedSlug || "lycee-jaures-2026-02-08"}`}
            value={slug}
            onChange={(e) => setSlug(slugify(e.target.value))}
            required
          />
          <p className="text-xs text-muted-foreground">
            Slug auto suggéré : <span className="font-mono">{suggestedSlug}</span>
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Formulaire AVANT</label>
          <select
            className="w-full rounded-md border p-2"
            value={avantFormId}
            onChange={(e) => setAvantFormId(e.target.value)}
            required
          >
            {avantForms.length === 0 && (
              <option value="">Aucun formulaire AVANT disponible</option>
            )}

            {avantForms.map((form) => (
              <option key={form.id} value={form.id}>
                {form.name} ({form.slug})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Formulaire APRÈS</label>
          <select
            className="w-full rounded-md border p-2"
            value={apresFormId}
            onChange={(e) => setApresFormId(e.target.value)}
            required
          >
            {apresForms.length === 0 && (
              <option value="">Aucun formulaire APRÈS disponible</option>
            )}

            {apresForms.map((form) => (
              <option key={form.id} value={form.id}>
                {form.name} ({form.slug})
              </option>
            ))}
          </select>
        </div>

        <button
          disabled={
            loading ||
            avantForms.length === 0 ||
            apresForms.length === 0
          }
          className="w-full rounded-md border px-4 py-3 font-medium"
          type="submit"
        >
          {loading ? "Création..." : "Créer"}
        </button>
      </form>
    </main>
  );
}