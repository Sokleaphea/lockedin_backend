import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  addFavorite,
  removeFavorite,
  getFavorites,
} from "../controllers/booksFavorite.controller";
import {
  createReview,
  updateReview,
  deleteReview,
  getBookReviews,
} from "../controllers/booksReview";
import { getBooks } from "../controllers/books.controller";

const router = Router();

// Public routes (no auth required)

/**
 * @swagger
 * /api/books:
 *   get:
 *     summary: Search and retrieve books
 *     description: Fetches books from the Gutendex API with optional search and category filtering
 *     tags: [Books]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search query to find books by title or author
 *         example: "dickens"
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter books by subject or bookshelf category
 *         example: "science"
 *     responses:
 *       200:
 *         description: Successfully retrieved books
 *       503:
 *         description: Book service temporarily unavailable
 *       500:
 *         description: Server error
 */
router.get("/", getBooks);

/**
 * @swagger
 * /api/books/{bookId}/reviews:
 *   get:
 *     summary: Get all reviews for a book
 *     description: Review - Retrieves all reviews for a specific book, with user info populated
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: number
 *         description: The Gutendex book ID
 *         example: 84
 *     responses:
 *       200:
 *         description: Successfully retrieved reviews
 *       400:
 *         description: Invalid bookId
 *       500:
 *         description: Server error
 */
router.get("/:bookId/reviews", getBookReviews);

// Protected routes (auth required)
router.use(authMiddleware);

// Favorites routes

/**
 * @swagger
 * /api/books/favorites:
 *   post:
 *     summary: Add book to favorites
 *     description: Favorite - Adds a book to the authenticated user's favorites list
 *     tags: [Books]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bookId:
 *                 type: number
 *                 example: 84
 *             required:
 *               - bookId
 *     responses:
 *       201:
 *         description: Book added to favorites
 *       400:
 *         description: Invalid bookId or book already in favorites
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/favorites", addFavorite);

/**
 * @swagger
 * /api/books/favorites:
 *   get:
 *     summary: Get user's favorite books
 *     description: Favorite - Retrieves all favorite books for the authenticated user
 *     tags: [Books]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved favorites
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/favorites", getFavorites);

/**
 * @swagger
 * /api/books/favorites/{bookId}:
 *   delete:
 *     summary: Remove book from favorites
 *     description: Favorite - Removes a book from the authenticated user's favorites list
 *     tags: [Books]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: number
 *         example: 84
 *     responses:
 *       200:
 *         description: Book removed from favorites
 *       400:
 *         description: Invalid bookId
 *       404:
 *         description: Favorite not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.delete("/favorites/:bookId", removeFavorite);

// Reviews routes

/**
 * @swagger
 * /api/books/{bookId}/reviews:
 *   post:
 *     summary: Create a book review
 *     description: Review - Adds a review for a specific book. Each user can only review a book once
 *     tags: [Books]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: number
 *         example: 84
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 4
 *               feedback:
 *                 type: string
 *                 example: "Great classic read!"
 *             required:
 *               - rating
 *               - feedback
 *     responses:
 *       201:
 *         description: Review created successfully
 *       400:
 *         description: Invalid input or duplicate review
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/:bookId/reviews", createReview);

/**
 * @swagger
 * /api/books/reviews/{reviewId}:
 *   patch:
 *     summary: Update a book review
 *     description: Review - Updates an existing review. Only the review owner can update it
 *     tags: [Books]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *         description: The review ObjectId
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               feedback:
 *                 type: string
 *     responses:
 *       200:
 *         description: Review updated successfully
 *       400:
 *         description: Invalid input
 *       403:
 *         description: You can only edit your own reviews
 *       404:
 *         description: Review not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.patch("/reviews/:reviewId", updateReview);

/**
 * @swagger
 * /api/books/reviews/{reviewId}:
 *   delete:
 *     summary: Delete a book review
 *     description: Review - Deletes an existing review. Only the review owner can delete it
 *     tags: [Books]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *         description: The review ObjectId
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *       403:
 *         description: You can only delete your own reviews
 *       404:
 *         description: Review not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.delete("/reviews/:reviewId", deleteReview);

export default router;
