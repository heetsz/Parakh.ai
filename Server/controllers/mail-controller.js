import sendMail from "../config/sendMail.js"

export const sendEmployeeMail = async (req, res) => {
  try {
    const { to, subject, text, html } = req.body
    if (!to) return res.status(400).json({ success: false, message: "Recipient email 'to' is required" })
    if (!subject) return res.status(400).json({ success: false, message: "Subject is required" })
    if (!text && !html) return res.status(400).json({ success: false, message: "Either 'text' or 'html' content is required" })

    await sendMail({ to, subject, text, html })

    return res.status(200).json({ success: true, message: "Email sent successfully" })
  } catch (error) {
    console.error("Error sending email:", error)
    return res.status(500).json({ success: false, message: "Failed to send email", error: error.message })
  }
}
