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
      className="rounded-md border px-4 py-2 text-sm hover:bg-gray-100"
    >
      {loading ? "Déconnexion..." : "🚪 Logout"}
    </button>
  );
}
