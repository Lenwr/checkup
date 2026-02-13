import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";

const Schema = z.object({
  slug: z.string().min(3),
  date: z.string().min(10), // YYYY-MM-DD
  etablissement: z.string().min(2),
  type_public: z.string().min(2),
  lieu: z.string().min(2),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = Schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Validation error", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const sb = supabaseServer();

    const { data, error } = await sb
      .from("interventions")
      .insert(parsed.data)
      .select("id, slug")
      .single();

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, intervention: data });
  } catch (e) {
    console.error("POST /api/admin/interventions crash:", e);
    return NextResponse.json(
      { ok: false, error: (e as Error)?.message ?? "Server error" },
      { status: 500 }
    );
  }
}
