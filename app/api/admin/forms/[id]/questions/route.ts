import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";

const optionSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
});

const questionSchema = z.object({
  label: z.string().min(1, "Label requis"),
  field_key: z
    .string()
    .min(1, "field_key requis")
    .max(80)
    .regex(/^[a-z0-9_]+$/, "field_key invalide"),
  type: z.enum([
    "text",
    "textarea",
    "number",
    "email",
    "date",
    "radio",
    "select",
    "checkbox",
    "yesno",
    "scale",
    "rating",
  ]),
  required: z.boolean().default(false),
  placeholder: z.string().optional().nullable(),
  help_text: z.string().optional().nullable(),
  sort_order: z.number().int().min(0).default(0),
  min_value: z.number().int().optional().nullable(),
  max_value: z.number().int().optional().nullable(),
  step_value: z.number().int().optional().nullable(),
  allow_other: z.boolean().default(false),
  options: z.array(optionSchema).optional().nullable(),
});

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const parsed = questionSchema.safeParse(body);

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

    const { data: form, error: formError } = await sb
      .from("forms")
      .select("id")
      .eq("id", id)
      .single();

    if (formError || !form) {
      return NextResponse.json(
        { ok: false, error: "Formulaire introuvable" },
        { status: 404 }
      );
    }

    const needsOptions = ["radio", "select", "checkbox"].includes(parsed.data.type);
    const needsScaleValues = ["scale", "rating"].includes(parsed.data.type);

    if (needsOptions && (!parsed.data.options || parsed.data.options.length === 0)) {
      return NextResponse.json(
        { ok: false, error: "Des options sont requises pour ce type de question" },
        { status: 400 }
      );
    }

    if (!needsOptions && parsed.data.options && parsed.data.options.length > 0) {
      // on laisse passer, mais on peut aussi nettoyer
    }

    if (needsScaleValues) {
      if (
        parsed.data.min_value === null ||
        parsed.data.min_value === undefined ||
        parsed.data.max_value === null ||
        parsed.data.max_value === undefined
      ) {
        return NextResponse.json(
          { ok: false, error: "min_value et max_value sont requis pour scale/rating" },
          { status: 400 }
        );
      }

      if (parsed.data.min_value > parsed.data.max_value) {
        return NextResponse.json(
          { ok: false, error: "min_value doit être <= max_value" },
          { status: 400 }
        );
      }
    }

    const insertPayload = {
      form_id: id,
      label: parsed.data.label,
      field_key: parsed.data.field_key,
      type: parsed.data.type,
      required: parsed.data.required,
      placeholder: parsed.data.placeholder ?? null,
      help_text: parsed.data.help_text ?? null,
      sort_order: parsed.data.sort_order,
      min_value: parsed.data.min_value ?? null,
      max_value: parsed.data.max_value ?? null,
      step_value: parsed.data.step_value ?? null,
      allow_other: parsed.data.allow_other,
      options: parsed.data.options ?? null,
    };

    const { data: question, error } = await sb
      .from("form_questions")
      .insert(insertPayload)
      .select(`
        id,
        form_id,
        label,
        field_key,
        type,
        required,
        placeholder,
        help_text,
        sort_order,
        min_value,
        max_value,
        step_value,
        allow_other,
        options
      `)
      .single();

    if (error || !question) {
      return NextResponse.json(
        { ok: false, error: error?.message ?? "Erreur création question" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, question });
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