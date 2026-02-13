import Image from "next/image";
import Link from "next/link";

export default function BrandHeader({ subtitle }: { subtitle?: string }) {
  return (
    <header className="mx-auto flex w-full max-w-xl items-center justify-between px-6 pt-8">
      <Link href="/" className="flex items-center gap-3">
        <Image
          src="/brand/logo.png"
          alt="Greff’Up"
          width={44}
          height={44}
          priority
        />
        <div className="leading-tight">
          <div className="text-lg font-semibold">Greff’Up</div>
          {subtitle ? (
            <div className="text-xs text-slate-500">{subtitle}</div>
          ) : null}
        </div>
      </Link>

      <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
        Check-up Impact
      </span>
    </header>
  );
}
