// backend/controllers/ticketController.js - FIXED VERSION
import Ticket from "../models/Ticket.js";
import Event from "../models/Event.js";
import mongoose from "mongoose";

export const getUserTickets = async (req, res) => {
  console.log("getUserTickets called", req.params);
  try {
    const { userId } = req.params;
    
    // Fix: Validate userId format
    if (!userId || userId.length < 10) {
      return res.status(400).json({ error: "Valid userId is required" });
    }
    
    const tickets = await Ticket.find({ userId }).sort({ createdAt: -1 });
    console.log("Tickets found:", tickets.length);
    res.status(200).json(tickets);
  } catch (err) {
    console.error("Error in getUserTickets:", err);
    res.status(500).json({ error: "Failed to fetch tickets" });
  }
};

export const purchaseTicket = async (req, res) => {
  console.log("purchaseTicket called", req.params, req.body);
  
  // Start a session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { eventId } = req.params;
    const { userId, price, eventTitle } = req.body;

    // Fix: Validate input parameters
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ error: "Invalid event ID format" });
    }
    if (!userId || !price || !eventTitle) {
      return res.status(400).json({ error: "Missing required fields: userId, price, eventTitle" });
    }

    // Fix: Check if user already has a ticket for this event
    const existingTicket = await Ticket.findOne({ 
      userId, 
      eventId 
    }).session(session);
    
    if (existingTicket) {
      await session.abortTransaction();
      return res.status(400).json({ error: "You already have a ticket for this event" });
    }

    // Fix: Find event and check availability atomically
    const event = await Event.findById(eventId).session(session);
    console.log("Event found:", event);
    if (!event) {
      await session.abortTransaction();
      return res.status(404).json({ error: "Event not found" });
    }

    if (event.soldTickets >= event.totalTickets) {
      await session.abortTransaction();
      console.log("Event sold out");
      return res.status(400).json({ error: "Sold out" });
    }

    // Fix: Create ticket and update event atomically
    const ticket = new Ticket({
      userId,
      eventId,
      eventTitle,
      price: parseFloat(price),
      status: "active",
      purchaseDate: new Date().toISOString().split("T")[0],
    });

    await ticket.save({ session });

    // Fix: Use atomic increment to prevent race conditions
    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      { $inc: { soldTickets: 1 } },
      { new: true, session }
    );

    if (!updatedEvent) {
      await session.abortTransaction();
      return res.status(404).json({ error: "Failed to update event" });
    }

    // Commit the transaction
    await session.commitTransaction();
    
    console.log("Ticket purchased successfully:", ticket);
    res.status(201).json(ticket);
  } catch (err) {
    // Rollback on error
    await session.abortTransaction();
    console.error("Error in purchaseTicket:", err);
    res.status(500).json({ error: "Ticket purchase failed: " + err.message });
  } finally {
    session.endSession();
  }
};

// NEW: Check if user has access to event
export const checkEventAccess = async (req, res) => {
  try {
    const { eventId, userId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ error: "Invalid event ID format" });
    }

    const ticket = await Ticket.findOne({
      userId,
      eventId,
      status: "active"
    });

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.json({
      hasAccess: !!ticket,
      ticket: ticket || null,
      event: {
        title: event.title,
        status: event.status,
        streamUrl: ticket ? event.streamUrl : null
      }
    });
  } catch (err) {
    console.error("Error in checkEventAccess:", err);
    res.status(500).json({ error: "Failed to check access" });
  }
};