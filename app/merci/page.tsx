"use client";

import { useEffect } from "react";
import Image from "next/image";

export default function MerciPage() {
  useEffect(() => {
    history.pushState(null, "", location.href);

    const handlePopState = () => {
      history.pushState(null, "", location.href);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--background)]">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute left-1/2 top-[-180px] h-[560px] w-[900px] -translate-x-1/2 rounded-full blur-3xl opacity-40"
          style={{
            background:
              "radial-gradient(circle at center, rgba(126,211,33,0.22) 0%, rgba(27,94,32,0.12) 45%, transparent 75%)",
          }}
        />

        <div
          className="absolute bottom-[-160px] right-[-120px] h-[420px] w-[420px] rounded-full blur-3xl opacity-30"
          style={{
            background:
              "radial-gradient(circle at center, rgba(126,211,33,0.18) 0%, rgba(27,94,32,0.10) 45%, transparent 75%)",
          }}
        />

        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(17,24,39,0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(17,24,39,0.14) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(255,255,255,0.55)_100%)]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-12">
        <section className="w-full max-w-2xl">
          {/* Logo */}
          <div className="mb-6 flex justify-center">
            <div className="rounded-2xl border border-white/60 bg-white/80 px-4 py-3 shadow-sm backdrop-blur-md">
              <Image
                src="/brand/logo.jpg"
                alt="Greff’Up"
                width={140}
                height={40}
                className="h-20 w-auto object-contain"
                priority
              />
            </div>
          </div>

          {/* Status pill */}
          <div className="mb-5 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              Soumission validée
            </span>
          </div>

          {/* Main card */}
          <div className="relative overflow-hidden rounded-[32px] border border-white/50 bg-white/78 p-8 shadow-[0_20px_80px_rgba(16,24,40,0.12)] backdrop-blur-xl md:p-10">
            <div
              className="absolute inset-x-0 top-0 h-1"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, var(--greff-400) 20%, var(--greff-600) 50%, var(--greff-400) 80%, transparent 100%)",
              }}
            />

            {/* Success Icon */}
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[24px] border border-emerald-100 bg-[linear-gradient(180deg,#ffffff_0%,#f2fff5_100%)] shadow-[0_10px_30px_rgba(16,185,129,0.12)]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-2xl font-bold text-white shadow-sm">
                ✓
              </div>
            </div>

            {/* Title */}
            <h1 className="mt-6 text-center text-3xl font-bold tracking-tight text-[color:var(--foreground)] md:text-5xl">
              Merci pour ta contribution
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-center text-sm leading-7 text-[color:var(--muted)] md:text-base">
              Tes réponses ont bien été enregistrées. Elles nous permettent de
              mieux mesurer l’impact du programme et d’améliorer
              l’accompagnement proposé.
            </p>

            {/* Info cards */}
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-black/10 bg-white/70 p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-lg">
                    🟢
                  </div>
                  <div>
                    <p className="font-semibold text-[color:var(--foreground)]">
                      Réponse bien envoyée
                    </p>
                    <p className="mt-1 text-sm leading-6 text-[color:var(--muted)]">
                      Le formulaire a déjà été transmis avec succès.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-black/10 bg-white/70 p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(126,211,33,0.12)] text-lg">
                    🔒
                  </div>
                  <div>
                    <p className="font-semibold text-[color:var(--foreground)]">
                      Formulaire clôturé
                    </p>
                    <p className="mt-1 text-sm leading-6 text-[color:var(--muted)]">
                      Cette soumission est terminée. Tu peux maintenant fermer
                      cette page.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="my-8 h-px w-full bg-gradient-to-r from-transparent via-black/10 to-transparent" />

            {/* Action */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => window.close()}
                className="inline-flex items-center justify-center rounded-2xl border border-black/10 bg-white px-6 py-3.5 text-sm font-semibold text-[color:var(--foreground)] shadow-sm transition hover:bg-black/[0.02]"
              >
                Fermer la page
              </button>
            </div>

            {/* Footer */}
            <p className="mt-7 text-center text-xs tracking-wide text-[color:var(--muted)]">
              Greff’Up • Check-up Impact
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}