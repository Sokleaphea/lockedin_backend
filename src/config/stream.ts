import { StreamChat } from "stream-chat";

if (!process.env.STREAM_API_KEY || !process.env.STREAM_API_SECRET) {
  throw new Error("Stream API credentials are missing");
}

export const streamServerClient = StreamChat.getInstance(
  process.env.STREAM_API_KEY,
  process.env.STREAM_API_SECRET
);