import { response } from "express";
import { firebaseMessaging } from "../config/firebase";

export const sendPushNotification = async (
    token: string,
    title: string,
    body: string,
) => {
    try {
        const response = await firebaseMessaging.send({
            token,
            notification:  {
                title,
                body,
            },
        });
        console.log("Notification sent:", response);
    } catch (error) {
        console.log("Notification error:", error)
    }
};