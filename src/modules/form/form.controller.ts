import { Request, Response } from "express";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

import {
  createFormService,
  getFormsService,
  getFormByIdService,
} from "./form.service";

const getStringId = (id: string | string[]) => {
  return Array.isArray(id) ? id[0] : id;
};

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().default(""),
  isQuiz: z.boolean().default(false),

  fields: z
    .array(
      z.object({
        fieldId: z.string(),
        label: z.string(),
        type: z.enum([
          "text",
          "number",
          "textarea",
          "select",
          "radio",
          "checkbox",
          "date",
        ]),
        required: z.boolean().default(false),
        options: z.array(z.string()).optional().default([]),
        correctAnswer: z.any().optional().default(null),
      })
    )
    .default([]),
});
export const createForm = async (req: Request, res: Response) => {
  try {
    const result = formSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation Failed",
        errors: result.error.issues,
      });
    }

    const data = {
      ...result.data,
      formGroupId: uuidv4(),
      version: 1,
      isActive: true,
    };

    const form = await createFormService(data);

    return res.status(201).json({
      success: true,
      message: "Form created successfully",
      data: form,
    });
  } catch (error: any) {
    console.error("CREATE FORM ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Internal Server Error",
    });
  }
};
export const updateForm = async (req: Request, res: Response) => {
  try {
    const formId = getStringId(req.params.id);

    const result = formSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation Failed",
        errors: result.error.issues,
      });
    }

    const currentForm = await getFormByIdService(formId);

    if (!currentForm) {
      return res.status(404).json({
        success: false,
        message: "Form not found",
      });
    }

    const newData = {
      ...result.data,
      formGroupId: currentForm.formGroupId,
      version: (currentForm.version || 1) + 1,
      isActive: true,
    };

    const newForm = await createFormService(newData);

    return res.status(201).json({
      success: true,
      message: "New version created",
      data: newForm,
    });
  } catch (error: any) {
    console.error("UPDATE FORM ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Internal Server Error",
    });
  }
};
export const getForms = async (_req: Request, res: Response) => {
  try {
    const forms = await getFormsService();

    return res.status(200).json({
      success: true,
      data: forms,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error?.message || "Internal Server Error",
    });
  }
};
export const getFormById = async (req: Request, res: Response) => {
  try {
    const formId = getStringId(req.params.id);

    const form = await getFormByIdService(formId);

    if (!form) {
      return res.status(404).json({
        success: false,
        message: "Form not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: form,
    });
  } catch (error: any) {
    console.error("GET FORM ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Internal Server Error",
    });
  }
};