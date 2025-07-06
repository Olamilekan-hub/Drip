// backend/routes/contentRoutes.js
import express from "express";
import {
  getContentSettings,
  updateContentSettings,
} from "../controllers/contentController.js";
import verifyToken from "../middlewares/verifyToken.js";

const router = express.Router();

console.log("contentRoutes loaded");

// Public route to get content settings
router.get("/", (req, res, next) => {
  console.log("GET /content");
  next();
}, getContentSettings);

// Protected route to update content settings (admin only)
router.put("/", verifyToken, (req, res, next) => {
  console.log("PUT /content", req.body);
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}, updateContentSettings);

export default router;