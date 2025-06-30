// backend/models/Ticket.js
import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  eventId: {
    type: String,
    required: true
  },
  eventTitle: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  purchaseDate: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'used', 'expired'],
    default: 'active'
  },
  qrCode: {
    type: String,
    default: ''
  }
}, { timestamps: true });

export default mongoose.model('Ticket', ticketSchema);
