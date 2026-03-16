import cron from "node-cron";
import User from "../models/user.model";
import { Todo } from "../models/todo.model";
import { FlashcardCardModel } from "../models/flashcardCard.model";
import { cloudinary } from "../config/cloudinary";


export const deleteAccountsCron = () => {
    cron.schedule("* * * * *", async () => {
        // const sevenDaysAgo = new Date(Date.now() - 7*24*60*60*1000);
        const sevenDaysAgo = new Date(Date.now() - 14*60*1000);
        const users = await User.find({ deletedAt: { $lte: sevenDaysAgo } });
    
        for (const user of users) {
            if (user.avatarPublicId) await cloudinary.uploader.destroy(user.avatarPublicId);
            await Todo.deleteMany({ userId: user._id});
            await FlashcardCardModel.deleteMany({ userId: user._id });
            await User.findByIdAndDelete(user._id);
            console.log(`Permanently deleted user ${user._id}`);
        }
    });
};