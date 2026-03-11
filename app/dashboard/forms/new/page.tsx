"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

export default function NewFormPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [kind, setKind] = useState<"avant" | "apres" | "autre">("avant");
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const suggestedSlug = useMemo(() => slugify(name), [name]);

  const onNameChange = (value: string) => {
    setName(value);
    if (!slug) {
      setSlug(slugify(value));
    }
  };

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErr(null);

    const finalName = name.trim();
    const finalSlug = (slug || suggestedSlug).trim();
    const finalDescription = description.trim() || null;

    if (!finalName) {
      setErr("Le nom est requis");
      setLoading(false);
      return;
    }

    if (!finalSlug) {
      setErr("Le slug est requis");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        name: finalName,
        slug: finalSlug,
        description: finalDescription,
        kind,
        is_active: isActive,
      };

      const res = await fetch("/api/admin/forms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok) {
        console.log("CREATE FORM ERROR FULL", data);
        console.log("CREATE FORM FIELD ERRORS", data?.details?.fieldErrors);

        const fieldErrors = data?.details?.fieldErrors ?? {};

        const firstFieldError =
          fieldErrors.name?.[0] ||
          fieldErrors.slug?.[0] ||
          fieldErrors.description?.[0] ||
          fieldErrors.kind?.[0] ||
          data?.details?.formErrors?.[0];

        setErr(firstFieldError ?? data?.error ?? "Erreur serveur");
        setLoading(false);
        return;
      }

      router.push(`/dashboard/forms/${data.form.id}`);
      return;
    } catch (error) {
      setErr(error instanceof Error ? error.message : "Erreur réseau");
      setLoading(false);
      return;
    }
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold">Nouveau formulaire</h1>

      {err && <div className="mt-4 rounded-md border p-3 text-sm">{err}</div>}

      <form onSubmit={submit} className="mt-6 space-y-5">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Nom</label>
          <input
            className="w-full rounded-md border p-2"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Ex: Questionnaire AVANT lycée"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Slug</label>
          <input
            className="w-full rounded-md border p-2"
            value={slug}
            onChange={(e) => setSlug(slugify(e.target.value))}
            placeholder={suggestedSlug || "questionnaire-avant-lycee"}
            required
          />
          <p className="text-xs text-muted-foreground">
            Slug suggéré : <span className="font-mono">{suggestedSlug}</span>
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Description</label>
          <textarea
            className="w-full rounded-md border p-2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description interne ou publique du formulaire"
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Type de formulaire</label>
          <select
            className="w-full rounded-md border p-2"
            value={kind}
            onChange={(e) =>
              setKind(e.target.value as "avant" | "apres" | "autre")
            }
          >
            <option value="avant">AVANT</option>
            <option value="apres">APRÈS</option>
            <option value="autre">AUTRE</option>
          </select>
        </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          <span>Formulaire actif</span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md border px-4 py-3 font-medium"
        >
          {loading ? "Création..." : "Créer le formulaire"}
        </button>
      </form>
    </main>
  );
}