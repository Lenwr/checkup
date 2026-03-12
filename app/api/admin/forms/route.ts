import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";

const FormSchema = z.object({
  name: z.string().min(2, "Nom trop court"),
  slug: z
    .string()
    .min(2, "Slug trop court")
    .max(80, "Slug trop long")
    .regex(/^[a-z0-9-]+$/, "Slug invalide"),
  description: z.string().nullable().optional(),
  kind: z.enum(["avant", "apres", "autre"]),
  is_active: z.boolean(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("FORM CREATE PAYLOAD", body);

    const parsed = FormSchema.safeParse(body);

    if (!parsed.success) {
      console.log("FORM VALIDATION ERROR", parsed.error.flatten());

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

    const { data: existing } = await sb
      .from("forms")
      .select("id")
      .eq("slug", parsed.data.slug)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        {
          ok: false,
          error: "Un formulaire avec ce slug existe déjà",
        },
        { status: 409 }
      );
    }

    const { data: form, error } = await sb
      .from("forms")
      .insert({
        name: parsed.data.name,
        slug: parsed.data.slug,
        description: parsed.data.description ?? null,
        kind: parsed.data.kind,
        is_active: parsed.data.is_active,
      })
      .select("id, name, slug, kind, is_active")
      .single();

    if (error) {
      console.error("FORM INSERT ERROR", error);

      return NextResponse.json(
        {
          ok: false,
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      form,
    });
  } catch (error) {
    console.error("FORM CREATE CRASH", error);

    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Server error",
      },
      { status: 500 }
    );
  }
}