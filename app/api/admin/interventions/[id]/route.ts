import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { z } from "zod";

const ParamsSchema = z.object({
  id: z.string().min(1),
});

/* ---------------- DELETE ---------------- */

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const parsed = ParamsSchema.safeParse({ id });

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid id" },
        { status: 400 }
      );
    }

    const sb = supabaseServer();

    const { error } = await sb
      .from("interventions")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });

  } catch (e) {
    console.error("DELETE /api/admin/interventions/[id] crash:", e);

    return NextResponse.json(
      {
        ok: false,
        error: (e as Error)?.message ?? "Server error",
      },
      { status: 500 }
    );
  }
}

/* ---------------- PATCH ---------------- */

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const parsed = ParamsSchema.safeParse({ id });

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid id" },
        { status: 400 }
      );
    }

    const body = await req.json();

    const sb = supabaseServer();

    const { error } = await sb
      .from("interventions")
      .update({
        avant_form_id: body.avant_form_id ?? null,
        apres_form_id: body.apres_form_id ?? null,
      })
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });

  } catch (e) {
    console.error("PATCH /api/admin/interventions/[id] crash:", e);

    return NextResponse.json(
      {
        ok: false,
        error: (e as Error)?.message ?? "Server error",
      },
      { status: 500 }
    );
  }
}