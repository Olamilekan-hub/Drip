// backend/controllers/eventController.js - FIXED VERSION
import Event from "../models/Event.js";
import mongoose from "mongoose";

// GET all events
export const getEvents = async (req, res) => {
  console.log("getEvents called");
  try {
    const { creatorId, status } = req.query;
    let filter = {};
    
    // Fix: Proper ObjectId comparison
    if (creatorId) {
      try {
        filter.creatorId = new mongoose.Types.ObjectId(creatorId);
      } catch (err) {
        return res.status(400).json({ error: "Invalid creatorId format" });
      }
    }
    if (status) filter.status = status;
    
    const events = await Event.find(filter).sort({ createdAt: -1 });
    console.log("Events found:", events.length);
    res.json(events);
  } catch (err) {
    console.error("Error in getEvents:", err);
    res.status(500).json({ error: err.message });
  }
};

// GET single event by ID
export const getEventById = async (req, res) => {
  console.log("getEventById called", req.params);
  try {
    // Fix: Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid event ID format" });
    }
    
    const event = await Event.findById(req.params.id);
    console.log("Event found:", event);
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json(event);
  } catch (err) {
    console.error("Error in getEventById:", err);
    res.status(500).json({ error: err.message });
  }
};

// POST create event
export const createEvent = async (req, res) => {
  console.log("createEvent called", req.body);
  try {
    const eventData = { ...req.body };
    
    // Fix: Validate creatorId
    if (!eventData.creatorId || !mongoose.Types.ObjectId.isValid(eventData.creatorId)) {
      return res.status(400).json({ error: "Valid creatorId is required" });
    }
    
    // Handle base64 image if provided
    if (req.body.imageBase64) {
      eventData.image = Buffer.from(req.body.imageBase64, "base64");
      delete eventData.imageBase64;
    }
    
    // Set default values
    if (!eventData.soldTickets) eventData.soldTickets = 0;
    if (!eventData.status) eventData.status = "upcoming";
    
    const newEvent = new Event(eventData);
    const saved = await newEvent.save();
    console.log("Event created:", saved);
    res.status(201).json(saved);
  } catch (err) {
    console.error("Error in createEvent:", err);
    res.status(400).json({ error: err.message });
  }
};

// PUT update event
export const updateEvent = async (req, res) => {
  console.log("updateEvent called", req.params, req.body);
  try {
    // Fix: Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid event ID format" });
    }
    
    const eventData = { ...req.body };
    
    // Handle base64 image if provided
    if (req.body.imageBase64) {
      eventData.image = Buffer.from(req.body.imageBase64, "base64");
      delete eventData.imageBase64;
    }
    
    const updated = await Event.findByIdAndUpdate(
      req.params.id, 
      eventData, 
      { new: true, runValidators: true }
    );
    
    console.log("Event updated:", updated);
    if (!updated) return res.status(404).json({ error: "Event not found" });
    res.json(updated);
  } catch (err) {
    console.error("Error in updateEvent:", err);
    res.status(400).json({ error: err.message });
  }
};

// DELETE event
export const deleteEvent = async (req, res) => {
  console.log("deleteEvent called", req.params);
  try {
    // Fix: Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid event ID format" });
    }
    
    const deleted = await Event.findByIdAndDelete(req.params.id);
    console.log("Event deleted:", deleted);
    if (!deleted) return res.status(404).json({ error: "Event not found" });
    res.json({ message: "Event deleted successfully", id: req.params.id });
  } catch (err) {
    console.error("Error in deleteEvent:", err);
    res.status(500).json({ error: err.message });
  }
};