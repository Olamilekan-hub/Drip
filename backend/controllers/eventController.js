// backend/controllers/eventController.js
import Event from "../models/Event.js";

// GET all events
export const getEvents = async (req, res) => {
  console.log("getEvents called");
  try {
    const events = await Event.find();
    console.log("Events found:", events);
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
    if (req.body.imageBase64) {
      newEvent.image = Buffer.from(req.body.imageBase64, "base64");
    }
    const newEvent = new Event(req.body);
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
    const updated = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
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
    const deleted = await Event.findByIdAndDelete(req.params.id);
    console.log("Event deleted:", deleted);
    if (!deleted) return res.status(404).json({ error: "Event not found" });
    res.json({ message: "Event deleted" });
  } catch (err) {
    console.error("Error in deleteEvent:", err);
    res.status(500).json({ error: err.message });
  }
};
