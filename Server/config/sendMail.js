import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();


const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465, 
      secure: true, 
      auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS, 
      },
});

export default async function sendMail({ to, subject, text, html }) {
      try {
            const info = await transporter.sendMail({
                  from: `"Parakh.AI" <${process.env.EMAIL_USER}>`,
                  to,
                  subject,
                  text,
                  html,
            });
            return info;
      } catch (error) {
            console.error("Error sending email:", error);
            throw error;
      }
}
