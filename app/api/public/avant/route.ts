import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";

const Schema = z.object({
  slug: z.string().min(1),
  q1_info_level: z.enum([
    "Très bien informé·e",
    "Plutôt informé·e",
    "Peu informé·e",
    "Pas du tout informé·e",
  ]),
  q2_position: z.enum([
    "Favorable",
    "Plutôt favorable",
    "Indécis·e",
    "Plutôt opposé·e",
    "Opposé·e",
  ]),
  q3_consentement: z.enum(["Oui", "Non"]),
  q4_discussion: z.enum(["Oui", "Non"]),
  q5_reticences: z.array(
    z.enum([
      "Manque d’information",
      "Peur / appréhension",
      "Raisons religieuses ou culturelles",
      "Manque de discussion avec les proches",
      "Méfiance vis-à-vis du système médical",
      "Sujet trop éloigné de mes préoccupations",
      "Autre",
    ])
  ),
  q5_autre: z.string().optional().nullable(),
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

    // 1) retrouver l’intervention via le slug
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

    // 2) insert réponse AVANT
    const { error: insertError } = await sb.from("reponses_avant").insert({
      intervention_id: intervention.id,
      q1_info_level: parsed.data.q1_info_level,
      q2_position: parsed.data.q2_position,
      q3_consentement: parsed.data.q3_consentement === "Oui",
      q4_discussion: parsed.data.q4_discussion === "Oui",
      q5_reticences: parsed.data.q5_reticences,
      q5_autre:
        parsed.data.q5_reticences.includes("Autre") ? parsed.data.q5_autre ?? null : null,
    });

    if (insertError) {
      return NextResponse.json(
        { ok: false, error: "DB insert error", details: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}
