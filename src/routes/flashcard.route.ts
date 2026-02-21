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

/**
 * @swagger
 * /api/flashcards:
 *   post:
 *     summary: Create a flashcard set
 *     description: |
 *       Creates a new flashcard set for the authenticated user.
 *       
 *       Rules:
 *       - Title must not be empty.
 *       - At least one card is required.
 *       - Each card must contain both front and back content.
 *     tags:
 *       - Flashcards
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Biology Chapter 1"
 *               cards:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     front:
 *                       type: string
 *                       example: "What is a cell?"
 *                     back:
 *                       type: string
 *                       example: "The basic structural unit of life."
 *             required:
 *               - title
 *               - cards
 *     responses:
 *       201:
 *         description: Flashcard set created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *
 *   get:
 *     summary: Get all flashcard sets
 *     description: Retrieves all flashcard sets for the authenticated user. Supports optional search by title.
 *     tags:
 *       - Flashcards
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search flashcard sets by title (case-insensitive)
 *         example: "biology"
 *     responses:
 *       200:
 *         description: List of flashcard sets
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   title:
 *                     type: string
 *                   cardCount:
 *                     type: number
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized
 *
 * /api/flashcards/{id}:
 *   get:
 *     summary: Get a specific flashcard set
 *     description: Retrieves a flashcard set and all its cards. User must own the set.
 *     tags:
 *       - Flashcards
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Flashcard set ID
 *     responses:
 *       200:
 *         description: Flashcard set retrieved
 *       404:
 *         description: Flashcard set not found
 *       401:
 *         description: Unauthorized
 *
 *   put:
 *     summary: Update a flashcard set
 *     description: |
 *       Updates a flashcard set. Supports:
 *       - Updating title
 *       - Adding new cards
 *       - Updating existing cards
 *       - Deleting cards
 *     tags:
 *       - Flashcards
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Flashcard set ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               addCards:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     front:
 *                       type: string
 *                     back:
 *                       type: string
 *               updateCards:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     front:
 *                       type: string
 *                     back:
 *                       type: string
 *               deleteCardIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Flashcard set updated
 *       400:
 *         description: Validation error
 *       404:
 *         description: Flashcard set not found
 *       401:
 *         description: Unauthorized
 *
 *   delete:
 *     summary: Delete a flashcard set
 *     description: Deletes a flashcard set and all associated cards.
 *     tags:
 *       - Flashcards
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Flashcard set ID
 *     responses:
 *       200:
 *         description: Flashcard set deleted
 *       404:
 *         description: Flashcard set not found
 *       401:
 *         description: Unauthorized
 *
 * /api/flashcards/test-results:
 *   get:
 *     summary: Get all flashcard test results
 *     description: Retrieves all flashcard test results for the authenticated user.
 *     tags:
 *       - Flashcards
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of test results
 *       401:
 *         description: Unauthorized
 *
 * /api/flashcards/{id}/test-results:
 *   get:
 *     summary: Get test results for a specific flashcard set
 *     description: Retrieves all test attempts for a specific flashcard set owned by the user.
 *     tags:
 *       - Flashcards
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Flashcard set ID
 *     responses:
 *       200:
 *         description: Test results retrieved
 *       400:
 *         description: Invalid flashcard set ID
 *       401:
 *         description: Unauthorized
 *
 * /api/flashcards/{id}/test-result:
 *   post:
 *     summary: Save a flashcard test attempt
 *     description: |
 *       Saves one flashcard test attempt.
 *       
 *       Validation Rules:
 *       - correctCount, wrongCount, totalCards must be numbers
 *       - correctCount + wrongCount must equal totalCards
 *       - totalCards must be greater than 0
 *       - totalCards cannot exceed the actual number of cards in the set
 *     tags:
 *       - Flashcards
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Flashcard set ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               correctCount:
 *                 type: number
 *                 example: 8
 *               wrongCount:
 *                 type: number
 *                 example: 2
 *               totalCards:
 *                 type: number
 *                 example: 10
 *             required:
 *               - correctCount
 *               - wrongCount
 *               - totalCards
 *     responses:
 *       201:
 *         description: Test result saved successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Flashcard set not found
 *       401:
 *         description: Unauthorized
 */
