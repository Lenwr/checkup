"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Accompagnement = {
  id: string;
  reference: string;
  age: number | null;
  situation: "greffe" | "attente_greffe" | "proche_parent";
  date_premier_contact: string | null;
  created_at: string;
};

function formatSituation(value: Accompagnement["situation"]) {
  switch (value) {
    case "greffe":
      return "Greffe";
    case "attente_greffe":
      return "En attente de greffe";
    case "proche_parent":
      return "Proche / parent";
    default:
      return value;
  }
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("fr-FR");
}

export default function AccompagnementsList({
  accompagnements,
  deleteAction,
}: {
  accompagnements: Accompagnement[];
  deleteAction: (formData: FormData) => Promise<void>;
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const allSelected =
    accompagnements.length > 0 && selectedIds.length === accompagnements.length;

  const selectedCount = selectedIds.length;

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const toggleOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(accompagnements.map((item) => item.id));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-3xl border border-black/10 bg-white/85 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.08)] backdrop-blur-sm md:flex-row md:items-center md:justify-between">
        <label className="flex items-center gap-3 text-sm font-medium">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleAll}
            className="h-4 w-4 rounded border-slate-300"
          />
          Tout sélectionner
        </label>

        <form
          action={deleteAction}
          onSubmit={(e) => {
            if (selectedCount === 0) {
              e.preventDefault();
              return;
            }

            const ok = window.confirm(
              `Supprimer ${selectedCount} accompagnement(s) sélectionné(s) ? Cette action supprimera aussi les rendez-vous et feedbacks liés.`
            );

            if (!ok) e.preventDefault();
          }}
          className="flex items-center gap-3"
        >
          {selectedIds.map((id) => (
            <input key={id} type="hidden" name="ids" value={id} />
          ))}

          <span className="text-sm text-[color:var(--muted)]">
            {selectedCount} sélectionné{selectedCount > 1 ? "s" : ""}
          </span>

          <button
            type="submit"
            disabled={selectedCount === 0}
            className="inline-flex items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Supprimer la sélection
          </button>
        </form>
      </div>

      <section className="space-y-4">
        {accompagnements.map((item) => {
          const checked = selectedSet.has(item.id);

          return (
            <div
              key={item.id}
              className={`rounded-3xl border bg-white/85 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.08)] backdrop-blur-sm transition ${
                checked
                  ? "border-[var(--greff-400)] ring-2 ring-[color:var(--greff-100)]"
                  : "border-black/10"
              }`}
            >
              <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                <div className="flex min-w-0 gap-4">
                  <div className="pt-1">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleOne(item.id)}
                      className="h-4 w-4 rounded border-slate-300"
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="truncate text-xl font-semibold tracking-tight">
                        {item.reference}
                      </h2>

                      <span className="rounded-full border border-black/10 bg-[var(--greff-50)] px-3 py-1 text-xs font-medium text-[var(--greff-700)]">
                        {formatSituation(item.situation)}
                      </span>
                    </div>

                    <div className="mt-3 grid gap-2 text-sm text-[color:var(--muted)] md:grid-cols-3">
                      <p>
                        <span className="font-medium text-[var(--foreground)]">Âge :</span>{" "}
                        {item.age ?? "—"}
                      </p>
                      <p>
                        <span className="font-medium text-[var(--foreground)]">Premier contact :</span>{" "}
                        {formatDate(item.date_premier_contact)}
                      </p>
                      <p>
                        <span className="font-medium text-[var(--foreground)]">Créé le :</span>{" "}
                        {formatDate(item.created_at)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="shrink-0">
                  <Link
                    href={`/dashboard/accompagnements/${item.id}`}
                    className="inline-flex items-center rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-medium text-[var(--foreground)] shadow-sm transition hover:bg-[var(--greff-50)]"
                  >
                    Ouvrir la fiche →
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}