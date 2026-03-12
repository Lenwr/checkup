"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EditFormsInline({
  interventionId,
  avantFormId,
  apresFormId,
  forms,
}: any) {
  const router = useRouter();

  const [avant, setAvant] = useState(avantFormId ?? "");
  const [apres, setApres] = useState(apresFormId ?? "");
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);

    const res = await fetch(`/api/admin/interventions/${interventionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        avant_form_id: avant || null,
        apres_form_id: apres || null,
      }),
    });

    const data = await res.json();

    setLoading(false);

    if (!data.ok) {
      alert(data.error);
      return;
    }

    router.refresh();
  }

  return (
    <div className="rounded-xl border bg-white p-4">
      <h3 className="font-medium">Formulaires liés</h3>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Formulaire AVANT</label>
          <select
            className="mt-1 w-full rounded-md border p-2"
            value={avant}
            onChange={(e) => setAvant(e.target.value)}
          >
            <option value="">Aucun</option>

            {forms
              .filter((f: any) => f.kind === "avant")
              .map((f: any) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Formulaire APRÈS</label>
          <select
            className="mt-1 w-full rounded-md border p-2"
            value={apres}
            onChange={(e) => setApres(e.target.value)}
          >
            <option value="">Aucun</option>

            {forms
              .filter((f: any) => f.kind === "apres")
              .map((f: any) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
          </select>
        </div>
      </div>

      <button
        onClick={save}
        disabled={loading}
        className="mt-4 rounded-md border px-4 py-2"
      >
        {loading ? "Enregistrement..." : "Sauvegarder"}
      </button>
    </div>
  );
}