import { Schema, model } from "mongoose";

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
        },
        avatar: {
            type: String,
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

export default model("User", userSchema);