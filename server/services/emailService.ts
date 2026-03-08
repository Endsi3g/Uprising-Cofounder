import nodemailer from "nodemailer";

export const sendEmail = async (to: string, subject: string, text: string, html?: string) => {
  // Note: For production, we assume environment variables SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
  // For development (if these are not set), we can log the email instead or use a testing service like Ethereal or Mailtrap.

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.ethereal.email",
      port: parseInt(process.env.SMTP_PORT || "587", 10),
      auth: {
        user: process.env.SMTP_USER || "ethereal-user",
        pass: process.env.SMTP_PASS || "ethereal-pass",
      }
    });

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Uprising Cofounder" <noreply@uprising-cofounder.com>',
      to,
      subject,
      text,
      html: html || text,
    });

    console.log("Message sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};
