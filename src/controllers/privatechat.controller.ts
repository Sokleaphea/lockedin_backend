import { Request, Response } from "express";
import { Types } from "mongoose";
import User from "../models/user.model";
import { Follow } from "../models/follow.model";
import { streamServerClient } from "../config/stream";
import { PrivateChat } from "../models/privateChat.model";


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

    // Mutual follow validation
    const [isFollowing, isFollowedBack] = await Promise.all([
      Follow.findOne({ followerId: currentUserId, followingId: targetId }),
      Follow.findOne({ followerId: targetId, followingId: currentUserId }),
    ]);

    if (!isFollowing || !isFollowedBack) {
      return res.status(403).json({
        message: "Private chat requires mutual follow",
      });
    }

    // Sort deterministically so member1 < member2 always
    const [member1, member2] = [currentUserId, targetId].sort((a, b) =>
      a.toString().localeCompare(b.toString())
    );

    const channelId = `private-${member1}-${member2}`;

    // findOneAndUpdate with upsert avoids any race condition duplicate inserts
    const privateChat = await PrivateChat.findOneAndUpdate(
      { member1, member2 },
      {
        $setOnInsert: {
          member1,
          member2,
          members: [member1, member2],
        },
      },
      { upsert: true, new: true }
    );

    // Upsert both users in Stream
    const users = await User.find({
      _id: { $in: [member1, member2] },
    }).select("username displayName avatar");

    await streamServerClient.upsertUsers(
      users.map((user) => ({
        id: user._id.toString(),
        name: user.displayName || user.username,
        image: user.avatar || undefined,
      }))
    );

    const channel = streamServerClient.channel("messaging", channelId, {
      members: [member1.toString(), member2.toString()],
      created_by_id: currentUserId.toString(),
    });

    await channel.create();

    return res.status(200).json({
      chatId: privateChat._id,
      channelId,
    });
  } catch (error) {
    console.error("Private channel error:", error);
    return res.status(500).json({
      message: "Failed to create private channel",
    });
  }
};

/**
 * GET /api/privatechat/chats
 * Returns all private chats for the authenticated user
 */
export const getPrivateChats = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = new Types.ObjectId(req.user!.id);

    const chats = await PrivateChat.find({
      members: userId,
    })
      .sort({ updatedAt: -1 })
      .lean();

    const formatted = chats.map((chat) => {
      const m1 = chat.member1.toString();
      const m2 = chat.member2.toString();
      const userIdStr = userId.toString();

      return {
        chatId: chat._id,
        channelId: `private-${m1}-${m2}`,
        otherUserId: m1 === userIdStr ? m2 : m1,
      };
    });

    return res.status(200).json(formatted);
  } catch (error) {
    console.error("Get private chats error:", error);
    return res.status(500).json({
      message: "Failed to fetch private chats",
    });
  }
};


// import { Request, Response } from "express";
// import { Types } from "mongoose";
// import User from "../models/user.model";
// import { Follow } from "../models/follow.model";
// import { streamServerClient } from "../config/stream";
// import { PrivateChat } from "../models/privateChat.model";


// /**
//  * POST /api/privatechat/token
//  * Generates Stream token for authenticated user
//  */
// export const generatePrivateChatToken = async (
//   req: Request,
//   res: Response
// ) => {
//   try {
//     const userId = new Types.ObjectId(req.user!.id);

//     const user = await User.findById(userId).select(
//       "username displayName avatar"
//     );

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Upsert user into Stream
//     await streamServerClient.upsertUser({
//       id: user._id.toString(),
//       name: user.displayName || user.username,
//       image: user.avatar || undefined,
//     });

//     const token = streamServerClient.createToken(user._id.toString());

//     return res.status(200).json({
//       token,
//       user: {
//         id: user._id,
//         name: user.displayName || user.username,
//         image: user.avatar || null,
//       },
//     });
//   } catch (error) {
//     console.error("Stream token error:", error);
//     return res.status(500).json({ message: "Failed to generate chat token" });
//   }
// };

// /**
//  * POST /api/privatechat/channel
//  * Creates or retrieves deterministic 1-on-1 private channel
//  */
// export const createPrivateChannel = async (
//   req: Request,
//   res: Response
// ) => {
//   try {
//     const currentUserId = new Types.ObjectId(req.user!.id);
//     const { targetUserId } = req.body;

//     if (!targetUserId || !Types.ObjectId.isValid(targetUserId)) {
//       return res.status(400).json({ message: "Invalid target user ID" });
//     }

//     const targetId = new Types.ObjectId(targetUserId);

//     if (currentUserId.equals(targetId)) {
//       return res.status(400).json({ message: "Cannot chat with yourself" });
//     }

//     const targetUser = await User.findById(targetId);
//     if (!targetUser) {
//       return res.status(404).json({ message: "Target user not found" });
//     }

//     // Mutual follow validation
//     const [isFollowing, isFollowedBack] = await Promise.all([
//       Follow.findOne({ followerId: currentUserId, followingId: targetId }),
//       Follow.findOne({ followerId: targetId, followingId: currentUserId }),
//     ]);

//     if (!isFollowing || !isFollowedBack) {
//       return res.status(403).json({
//         message: "Private chat requires mutual follow",
//       });
//     }

//     // Sort members deterministically
//     const sortedMembers = [currentUserId, targetId].sort((a, b) =>
//       a.toString().localeCompare(b.toString())
//     );

//     const sortedMemberStrings = sortedMembers.map((id) => id.toString());
//     const channelId = `private-${sortedMemberStrings[0]}-${sortedMemberStrings[1]}`;

//     // Check if private chat already exists in Mongo
//     let privateChat = await PrivateChat.findOne({
//       members: { $all: sortedMembers, $size: 2 },
//     });

//     if (!privateChat) {
//       privateChat = await PrivateChat.create({
//         members: sortedMembers,
//       });
//     }

//     // Upsert users in Stream
//     const users = await User.find({
//       _id: { $in: sortedMembers },
//     }).select("username displayName avatar");

//     await streamServerClient.upsertUsers(
//       users.map((user) => ({
//         id: user._id.toString(),
//         name: user.displayName || user.username,
//         image: user.avatar || undefined,
//       }))
//     );

//     const channel = streamServerClient.channel("messaging", channelId, {
//       members: sortedMemberStrings,
//       created_by_id: currentUserId.toString(),
//     });

//     await channel.create();

//     return res.status(200).json({
//       chatId: privateChat._id,
//       channelId,
//     });
//   } catch (error) {
//     console.error("Private channel error:", error);
//     return res.status(500).json({
//       message: "Failed to create private channel",
//     });
//   }
// };

// /**
//  * GET /api/privatechat/chats
//  * Returns all private chats for the authenticated user
//  */
// export const getPrivateChats = async (
//   req: Request,
//   res: Response
// ) => {
//   try {
//     const userId = new Types.ObjectId(req.user!.id);

//     const chats = await PrivateChat.find({
//       members: userId,
//     })
//       .sort({ updatedAt: -1 })
//       .lean();

//     const formatted = chats.map((chat) => {
//       // Re-sort members to guarantee channelId matches the one created in createPrivateChannel
//       const sortedMembers = chat.members
//         .map((m) => m.toString())
//         .sort((a, b) => a.localeCompare(b));

//       const otherUserId = sortedMembers.find(
//         (memberId) => memberId !== userId.toString()
//       );

//       return {
//         chatId: chat._id,
//         channelId: `private-${sortedMembers[0]}-${sortedMembers[1]}`,
//         otherUserId,
//       };
//     });

//     return res.status(200).json(formatted);
//   } catch (error) {
//     console.error("Get private chats error:", error);
//     return res.status(500).json({
//       message: "Failed to fetch private chats",
//     });
//   }
// };

// // import { Request, Response } from "express";
// // import { Types } from "mongoose";
// // import User from "../models/user.model";
// // import { Follow } from "../models/follow.model";
// // import { streamServerClient } from "../config/stream";
// // import { PrivateChat } from "../models/privateChat.model";


// // /**
// //  * POST /api/privatechat/token
// //  * Generates Stream token for authenticated user
// //  */
// // export const generatePrivateChatToken = async (
// //   req: Request,
// //   res: Response
// // ) => {
// //   try {
// //     const userId = new Types.ObjectId(req.user!.id);

// //     const user = await User.findById(userId).select(
// //       "username displayName avatar"
// //     );

// //     if (!user) {
// //       return res.status(404).json({ message: "User not found" });
// //     }

// //     // Upsert user into Stream
// //     await streamServerClient.upsertUser({
// //       id: user._id.toString(),
// //       name: user.displayName || user.username,
// //       image: user.avatar || undefined,
// //     });

// //     const token = streamServerClient.createToken(user._id.toString());

// //     return res.status(200).json({
// //       token,
// //       user: {
// //         id: user._id,
// //         name: user.displayName || user.username,
// //         image: user.avatar || null,
// //       },
// //     });
// //   } catch (error) {
// //     console.error("Stream token error:", error);
// //     return res.status(500).json({ message: "Failed to generate chat token" });
// //   }
// // };

// // /**
// //  * POST /api/privatechat/channel
// //  * Creates or retrieves deterministic 1-on-1 private channel
// //  */
// // export const createPrivateChannel = async (
// //   req: Request,
// //   res: Response
// // ) => {
// //   try {
// //     const currentUserId = new Types.ObjectId(req.user!.id);
// //     const { targetUserId } = req.body;

// //     if (!targetUserId || !Types.ObjectId.isValid(targetUserId)) {
// //       return res.status(400).json({ message: "Invalid target user ID" });
// //     }

// //     const targetId = new Types.ObjectId(targetUserId);

// //     if (currentUserId.equals(targetId)) {
// //       return res.status(400).json({ message: "Cannot chat with yourself" });
// //     }

// //     const targetUser = await User.findById(targetId);
// //     if (!targetUser) {
// //       return res.status(404).json({ message: "Target user not found" });
// //     }

// //     // Mutual follow validation
// //     const isFollowing = await Follow.findOne({
// //       followerId: currentUserId,
// //       followingId: targetId,
// //     });

// //     const isFollowedBack = await Follow.findOne({
// //       followerId: targetId,
// //       followingId: currentUserId,
// //     });

// //     if (!isFollowing || !isFollowedBack) {
// //       return res.status(403).json({
// //         message: "Private chat requires mutual follow",
// //       });
// //     }

// //     // Sort members deterministically
// //     const sortedMembers = [
// //       currentUserId,
// //       targetId,
// //     ].sort((a, b) => a.toString().localeCompare(b.toString()));

// //     // Check if private chat already exists in Mongo
// //     let privateChat = await PrivateChat.findOne({
// //       members: sortedMembers,
// //     });

// //     if (!privateChat) {
// //       privateChat = await PrivateChat.create({
// //         members: sortedMembers,
// //       });
// //     }

// //     const channelId = `private-${sortedMembers[0]}-${sortedMembers[1]}`;

// //     // Upsert users in Stream
// //     const users = await User.find({
// //       _id: { $in: sortedMembers },
// //     }).select("username displayName avatar");

// //     await streamServerClient.upsertUsers(
// //       users.map((user) => ({
// //         id: user._id.toString(),
// //         name: user.displayName || user.username,
// //         image: user.avatar || undefined,
// //       }))
// //     );

// //     const channel = streamServerClient.channel("messaging", channelId, {
// //       members: sortedMembers.map((id) => id.toString()),
// //       created_by_id: currentUserId.toString(),
// //     });

// //     await channel.create();

// //     return res.status(200).json({
// //       chatId: privateChat._id,
// //       channelId,
// //     });
// //   } catch (error) {
// //     console.error("Private channel error:", error);
// //     return res.status(500).json({
// //       message: "Failed to create private channel",
// //     });
// //   }
// // };

// // export const getPrivateChats = async (
// //   req: Request,
// //   res: Response
// // ) => {
// //   try {
// //     const userId = new Types.ObjectId(req.user!.id);

// //     const chats = await PrivateChat.find({
// //       members: userId,
// //     })
// //       .sort({ updatedAt: -1 })
// //       .lean();

// //     const formatted = chats.map((chat) => {
// //       const members = chat.members.map((m) => m.toString());

// //       const otherUserId = members.find(
// //         (memberId) => memberId !== userId.toString()
// //       );

// //       return {
// //         chatId: chat._id,
// //         channelId: `private-${members[0]}-${members[1]}`,
// //         otherUserId,
// //       };
// //     });

// //     return res.status(200).json(formatted);
// //   } catch (error) {
// //     console.error("Get private chats error:", error);
// //     return res.status(500).json({
// //       message: "Failed to fetch private chats",
// //     });
// //   }
// // };