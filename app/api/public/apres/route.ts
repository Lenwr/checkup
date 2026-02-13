import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";

const Schema = z.object({
  slug: z.string().min(1),

  q1_apports: z.enum([
    "D’apprendre des choses nouvelles",
    "De mieux comprendre le don d’organes",
    "De faire évoluer mon point de vue",
    "Non",
  ]),

  q2_position: z.enum([
    "Plus favorable qu’avant",
    "Inchangée",
    "Plus réservée qu’avant",
  ]),

  q3_comprehension: z.array(
    z.enum([
      "Du don d’organes",
      "De la greffe",
      "Du rôle des familles",
      "Des idées reçues autour du don",
    ])
  ),

  q4_aisance: z.enum(["Oui", "Peut-être", "Non"]),

  q5_suivre: z.enum(["Oui", "Non"]),

  email: z.string().email().optional().or(z.literal("")).nullable(),
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

    const { data: intervention, error: interventionError } = await sb
      .from("interventions")
      .select("id")
      .eq("slug", parsed.data.slug)
      .single();

    if (interventionError || !intervention) {
      return NextResponse.json(
        { ok: false, error: "Intervention introuvable (slug invalide)" },
        { status: 404 }
      );
    }

    const email =
      parsed.data.q5_suivre === "Oui" && parsed.data.email
        ? parsed.data.email
        : null;

    const { error: insertError } = await sb.from("reponses_apres").insert({
      intervention_id: intervention.id,
      q1_apports: parsed.data.q1_apports,
      q2_position: parsed.data.q2_position,
      q3_comprehension: parsed.data.q3_comprehension,
      q4_aisance: parsed.data.q4_aisance,
      q5_suivre: parsed.data.q5_suivre === "Oui",
      email,
    });

    if (insertError) {
      return NextResponse.json(
        { ok: false, error: "DB insert error", details: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}
