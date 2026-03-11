import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";

const Schema = z.object({
  slug: z.string().min(3),
  date: z.string().min(10),
  etablissement: z.string().min(2),
  type_public: z.string().min(2),
  lieu: z.string().min(2),
  avant_form_id: z.string().uuid("Formulaire AVANT invalide"),
  apres_form_id: z.string().uuid("Formulaire APRÈS invalide"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = Schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: "Validation error",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const sb = supabaseServer();

    const { data: avantForm, error: avantError } = await sb
      .from("forms")
      .select("id, kind, is_active")
      .eq("id", parsed.data.avant_form_id)
      .single();

    if (avantError || !avantForm || avantForm.kind !== "avant" || !avantForm.is_active) {
      return NextResponse.json(
        { ok: false, error: "Formulaire AVANT introuvable ou invalide" },
        { status: 400 }
      );
    }

    const { data: apresForm, error: apresError } = await sb
      .from("forms")
      .select("id, kind, is_active")
      .eq("id", parsed.data.apres_form_id)
      .single();

    if (apresError || !apresForm || apresForm.kind !== "apres" || !apresForm.is_active) {
      return NextResponse.json(
        { ok: false, error: "Formulaire APRÈS introuvable ou invalide" },
        { status: 400 }
      );
    }

    const { data, error } = await sb
      .from("interventions")
      .insert({
        slug: parsed.data.slug,
        date: parsed.data.date,
        etablissement: parsed.data.etablissement,
        type_public: parsed.data.type_public,
        lieu: parsed.data.lieu,
        avant_form_id: parsed.data.avant_form_id,
        apres_form_id: parsed.data.apres_form_id,
      })
      .select("id, slug, avant_form_id, apres_form_id")
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
      { ok: false, error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}