"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/browser";


export default function LoginPage() {
  const router = useRouter();
  const sb = supabaseBrowser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr(null);

    const { error } = await sb.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (error) {
      setErr(error.message);
      return;
    }

    router.push("/dashboard/interventions");
    router.refresh();
  };

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-semibold">Connexion</h1>

      {err && <div className="mt-4 rounded-md border p-3 text-sm text-red-500">{err}</div>}

      <form onSubmit={onLogin} className="mt-6 space-y-3">
        <input
          className="w-full rounded-md border p-2"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="w-full rounded-md border p-2"
          placeholder="Mot de passe"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="w-full rounded-md border px-4 py-2" disabled={loading}>
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>
    </main>
  );
}
