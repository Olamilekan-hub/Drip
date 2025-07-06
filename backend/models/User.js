// backend/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: { 
    type: String, 
    unique: true,
    required: true,
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true 
  },
  country: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
  role: { 
    type: String, 
    enum: ['user', 'creator', 'admin'],
    default: "user" 
  },
  // Creator-specific fields
  creatorProfile: {
    bio: String,
    socialLinks: {
      instagram: String,
      twitter: String,
      website: String
    },
    totalRevenue: {
      type: Number,
      default: 0
    },
    totalEvents: {
      type: Number,
      default: 0
    },
    followers: {
      type: Number,
      default: 0
    }
  },
  // User activity tracking
  lastLogin: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  preferences: {
    notifications: {
      type: Boolean,
      default: true
    },
    newsletter: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Index for efficient queries
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// Virtual for full name display
userSchema.virtual('displayName').get(function() {
  return this.name;
});

// Method to update creator stats
userSchema.methods.updateCreatorStats = async function() {
  if (this.role !== 'creator' && this.role !== 'admin') return;
  
  const Event = mongoose.model('Event');
  const events = await Event.find({ creatorId: this._id });
  
  this.creatorProfile.totalEvents = events.length;
  this.creatorProfile.totalRevenue = events.reduce((sum, event) => {
    return sum + (event.soldTickets * event.price);
  }, 0);
  
  await this.save();
};

// Ensure virtual fields are serialized
userSchema.set('toJSON', { virtuals: true });

export default mongoose.model("User", userSchema);