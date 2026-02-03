import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
interface EmailOption {
    to: string,
    subject: string,
    text: string,
}

export default async function sendEmail(options: EmailOption) {
    const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: options.to,
        subject: options.subject,
        text: options.text,
    });
}