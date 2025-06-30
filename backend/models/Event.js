// backend/models/Event.js
import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: String,
  description: String,
  date: String,
  time: String,
  price: Number,
  totalTickets: Number,
  soldTickets: { type: Number, default: 0 },
  status: String,
  streamUrl: String,
  image: Buffer, // optional
  createdAt: { type: Date, default: Date.now },
});
export default mongoose.model("Event", eventSchema);
