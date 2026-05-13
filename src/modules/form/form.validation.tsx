import { z } from "zod";

export const formSchema = z.object({
  title: z.string().min(3, "Title is required"),
  description: z.string().optional(),
  isQuiz: z.boolean().default(false),
  fields: z.array(z.object({
    id: z.string(),
    label: z.string(),
    type: z.enum(["text", "number", "textarea", "select", "radio", "checkbox", "date"]),
    required: z.boolean(),
    options: z.array(z.string()).optional(),
    correctAnswer: z.union([z.string(), z.array(z.string())]).optional()
  }))
});