// backend/routes/historyRoutes.js
import express from "express";
import {
  getUserHistory,
  logWatchedEvent,
} from "../controllers/historyController.js";

const router = express.Router();

console.log("historyRoutes loaded");

router.get(
  "/me/:userId",
  (req, res, next) => {
    console.log("GET /me/:userId", req.params);
    next();
  },
  getUserHistory
);
router.post(
  "/:eventId",
  (req, res, next) => {
    console.log("POST /:eventId", req.params, req.body);
    next();
  },
  logWatchedEvent
);

export default router;
