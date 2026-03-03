import { Request, Response } from "express";
import { Types } from "mongoose";
import { GroupChat } from "../models/groupChat.model";
import User from "../models/user.model";
import { Follow } from "../models/follow.model";
import { streamServerClient } from "../config/stream";

interface CreateGroupBody {
    name: string;
    memberIds: string[];
}

interface BatchMembersBody {
    userIds: string[];
}

interface TransferOwnershipBody {
  newOwnerId: string;
}

interface RenameGroupBody {
  name: string;
}

/**
 * POST /api/groupchat
 * Create group
 */
export const createGroupChat = async (
    req: Request<{}, {}, CreateGroupBody>,
    res: Response) => {
    try {
        const ownerId = req.user!.id;
        const { name, memberIds } = req.body;

        if (!name || typeof name !== "string") {
            return res.status(400).json({ message: "Group name is required" });
        }

        if (!Array.isArray(memberIds)) {
            return res.status(400).json({ message: "memberIds must be an array" });
        }

        // Validate and deduplicate input IDs
        const uniqueMembers = Array.from(
            new Set(
                memberIds.filter(
                    (id: string) =>
                        Types.ObjectId.isValid(id) && id !== ownerId
                )
            )
        );

        const validMembers: string[] = [];

        for (const id of uniqueMembers) {
            const userExists = await User.findById(id);
            if (!userExists) continue;

            const isFollowing = await Follow.findOne({
                followerId: ownerId,
                followingId: id,
            });

            const isFollowedBack = await Follow.findOne({
                followerId: id,
                followingId: ownerId,
            });

            if (isFollowing && isFollowedBack) {
                validMembers.push(id);
            }
        }

        const group = await GroupChat.create({
            name,
            ownerId,
            memberIds: [ownerId, ...validMembers],
        });

        const channelId = `group-${group._id}`;

        const users = await User.find({
            _id: { $in: group.memberIds },
        }).select("username displayName avatar");

        await streamServerClient.upsertUsers(
            users.map((user) => ({
                id: user._id.toString(),
                name: user.displayName || user.username,
                image: user.avatar || undefined,
            }))
        );

        const channel = streamServerClient.channel(
            "messaging",
            channelId,
            {
                name,
                members: group.memberIds.map((id: any) => id.toString()),
                created_by_id: ownerId,
            } as any
        );

        await channel.create();

        return res.status(201).json({
            groupId: group._id,
            channelId,
        });
    } catch (error) {
        console.error("Create group error:", error);
        return res.status(500).json({ message: "Failed to create group" });
    }
};

/**
 * GET /api/groupchat
 * List user groups
 */
export const getUserGroups = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;

        const groups = await GroupChat.find({
            memberIds: userId,
        }).sort({ updatedAt: -1 });

        return res.status(200).json(
            groups.map((group) => ({
                groupId: group._id,
                name: group.name,
                ownerId: group.ownerId,
                memberCount: group.memberIds.length,
                createdAt: group.createdAt,
            }))
        );
    } catch (error) {
        console.error("Get groups error:", error);
        return res.status(500).json({ message: "Failed to fetch groups" });
    }
};

/**
 * GET /api/groupchat/:groupId
 * Get group details
 */
export const getGroupDetails = async (
  req: Request<{ groupId: string }>,
  res: Response) => {
    try {
        const userId = req.user!.id;
        const { groupId } = req.params;

        if (!Types.ObjectId.isValid(groupId)) {
            return res.status(400).json({ message: "Invalid group ID" });
        }

        const group = await GroupChat.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        const isMember = group.memberIds
            .map((id: any) => id.toString())
            .includes(userId);

        if (!isMember) {
            return res.status(403).json({ message: "Access denied" });
        }

        const members = await User.find({
            _id: { $in: group.memberIds },
        }).select("username displayName avatar");

        return res.status(200).json({
            groupId: group._id,
            name: group.name,
            ownerId: group.ownerId,
            members,
        });
    } catch (error) {
        console.error("Get group details error:", error);
        return res.status(500).json({ message: "Failed to fetch group details" });
    }
};

/**
 * POST /api/groupchat/:groupId/members
 * Batch add members (partial success)
 */
export const addGroupMembers = async (
    req: Request<{ groupId: string }, {}, BatchMembersBody>,
    res: Response) => {
    try {
        const ownerId = req.user!.id;
        const { groupId } = req.params;
        const { userIds } = req.body;

        if (!Types.ObjectId.isValid(groupId)) {
            return res.status(400).json({ message: "Invalid group ID" });
        }

        if (!Array.isArray(userIds)) {
            return res.status(400).json({ message: "userIds must be an array" });
        }

        const group = await GroupChat.findById(groupId);
        if (!group) return res.status(404).json({ message: "Group not found" });

        if (group.ownerId.toString() !== ownerId) {
            return res.status(403).json({ message: "Only owner can add members" });
        }

        const added: string[] = [];
        const failed: any[] = [];

        for (const id of userIds) {
            if (!Types.ObjectId.isValid(id)) {
                failed.push({ userId: id, reason: "invalid_id" });
                continue;
            }

            if (
                group.memberIds
                    .map((m: any) => m.toString())
                    .includes(id)
            ) {
                failed.push({ userId: id, reason: "already_member" });
                continue;
            }

            const userExists = await User.findById(id);
            if (!userExists) {
                failed.push({ userId: id, reason: "not_found" });
                continue;
            }

            const isFollowing = await Follow.findOne({
                followerId: ownerId,
                followingId: id,
            });

            const isFollowedBack = await Follow.findOne({
                followerId: id,
                followingId: ownerId,
            });

            if (!isFollowing || !isFollowedBack) {
                failed.push({ userId: id, reason: "not_mutual" });
                continue;
            }

            group.memberIds.push(id as any);
            added.push(id);
        }

        await group.save();

        if (added.length > 0) {
            const channel = streamServerClient.channel(
                "messaging",
                `group-${group._id}`
            );

            await channel.addMembers(added as string[]);
        }

        return res.status(200).json({ added, failed });
    } catch (error) {
        console.error("Add members error:", error);
        return res.status(500).json({ message: "Failed to add members" });
    }
};

/**
 * DELETE /api/groupchat/:groupId/members
 * Batch remove members (partial success)
 */
export const removeGroupMembers = async (
  req: Request<{ groupId: string }, {}, BatchMembersBody>,
  res: Response) => {
    try {
        const ownerId = req.user!.id;
        const { groupId } = req.params;
        const { userIds } = req.body;

        if (!Types.ObjectId.isValid(groupId)) {
            return res.status(400).json({ message: "Invalid group ID" });
        }

        if (!Array.isArray(userIds)) {
            return res.status(400).json({ message: "userIds must be an array" });
        }

        const group = await GroupChat.findById(groupId);
        if (!group) return res.status(404).json({ message: "Group not found" });

        if (group.ownerId.toString() !== ownerId) {
            return res.status(403).json({ message: "Only owner can remove members" });
        }

        const removed: string[] = [];
        const failed: any[] = [];

        for (const id of userIds) {
            if (!Types.ObjectId.isValid(id)) {
                failed.push({ userId: id, reason: "invalid_id" });
                continue;
            }

            if (group.ownerId.toString() === id) {
                failed.push({ userId: id, reason: "cannot_remove_owner" });
                continue;
            }

            const isMember = group.memberIds
                .map((m: any) => m.toString())
                .includes(id);

            if (!isMember) {
                failed.push({ userId: id, reason: "not_member" });
                continue;
            }

            group.memberIds = group.memberIds.filter(
                (m: any) => m.toString() !== id
            ) as any;

            removed.push(id);
        }

        await group.save();

        if (removed.length > 0) {
            const channel = streamServerClient.channel(
                "messaging",
                `group-${group._id}`
            );

            await channel.removeMembers(removed as string[]);
        }

        return res.status(200).json({ removed, failed });
    } catch (error) {
        console.error("Remove members error:", error);
        return res.status(500).json({ message: "Failed to remove members" });
    }
};

export const transferGroupOwnership = async (
  req: Request<{ groupId: string }, {}, TransferOwnershipBody>,
  res: Response
) => {
  try {
    const currentUserId = req.user!.id;
    const { groupId } = req.params;
    const { newOwnerId } = req.body;

    if (!Types.ObjectId.isValid(groupId) || !Types.ObjectId.isValid(newOwnerId)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const group = await GroupChat.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (group.ownerId.toString() !== currentUserId) {
      return res.status(403).json({ message: "Only owner can transfer ownership" });
    }

    const isMember = group.memberIds
      .map((m: any) => m.toString())
      .includes(newOwnerId);

    if (!isMember) {
      return res.status(400).json({ message: "New owner must be a group member" });
    }

    group.ownerId = newOwnerId as any;
    await group.save();

    return res.status(200).json({ message: "Ownership transferred" });
  } catch (error) {
    console.error("Transfer ownership error:", error);
    return res.status(500).json({ message: "Failed to transfer ownership" });
  }
};

export const leaveGroup = async (
  req: Request<{ groupId: string }>,
  res: Response
) => {
  try {
    const userId = req.user!.id;
    const { groupId } = req.params;

    if (!Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ message: "Invalid group ID" });
    }

    const group = await GroupChat.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const isMember = group.memberIds
      .map((m: any) => m.toString())
      .includes(userId);

    if (!isMember) {
      return res.status(400).json({ message: "Not a group member" });
    }

    // Owner leaving logic
    if (group.ownerId.toString() === userId) {
      if (group.memberIds.length > 1) {
        return res.status(400).json({
          message: "Owner must transfer ownership before leaving",
        });
      }
    }

    group.memberIds = group.memberIds.filter(
      (m: any) => m.toString() !== userId
    ) as any;

    await group.save();

    const channel = streamServerClient.channel(
      "messaging",
      `group-${group._id}`
    );

    await channel.removeMembers([userId]);

    return res.status(200).json({ message: "Left group successfully" });
  } catch (error) {
    console.error("Leave group error:", error);
    return res.status(500).json({ message: "Failed to leave group" });
  }
};

export const deleteGroup = async (
  req: Request<{ groupId: string }>,
  res: Response
) => {
  try {
    const userId = req.user!.id;
    const { groupId } = req.params;

    if (!Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ message: "Invalid group ID" });
    }

    const group = await GroupChat.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (group.ownerId.toString() !== userId) {
      return res.status(403).json({ message: "Only owner can delete group" });
    }

    await GroupChat.findByIdAndDelete(groupId);

    const channel = streamServerClient.channel(
      "messaging",
      `group-${groupId}`
    );

    await channel.delete();

    return res.status(200).json({ message: "Group deleted" });
  } catch (error) {
    console.error("Delete group error:", error);
    return res.status(500).json({ message: "Failed to delete group" });
  }
};

export const renameGroup = async (
  req: Request<{ groupId: string }, {}, RenameGroupBody>,
  res: Response
) => {
  try {
    const userId = req.user!.id;
    const { groupId } = req.params;
    const { name } = req.body;

    if (!name || typeof name !== "string") {
      return res.status(400).json({ message: "Invalid group name" });
    }

    const group = await GroupChat.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (group.ownerId.toString() !== userId) {
      return res.status(403).json({ message: "Only owner can rename group" });
    }

    group.name = name;
    await group.save();

    const channel = streamServerClient.channel(
      "messaging",
      `group-${groupId}`
    );

    await channel.update({ name } as any);

    return res.status(200).json({ message: "Group renamed" });
  } catch (error) {
    console.error("Rename group error:", error);
    return res.status(500).json({ message: "Failed to rename group" });
  }
};

