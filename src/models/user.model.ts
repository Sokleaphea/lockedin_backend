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
            required: true,
        },
        username: {
            type: String,
            required: true,
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