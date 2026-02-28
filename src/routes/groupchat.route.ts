import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  createGroupChat,
  getUserGroups,
  getGroupDetails,
  addGroupMembers,
  removeGroupMembers,
  transferGroupOwnership,
  leaveGroup,
  deleteGroup,
  renameGroup,
} from "../controllers/groupchat.controller";

const router = Router();

router.use(authMiddleware);

router.post("/", createGroupChat);
router.get("/", getUserGroups);
router.get("/:groupId", getGroupDetails);
router.post("/:groupId/members", addGroupMembers);
router.delete("/:groupId/members", removeGroupMembers);
router.patch("/:groupId/transfer", transferGroupOwnership);
router.post("/:groupId/leave", leaveGroup);
router.delete("/:groupId", deleteGroup);
router.patch("/:groupId/rename", renameGroup);


/**
 * @swagger
 * tags:
 *   name: GroupChat
 *   description: Group chat management and access control
 */

/**
 * @swagger
 * /api/groupchat:
 *   post:
 *     summary: Create a new group chat
 *     tags: [GroupChat]
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
 *               memberIds:
 *                 type: array
 *                 items:
 *                   type: string
 *             required:
 *               - name
 *               - memberIds
 *     responses:
 *       201:
 *         description: Group created successfully
 */

/**
 * @swagger
 * /api/groupchat:
 *   get:
 *     summary: Get all groups for authenticated user
 *     tags: [GroupChat]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of groups
 */

/**
 * @swagger
 * /api/groupchat/{groupId}:
 *   get:
 *     summary: Get group details (members only)
 *     tags: [GroupChat]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Group details
 *       403:
 *         description: Access denied
 *       404:
 *         description: Group not found
 */

/**
 * @swagger
 * /api/groupchat/{groupId}/members:
 *   post:
 *     summary: Batch add members (owner only)
 *     tags: [GroupChat]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Members added (partial success model)
 */

/**
 * @swagger
 * /api/groupchat/{groupId}/members:
 *   delete:
 *     summary: Batch remove members (owner only)
 *     tags: [GroupChat]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Members removed (partial success model)
 */

/**
 * @swagger
 * /api/groupchat/{groupId}/transfer:
 *   patch:
 *     summary: Transfer ownership (owner only)
 *     tags: [GroupChat]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newOwnerId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Ownership transferred
 */

/**
 * @swagger
 * /api/groupchat/{groupId}/leave:
 *   post:
 *     summary: Leave group
 *     tags: [GroupChat]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Left group successfully
 */

/**
 * @swagger
 * /api/groupchat/{groupId}:
 *   delete:
 *     summary: Delete group (owner only)
 *     tags: [GroupChat]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Group deleted
 */

/**
 * @swagger
 * /api/groupchat/{groupId}/rename:
 *   patch:
 *     summary: Rename group (owner only)
 *     tags: [GroupChat]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Group renamed
 */

export default router;