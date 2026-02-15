"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteInterventionInline({
  id,
  label,
}: {
  id: string;
  label: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onDelete = async (e: React.MouseEvent) => {
    e.preventDefault(); // empêche le Link de naviguer
    e.stopPropagation();

    const ok = confirm(
      `Supprimer l’intervention "${label}" ?\n\nToutes les réponses AVANT/APRÈS seront supprimées définitivement.`
    );
    if (!ok) return;

    setLoading(true);

    const res = await fetch(`/api/admin/interventions/${id}`, {
      method: "DELETE",
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.ok) {
      alert(data?.error ?? "Erreur suppression");
      setLoading(false);
      return;
    }

    router.refresh(); // recharge la liste
  };

  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={loading}
      className="rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
      aria-label="Supprimer l’intervention"
      title="Supprimer"
    >
      {loading ? "..." : "🗑️ Supprimer"}
    </button>
  );
}
