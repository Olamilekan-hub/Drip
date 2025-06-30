// backend/controllers/ticketController.js
import Ticket from "../models/Ticket.js";
import Event from "../models/Event.js";

export const getUserTickets = async (req, res) => {
  console.log("getUserTickets called", req.params);
  try {
    const tickets = await Ticket.find({ userId: req.params.userId });
    console.log("Tickets found:", tickets);
    res.status(200).json(tickets);
  } catch (err) {
    console.error("Error in getUserTickets:", err);
    res.status(500).json({ error: "Failed to fetch tickets" });
  }
};

export const purchaseTicket = async (req, res) => {
  console.log("purchaseTicket called", req.params, req.body);
  try {
    const { eventId } = req.params;
    const { userId, price, eventTitle } = req.body;

    const event = await Event.findById(eventId);
    console.log("Event found:", event);
    if (!event) return res.status(404).json({ error: "Event not found" });

    if (event.ticketsSold >= event.totalTickets) {
      console.log("Event sold out");
      return res.status(400).json({ error: "Sold out" });
    }

    const ticket = new Ticket({
      userId,
      eventId,
      eventTitle,
      price,
      status: "active",
      purchaseDate: new Date().toISOString().split("T")[0],
    });

    await ticket.save();
    event.ticketsSold += 1;
    await event.save();

    console.log("Ticket purchased:", ticket);
    res.status(201).json(ticket);
  } catch (err) {
    console.error("Error in purchaseTicket:", err);
    res.status(500).json({ error: "Ticket purchase failed" });
  }
};
