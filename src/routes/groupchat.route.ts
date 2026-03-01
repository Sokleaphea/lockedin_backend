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
 *   description: |
 *     Group chat management and access control.
 *     
 *     Architecture:
 *     - Group metadata is stored in MongoDB.
 *     - Messages are handled by Stream Chat.
 *     - Only authenticated users can interact with group endpoints.
 *     
 *     Business Rules:
 *     - A group always has exactly one owner.
 *     - Owner is automatically included as a member.
 *     - Mutual follow is required only when adding members.
 *     - Members do NOT need to be mutual with each other.
 *     - Owner must transfer ownership before leaving (unless sole member).
 */

/**
 * @swagger
 * /api/groupchat:
 *   post:
 *     summary: Create a new group chat
 *     description: |
 *       Creates a new group chat.
 *
 *       Behavior:
 *       - Authenticated user becomes the group owner.
 *       - Owner is automatically added to the member list.
 *       - memberIds may be empty (group can initially contain only the owner).
 *       - All provided members must mutually follow the owner.
 *       - Invalid or non-mutual users are silently ignored during creation.
 *
 *       A corresponding Stream channel is created with ID:
 *       group-{groupId}
 *
 *     tags:
 *       - GroupChat
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
 *                 example: "Backend Study Group"
 *               memberIds:
 *                 type: array
 *                 description: Initial members (must be mutual with owner)
 *                 items:
 *                   type: string
 *                   example: "698808a9fa68c908e9240d8a"
 *             required:
 *               - name
 *               - memberIds
 *     responses:
 *       201:
 *         description: Group created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 groupId:
 *                   type: string
 *                 channelId:
 *                   type: string
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/groupchat:
 *   get:
 *     summary: Get all groups for authenticated user
 *     description: |
 *       Returns all groups where the authenticated user is a member.
 *
 *       Sorted by most recently updated.
 *
 *       Does NOT return full member list.
 *       Use GET /api/groupchat/{groupId} for detailed info.
 *     tags:
 *       - GroupChat
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved groups
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   groupId:
 *                     type: string
 *                   name:
 *                     type: string
 *                   ownerId:
 *                     type: string
 *                   memberCount:
 *                     type: number
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/groupchat/{groupId}:
 *   get:
 *     summary: Get group details
 *     description: |
 *       Returns full group metadata including member profile data.
 *
 *       Access Control:
 *       - Only group members can access this endpoint.
 *       - Unauthorized users receive 403.
 *     tags:
 *       - GroupChat
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
 *         description: Group details retrieved
 *       403:
 *         description: Access denied (not a member)
 *       404:
 *         description: Group not found
 */

/**
 * @swagger
 * /api/groupchat/{groupId}/members:
 *   post:
 *     summary: Batch add members
 *     description: |
 *       Adds multiple members to a group.
 *
 *       Rules:
 *       - Only the group owner can add members.
 *       - Each user must:
 *         • Exist
 *         • Not already be a member
 *         • Mutually follow the owner
 *
 *       Partial Success Model:
 *       - Valid users are added.
 *       - Invalid users are returned in `failed` array with reason.
 *
 *       Stream membership is updated automatically.
 *     tags:
 *       - GroupChat
 *     security:
 *       - BearerAuth: []
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
 *         description: Members processed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 added:
 *                   type: array
 *                   items:
 *                     type: string
 *                 failed:
 *                   type: array
 *       403:
 *         description: Only owner can add members
 */

/**
 * @swagger
 * /api/groupchat/{groupId}/members:
 *   delete:
 *     summary: Batch remove members
 *     description: |
 *       Removes multiple members from the group.
 *
 *       Rules:
 *       - Only owner can remove members.
 *       - Owner cannot remove themselves.
 *
 *       Partial Success Model:
 *       - Valid removals processed.
 *       - Invalid removals returned in `failed` array.
 *
 *       Stream membership updated automatically.
 *     tags:
 *       - GroupChat
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Members processed
 *       403:
 *         description: Only owner can remove members
 */

/**
 * @swagger
 * /api/groupchat/{groupId}/transfer:
 *   patch:
 *     summary: Transfer group ownership
 *     description: |
 *       Transfers ownership to another existing group member.
 *
 *       Rules:
 *       - Only current owner can transfer.
 *       - New owner must already be a member.
 *       - Mutual follow is NOT revalidated.
 *     tags:
 *       - GroupChat
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Ownership transferred
 *       403:
 *         description: Only owner allowed
 */

/**
 * @swagger
 * /api/groupchat/{groupId}/leave:
 *   post:
 *     summary: Leave group
 *     description: |
 *       Allows a member to leave a group.
 *
 *       Rules:
 *       - Regular members can leave freely.
 *       - Owner must transfer ownership first unless sole member.
 *       - Stream membership updated automatically.
 *     tags:
 *       - GroupChat
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully left group
 *       400:
 *         description: Owner must transfer first
 */

/**
 * @swagger
 * /api/groupchat/{groupId}:
 *   delete:
 *     summary: Delete group
 *     description: |
 *       Permanently deletes a group.
 *
 *       Rules:
 *       - Only owner can delete.
 *       - Mongo record is removed.
 *       - Corresponding Stream channel is deleted.
 *     tags:
 *       - GroupChat
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Group deleted
 *       403:
 *         description: Only owner allowed
 */

/**
 * @swagger
 * /api/groupchat/{groupId}/rename:
 *   patch:
 *     summary: Rename group
 *     description: |
 *       Updates the group's display name.
 *
 *       Rules:
 *       - Only owner can rename.
 *       - Mongo and Stream channel metadata are updated.
 *     tags:
 *       - GroupChat
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Group renamed
 *       403:
 *         description: Only owner allowed
 */

export default router;