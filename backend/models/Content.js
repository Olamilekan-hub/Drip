// backend/models/Content.js
import mongoose from 'mongoose';

const contentSchema = new mongoose.Schema({
  platformName: String,
  platformDescription: String,
  featuredEventId: String,
  homepageBanner: String
});

export default mongoose.model('Content', contentSchema);