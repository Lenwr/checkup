"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteInterventionButton({
  id,
  variant = "detail",
}: {
  id: string;
  variant?: "detail" | "list";
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onDelete = async () => {
    const confirmDelete = confirm(
      "Supprimer cette intervention ?\n\nToutes les réponses AVANT/APRÈS seront supprimées définitivement."
    );
    if (!confirmDelete) return;

    setLoading(true);
    setErr(null);

    try {
      const res = await fetch(`/api/admin/interventions/${id}`, {
        method: "DELETE",
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok) {
        setErr(data?.error ?? "Erreur suppression");
        setLoading(false);
        return;
      }

      // En liste : refresh la liste
      // En détail : on revient à la liste
      if (variant === "detail") {
        router.push("/dashboard/interventions");
      } else {
        router.refresh();
      }

      router.refresh();
    } catch (e) {
      setErr((e as Error)?.message ?? "Erreur réseau");
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const isDetail = variant === "detail";

  return (
    <div className={isDetail ? "mt-8" : ""}>
      {isDetail && err && (
        <div className="mb-4 rounded-md border p-3 text-sm text-red-500">
          {err}
        </div>
      )}

      <button
        type="button"
        onClick={onDelete}
        disabled={loading}
        className={
          isDetail
            ? "rounded-md border px-4 py-2 text-red-500 hover:bg-red-500/10"
            : "rounded-md border px-3 py-1 text-sm text-red-500 hover:bg-red-500/10"
        }
        title="Supprimer"
      >
        {loading ? "Suppression..." : isDetail ? "🗑 Supprimer l’intervention" : "🗑"}
      </button>
    </div>
  );
}
