import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      slug,
      q1_utilite,
      q2_ressenti,
      q2_autre,
      q3_prochain_sujet,
      q4_mieux_accompagne,
      q5_poursuivre,
    } = body;

    if (!slug) {
      return NextResponse.json(
        { error: "Slug manquant" },
        { status: 400 }
      );
    }

    const supabase = supabaseAdmin();

    // 🔍 1. retrouver le rendez-vous
    const { data: rdv, error: rdvError } = await supabase
      .from("accompagnement_rendez_vous")
      .select("id")
      .eq("slug_feedback", slug)
      .single();

    if (rdvError || !rdv) {
      return NextResponse.json(
        { error: "Rendez-vous introuvable" },
        { status: 404 }
      );
    }

    // 💾 2. insérer le feedback
    const { error: insertError } = await supabase
      .from("accompagnement_feedbacks")
      .insert({
        rendez_vous_id: rdv.id,
        q1_utilite,
        q2_ressenti,
        q2_autre: q2_autre || null,
        q3_prochain_sujet: q3_prochain_sujet || null,
        q4_mieux_accompagne,
        q5_poursuivre,
      });

    if (insertError) {
      return NextResponse.json(
        { error: "Erreur lors de l’enregistrement" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}