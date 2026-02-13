"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/browser";
import BrandHeader from "@/app/dashboard/_components/BrandHeader";

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

    if (error) return setErr(error.message);

    router.push("/dashboard/interventions");
    router.refresh();
  };

  return (
    <main className="min-h-screen">
      <BrandHeader subtitle="Espace équipe" />

      <div className="mx-auto mt-10 max-w-md px-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold">Connexion</h1>
          <p className="mt-1 text-sm text-slate-500">
            Accès réservé à l’équipe Checkup Impact.
          </p>

          {err && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {err}
            </div>
          )}

          <form onSubmit={onLogin} className="mt-6 space-y-3">
            <input
              className="w-full rounded-xl border border-slate-200 bg-white p-3 outline-none focus:border-greff-600"
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              className="w-full rounded-xl border border-slate-200 bg-white p-3 outline-none focus:border-greff-600"
              placeholder="Mot de passe"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              className="w-full rounded-xl bg-greff-600 border-2 px-4 py-3 font-medium text-black hover:bg-greff-700 disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
