import Image from "next/image";
import Link from "next/link";

export default function BrandHeader({ subtitle }: { subtitle?: string }) {
  return (
    <header className="relative z-10 mx-auto w-full max-w-6xl px-6 pt-8">
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative h-11 w-11 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm transition group-hover:shadow-md">
            <Image
              src="/brand/logo.png"
              alt="Greff’Up"
              fill
              className="object-contain p-2"
              priority
            />
          </div>

          <div className="leading-tight">
            <div className="text-lg font-semibold tracking-tight">Greff’Up</div>
            {subtitle ? (
              <div className="text-xs text-[color:var(--muted)]">{subtitle}</div>
            ) : null}
          </div>
        </Link>

        <span className="hidden sm:inline-flex items-center rounded-full border border-black/10 bg-white/70 px-4 py-1 text-xs font-medium text-[color:var(--muted)] backdrop-blur">
          Check-up Impact
        </span>
      </div>
    </header>
  );
}
