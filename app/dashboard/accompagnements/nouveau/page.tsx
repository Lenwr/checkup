"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BrandHeader from "@/app/dashboard/_components/BrandHeader";

export default function NewAccompagnementPage() {
  const router = useRouter();

  const [reference, setReference] = useState("");
  const [age, setAge] = useState("");
  const [situation, setSituation] = useState<
    "greffe" | "attente_greffe" | "proche_parent"
  >("greffe");
  const [datePremierContact, setDatePremierContact] = useState("");
  const [canalPremierContact, setCanalPremierContact] = useState<
    "telephone" | "mail" | "visio" | "physique" | "autre"
  >("telephone");
  const [notes, setNotes] = useState("");

  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setErr(null);

    try {
      const res = await fetch("/api/accompagnements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reference: reference.trim(),
          age: age ? Number(age) : null,
          situation,
          date_premier_contact: datePremierContact || null,
          canal_premier_contact: canalPremierContact,
          notes: notes.trim() || null,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setErr(data?.error ?? "Erreur lors de la création.");
        setLoading(false);
        return;
      }

      router.push("/dashboard/accompagnements");
      router.refresh();
    } catch {
      setErr("Erreur réseau. Réessaie.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <BrandHeader subtitle="Nouvel accompagnement" />

      <div className="mx-auto mt-10 max-w-3xl px-6 pb-12">
        <div className="rounded-3xl border border-black/10 bg-white/85 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.08)] backdrop-blur-sm md:p-8">
          <h1 className="text-2xl font-semibold tracking-tight">
            Créer une fiche accompagnement
          </h1>
          <p className="mt-2 text-sm text-[color:var(--muted)]">
            Renseigne les informations principales pour démarrer le suivi.
          </p>

          {err && (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {err}
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-8 space-y-6">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Référence</label>
                <input
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none transition focus:border-[var(--greff-400)]"
                  placeholder="Ex: ACC-2026-001"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Âge</label>
                <input
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none transition focus:border-[var(--greff-400)]"
                  placeholder="Ex: 32"
                  type="number"
                  min="0"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Situation</label>
                <select
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none transition focus:border-[var(--greff-400)]"
                  value={situation}
                  onChange={(e) =>
                    setSituation(
                      e.target.value as
                        | "greffe"
                        | "attente_greffe"
                        | "proche_parent"
                    )
                  }
                >
                  <option value="greffe">Greffe</option>
                  <option value="attente_greffe">En attente de greffe</option>
                  <option value="proche_parent">Proche / parent</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Date du premier contact
                </label>
                <input
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none transition focus:border-[var(--greff-400)]"
                  type="date"
                  value={datePremierContact}
                  onChange={(e) => setDatePremierContact(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-1">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Canal du premier contact
                </label>
                <select
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none transition focus:border-[var(--greff-400)]"
                  value={canalPremierContact}
                  onChange={(e) =>
                    setCanalPremierContact(
                      e.target.value as
                        | "telephone"
                        | "mail"
                        | "visio"
                        | "physique"
                        | "autre"
                    )
                  }
                >
                  <option value="telephone">Téléphone</option>
                  <option value="mail">Mail</option>
                  <option value="visio">Visio</option>
                  <option value="physique">Physique</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <textarea
                className="min-h-[140px] w-full rounded-2xl border border-black/10 bg-white px-4 py-3 outline-none transition focus:border-[var(--greff-400)]"
                placeholder="Ajoute ici les infos utiles sur l’accompagnement..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <button
                type="button"
                onClick={() => router.push("/dashboard/accompagnements")}
                className="inline-flex items-center justify-center rounded-2xl border border-black/10 bg-white px-5 py-3 font-medium text-[var(--foreground)] transition hover:bg-[var(--greff-50)]"
                disabled={loading}
              >
                Annuler
              </button>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center rounded-2xl px-5 py-3 font-semibold text-white shadow-md transition disabled:cursor-not-allowed disabled:opacity-60"
                style={{
                  background:
                    "linear-gradient(135deg, var(--greff-600) 0%, var(--greff-500) 55%, var(--greff-400) 100%)",
                }}
              >
                {loading ? "Création..." : "Créer la fiche"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}