import { Form } from "./form.model";
import { v4 as uuidv4 } from "uuid";
export const createFormService = async (data: any) => {
  return await Form.create({
    ...data,
    formGroupId: uuidv4(),
    version: 1,
  });
};

export const getFormsService = async () => {
  // Aggregate: group by formGroupId, pick highest version
  return await Form.aggregate([
    { $sort: { version: -1 } },
    {
      $group: {
        _id: "$formGroupId",
        doc: { $first: "$$ROOT" },
      },
    },
    { $replaceRoot: { newRoot: "$doc" } },
    { $sort: { createdAt: -1 } },
  ]);
};

export const getFormVersionsService = async (formGroupId: string) => {
  return await Form.find({ formGroupId }).sort({ version: -1 });
};
export const getFormByIdService = async (id: string) => {
  return await Form.findById(id);
};
export const updateFormService = async (formId: string, data: any) => {
  const existingForm = await Form.findById(formId);

  if (!existingForm) {
    const err = new Error("Form not found");
    throw err;
  }
  await Form.findByIdAndUpdate(formId, { isActive: false });

 
  const newFormVersion = await Form.create({
    title: data.title,
    description: data.description,
    isQuiz: data.isQuiz,
    fields: data.fields,
    formGroupId: existingForm.formGroupId,
    version: (existingForm.version || 1) + 1,
    isActive: true,
    publishedAt: new Date(),
  });

  return newFormVersion;
};
export const deleteFormService = async (formId: string) => {
  const form = await Form.findById(formId);
  if (!form) throw new Error("Form not found");

  await Form.updateMany(
    { formGroupId: form.formGroupId },
    { isActive: false }
  );

  return { message: "Form deleted successfully" };
};