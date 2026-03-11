import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

type SubmittedValues = Record<string, unknown>;

function isEmptyValue(value: unknown) {
  return (
    value === undefined ||
    value === null ||
    value === "" ||
    (Array.isArray(value) && value.length === 0)
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { formSlug, interventionSlug, values } = body as {
      formSlug?: string;
      interventionSlug?: string | null;
      values?: SubmittedValues;
    };

    if (!formSlug || typeof formSlug !== "string") {
      return NextResponse.json(
        { ok: false, error: "formSlug manquant ou invalide" },
        { status: 400 }
      );
    }

    if (!values || typeof values !== "object" || Array.isArray(values)) {
      return NextResponse.json(
        { ok: false, error: "values manquant ou invalide" },
        { status: 400 }
      );
    }

    const sb = supabaseServer();

    // 1) Charger le formulaire
    const { data: form, error: formError } = await sb
      .from("forms")
      .select("id, slug, is_active")
      .eq("slug", formSlug)
      .eq("is_active", true)
      .single();

    if (formError || !form) {
      return NextResponse.json(
        { ok: false, error: "Formulaire introuvable ou inactif" },
        { status: 404 }
      );
    }

    // 2) Charger les questions
    const { data: questions, error: questionsError } = await sb
      .from("form_questions")
      .select(`
        id,
        field_key,
        label,
        type,
        required,
        options,
        min_value,
        max_value,
        step_value,
        allow_other
      `)
      .eq("form_id", form.id)
      .order("sort_order", { ascending: true });

    if (questionsError) {
      return NextResponse.json(
        { ok: false, error: questionsError.message },
        { status: 500 }
      );
    }

    if (!questions || questions.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Ce formulaire ne contient aucune question" },
        { status: 400 }
      );
    }

    // 3) Résoudre l’intervention si fournie
    let interventionId: string | null = null;

    if (interventionSlug) {
      const { data: intervention, error: interventionError } = await sb
        .from("interventions")
        .select("id")
        .eq("slug", interventionSlug)
        .single();

      if (interventionError || !intervention) {
        return NextResponse.json(
          { ok: false, error: "Intervention introuvable (slug invalide)" },
          { status: 404 }
        );
      }

      interventionId = intervention.id;
    }

    // 4) Validation générique
    for (const q of questions) {
      const rawValue = values[q.field_key];

      if (q.required && isEmptyValue(rawValue)) {
        return NextResponse.json(
          { ok: false, error: `Champ requis manquant : ${q.label}` },
          { status: 400 }
        );
      }

      if (isEmptyValue(rawValue)) continue;

      if (q.type === "text" || q.type === "textarea" || q.type === "email") {
        if (typeof rawValue !== "string") {
          return NextResponse.json(
            { ok: false, error: `Valeur invalide pour : ${q.label}` },
            { status: 400 }
          );
        }

        if (q.type === "email" && rawValue !== "") {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(rawValue)) {
            return NextResponse.json(
              { ok: false, error: `Email invalide pour : ${q.label}` },
              { status: 400 }
            );
          }
        }
      }

      if (q.type === "number" || q.type === "scale" || q.type === "rating") {
        if (typeof rawValue !== "number" && typeof rawValue !== "string") {
          return NextResponse.json(
            { ok: false, error: `Nombre invalide pour : ${q.label}` },
            { status: 400 }
          );
        }

        const n = Number(rawValue);
        if (Number.isNaN(n)) {
          return NextResponse.json(
            { ok: false, error: `Nombre invalide pour : ${q.label}` },
            { status: 400 }
          );
        }

        if (q.min_value !== null && q.min_value !== undefined && n < q.min_value) {
          return NextResponse.json(
            { ok: false, error: `Valeur trop petite pour : ${q.label}` },
            { status: 400 }
          );
        }

        if (q.max_value !== null && q.max_value !== undefined && n > q.max_value) {
          return NextResponse.json(
            { ok: false, error: `Valeur trop grande pour : ${q.label}` },
            { status: 400 }
          );
        }
      }

      if (q.type === "yesno") {
        if (rawValue !== "Oui" && rawValue !== "Non") {
          return NextResponse.json(
            { ok: false, error: `Réponse invalide pour : ${q.label}` },
            { status: 400 }
          );
        }
      }

      if (q.type === "radio" || q.type === "select") {
        if (typeof rawValue !== "string") {
          return NextResponse.json(
            { ok: false, error: `Réponse invalide pour : ${q.label}` },
            { status: 400 }
          );
        }

        const allowed = Array.isArray(q.options)
          ? q.options.map((opt: any) => opt.value)
          : [];

        if (!allowed.includes(rawValue)) {
          return NextResponse.json(
            { ok: false, error: `Option invalide pour : ${q.label}` },
            { status: 400 }
          );
        }
      }

      if (q.type === "checkbox") {
        if (!Array.isArray(rawValue)) {
          return NextResponse.json(
            { ok: false, error: `Réponse invalide pour : ${q.label}` },
            { status: 400 }
          );
        }

        const allowed = Array.isArray(q.options)
          ? q.options.map((opt: any) => opt.value)
          : [];

        const invalid = rawValue.some((v) => !allowed.includes(v));
        if (invalid) {
          return NextResponse.json(
            { ok: false, error: `Une ou plusieurs options sont invalides pour : ${q.label}` },
            { status: 400 }
          );
        }
      }

      if (q.type === "date") {
        if (typeof rawValue !== "string") {
          return NextResponse.json(
            { ok: false, error: `Date invalide pour : ${q.label}` },
            { status: 400 }
          );
        }
      }
    }

    // 5) Créer la soumission
    const { data: submission, error: submissionError } = await sb
      .from("form_submissions")
      .insert({
        form_id: form.id,
        intervention_id: interventionId,
      })
      .select("id")
      .single();

    if (submissionError || !submission) {
      return NextResponse.json(
        { ok: false, error: submissionError?.message ?? "Erreur création soumission" },
        { status: 500 }
      );
    }

    // 6) Préparer les réponses
    const answers = questions.map((q) => {
      let normalizedValue = values[q.field_key] ?? null;

      // Normalisations simples
      if (q.type === "number" || q.type === "scale" || q.type === "rating") {
        normalizedValue =
          normalizedValue === null || normalizedValue === ""
            ? null
            : Number(normalizedValue);
      }

      if (q.type === "yesno") {
        normalizedValue =
          normalizedValue === "Oui" ? true :
          normalizedValue === "Non" ? false :
          null;
      }

      return {
        submission_id: submission.id,
        question_id: q.id,
        value: normalizedValue,
      };
    });

    const { error: answersError } = await sb
      .from("form_answers")
      .insert(answers);

    if (answersError) {
      return NextResponse.json(
        { ok: false, error: answersError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, submissionId: submission.id });
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