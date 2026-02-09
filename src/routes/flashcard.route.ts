import { Router } from "express";
import {
  createFlashcardSet,
  getFlashcardSets,
  getFlashcardSet,
  updateFlashcardSet,
  deleteFlashcardSet,
} from "../controllers/flashcard.controller";

import {
  createFlashcardTestResult,
  getFlashcardTestResults,
  getFlashcardTestResultsBySet,
} from "../controllers/flashcardTestResult.controller";


import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware); // enable later

// ---------- Flashcard Test Results (STATIC FIRST) ----------
router.get("/test-results", getFlashcardTestResults);
router.get("/:id/test-results", getFlashcardTestResultsBySet);
router.post("/:id/test-result", createFlashcardTestResult);

// ---------- Flashcard Sets ----------
router.post("/", createFlashcardSet);
router.get("/", getFlashcardSets);
router.get("/:id", getFlashcardSet);
router.put("/:id", updateFlashcardSet);
router.delete("/:id", deleteFlashcardSet);

export default router;
