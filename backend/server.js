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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`),
);
