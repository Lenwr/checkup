import Link from "next/link";
import LogoutButton from "./_components/LogoutButton";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <Link href="/dashboard/interventions" className="text-lg font-semibold">
              Checkup Greff’Up
            </Link>

            <nav className="flex items-center gap-4 text-sm text-muted-foreground">
              <Link href="/dashboard/interventions" className="hover:text-foreground hover:underline">
                Interventions
              </Link>
            </nav>
          </div>

          <LogoutButton />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
