// app/login/page.tsx (ou ton chemin actuel)
"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/browser";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

export default function LoginPage() {
  const router = useRouter();
  const sb = supabaseBrowser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => {
    return email.trim().length > 3 && password.length >= 6 && !loading;
  }, [email, password, loading]);

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setErr(null);

    const { error } = await sb.auth.signInWithPassword({ email, password });

    if (error) {
      setLoading(false);
      return setErr("Email ou mot de passe incorrect.");
    }

    router.push("/dashboard/interventions");
    router.refresh();
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--background)]">
      {/* Background glow + subtle dots */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute -top-44 left-1/2 h-[720px] w-[980px] -translate-x-1/2 rounded-full blur-3xl opacity-35"
          style={{
            background:
              "radial-gradient(circle at center, rgba(126,211,33,0.55) 0%, rgba(27,94,32,0.25) 45%, transparent 75%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(17,24,39,0.6) 1px, transparent 1px)",
            backgroundSize: "18px 18px",
          }}
        />
      </div>

      {/* Top bar */}
      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-black/10 bg-white">
            <Image
              src="/brand/logo.png"
              alt="Greff'Up"
              fill
              className="object-contain p-1.5"
              priority
            />
          </div>

          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight">Greff’Up</div>
            <div className="text-xs text-[color:var(--muted)]">Espace équipe</div>
          </div>
        </div>

        <span className="rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs font-medium text-[color:var(--muted)] backdrop-blur">
          Check-up Impact
        </span>
      </header>

      {/* Content */}
      <div className="relative z-10 mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 px-6 pb-16 pt-6 md:grid-cols-2 md:pt-10">
        {/* Left: form */}
        <section>
          <div className="mb-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1 text-xs font-medium text-[color:var(--muted)] backdrop-blur">
              🔒 Accès sécurisé
            </span>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
              Connexion
            </h1>

            <p className="mt-2 text-sm text-[color:var(--muted)]">
              Accès réservé à l’équipe Checkup Impact.
            </p>
          </div>

          <div className="rounded-3xl border border-black/10 bg-white/85 p-7 shadow-[0_24px_70px_rgba(0,0,0,0.10)] backdrop-blur-sm">
            {err && (
              <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {err}
              </div>
            )}

            <form onSubmit={onLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Email</label>
                <input
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[color:var(--greff-400)]"
                  placeholder="nom@domaine.fr"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Mot de passe</label>
                <input
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[color:var(--greff-400)]"
                  placeholder="••••••••"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>

              <button
                disabled={!canSubmit}
                className="group relative mt-2 w-full overflow-hidden rounded-2xl px-4 py-3 font-semibold text-white shadow-md transition disabled:opacity-50"
                style={{
                  background:
                    "linear-gradient(135deg, var(--greff-600) 0%, var(--greff-500) 55%, var(--greff-400) 100%)",
                }}
              >
                <span className="relative z-10">
                  {loading ? "Connexion..." : "Se connecter"}
                </span>

                <span
                  className="absolute inset-0 opacity-0 transition group-hover:opacity-100"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--greff-700) 0%, var(--greff-600) 55%, var(--greff-500) 100%)",
                  }}
                />
              </button>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-[color:var(--muted)]">
                  Besoin d’aide ? Contacte un admin.
                </span>

                <button
                  type="button"
                  className="text-xs font-medium text-[color:var(--greff-600)] hover:underline"
                  onClick={() => setErr("Branche ici le flow “mot de passe oublié”.")}
                >
                  Mot de passe oublié ?
                </button>
              </div>
            </form>
          </div>

          <p className="mt-5 text-xs text-[color:var(--muted)]">
            En continuant, tu acceptes les règles d’accès interne de l’équipe.
          </p>
        </section>

        {/* Right: image (external URL) */}
        <aside className="hidden md:block">
          <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-white/60 shadow-[0_24px_70px_rgba(0,0,0,0.10)] backdrop-blur-sm">
            <div className="absolute inset-0">
              <div
                className="absolute -left-24 -top-24 h-72 w-72 rounded-full blur-3xl opacity-40"
                style={{ background: "rgba(126,211,33,0.45)" }}
              />
              <div
                className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full blur-3xl opacity-35"
                style={{ background: "rgba(27,94,32,0.35)" }}
              />
            </div>

            <div className="relative p-6">
              <div className="mb-3 text-sm font-semibold">
                Suivi. Impact. Communauté.
              </div>
              <div className="mb-6 text-sm text-[color:var(--muted)]">
                Une interface claire pour les équipes — rapide, fiable, et alignée Greff’Up.
              </div>

              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-black/10">
                <Image
                  src={HERO_IMAGE}
                  alt="Illustration / photo"
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 50vw, 100vw"
                  priority={false}
                />
                {/* Overlay brand tint */}
                <div
                  className="absolute inset-0 opacity-25"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(27,94,32,0.55) 0%, rgba(126,211,33,0.10) 60%, transparent 100%)",
                  }}
                />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
