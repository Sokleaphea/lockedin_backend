import nodemailer from "nodemailer";
import dotenv from "dotenv";
import sgMail from "@sendgrid/mail";
import { text } from "node:stream/consumers";
dotenv.config();
interface EmailOption {
    to: string,
    subject: string,
    text: string,
    html: string
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

export default async function sendEmail(options: EmailOption) {
    const msg = {
        to: options.to,
        from: process.env.EMAIL_FROM as string,
        subject: options.subject,
        text: options.text,
        html: options.html,
    }
    // const transporter = nodemailer.createTransport({
    //     service: "Gmail",
    //     auth: {
    //         user: process.env.EMAIL_USER,
    //         pass: process.env.EMAIL_PASS,
    //     },
    await sgMail.send(msg);

    // await transporter.sendMail({
    //     from: process.env.EMAIL_USER,
    //     to: options.to,
    //     subject: options.subject,
    //     text: options.text,
    //     html: options.html,
    // });
}