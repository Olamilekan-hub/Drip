// backend/routes/userRoutes.js
import express from "express";
import {
  registerUser,
  loginUser,
  getMe,
  updateMe,
  getAllUsers,
  updateUserRole,
  // Deprecated functions (kept for backward compatibility)
  getCurrentUser,
  updateProfile,
} from "../controllers/userController.js";
import verifyToken from "../middlewares/verifyToken.js";

const router = express.Router();

console.log("userRoutes loaded");

// Public routes (no authentication required)
router.post("/", registerUser);
router.post("/login", loginUser);

// Protected routes (authentication required)
router.get("/me", verifyToken, getMe);
router.put("/me", verifyToken, updateMe);

// Admin-only routes
router.get("/", verifyToken, (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}, getAllUsers);

router.patch("/:id/role", verifyToken, (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}, updateUserRole);

// Deprecated routes (kept for backward compatibility)
router.get("/me/:uid", (req, res, next) => {
  console.log("GET /me/:uid (deprecated)", req.params);
  next();
}, getCurrentUser);

router.put("/me/:uid", (req, res, next) => {
  console.log("PUT /me/:uid (deprecated)", req.params, req.body);
  next();
}, updateProfile);

export default router;