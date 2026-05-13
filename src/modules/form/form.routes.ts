import express from "express";
import {
  createForm,
  getForms,
  getFormById,
  updateForm,
} from "./form.controller";

import { protect, adminOnly } from "../../middlewares/auth.middleware";

const router = express.Router();

router.post("/", protect, adminOnly, createForm);
router.get("/", protect, adminOnly, getForms);
router.get("/:id", protect, getFormById);
router.put("/:id", protect, adminOnly, updateForm);

export default router;