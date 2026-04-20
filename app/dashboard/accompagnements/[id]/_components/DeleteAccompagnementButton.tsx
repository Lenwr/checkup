"use client";

export default function DeleteAccompagnementButton() {
  return (
    <button
      type="submit"
      onClick={(e) => {
        const ok = window.confirm(
          "Supprimer cet accompagnement, tous ses rendez-vous et feedbacks ?"
        );
        if (!ok) e.preventDefault();
      }}
      className="inline-flex items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-5 py-3 font-semibold text-red-700 hover:bg-red-100"
    >
      Supprimer l’accompagnement
    </button>
  );
}