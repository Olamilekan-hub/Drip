// backend/controllers/userController.js
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// GET /users/me/:uid
export const getCurrentUser = async (req, res) => {
  console.log("getCurrentUser called", req.params);
  try {
    const user = await User.findOne({ uid: req.params.uid });
    console.log("User found:", user);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Error in getCurrentUser:", err);
    res.status(500).json({ error: err.message });
  }
};

// PUT /users/me/:uid
export const updateProfile = async (req, res) => {
  console.log("updateProfile called", req.params, req.body);
  try {
    const updated = await User.findOneAndUpdate(
      { uid: req.params.uid },
      req.body,
      { new: true }
    );
    console.log("Profile updated:", updated);
    res.json(updated);
  } catch (err) {
    console.error("Error in updateProfile:", err);
    res.status(400).json({ error: err.message });
  }
};

// GET /users/
export const getAllUsers = async (req, res) => {
  console.log("getAllUsers called");
  try {
    const users = await User.find();
    console.log("All users:", users);
    res.json(users);
  } catch (err) {
    console.error("Error in getAllUsers:", err);
    res.status(500).json({ error: err.message });
  }
};

// PATCH /users/:id/role
export const updateUserRole = async (req, res) => {
  console.log("updateUserRole called", req.params, req.body);
  try {
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { role: req.body.role },
      { new: true }
    );
    console.log("User role updated:", updated);
    res.json(updated);
  } catch (err) {
    console.error("Error in updateUserRole:", err);
    res.status(400).json({ error: err.message });
  }
};

// POST /users (register)
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, country, city, role } = req.body;
    if (!email || !password || !name) {
      return res
        .status(400)
        .json({ error: "Name, email, and password are required." });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "Email already in use." });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      country,
      city,
      role: role || "user",
      createdAt: new Date(),
    });
    // JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.status(201).json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /users/login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials." });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: "Invalid credentials." });
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /users/me (auth required)
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    // Ensure role is always present
    const userObj = user.toObject();
    if (!userObj.role) userObj.role = "user";
    res.json(userObj);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
