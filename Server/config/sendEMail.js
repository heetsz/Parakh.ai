import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";
dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");

// Expected usage: sendMail({ to, subject, text, html })
export default async function sendMail({ to, subject, text, html }) {
      if (!to || (typeof to === "string" && !to.trim())) {
            console.error("❌ SendGrid error: 'to' email is missing or empty");
            throw new Error("Missing 'to' email address");
      }
      const fromEmail = process.env.FROM_EMAIL;
      if (!fromEmail) {
            console.error("❌ SendGrid error: FROM_EMAIL env is not set");
            throw new Error("Missing FROM_EMAIL env var");
      }

      const msg = {
            to,
            from: fromEmail,
            subject: subject || "Parakh.ai Notification",
            text: text || "",
            html: html || "",
      };

      try {
            await sgMail.send(msg);
            console.log("📧 Email sent! to:", to);
            return true;
      } catch (error) {
            const detail = error?.response?.body || error?.message || error;
            console.error("❌ SendGrid error:", detail);
            throw error;
      }
}
