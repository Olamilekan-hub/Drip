// backend/routes/ticketRoutes.js
import express from "express";
import {
  getUserTickets,
  purchaseTicket,
} from "../controllers/ticketController.js";

const router = express.Router();

console.log("ticketRoutes loaded");

router.get(
  "/me/:userId",
  (req, res, next) => {
    console.log("GET /me/:userId", req.params);
    next();
  },
  getUserTickets
);
router.post(
  "/:eventId",
  (req, res, next) => {
    console.log("POST /:eventId", req.params, req.body);
    next();
  },
  purchaseTicket
);

export default router;
