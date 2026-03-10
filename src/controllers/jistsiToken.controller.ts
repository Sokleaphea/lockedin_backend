import { Request, Response } from "express";
import jwt from "jsonwebtoken";

export const generateJitsiToken = (req: Request, res: Response) => {
  try {
    const { roomId, displayName, email } = req.body;
    const userId = req.user!.id;

    const appId = process.env.JAAS_APP_ID;
    const apiKeyId = process.env.JAAS_API_KEY_ID;
    const privateKey = process.env.JAAS_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (!appId || !apiKeyId || !privateKey) {
      return res.status(500).json({
        message: `Missing config: appId=${!!appId}, apiKeyId=${!!apiKeyId}, privateKey=${!!privateKey}`,
      });
    }

    const payload = {
      aud: "jitsi",
      iss: "chat",
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
      nbf: Math.floor(Date.now() / 1000) - 10,
      room: roomId || "*",
      sub: appId,
      context: {
        user: {
          id: userId,
          name: displayName,
          email: email,
          moderator: "true",
          "hidden-from-recorder": "false",
        },
        features: {
          livestreaming: false,
          recording: false,
          transcription: false,
          "outbound-call": false,
        },
      },
    };

    const token = jwt.sign(payload, privateKey, {
      algorithm: "RS256",
      keyid: apiKeyId,
    });

    return res.json({ token });
  } catch (error) {
    console.error("Jitsi token error:", error);
    return res
      .status(500)
      .json({ message: `Failed to generate token: ${String(error)}` });
  }
};