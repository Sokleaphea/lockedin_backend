import { Types } from "mongoose";

export const getUserId = () => {
  // return (req as any).user.id; // JWT later
  return new Types.ObjectId("64f000000000000000000001"); // TEMP
};
