require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const itemRoutes = require("./routes/items");
const authRoutes = require("./routes/auth"); // NEW
const app = express();
connectDB();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/items", itemRoutes);
app.use("/api/auth", authRoutes); // NEW
app.get("/", (req, res) => res.send("Compass API is running 🧭"));

// TEMPORARY DEBUG ROUTE — remove after diagnosing email issue
app.get("/debug-email-test", async (req, res) => {
  const nodemailer = require("nodemailer");
  const t = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    family: 4,
  });
  try {
    const info = await t.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "Compass debug test",
      text: "This is a test email from the debug route.",
    });
    res.json({ success: true, info });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
      code: err.code,
      command: err.command,
    });
  }
});
// END TEMPORARY DEBUG ROUTE

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`),
);
