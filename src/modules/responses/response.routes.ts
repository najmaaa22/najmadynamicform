import express from "express";
import {
  submitResponse,
  getResponses,
  exportResponsesCSV,
} from "./response.controller";
import submissionLimiter from "../../middlewares/rateLimits";

const router = express.Router();
router.post("/:id/submit", submitResponse);
router.get("/:id", getResponses); 
router.get("/:id/export", exportResponsesCSV);
router.post("/:id/submit", submissionLimiter, submitResponse);

export default router;