import { Request, Response } from "express";
import { Types } from "mongoose";
import User from "../models/user.model";
import { Follow } from "../models/follow.model";
import { streamServerClient } from "../config/stream";

/**
 * POST /api/privatechat/token
 * Generates Stream token for authenticated user
 */
export const generatePrivateChatToken = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = new Types.ObjectId(req.user!.id);

    const user = await User.findById(userId).select(
      "username displayName avatar"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Upsert user into Stream
    await streamServerClient.upsertUser({
      id: user._id.toString(),
      name: user.displayName || user.username,
      image: user.avatar || undefined,
    });

    const token = streamServerClient.createToken(user._id.toString());

    return res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.displayName || user.username,
        image: user.avatar || null,
      },
    });
  } catch (error) {
    console.error("Stream token error:", error);
    return res.status(500).json({ message: "Failed to generate chat token" });
  }
};

/**
 * POST /api/privatechat/channel
 * Creates or retrieves deterministic 1-on-1 private channel
 */
export const createPrivateChannel = async (
  req: Request,
  res: Response
) => {
  try {
    const currentUserId = new Types.ObjectId(req.user!.id);
    const { targetUserId } = req.body;

    if (!targetUserId || !Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({ message: "Invalid target user ID" });
    }

    const targetId = new Types.ObjectId(targetUserId);

    if (currentUserId.equals(targetId)) {
      return res.status(400).json({ message: "Cannot chat with yourself" });
    }

    const targetUser = await User.findById(targetId);
    if (!targetUser) {
      return res.status(404).json({ message: "Target user not found" });
    }

    // 🔐 Mutual follow validation
    const isFollowing = await Follow.findOne({
      followerId: currentUserId,
      followingId: targetId,
    });

    const isFollowedBack = await Follow.findOne({
      followerId: targetId,
      followingId: currentUserId,
    });

    if (!isFollowing || !isFollowedBack) {
      return res.status(403).json({
        message: "Private chat requires mutual follow",
      });
    }

    // Deterministic channel ID
    const ids = [
      currentUserId.toString(),
      targetId.toString(),
    ].sort();

    const channelId = `private-${ids[0]}-${ids[1]}`;

    // const channel = streamServerClient.channel("messaging", channelId, {
    //   members: ids,
    //   created_by_id: currentUserId.toString(),
    // });

    // await channel.create();

    // Upsert both users to Stream first
    const currentUser = await User.findById(currentUserId).select(
      "username displayName avatar"
    );

    const targetUserFull = await User.findById(targetId).select(
      "username displayName avatar"
    );

    await streamServerClient.upsertUsers([
      {
        id: currentUser!._id.toString(),
        name: currentUser!.displayName || currentUser!.username,
        image: currentUser!.avatar || undefined,
      },
      {
        id: targetUserFull!._id.toString(),
        name: targetUserFull!.displayName || targetUserFull!.username,
        image: targetUserFull!.avatar || undefined,
      },
    ]);

    const channel = streamServerClient.channel("messaging", channelId, {
      members: ids,
      created_by_id: currentUserId.toString(),
    });

    await channel.create();
    // await channel.create({ skip_push: true });

    return res.status(200).json({
      channelId,
    });
  } catch (error) {
    console.error("Private channel error:", error);
    // console.error("Private channel error:", error.response?.data || error);
    return res.status(500).json({
      message: "Failed to create private channel",
    });
  }
};