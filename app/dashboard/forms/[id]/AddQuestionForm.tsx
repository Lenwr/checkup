"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type QuestionType =
  | "text"
  | "textarea"
  | "number"
  | "email"
  | "date"
  | "radio"
  | "select"
  | "checkbox"
  | "yesno"
  | "scale"
  | "rating";

function fieldKeyify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/(^_|_$)/g, "")
    .slice(0, 80);
}

function typeNeedsOptions(type: QuestionType) {
  return type === "radio" || type === "select" || type === "checkbox";
}

function typeNeedsScale(type: QuestionType) {
  return type === "scale" || type === "rating";
}

export default function AddQuestionForm({ formId }: { formId: string }) {
  const router = useRouter();

  const [label, setLabel] = useState("");
  const [fieldKey, setFieldKey] = useState("");
  const [type, setType] = useState<QuestionType>("text");
  const [required, setRequired] = useState(false);
  const [placeholder, setPlaceholder] = useState("");
  const [helpText, setHelpText] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [optionsText, setOptionsText] = useState("");
  const [minValue, setMinValue] = useState("1");
  const [maxValue, setMaxValue] = useState("5");
  const [stepValue, setStepValue] = useState("1");
  const [allowOther, setAllowOther] = useState(false);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const suggestedFieldKey = useMemo(() => fieldKeyify(label), [label]);

  const onLabelChange = (value: string) => {
    setLabel(value);
    if (!fieldKey) {
      setFieldKey(fieldKeyify(value));
    }
  };

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErr(null);

    const parsedOptions = typeNeedsOptions(type)
      ? optionsText
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line) => ({
            label: line,
            value: fieldKeyify(line).replace(/_/g, "-"),
          }))
      : null;

    try {
      const res = await fetch(`/api/admin/forms/${formId}/questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          label,
          field_key: fieldKey || suggestedFieldKey,
          type,
          required,
          placeholder: placeholder || null,
          help_text: helpText || null,
          sort_order: Number(sortOrder),
          options: parsedOptions,
          min_value: typeNeedsScale(type) ? Number(minValue) : null,
          max_value: typeNeedsScale(type) ? Number(maxValue) : null,
          step_value: typeNeedsScale(type) ? Number(stepValue) : null,
          allow_other: typeNeedsOptions(type) ? allowOther : false,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok) {
        setErr(data?.error ?? "Erreur serveur");
        setLoading(false);
        return;
      }

      setLabel("");
      setFieldKey("");
      setType("text");
      setRequired(false);
      setPlaceholder("");
      setHelpText("");
      setSortOrder(0);
      setOptionsText("");
      setMinValue("1");
      setMaxValue("5");
      setStepValue("1");
      setAllowOther(false);

      router.refresh();
    } catch (error) {
      setErr(error instanceof Error ? error.message : "Erreur réseau");
      setLoading(false);
      return;
    }

    setLoading(false);
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-5">
      {err && <div className="rounded-md border p-3 text-sm">{err}</div>}

      <div className="space-y-2">
        <label className="block text-sm font-medium">Question</label>
        <input
          className="w-full rounded-md border p-2"
          value={label}
          onChange={(e) => onLabelChange(e.target.value)}
          placeholder="Ex: Avant aujourd’hui, diriez-vous que vous êtes..."
          required
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Field key</label>
        <input
          className="w-full rounded-md border p-2"
          value={fieldKey}
          onChange={(e) => setFieldKey(fieldKeyify(e.target.value))}
          placeholder={suggestedFieldKey || "question_1"}
          required
        />
        <p className="text-xs text-slate-500">
          Suggéré : <span className="font-mono">{suggestedFieldKey}</span>
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Type</label>
          <select
            className="w-full rounded-md border p-2"
            value={type}
            onChange={(e) => setType(e.target.value as QuestionType)}
          >
            <option value="text">Texte court</option>
            <option value="textarea">Texte long</option>
            <option value="number">Nombre</option>
            <option value="email">Email</option>
            <option value="date">Date</option>
            <option value="radio">QCM (1 choix)</option>
            <option value="checkbox">Cases à cocher</option>
            <option value="select">Liste déroulante</option>
            <option value="yesno">Oui / Non</option>
            <option value="scale">Échelle</option>
            <option value="rating">Note</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Ordre</label>
          <input
            type="number"
            className="w-full rounded-md border p-2"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
            min={0}
          />
        </div>

        <div className="flex items-end">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={required}
              onChange={(e) => setRequired(e.target.checked)}
            />
            <span>Champ requis</span>
          </label>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Aide / description</label>
        <input
          className="w-full rounded-md border p-2"
          value={helpText}
          onChange={(e) => setHelpText(e.target.value)}
          placeholder="Texte d’aide affiché sous la question"
        />
      </div>

      {!typeNeedsOptions(type) && !typeNeedsScale(type) && (
        <div className="space-y-2">
          <label className="block text-sm font-medium">Placeholder</label>
          <input
            className="w-full rounded-md border p-2"
            value={placeholder}
            onChange={(e) => setPlaceholder(e.target.value)}
            placeholder="Texte affiché dans le champ"
          />
        </div>
      )}

      {typeNeedsOptions(type) && (
        <div className="space-y-3">
          <label className="block text-sm font-medium">Options</label>
          <textarea
            className="w-full rounded-md border p-2"
            rows={6}
            value={optionsText}
            onChange={(e) => setOptionsText(e.target.value)}
            placeholder={`Une option par ligne
Instagram
TikTok
Snapchat`}
            required
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={allowOther}
              onChange={(e) => setAllowOther(e.target.checked)}
            />
            <span>Autoriser “Autre”</span>
          </label>
        </div>
      )}

      {typeNeedsScale(type) && (
        <div className="grid gap-5 md:grid-cols-3">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Min</label>
            <input
              type="number"
              className="w-full rounded-md border p-2"
              value={minValue}
              onChange={(e) => setMinValue(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Max</label>
            <input
              type="number"
              className="w-full rounded-md border p-2"
              value={maxValue}
              onChange={(e) => setMaxValue(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Pas</label>
            <input
              type="number"
              className="w-full rounded-md border p-2"
              value={stepValue}
              onChange={(e) => setStepValue(e.target.value)}
              required
            />
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="rounded-md border px-4 py-3 font-medium"
      >
        {loading ? "Ajout..." : "Ajouter la question"}
      </button>
    </form>
  );
}