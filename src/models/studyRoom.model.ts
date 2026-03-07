import { Schema, model, Types } from "mongoose";

export interface IStudyRoom {
  _id: Types.ObjectId;
  name: string;
  roomId: string;
  creator: Types.ObjectId;
  participants: Types.ObjectId[];
  isActive: boolean;
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const studyRoomSchema = new Schema<IStudyRoom>(
  {
    name: { type: String, required: true, trim: true },
    roomId: { type: String, required: true, unique: true },
    creator: { type: Schema.Types.ObjectId, ref: "User", required: true },
    participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
    isActive: { type: Boolean, default: true },
    closedAt: { type: Date },
  },
  { timestamps: true }
);

export const StudyRoom = model<IStudyRoom>("StudyRoom", studyRoomSchema);
