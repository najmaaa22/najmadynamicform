import { Request, Response } from "express";

import {
  submitResponseService,
  getResponsesService,
} from "./response.service";

import { Parser } from "json2csv";
export const submitResponse = async (
  req: Request,
  res: Response
) => {
  try {
    const response =
      await submitResponseService(
        req.params.id as string,
        req.body.answers
      );

    return res.status(201).json({
      message: "Response submitted successfully",
      data: response,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
export const getResponses = async (
  req: Request,
  res: Response
) => {
  try {
    const responses =
      await getResponsesService(
        req.params.id as string
      );

    return res.status(200).json({
      message: "Responses fetched successfully",
      data: responses,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
export const exportResponsesCSV = async (
  req: Request,
  res: Response
) => {
  try {
    const responses =
      await getResponsesService(
        req.params.id as string
      );
    const formatted = responses.map(
      (response: any) => ({
        ...response.answers,

        version: response.version,

        submittedAt:
          response.createdAt,

        score:
          response.score
            ?.obtained || 0,
      })
    );

    const parser = new Parser();

    const csv =
      parser.parse(formatted);

    res.header(
      "Content-Type",
      "text/csv"
    );

    res.attachment(
      "responses.csv"
    );

    return res.send(csv);
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
    });
  }
};