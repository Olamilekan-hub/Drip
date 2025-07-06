// backend/routes/analyticsRoutes.js
import express from "express";
import { 
  getAnalytics, 
  getEventAnalytics, 
  getUserEngagementAnalytics 
} from "../controllers/analyticsController.js";
import verifyToken from "../middlewares/verifyToken.js";

const router = express.Router();

console.log("analyticsRoutes loaded");

// General analytics endpoint - supports query parameters for filtering
// ?creatorId=xxx for creator-specific analytics
// ?timeRange=7d|30d|90d|1y for time-based filtering
router.get(
  "/",
  verifyToken,
  (req, res, next) => {
    console.log("GET /analytics", req.query);
    next();
  },
  getAnalytics
);

// Event-specific analytics
router.get(
  "/events/:eventId",
  verifyToken,
  (req, res, next) => {
    console.log("GET /analytics/events/:eventId", req.params);
    next();
  },
  getEventAnalytics
);

// User engagement analytics (admin only)
router.get(
  "/engagement",
  verifyToken,
  (req, res, next) => {
    console.log("GET /analytics/engagement");
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }
    next();
  },
  getUserEngagementAnalytics
);

export default router;