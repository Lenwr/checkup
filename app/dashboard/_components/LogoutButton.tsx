"use client";

import { supabaseBrowser } from "@/lib/supabase/browser";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const logout = async () => {
    setLoading(true);
    const supabase = supabaseBrowser();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <button
      onClick={logout}
      disabled={loading}
      className="
        inline-flex items-center gap-2
        rounded-2xl
        border border-black/10
        bg-white/70
        px-4 py-2
        text-sm font-medium
        text-[color:var(--foreground)]
        shadow-sm
        backdrop-blur
        transition
        hover:bg-white
        disabled:opacity-60
      "
    >
      <span aria-hidden>🚪</span>
      {loading ? "Déconnexion..." : "Logout"}
    </button>
  );
}
