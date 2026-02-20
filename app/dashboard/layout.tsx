import Link from "next/link";
import LogoutButton from "./_components/LogoutButton";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
      {/* Background glow + subtle dots */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute -top-44 left-1/2 h-[720px] w-[980px] -translate-x-1/2 rounded-full blur-3xl opacity-25"
          style={{
            background:
              "radial-gradient(circle at center, rgba(126,211,33,0.40) 0%, rgba(27,94,32,0.20) 45%, transparent 75%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(17,24,39,0.6) 1px, transparent 1px)",
            backgroundSize: "18px 18px",
          }}
        />
      </div>

      <header className="sticky top-0 z-50 border-b border-black/10 bg-white/55 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <Link
              href="/dashboard/interventions"
              className="text-base font-semibold tracking-tight"
            >
              Checkup Impact
            </Link>

            <nav className="flex items-center gap-2">
              <Link
                href="/dashboard/interventions"
                className="rounded-full border border-black/10 bg-white/70 px-3 py-1 text-sm font-medium text-[color:var(--muted)] transition hover:bg-white hover:text-[var(--foreground)]"
              >
                Interventions
              </Link>

              {/* Exemple si tu ajoutes d'autres onglets */}
              {/* <Link
                href="/dashboard/stats"
                className="rounded-full border border-black/10 bg-white/40 px-3 py-1 text-sm font-medium text-[color:var(--muted)] transition hover:bg-white hover:text-[var(--foreground)]"
              >
                Stats
              </Link> */}
            </nav>
          </div>

          <LogoutButton />
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-6 py-8">
        {children}
      </main>
    </div>
  );
}
