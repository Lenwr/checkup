"use client";

import { useState } from "react";

type Option = {
  label: string;
  value: string;
};

type Question = {
  id: string;
  label: string;
  field_key: string;
  type:
    | "text"
    | "textarea"
    | "number"
    | "email"
    | "date"
    | "radio"
    | "checkbox"
    | "select"
    | "yesno"
    | "scale"
    | "rating";
  required: boolean;
  options?: Option[] | null;
  help_text?: string | null;
  placeholder?: string | null;
  min_value?: number | null;
  max_value?: number | null;
  step_value?: number | null;
};

export default function DynamicForm({
  formSlug,
  interventionSlug,
  questions,
}: {
  formSlug: string;
  interventionSlug: string | null;
  questions: Question[];
}) {
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setValue(key: string, value: unknown) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function toggleCheckboxValue(fieldKey: string, value: string, checked: boolean) {
    const prev = Array.isArray(values[fieldKey]) ? (values[fieldKey] as string[]) : [];

    if (checked) {
      if (!prev.includes(value)) {
        setValue(fieldKey, [...prev, value]);
      }
      return;
    }

    setValue(
      fieldKey,
      prev.filter((item) => item !== value)
    );
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/forms/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          formSlug,
          interventionSlug,
          values,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok) {
        setError(data?.error ?? "Erreur lors de l’envoi.");
        setLoading(false);
        return;
      }

      window.location.href = "/merci";
      return;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur réseau.");
      setLoading(false);
      return;
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-8">
      {questions.map((q) => {
        const currentValue = values[q.field_key];

        if (q.type === "radio") {
          return (
            <section key={q.id} className="space-y-3">
              <h2 className="font-medium">{q.label}</h2>

              {q.help_text && (
                <p className="text-sm text-muted-foreground">{q.help_text}</p>
              )}

              {q.options?.map((opt) => (
                <label key={opt.value} className="flex gap-2">
                  <input
                    type="radio"
                    name={q.field_key}
                    value={opt.value}
                    checked={currentValue === opt.value}
                    onChange={() => setValue(q.field_key, opt.value)}
                    required={q.required}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </section>
          );
        }

        if (q.type === "yesno") {
          const yesNoOptions: Option[] = [
            { label: "Oui", value: "Oui" },
            { label: "Non", value: "Non" },
          ];

          return (
            <section key={q.id} className="space-y-3">
              <h2 className="font-medium">{q.label}</h2>

              {q.help_text && (
                <p className="text-sm text-muted-foreground">{q.help_text}</p>
              )}

              {yesNoOptions.map((opt) => (
                <label key={opt.value} className="flex gap-2">
                  <input
                    type="radio"
                    name={q.field_key}
                    value={opt.value}
                    checked={currentValue === opt.value}
                    onChange={() => setValue(q.field_key, opt.value)}
                    required={q.required}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </section>
          );
        }

        if (q.type === "checkbox") {
          const checkedValues = Array.isArray(currentValue) ? (currentValue as string[]) : [];

          return (
            <section key={q.id} className="space-y-3">
              <h2 className="font-medium">{q.label}</h2>

              {q.help_text && (
                <p className="text-sm text-muted-foreground">{q.help_text}</p>
              )}

              {q.options?.map((opt) => (
                <label key={opt.value} className="flex gap-2">
                  <input
                    type="checkbox"
                    value={opt.value}
                    checked={checkedValues.includes(opt.value)}
                    onChange={(e) =>
                      toggleCheckboxValue(q.field_key, opt.value, e.target.checked)
                    }
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </section>
          );
        }

        if (q.type === "text") {
          return (
            <section key={q.id} className="space-y-2">
              <label className="block font-medium">{q.label}</label>

              {q.help_text && (
                <p className="text-sm text-muted-foreground">{q.help_text}</p>
              )}

              <input
                type="text"
                className="w-full rounded-md border p-2"
                value={typeof currentValue === "string" ? currentValue : ""}
                placeholder={q.placeholder ?? ""}
                onChange={(e) => setValue(q.field_key, e.target.value)}
                required={q.required}
              />
            </section>
          );
        }

        if (q.type === "textarea") {
          return (
            <section key={q.id} className="space-y-2">
              <label className="block font-medium">{q.label}</label>

              {q.help_text && (
                <p className="text-sm text-muted-foreground">{q.help_text}</p>
              )}

              <textarea
                className="w-full rounded-md border p-2"
                value={typeof currentValue === "string" ? currentValue : ""}
                placeholder={q.placeholder ?? ""}
                onChange={(e) => setValue(q.field_key, e.target.value)}
                required={q.required}
              />
            </section>
          );
        }

        if (q.type === "number") {
          return (
            <section key={q.id} className="space-y-2">
              <label className="block font-medium">{q.label}</label>

              {q.help_text && (
                <p className="text-sm text-muted-foreground">{q.help_text}</p>
              )}

              <input
                type="number"
                className="w-full rounded-md border p-2"
                value={currentValue ?? ""}
                placeholder={q.placeholder ?? ""}
                min={q.min_value ?? undefined}
                max={q.max_value ?? undefined}
                step={q.step_value ?? undefined}
                onChange={(e) =>
                  setValue(
                    q.field_key,
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                required={q.required}
              />
            </section>
          );
        }

        if (q.type === "email") {
          return (
            <section key={q.id} className="space-y-2">
              <label className="block font-medium">{q.label}</label>

              {q.help_text && (
                <p className="text-sm text-muted-foreground">{q.help_text}</p>
              )}

              <input
                type="email"
                className="w-full rounded-md border p-2"
                value={typeof currentValue === "string" ? currentValue : ""}
                placeholder={q.placeholder ?? ""}
                onChange={(e) => setValue(q.field_key, e.target.value)}
                required={q.required}
              />
            </section>
          );
        }

        if (q.type === "date") {
          return (
            <section key={q.id} className="space-y-2">
              <label className="block font-medium">{q.label}</label>

              {q.help_text && (
                <p className="text-sm text-muted-foreground">{q.help_text}</p>
              )}

              <input
                type="date"
                className="w-full rounded-md border p-2"
                value={typeof currentValue === "string" ? currentValue : ""}
                onChange={(e) => setValue(q.field_key, e.target.value)}
                required={q.required}
              />
            </section>
          );
        }

        if (q.type === "select") {
          return (
            <section key={q.id} className="space-y-2">
              <label className="block font-medium">{q.label}</label>

              {q.help_text && (
                <p className="text-sm text-muted-foreground">{q.help_text}</p>
              )}

              <select
                className="w-full rounded-md border p-2"
                value={typeof currentValue === "string" ? currentValue : ""}
                onChange={(e) => setValue(q.field_key, e.target.value)}
                required={q.required}
              >
                <option value="">Choisir</option>
                {q.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </section>
          );
        }

        if (q.type === "scale" || q.type === "rating") {
          const min = q.min_value ?? 1;
          const max = q.max_value ?? 5;
          const step = q.step_value ?? 1;
          const numericValue =
            typeof currentValue === "number" ? currentValue : undefined;

          const valuesList: number[] = [];
          for (let i = min; i <= max; i += step) {
            valuesList.push(i);
          }

          return (
            <section key={q.id} className="space-y-3">
              <h2 className="font-medium">{q.label}</h2>

              {q.help_text && (
                <p className="text-sm text-muted-foreground">{q.help_text}</p>
              )}

              <div className="flex flex-wrap gap-3">
                {valuesList.map((n) => (
                  <label key={n} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={q.field_key}
                      value={n}
                      checked={numericValue === n}
                      onChange={() => setValue(q.field_key, n)}
                      required={q.required}
                    />
                    <span>{n}</span>
                  </label>
                ))}
              </div>
            </section>
          );
        }

        return null;
      })}

      {error && <div className="rounded-md border p-3 text-sm">{error}</div>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md border px-4 py-3 font-medium"
      >
        {loading ? "Envoi..." : "Envoyer"}
      </button>
    </form>
  );
}