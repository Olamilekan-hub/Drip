// backend/routes/ticketRoutes.js
import express from "express";
import {
  getUserTickets,
  purchaseTicket,
} from "../controllers/ticketController.js";
import verifyToken from "../middlewares/verifyToken.js";

const router = express.Router();

console.log("ticketRoutes loaded");

// All ticket routes require authentication
router.get("/me/:userId", verifyToken, (req, res, next) => {
  console.log("GET /tickets/me/:userId", req.params);
  next();
}, getUserTickets);

router.post("/:eventId", verifyToken, (req, res, next) => {
  console.log("POST /tickets/:eventId", req.params, req.body);
  next();
}, purchaseTicket);

export default router;