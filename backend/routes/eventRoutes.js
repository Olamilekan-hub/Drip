// backend/routes/eventRoutes.js
import express from "express";
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} from "../controllers/eventController.js";
import verifyToken from "../middlewares/verifyToken.js";

const router = express.Router();

console.log("eventRoutes loaded");

// Public routes
router.get("/", (req, res, next) => {
  console.log("GET /events");
  next();
}, getEvents);

router.get("/:id", (req, res, next) => {
  console.log("GET /events/:id", req.params);
  next();
}, getEventById);

// Protected routes (require authentication)
router.post("/", verifyToken, (req, res, next) => {
  console.log("POST /events", req.body);
  next();
}, createEvent);

router.put("/:id", verifyToken, (req, res, next) => {
  console.log("PUT /events/:id", req.params, req.body);
  next();
}, updateEvent);

router.delete("/:id", verifyToken, (req, res, next) => {
  console.log("DELETE /events/:id", req.params);
  next();
}, deleteEvent);

export default router;