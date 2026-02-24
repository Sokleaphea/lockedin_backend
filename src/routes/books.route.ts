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
router.get("/", getBooks);
router.get("/:bookId/reviews", getBookReviews);

// Protected routes (auth required)
router.use(authMiddleware);

// Favorites routes
router.post("/favorites", addFavorite);
router.get("/favorites", getFavorites);
router.delete("/favorites/:bookId", removeFavorite);

// Reviews routes
router.post("/:bookId/reviews", createReview);
router.put("/reviews/:reviewId", updateReview);
router.delete("/reviews/:reviewId", deleteReview);

export default router;

/**
 * @swagger
 * /api/books:
 *   get:
 *     summary: Search and retrieve books
 *     description: Fetches books from the Gutendex API with optional search and category filtering. Results are cached for 5 minutes.
 *     tags: [Books]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search query to find books by title or author
 *         example: "biology"
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter books by subject or bookshelf category
 *         example: "science"
 *     responses:
 *       200:
 *         description: Successfully retrieved books
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: number
 *                   title:
 *                     type: string
 *                   authors:
 *                     type: array
 *                     items:
 *                       type: string
 *                   summary:
 *                     type: string
 *                   categories:
 *                     type: array
 *                     items:
 *                       type: string
 *                   downloadCount:
 *                     type: number
 *       503:
 *         description: Book service temporarily unavailable
 *       500:
 *         description: Server error
 *
 * /api/books/favorites:
 *   post:
 *     summary: Add a book to favorites
 *     description: Adds a book to the authenticated user's favorites list. Duplicate favorites are prevented.
 *     tags: [Favorites]
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
 *                 description: The Gutendex book ID
 *                 example: 84
 *             required:
 *               - bookId
 *     responses:
 *       201:
 *         description: Book added to favorites
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Book added to favorites"
 *       400:
 *         description: Invalid bookId or book already in favorites
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 *
 *   get:
 *     summary: Get user's favorite books
 *     description: Retrieves all favorite books for the authenticated user, sorted by most recently added.
 *     tags: [Favorites]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved favorites
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   userId:
 *                     type: string
 *                   bookId:
 *                     type: number
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 *
 * /api/books/favorites/{bookId}:
 *   delete:
 *     summary: Remove a book from favorites
 *     description: Removes a book from the authenticated user's favorites list.
 *     tags: [Favorites]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: number
 *         description: The Gutendex book ID to remove
 *         example: 84
 *     responses:
 *       200:
 *         description: Book removed from favorites
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Book removed from favorites"
 *       400:
 *         description: Invalid bookId
 *       404:
 *         description: Favorite not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 *
 * /api/books/{bookId}/reviews:
 *   get:
 *     summary: Get reviews for a book
 *     description: Retrieves all reviews for a specific book, with user info populated.
 *     tags: [Reviews]
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
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   userId:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       username:
 *                         type: string
 *                       displayName:
 *                         type: string
 *                       avatar:
 *                         type: string
 *                   bookId:
 *                     type: number
 *                   rating:
 *                     type: number
 *                   feedback:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *       400:
 *         description: Invalid bookId
 *       500:
 *         description: Server error
 *
 *   post:
 *     summary: Create a review for a book
 *     description: Adds a review for a specific book. Each user can only review a book once.
 *     tags: [Reviews]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: number
 *         description: The Gutendex book ID
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
 *
 * /api/books/reviews/{reviewId}:
 *   put:
 *     summary: Update a review
 *     description: Updates an existing review. Only the review owner can update it.
 *     tags: [Reviews]
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
 *
 *   delete:
 *     summary: Delete a review
 *     description: Deletes an existing review. Only the review owner can delete it.
 *     tags: [Reviews]
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
