const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  family: 4,
});

const sendVerificationEmail = async (to, token) => {
  const verifyUrl = `https://compass-riu7.onrender.com/api/auth/verify/${token}`;
  await transporter.sendMail({
    from: `"Compass 🧭" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Verify your Compass account",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px;">
        <h2 style="color:#0d9488;">🧭 Welcome to Compass</h2>
        <p>Please confirm your email address to activate your account.</p>
        <a href="${verifyUrl}" style="display:inline-block; background:#0d9488; color:#062e2b; padding:12px 22px; border-radius:999px; text-decoration:none; font-weight:bold; margin-top:12px;">
          Verify Email
        </a>
        <p style="margin-top:20px; color:#888; font-size:0.85rem;">This link expires in 24 hours. If you didn't sign up, you can ignore this email.</p>
      </div>
    `,
  });
};

module.exports = sendVerificationEmail;
