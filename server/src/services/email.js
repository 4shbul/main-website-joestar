const nodemailer = require("nodemailer");

const getTransporter = () => {
  if (!process.env.SMTP_HOST) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });
};

const sendResetEmail = async (email, token) => {
  const link = `${process.env.APP_URL || "http://localhost:5500"}/#reset-${token}`;
  const transporter = getTransporter();

  if (!transporter) {
    console.log(`[RESET] Email to ${email}: ${link}`);
    return;
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: "Reset Password Joestar Peptide",
    text: `Gunakan token ini untuk reset password: ${token}\nLink: ${link}`,
  });
};

module.exports = { sendResetEmail };
