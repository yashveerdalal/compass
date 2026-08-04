const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const sendVerificationEmail = require("../utils/sendEmail");

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { fullName, phone, email, password } = req.body;
    if (!fullName || !phone || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res
        .status(400)
        .json({ message: "An account with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24h

    const newUser = new User({
      fullName,
      phone,
      email,
      password: hashedPassword,
      verificationToken,
      verificationTokenExpires,
    });

    await newUser.save();
    await sendVerificationEmail(newUser.email, verificationToken);

    res.status(201).json({
      message:
        "🎉 Account created! Please check your email to verify your account before logging in.",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// VERIFY EMAIL  (clicked from an email link in the browser — redirect, don't return JSON)
router.get("/verify/:token", async (req, res) => {
  try {
    const user = await User.findOne({
      verificationToken: req.params.token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.redirect(
        `${process.env.CLIENT_URL}/frontend/index.html?verified=false`,
      );
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    return res.redirect(
      `${process.env.CLIENT_URL}/frontend/index.html?verified=true`,
    );
  } catch (err) {
    console.error("Verification error:", err);
    return res.redirect(
      `${process.env.CLIENT_URL}/frontend/index.html?verified=error`,
    );
  }
});

// RESEND VERIFICATION
router.post("/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });

    if (!user)
      return res
        .status(404)
        .json({ message: "No account found with that email." });
    if (user.isVerified)
      return res
        .status(400)
        .json({ message: "This account is already verified." });

    const verificationToken = crypto.randomBytes(32).toString("hex");
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    await sendVerificationEmail(user.email, verificationToken);
    res.json({
      message: "Verification email resent. Please check your inbox.",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });

    if (!user)
      return res.status(400).json({ message: "Invalid email or password." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password." });

    if (!user.isVerified) {
      return res
        .status(403)
        .json({ message: "Please verify your email before logging in." });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
