import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const sb = supabaseServer();

    const { data: form, error: formError } = await sb
      .from("forms")
      .select("id, name")
      .eq("id", id)
      .single();

    if (formError || !form) {
      return NextResponse.json(
        { ok: false, error: "Formulaire introuvable" },
        { status: 404 }
      );
    }

    const { error } = await sb
      .from("forms")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Server error",
      },
      { status: 500 }
    );
  }
}