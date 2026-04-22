import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const body = await req.json();

  const {
    reference,
    age,
    situation,
    date_premier_contact,
    canal_premier_contact,
    notes,
  } = body;

  const supabase = await supabaseServer();

  const { error } = await supabase.from("accompagnements").insert({
    reference,
    age,
    situation,
    date_premier_contact,
    canal_premier_contact,
    notes,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}