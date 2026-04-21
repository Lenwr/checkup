"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewAccompagnementButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    if (loading) return;
    setLoading(true);
    router.push("/dashboard/accompagnements/nouveau");
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="inline-flex items-center justify-center rounded-2xl px-5 py-3 font-semibold text-white shadow-md transition disabled:cursor-not-allowed disabled:opacity-70"
      style={{
        background:
          "linear-gradient(135deg, var(--greff-600) 0%, var(--greff-500) 55%, var(--greff-400) 100%)",
      }}
    >
      {loading ? "Ouverture..." : "+ Nouvel accompagnement"}
    </button>
  );
}