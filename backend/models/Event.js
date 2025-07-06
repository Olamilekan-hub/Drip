// backend/models/Event.js
import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  totalTickets: {
    type: Number,
    required: true,
    min: 1
  },
  soldTickets: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ['upcoming', 'live', 'past', 'cancelled'],
    default: 'upcoming'
  },
  streamUrl: {
    type: String,
    required: true
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  image: Buffer, // optional event image
  category: {
    type: String,
    default: 'music'
  },
  tags: [{
    type: String,
    trim: true
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  maxViewers: {
    type: Number,
    default: null // null means unlimited
  }
}, {
  timestamps: true
});

// Index for efficient queries
eventSchema.index({ creatorId: 1, status: 1 });
eventSchema.index({ date: 1, status: 1 });
eventSchema.index({ isPublic: 1, status: 1 });

// Virtual for calculating availability
eventSchema.virtual('availableTickets').get(function() {
  return this.totalTickets - this.soldTickets;
});

// Virtual for calculating revenue
eventSchema.virtual('revenue').get(function() {
  return this.soldTickets * this.price;
});

// Ensure virtual fields are serialized
eventSchema.set('toJSON', { virtuals: true });

export default mongoose.model("Event", eventSchema);