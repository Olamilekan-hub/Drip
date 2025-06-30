// backend/routes/userRoutes.js
import express from "express";
import {
  registerUser,
  loginUser,
  getMe,
  getCurrentUser,
  updateProfile,
  getAllUsers,
  updateUserRole,
} from "../controllers/userController.js";
import verifyToken from "../middlewares/verifyToken.js";

const router = express.Router();

console.log("userRoutes loaded");

// Registration and login
router.post("/", registerUser);
router.post("/login", loginUser);

// Authenticated user profile
router.get(
  "/me",
  verifyToken,
  (req, res, next) => {
    console.log("GET /me", req.user);
    next();
  },
  getMe
);
router.get(
  "/me/:uid",
  (req, res, next) => {
    console.log("GET /me/:uid", req.params);
    next();
  },
  getCurrentUser
);
router.put(
  "/me/:uid",
  (req, res, next) => {
    console.log("PUT /me/:uid", req.params, req.body);
    next();
  },
  updateProfile
);

// Admin-only
router.get(
  "/",
  (req, res, next) => {
    console.log("GET /users");
    next();
  },
  getAllUsers
);
router.patch(
  "/:id/role",
  (req, res, next) => {
    console.log("PATCH /:id/role", req.params, req.body);
    next();
  },
  updateUserRole
);

export default router;
