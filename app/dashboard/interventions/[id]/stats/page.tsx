import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import BarChartCard from "./BartChartCard";
import RecapQuestionTable from "./RecapQuestionTable";

type FormRow = {
  id: string;
  name: string;
  slug: string;
  kind: string;
};

type QuestionRow = {
  id: string;
  form_id: string;
  label: string;
  field_key: string;
  type: string;
  required: boolean;
  sort_order: number;
  options: { label: string; value: string }[] | null;
  min_value: number | null;
  max_value: number | null;
  step_value: number | null;
};

type SubmissionRow = {
  id: string;
  form_id: string;
};

type AnswerRow = {
  submission_id: string;
  question_id: string;
  value: unknown;
};

function countValues(values: string[]) {
  return values.reduce(
    (acc, value) => {
      acc[value] = (acc[value] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
}

function toRows(counts: Record<string, number>, orderedLabels?: string[]) {
  const entries = Object.entries(counts);

  if (orderedLabels && orderedLabels.length > 0) {
    const ordered = orderedLabels.map((label) => ({
      label,
      value: counts[label] ?? 0,
    }));

    const remaining = entries
      .filter(([label]) => !orderedLabels.includes(label))
      .map(([label, value]) => ({ label, value }));

    return [...ordered, ...remaining];
  }

  return entries
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

function normalizeSingleValue(
  value: unknown,
  question: QuestionRow
): string | null {
  if (value === null || value === undefined || value === "") return null;

  if (question.type === "yesno") {
    if (value === true) return "Oui";
    if (value === false) return "Non";
    if (value === "Oui" || value === "Non") return value;
  }

  if (
    question.type === "radio" ||
    question.type === "select" ||
    question.type === "checkbox"
  ) {
    const options = Array.isArray(question.options) ? question.options : [];
    const optionMap = Object.fromEntries(
      options.map((opt) => [opt.value, opt.label])
    );

    if (typeof value === "string") {
      return optionMap[value] ?? value;
    }
  }

  if (
    question.type === "scale" ||
    question.type === "rating" ||
    question.type === "number"
  ) {
    return String(value);
  }

  if (question.type === "date" && typeof value === "string") {
    return value;
  }

  if (
    question.type === "text" ||
    question.type === "textarea" ||
    question.type === "email"
  ) {
    return typeof value === "string" ? value : String(value);
  }

  return typeof value === "string" ? value : String(value);
}

function extractValues(answer: AnswerRow, question: QuestionRow): string[] {
  if (question.type === "checkbox") {
    if (!Array.isArray(answer.value)) return [];
    return answer.value
      .map((item) => normalizeSingleValue(item, question))
      .filter(Boolean) as string[];
  }

  const normalized = normalizeSingleValue(answer.value, question);
  return normalized ? [normalized] : [];
}

function orderedLabelsForQuestion(question: QuestionRow): string[] | undefined {
  if (question.type === "yesno") {
    return ["Oui", "Non"];
  }

  if (
    question.type === "radio" ||
    question.type === "select" ||
    question.type === "checkbox"
  ) {
    return Array.isArray(question.options)
      ? question.options.map((opt) => opt.label)
      : undefined;
  }

  if (question.type === "scale" || question.type === "rating") {
    const min = question.min_value ?? 1;
    const max = question.max_value ?? 5;
    const step = question.step_value ?? 1;
    const labels: string[] = [];

    for (let n = min; n <= max; n += step) {
      labels.push(String(n));
    }

    return labels;
  }

  return undefined;
}

export default async function InterventionStatsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sb = supabaseServer();

  const { data: intervention, error: interventionError } = await sb
    .from("interventions")
    .select(
      "id, slug, date, etablissement, lieu, type_public, avant_form_id, apres_form_id"
    )
    .eq("id", id)
    .single();

  if (interventionError || !intervention) {
    return <main className="p-6">Intervention introuvable</main>;
  }

  const formIds = [intervention.avant_form_id, intervention.apres_form_id].filter(
    Boolean
  ) as string[];

  const { data: formsData, error: formsError } =
    formIds.length > 0
      ? await sb
          .from("forms")
          .select("id, name, slug, kind")
          .in("id", formIds)
      : { data: [], error: null };

  if (formsError) {
    return <main className="p-6">Erreur chargement formulaires</main>;
  }

  const forms = (formsData ?? []) as FormRow[];
  const formMap = Object.fromEntries(forms.map((form) => [form.id, form]));

  const { data: questionsData, error: questionsError } =
    formIds.length > 0
      ? await sb
          .from("form_questions")
          .select(
            "id, form_id, label, field_key, type, required, sort_order, options, min_value, max_value, step_value"
          )
          .in("form_id", formIds)
          .order("sort_order", { ascending: true })
      : { data: [], error: null };

  if (questionsError) {
    return <main className="p-6">Erreur chargement questions</main>;
  }

  const questions = (questionsData ?? []) as QuestionRow[];

  const { data: submissionsData, error: submissionsError } =
    formIds.length > 0
      ? await sb
          .from("form_submissions")
          .select("id, form_id")
          .eq("intervention_id", id)
          .in("form_id", formIds)
      : { data: [], error: null };

  if (submissionsError) {
    return <main className="p-6">Erreur chargement réponses</main>;
  }

  const submissions = (submissionsData ?? []) as SubmissionRow[];
  const submissionIds = submissions.map((submission) => submission.id);

  const { data: answersData, error: answersError } =
    submissionIds.length > 0
      ? await sb
          .from("form_answers")
          .select("submission_id, question_id, value")
          .in("submission_id", submissionIds)
      : { data: [], error: null };

  if (answersError) {
    return <main className="p-6">Erreur chargement réponses détaillées</main>;
  }

  const answers = (answersData ?? []) as AnswerRow[];

  const submissionsByForm = submissions.reduce(
    (acc, submission) => {
      acc[submission.form_id] = (acc[submission.form_id] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const answersByQuestion = answers.reduce(
    (acc, answer) => {
      if (!acc[answer.question_id]) acc[answer.question_id] = [];
      acc[answer.question_id].push(answer);
      return acc;
    },
    {} as Record<string, AnswerRow[]>
  );

  const avantForm = intervention.avant_form_id
    ? formMap[intervention.avant_form_id]
    : null;

  const apresForm = intervention.apres_form_id
    ? formMap[intervention.apres_form_id]
    : null;

  const avantQuestions = questions.filter(
    (question) => question.form_id === intervention.avant_form_id
  );

  const apresQuestions = questions.filter(
    (question) => question.form_id === intervention.apres_form_id
  );

  const nbAvant = intervention.avant_form_id
    ? submissionsByForm[intervention.avant_form_id] ?? 0
    : 0;

  const nbApres = intervention.apres_form_id
    ? submissionsByForm[intervention.apres_form_id] ?? 0
    : 0;

  const completion = nbAvant > 0 ? Math.round((nbApres / nbAvant) * 100) : 0;

  function renderQuestion(question: QuestionRow, total: number) {
    const questionAnswers = answersByQuestion[question.id] ?? [];
    const flatValues = questionAnswers.flatMap((answer) =>
      extractValues(answer, question)
    );
    const counts = countValues(flatValues);
    const rows = toRows(counts, orderedLabelsForQuestion(question));

    const isFreeText =
      question.type === "text" ||
      question.type === "textarea" ||
      question.type === "email" ||
      question.type === "date";

    if (isFreeText) {
      return (
        <RecapQuestionTable
          key={question.id}
          title={question.label}
          total={total}
          rows={rows}
        />
      );
    }

    return (
      <BarChartCard
        key={question.id}
        title={question.label}
        data={rows}
        total={total}
      />
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-semibold">
            {intervention.etablissement}
          </h1>
          <p className="mt-1 text-slate-500">
            {intervention.date} • {intervention.lieu} • {intervention.type_public}
          </p>

          <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
            <span className="rounded-full border px-2 py-1">
              AVANT : {avantForm?.name ?? "—"}
            </span>
            <span className="rounded-full border px-2 py-1">
              APRÈS : {apresForm?.name ?? "—"}
            </span>
          </div>
        </div>

        <a
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm hover:bg-black/5"
          href={`/dashboard/interventions/${id}`}
        >
          ← Retour
        </a>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <Card title="Réponses AVANT" value={nbAvant} />
        <Card title="Réponses APRÈS" value={nbApres} />
        <Card title="Taux de complétion" value={`${completion}%`} />
        <Card title="Questions totales" value={questions.length} />
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Résultats — AVANT l’intervention</h2>
        <p className="mt-1 text-sm text-slate-500">
          Formulaire : {avantForm?.name ?? "Non défini"} • Réponses : {nbAvant}
        </p>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {avantQuestions.length > 0 ? (
            avantQuestions.map((question) => renderQuestion(question, nbAvant))
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
              Aucun formulaire AVANT lié ou aucune question.
            </div>
          )}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Résultats — APRÈS l’intervention</h2>
        <p className="mt-1 text-sm text-slate-500">
          Formulaire : {apresForm?.name ?? "Non défini"} • Réponses : {nbApres}
        </p>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {apresQuestions.length > 0 ? (
            apresQuestions.map((question) => renderQuestion(question, nbApres))
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
              Aucun formulaire APRÈS lié ou aucune question.
            </div>
          )}
        </div>
      </section>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-medium">Note</h2>
        <p className="mt-3 text-sm text-slate-600">
          Les anciens indicateurs de comparaison métier basés sur des questions
          codées en dur ont été retirés ici, car les formulaires sont maintenant
          dynamiques. Si tu veux, on peut ajouter ensuite un système de
          “questions repères” pour comparer automatiquement AVANT / APRÈS.
        </p>
      </section>
    </main>
  );
}

function Card({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
}