import { Router } from "express";
import {
  getActiveRooms,
  createRoom,
  joinRoom,
  leaveRoom,
} from "../controllers/studyRoom.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { generateJitsiToken } from "../controllers/jistsiToken.controller";

const router = Router();

router.use(authMiddleware);

router.get("/", getActiveRooms);
router.post("/", createRoom);
router.post("/:roomId/join", joinRoom);
router.post("/:roomId/leave", leaveRoom);
router.post("/jitsi-token", generateJitsiToken);

export default router;

/**
 * @swagger
 * /api/study-rooms:
 *   get:
 *     summary: Get all active study rooms
 *     description: |
 *       Retrieves a list of all currently active study rooms.
 *       
 *       Returns:
 *       - Room name
 *       - Unique room ID
 *       - Current participant count
 *     tags:
 *       - Study Rooms
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved active rooms
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     example: "Math Study Group"
 *                   roomId:
 *                     type: string
 *                     example: "study-a1b2c3d4-e5f6-7890-abcd-ef1234567890"
 *                   participantCount:
 *                     type: number
 *                     example: 5
 *       401:
 *         description: Unauthorized - missing or invalid JWT token
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to fetch study rooms"
 *
 *   post:
 *     summary: Create a new study room
 *     description: |
 *       Creates a new study room with the authenticated user as the creator and first participant.
 *       
 *       - Room ID is auto-generated using UUID v4
 *       - Creator is automatically added as the first participant
 *       - Room is marked as active by default
 *     tags:
 *       - Study Rooms
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the study room
 *                 example: "Physics Study Session"
 *             required:
 *               - name
 *     responses:
 *       201:
 *         description: Room created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   example: "Physics Study Session"
 *                 roomId:
 *                   type: string
 *                   example: "study-12345678-1234-1234-1234-123456789012"
 *                 participantCount:
 *                   type: number
 *                   example: 1
 *       400:
 *         description: Bad request - room name is required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Room name is required"
 *       401:
 *         description: Unauthorized - missing or invalid JWT token
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to create study room"
 *
 * /api/study-rooms/{roomId}/join:
 *   post:
 *     summary: Join an active study room
 *     description: |
 *       Adds the authenticated user to an existing study room.
 *       
 *       - Only active rooms can be joined
 *       - Maximum 10 participants per room
 *       - Duplicate joins are prevented (same user won't be added twice)
 *     tags:
 *       - Study Rooms
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique room identifier
 *         example: "study-12345678-1234-1234-1234-123456789012"
 *     responses:
 *       200:
 *         description: Successfully joined the room
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 roomId:
 *                   type: string
 *                   example: "study-12345678-1234-1234-1234-123456789012"
 *                 participantCount:
 *                   type: number
 *                   example: 4
 *       400:
 *         description: Room is full (max 10 participants)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Room is full (max 10 participants)"
 *       401:
 *         description: Unauthorized - missing or invalid JWT token
 *       404:
 *         description: Room not found or not active
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Room not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to join study room"
 *
 * /api/study-rooms/{roomId}/leave:
 *   post:
 *     summary: Leave a study room
 *     description: |
 *       Removes the authenticated user from a study room.
 *       
 *       - User is removed from the participants array
 *       - If the last participant leaves, the room is marked as inactive with a closedAt timestamp
 *       - Inactive rooms are automatically deleted after 5 minutes
 *     tags:
 *       - Study Rooms
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique room identifier
 *         example: "study-12345678-1234-1234-1234-123456789012"
 *     responses:
 *       200:
 *         description: Successfully left the room
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Successfully left the room"
 *       401:
 *         description: Unauthorized - missing or invalid JWT token
 *       404:
 *         description: Room not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Room not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to leave study room"
 */
