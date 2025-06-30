// backend/controllers/analyticsController.js
import Event from "../models/Event.js";
import Ticket from "../models/Ticket.js";
import User from "../models/User.js";

export const getAnalytics = async (req, res) => {
  console.log("getAnalytics called");
  try {
    const totalRevenue = await Ticket.aggregate([
      { $group: { _id: null, total: { $sum: "$price" } } },
    ]);
    const ticketsSold = await Ticket.countDocuments();
    const users = await User.countDocuments();
    const activeEvents = await Event.countDocuments({ status: "live" });

    const topEvents = await Ticket.aggregate([
      {
        $group: {
          _id: "$eventTitle",
          revenue: { $sum: "$price" },
          tickets: { $sum: 1 },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 3 },
    ]);

    console.log("Analytics data:", {
      totalRevenue: totalRevenue[0]?.total || 0,
      totalTicketsSold: ticketsSold,
      totalUsers: users,
      activeEvents,
      topEvents,
    });

    res.json({
      totalRevenue: totalRevenue[0]?.total || 0,
      totalTicketsSold: ticketsSold,
      totalUsers: users,
      activeEvents,
      topEvents,
    });
  } catch (err) {
    console.error("Error in getAnalytics:", err);
    res.status(500).json({ error: err.message });
  }
};
