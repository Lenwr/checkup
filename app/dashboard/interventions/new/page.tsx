"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

export default function NewInterventionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // champs contrôlés (pour auto slug)
  const [etablissement, setEtablissement] = useState("");
  const [date, setDate] = useState("");
  const [typePublic, setTypePublic] = useState("");
  const [lieu, setLieu] = useState("");
  const [slug, setSlug] = useState("");

  const suggestedSlug = useMemo(() => {
    const d = date ? date : "yyyy-mm-dd";
    const base = `${etablissement}-${d}`;
    return slugify(base);
  }, [etablissement, date]);

  // si l’utilisateur n’a pas encore touché slug, on le remplit auto
  const onEtablissementChange = (v: string) => {
    setEtablissement(v);
    if (!slug) setSlug(slugify(`${v}-${date || "yyyy-mm-dd"}`));
  };
  const onDateChange = (v: string) => {
    setDate(v);
    if (!slug || slug.includes("yyyy-mm-dd")) setSlug(slugify(`${etablissement}-${v}`));
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErr(null);

    const payload = {
      slug: slug || suggestedSlug,
      date,
      etablissement,
      type_public: typePublic,
      lieu,
    };

    try {
      const res = await fetch("/api/admin/interventions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      setLoading(false);

      if (!res.ok || !data?.ok) {
        setErr(data?.error ?? "Erreur serveur");
        return;
      }

      router.push(`/dashboard/interventions/${data.intervention.id}`);
    } catch (e2) {
      setLoading(false);
      setErr((e2 as Error)?.message ?? "Erreur réseau");
    }
  };

  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="text-2xl font-semibold">Nouvelle intervention</h1>

      {err && (
        <div className="mt-4 rounded-md border p-3 text-sm">
          {err}
        </div>
      )}

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

        <button
          disabled={loading}
          className="w-full rounded-md border px-4 py-3 font-medium"
          type="submit"
        >
          {loading ? "Création..." : "Créer"}
        </button>
      </form>
    </main>
  );
}
