import { Response, IResponse } from "../responses/response.model";
export const getFormAnalytics = async (formId: string) => {
  const responses: IResponse[] = await Response.find({ formId }).sort({ submittedAt: -1 });

  const totalResponses = responses.length;
  const totalObtainedScore = responses.reduce((sum: number, r: IResponse) => {
    const scoreValue = typeof r.score === 'number' ? r.score : (r.score as any)?.obtained || 0;
    return sum + scoreValue;
  }, 0);
  const averageScore = totalResponses > 0 
    ? parseFloat((totalObtainedScore / totalResponses).toFixed(2)) 
    : 0;
  return {
    totalResponses,
    averageScore,
    responses,
  };
};