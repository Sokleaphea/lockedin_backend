import mongoose, { Schema, model } from "mongoose";

const userSchema = new Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: false,
        },
        username: {
            type: String,
            required: true,
        },
        googleId: {
            type: String,
            unique: true,
            sparse: true,
        },
        displayName: {
            type: String,
            maxLength: 50,
        },
        avatar: {
            type: String,
        },
        bio: {
            type: String,
            maxLength: 160,
            default: "",
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        resetOTP: {
            type: String,
        },
        resetOTPExpires: {
            type: Date,
        }
    },
    { timestamps: true}
)
userSchema.pre("save", function () {
  if (!this.displayName) {
    this.displayName = this.username;
  }
});
export default model("User", userSchema);