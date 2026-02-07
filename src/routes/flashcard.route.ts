import { Router } from "express";
import {
  createFlashcardSet,
  getFlashcardSets,
  getFlashcardSet,
  updateFlashcardSet,
  deleteFlashcardSet,
} from "../controllers/flashcard.controller";

// import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// router.use(authMiddleware); // 🔒 enable later

// Create new flashcard set
router.post("/", createFlashcardSet);

// Get all flashcard sets (home screen)
router.get("/", getFlashcardSets);

// Get one flashcard set (review / edit / test entry)
router.get("/:id", getFlashcardSet);

// Update flashcard set (title / cards)
router.put("/:id", updateFlashcardSet);

// Delete flashcard set (hard delete + cascade)
router.delete("/:id", deleteFlashcardSet);

export default router;
