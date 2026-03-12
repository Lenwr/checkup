"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function EditInterventionForm({
  intervention,
  forms,
}: any) {
  const router = useRouter();

  const [avantForm, setAvantForm] = useState(
    intervention.avant_form_id ?? ""
  );

  const [apresForm, setApresForm] = useState(
    intervention.apres_form_id ?? ""
  );

  const [loading, setLoading] = useState(false);

  async function submit(e: any) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch(
      `/api/admin/interventions/${intervention.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          avant_form_id: avantForm || null,
          apres_form_id: apresForm || null,
        }),
      }
    );

    const data = await res.json();

    setLoading(false);

    if (!data.ok) {
      alert(data.error);
      return;
    }

    router.push(`/dashboard/interventions/${intervention.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-6">
      {/* FORMULAIRE AVANT */}
      <div className="space-y-2">
        <label className="font-medium">Formulaire AVANT</label>

        <select
          className="w-full rounded-md border p-2"
          value={avantForm}
          onChange={(e) => setAvantForm(e.target.value)}
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

      {/* FORMULAIRE APRES */}
      <div className="space-y-2">
        <label className="font-medium">Formulaire APRÈS</label>

        <select
          className="w-full rounded-md border p-2"
          value={apresForm}
          onChange={(e) => setApresForm(e.target.value)}
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

      <button
        disabled={loading}
        className="w-full rounded-md border px-4 py-3 font-medium"
      >
        {loading ? "Enregistrement..." : "Enregistrer"}
      </button>
    </form>
  );
}