// backend/routes/contentRoutes.js
import express from "express";
import {
  getContentSettings,
  updateContentSettings,
} from "../controllers/contentController.js";

const router = express.Router();

console.log("contentRoutes loaded");

router.get(
  "/",
  (req, res, next) => {
    console.log("GET /content");
    next();
  },
  getContentSettings
);
router.put(
  "/",
  (req, res, next) => {
    console.log("PUT /content", req.body);
    next();
  },
  updateContentSettings
);

export default router;
