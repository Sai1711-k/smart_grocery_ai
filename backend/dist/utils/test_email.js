"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
async function testEmail() {
    try {
        const transporter = nodemailer_1.default.createTransport({
            host: process.env.EMAIL_HOST,
            port: Number(process.env.EMAIL_PORT),
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
        console.log(`Connecting to ${process.env.EMAIL_HOST}:${process.env.EMAIL_PORT} with user ${process.env.EMAIL_USER}...`);
        const info = await transporter.sendMail({
            from: `"Grocery App Admin" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER, // sending to themselves to test
            subject: "Test Email from Grocery Backend",
            text: "If you are reading this, the Gmail SMTP configuration works perfectly!",
            html: "<b>If you are reading this, the Gmail SMTP configuration works perfectly!</b>"
        });
        console.log("Success! Message sent: %s", info.messageId);
    }
    catch (error) {
        console.error("Failed to send email:", error);
    }
}
testEmail();
