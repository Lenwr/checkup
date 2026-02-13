import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { z } from "zod";

const ParamsSchema = z.object({
  id: z.string().min(1),
});

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const parsed = ParamsSchema.safeParse({ id });
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid id" }, { status: 400 });
    }

    const sb = supabaseServer();

    const { error } = await sb.from("interventions").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/admin/interventions/[id] crash:", e);
    return NextResponse.json(
      { ok: false, error: (e as Error)?.message ?? "Server error" },
      { status: 500 }
    );
  }
}
