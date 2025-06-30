// backend/controllers/historyController.js
import History from "../models/History.js";
import Event from "../models/Event.js";

export const getUserHistory = async (req, res) => {
  console.log("getUserHistory called", req.params);
  try {
    const history = await History.find({ userId: req.params.userId });
    console.log("History found:", history);
    res.json(history);
  } catch (err) {
    console.error("Error in getUserHistory:", err);
    res.status(500).json({ error: err.message });
  }
};

export const logWatchedEvent = async (req, res) => {
  console.log("logWatchedEvent called", req.params, req.body);
  try {
    const event = await Event.findById(req.params.eventId);
    console.log("Event found for history:", event);
    if (!event) return res.status(404).json({ error: "Event not found" });

    const newHistory = new History({
      userId: req.body.userId,
      eventTitle: event.title,
      watchDate: new Date().toISOString().split("T")[0],
      duration: req.body.duration,
    });

    await newHistory.save();
    console.log("New history saved:", newHistory);
    res.status(201).json(newHistory);
  } catch (err) {
    console.error("Error in logWatchedEvent:", err);
    res.status(400).json({ error: err.message });
  }
};
