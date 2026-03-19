import { Schema, model, Types } from "mongoose";

const privateChatSchema = new Schema(
  {
    members: {
      type: [Types.ObjectId],
      required: true,
      validate: {
        validator: function (value: Types.ObjectId[]) {
          return value.length === 2;
        },
        message: "Private chat must have exactly 2 members",
      },
    },
    // Store the sorted pair as separate fields for reliable unique indexing
    member1: {
      type: Types.ObjectId,
      required: true,
    },
    member2: {
      type: Types.ObjectId,
      required: true,
    },
  },
  { timestamps: true }
);

// Unique index on the sorted pair — this is the correct way to enforce
// one chat per user pair. member1 is always the lexicographically smaller ID.
privateChatSchema.index({ member1: 1, member2: 1 }, { unique: true });

export const PrivateChat = model("PrivateChat", privateChatSchema);


// import { Schema, model, Types } from "mongoose";

// const privateChatSchema = new Schema(
//   {
//     members: {
//       type: [Types.ObjectId],
//       required: true,
//       validate: {
//         validator: function (value: Types.ObjectId[]) {
//           return value.length === 2;
//         },
//         message: "Private chat must have exactly 2 members",
//       },
//     },
//   },
//   { timestamps: true }
// );

// // Ensure uniqueness of pair (sorted order stored)
// privateChatSchema.index({ members: 1 }, { unique: true });

// export const PrivateChat = model("PrivateChat", privateChatSchema);