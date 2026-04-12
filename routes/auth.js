// routes/auth.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.js";

const router = express.Router();

function dbReady() {
  return mongoose.connection.readyState === 1;
}

// Signup
router.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  if (!process.env.JWT_SECRET) {
    console.error("auth: JWT_SECRET is not set on the server");
    return res.status(503).json({ msg: "Server misconfiguration (JWT_SECRET missing). Set it in Render Environment." });
  }
  if (!dbReady()) {
    console.error("auth: MongoDB not connected, readyState=", mongoose.connection.readyState);
    return res.status(503).json({ msg: "Database unavailable. Check MONGODB_URI on Render and redeploy." });
  }
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ msg: "User created successfully" });
  } catch (err) {
    console.error("signup error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!process.env.JWT_SECRET) {
    console.error("auth: JWT_SECRET is not set on the server");
    return res.status(503).json({ msg: "Server misconfiguration (JWT_SECRET missing). Set it in Render Environment." });
  }
  if (!dbReady()) {
    console.error("auth: MongoDB not connected, readyState=", mongoose.connection.readyState);
    return res.status(503).json({ msg: "Database unavailable. Check MONGODB_URI on Render and redeploy." });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials!" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ id: String(user._id) }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token });
  } catch (err) {
    console.error("login error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;
