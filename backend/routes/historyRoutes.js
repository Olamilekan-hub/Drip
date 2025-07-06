// backend/routes/historyRoutes.js
import express from "express";
import {
  getUserHistory,
  logWatchedEvent,
} from "../controllers/historyController.js";
import verifyToken from "../middlewares/verifyToken.js";

const router = express.Router();

console.log("historyRoutes loaded");

// All history routes require authentication
router.get("/me/:userId", verifyToken, (req, res, next) => {
  console.log("GET /history/me/:userId", req.params);
  next();
}, getUserHistory);

router.post("/:eventId", verifyToken, (req, res, next) => {
  console.log("POST /history/:eventId", req.params, req.body);
  next();
}, logWatchedEvent);

export default router;