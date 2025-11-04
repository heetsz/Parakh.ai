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
            const mailData = {
                  from: `"Parakh.ai" <${process.env.EMAIL_USER}>`,
                  to,
                  subject,
                  text,
                  html,
            };

            // Explicitly wrap sendMail in a Promise using the callback API for
            // compatibility across Nodemailer versions / runtimes.
            const info = await new Promise((resolve, reject) => {
                  transporter.sendMail(mailData, (err, info) => {
                        if (err) {
                              console.error("Error sending email:", err);
                              return reject(err);
                        }
                        return resolve(info);
                  });
            });

            return info;
      } catch (error) {
            console.error("Error sending email:", error);
            throw error;
      }
}