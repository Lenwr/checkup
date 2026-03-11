"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteFormButton({
  id,
  name,
  variant = "inline",
}: {
  id: string;
  name: string;
  variant?: "inline" | "detail";
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleDelete() {
    const ok = window.confirm(
      `Supprimer le formulaire "${name}" ? Cette action est définitive.`
    );

    if (!ok) return;

    setLoading(true);
    setErr(null);

    try {
      const res = await fetch(`/api/admin/forms/${id}`, {
        method: "DELETE",
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok) {
        setErr(data?.error ?? "Erreur suppression");
        setLoading(false);
        return;
      }

      if (variant === "detail") {
        router.push("/dashboard/forms");
        router.refresh();
        return;
      }

      router.refresh();
    } catch (error) {
      setErr(error instanceof Error ? error.message : "Erreur réseau");
      setLoading(false);
      return;
    }

    setLoading(false);
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        className="rounded-md border px-3 py-2 text-sm"
      >
        {loading ? "Suppression..." : "Supprimer"}
      </button>

      {err && <div className="text-xs text-red-600">{err}</div>}
    </div>
  );
}