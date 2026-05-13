import { Response } from "./response.model";
import { Form } from "../form/form.model";
import { Parser } from "json2csv";

export const submitResponseService = async (
  formId: string,
  answers: Record<string, any>,
  userId?: string
) => {
  const form = await Form.findById(formId);
  if (!form) throw new Error("Form not found");

  let score:
    | {
        obtained: number;
        total: number;
        breakdown: { fieldId: string; isCorrect: boolean }[];
      }
    | undefined;

  if (form.isQuiz) {
    let correct = 0;
    const breakdown: { fieldId: string; isCorrect: boolean }[] = [];

    form.fields.forEach((field: any) => {
      const userAns = answers[field.fieldId];
      const correctAns = field.correctAnswer;

      let isCorrect = false;

      if (Array.isArray(correctAns)) {
        
        const userArr = Array.isArray(userAns) ? userAns : [userAns];
        isCorrect =
          correctAns.length === userArr.length &&
          correctAns.every((a: string) => userArr.includes(a));
      } else {
        isCorrect =
          String(userAns ?? "").trim().toLowerCase() ===
          String(correctAns ?? "").trim().toLowerCase();
      }

      if (isCorrect) correct++;
      breakdown.push({ fieldId: field.fieldId, isCorrect });
    });

    score = {
      obtained: correct,
      total: form.fields.length,
      breakdown,
    };
  }

  return await Response.create({
    formId: form._id,
    formGroupId: form.formGroupId,
    version: form.version,
    answers,
    score,
    submittedBy: userId || null,
    submittedAt: new Date(),
  });
};

export const getResponsesService = async (formId: string) => {
  return await Response.find({ formId }).sort({ createdAt: -1 });
};
export const getResponsesByGroupService = async (formGroupId: string) => {
  return await Response.find({ formGroupId }).sort({ createdAt: -1 });
};

export const exportResponsesCSVService = async (formId: string) => {
  const form = await Form.findById(formId);
  if (!form) throw new Error("Form not found");

  const responses = await Response.find({ formId }).sort({ createdAt: -1 });

  if (responses.length === 0) {
    throw new Error("No responses found");
  }

  const fieldHeaders = form.fields.map((f: any) => ({
    label: f.label,
    value: (row: any) => {
      const ans = row.answers?.[f.fieldId];
      if (Array.isArray(ans)) return ans.join(", ");
      return ans ?? "";
    },
  }));
  const baseHeaders = [
    { label: "Response ID", value: "_id" },
    { label: "Version", value: "version" },
    { label: "Submitted At", value: "submittedAt" },
  ];
  const quizHeaders = form.isQuiz
    ? [
        {
          label: "Score Obtained",
          value: (row: any) => row.score?.obtained ?? "",
        },
        {
          label: "Score Total",
          value: (row: any) => row.score?.total ?? "",
        },
      ]
    : [];

  const fields = [...baseHeaders, ...fieldHeaders, ...quizHeaders];

  const parser = new Parser({ fields });
  const csv = parser.parse(
    responses.map((r) => ({
      _id: r._id.toString(),
      version: r.version,
      submittedAt: r.submittedAt?.toISOString(),
      answers: r.answers,
      score: r.score,
    }))
  );

  return csv;
};
export const getFormAnalyticsService = async (formId: string) => {
  const responses = await Response.find({ formId });

  const total = responses.length;
  const quizResponses = responses.filter((r) => r.score);

  const avgScore =
    quizResponses.length > 0
      ? quizResponses.reduce(
          (sum, r) =>
            sum + (r.score!.obtained / r.score!.total) * 100,
          0
        ) / quizResponses.length
      : null;

  return {
    totalResponses: total,
    averageScore: avgScore ? parseFloat(avgScore.toFixed(2)) : null,
  };
};