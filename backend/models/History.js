// backend/models/History.js
import mongoose from "mongoose";

const historySchema = new mongoose.Schema({
  userId: String,
  eventTitle: String,
  watchDate: String,
  duration: String,
});
export default mongoose.model("History", historySchema);
