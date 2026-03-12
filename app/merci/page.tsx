"use client";import Link from "next/link";


export default function MerciPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--background)]">
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

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-3xl items-center px-6 py-14">
        <section className="w-full">
          <div className="mb-6 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-4 py-1 text-xs font-medium text-[color:var(--muted)] backdrop-blur">
              ✅ Soumission validée
            </span>
          </div>

          <div className="rounded-3xl border border-black/10 bg-white/85 p-8 shadow-[0_24px_70px_rgba(0,0,0,0.10)] backdrop-blur-sm md:p-10">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-black/10 bg-white shadow-sm">
              <span className="text-2xl">🙏</span>
            </div>

            <h1 className="mt-6 text-center text-3xl font-semibold tracking-tight md:text-4xl">
              Merci !
            </h1>

            <p className="mx-auto mt-3 max-w-prose text-center text-sm leading-relaxed text-[color:var(--muted)] md:text-base">
              Tes réponses ont bien été enregistrées. Elles nous aident à suivre
              l’impact et à améliorer l’accompagnement.
            </p>

            <div className="mt-7 rounded-2xl border border-black/10 bg-white/70 p-4 text-sm text-[color:var(--muted)]">
              <div className="flex items-start gap-3">
                <span className="mt-0.5">🟢</span>
                <div>
                  <div className="font-medium text-[color:var(--foreground)]">
                    Réponse bien envoyée
                  </div>
                  <div className="mt-1">
                    Tu peux maintenant fermer cette page. Le formulaire a déjà été transmis.
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <Link
                href="/"
                className="group relative overflow-hidden rounded-2xl px-4 py-3 text-center font-semibold text-white shadow-md transition"
                style={{
                  background:
                    "linear-gradient(135deg, var(--greff-600) 0%, var(--greff-500) 55%, var(--greff-400) 100%)",
                }}
              >
                <span className="relative z-10">Retour à l’accueil</span>
                <span
                  className="absolute inset-0 opacity-0 transition group-hover:opacity-100"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--greff-700) 0%, var(--greff-600) 55%, var(--greff-500) 100%)",
                  }}
                />
              </Link>

              <button
                type="button"
                onClick={() => window.close()}
                className="rounded-2xl border border-black/10 bg-white/80 px-4 py-3 text-center font-semibold text-[color:var(--greff-600)] transition hover:bg-white"
              >
                Fermer la page
              </button>
            </div>

            <p className="mt-6 text-center text-xs text-[color:var(--muted)]">
              Greff’Up • Check-up Impact
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}