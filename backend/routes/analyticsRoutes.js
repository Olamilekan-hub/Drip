// backend/routes/analyticsRoutes.js
import express from "express";
import { getAnalytics } from "../controllers/analyticsController.js";

const router = express.Router();
console.log("analyticsRoutes loaded");
router.get(
  "/",
  (req, res, next) => {
    console.log("GET /analytics");
    next();
  },
  getAnalytics
);

export default router;
