// backend/controllers/analyticsController.js
import Event from "../models/Event.js";
import Ticket from "../models/Ticket.js";
import User from "../models/User.js";

export const getAnalytics = async (req, res) => {
  console.log("getAnalytics called with query:", req.query);
  try {
    const { creatorId, timeRange = '30d' } = req.query;
    
    // Calculate date range for filtering
    const now = new Date();
    let startDate = new Date();
    switch (timeRange) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    let eventFilter = {};
    let ticketFilter = {};

    // If creatorId is provided, filter for creator-specific analytics
    if (creatorId) {
      eventFilter.creatorId = creatorId;
      
      // Get events by this creator first
      const creatorEvents = await Event.find(eventFilter);
      const eventIds = creatorEvents.map(event => event._id.toString());
      
      if (eventIds.length > 0) {
        ticketFilter.eventId = { $in: eventIds };
      } else {
        // No events found for this creator
        return res.json({
          totalRevenue: 0,
          totalTicketsSold: 0,
          totalUsers: 0,
          activeEvents: 0,
          totalEvents: 0,
          upcomingEvents: 0,
          pastEvents: 0,
          conversionRate: 0,
          topEvents: [],
          revenueOverTime: [],
          eventStatusDistribution: {
            upcoming: 0,
            live: 0,
            past: 0,
            cancelled: 0
          }
        });
      }
    }

    // Aggregate total revenue from tickets
    const revenueData = await Ticket.aggregate([
      { $match: { ...ticketFilter, createdAt: { $gte: startDate } } },
      { $group: { _id: null, total: { $sum: "$price" } } },
    ]);

    // Count total tickets sold
    const ticketsSold = await Ticket.countDocuments({
      ...ticketFilter,
      createdAt: { $gte: startDate }
    });

    // Get events data
    const events = await Event.find(eventFilter);
    const activeEvents = await Event.countDocuments({ 
      ...eventFilter, 
      status: "live" 
    });
    const upcomingEvents = await Event.countDocuments({ 
      ...eventFilter, 
      status: "upcoming" 
    });
    const pastEvents = await Event.countDocuments({ 
      ...eventFilter, 
      status: "past" 
    });

    // Get user count (total platform users if no creator filter)
    const userCount = creatorId ? 
      await User.countDocuments({ createdAt: { $gte: startDate } }) :
      await User.countDocuments();

    // Get top performing events
    const topEventsData = await Ticket.aggregate([
      { $match: ticketFilter },
      {
        $group: {
          _id: "$eventTitle",
          eventId: { $first: "$eventId" },
          revenue: { $sum: "$price" },
          tickets: { $sum: 1 },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
    ]);

    // Calculate conversion rate (tickets sold vs total tickets available)
    const totalTicketsAvailable = events.reduce((sum, event) => sum + event.totalTickets, 0);
    const conversionRate = totalTicketsAvailable > 0 ? 
      (ticketsSold / totalTicketsAvailable * 100).toFixed(1) : 0;

    // Revenue over time (last 30 days)
    const revenueOverTime = await Ticket.aggregate([
      { 
        $match: { 
          ...ticketFilter, 
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } 
        } 
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          revenue: { $sum: "$price" },
          tickets: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // Event status distribution
    const eventStatusDistribution = {
      upcoming: upcomingEvents,
      live: activeEvents,
      past: pastEvents,
      cancelled: await Event.countDocuments({ 
        ...eventFilter, 
        status: "cancelled" 
      })
    };

    const analyticsData = {
      totalRevenue: revenueData[0]?.total || 0,
      totalTicketsSold: ticketsSold,
      totalUsers: userCount,
      activeEvents,
      totalEvents: events.length,
      upcomingEvents,
      pastEvents,
      conversionRate: parseFloat(conversionRate),
      topEvents: topEventsData,
      revenueOverTime,
      eventStatusDistribution,
      // Additional metrics
      averageTicketPrice: ticketsSold > 0 ? 
        (revenueData[0]?.total || 0) / ticketsSold : 0,
      averageEventRevenue: events.length > 0 ? 
        (revenueData[0]?.total || 0) / events.length : 0,
      timeRange,
      generatedAt: new Date().toISOString()
    };

    console.log("Analytics data generated:", {
      ...analyticsData,
      creatorId: creatorId || 'platform-wide'
    });

    res.json(analyticsData);
  } catch (err) {
    console.error("Error in getAnalytics:", err);
    res.status(500).json({ 
      error: err.message,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

// Get analytics for a specific event
export const getEventAnalytics = async (req, res) => {
  console.log("getEventAnalytics called for event:", req.params.eventId);
  try {
    const { eventId } = req.params;
    
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Get tickets for this event
    const tickets = await Ticket.find({ eventId });
    const revenue = tickets.reduce((sum, ticket) => sum + ticket.price, 0);

    // Ticket sales over time
    const salesOverTime = await Ticket.aggregate([
      { $match: { eventId } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          tickets: { $sum: 1 },
          revenue: { $sum: "$price" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    const eventAnalytics = {
      eventId,
      eventTitle: event.title,
      totalTickets: event.totalTickets,
      soldTickets: tickets.length,
      availableTickets: event.totalTickets - tickets.length,
      revenue,
      averageTicketPrice: tickets.length > 0 ? revenue / tickets.length : 0,
      conversionRate: ((tickets.length / event.totalTickets) * 100).toFixed(1),
      salesOverTime,
      status: event.status,
      createdAt: event.createdAt,
      eventDate: event.date
    };

    res.json(eventAnalytics);
  } catch (err) {
    console.error("Error in getEventAnalytics:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get user engagement analytics
export const getUserEngagementAnalytics = async (req, res) => {
  console.log("getUserEngagementAnalytics called");
  try {
    // User registration over time
    const userGrowth = await User.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m", date: "$createdAt" }
          },
          newUsers: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // User role distribution
    const roleDistribution = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 }
        }
      }
    ]);

    // Active users (users who purchased tickets in last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const activeUsers = await Ticket.distinct("userId", {
      createdAt: { $gte: thirtyDaysAgo }
    });

    const engagementData = {
      userGrowth,
      roleDistribution,
      totalUsers: await User.countDocuments(),
      activeUsers: activeUsers.length,
      activeUserRate: ((activeUsers.length / await User.countDocuments()) * 100).toFixed(1)
    };

    res.json(engagementData);
  } catch (err) {
    console.error("Error in getUserEngagementAnalytics:", err);
    res.status(500).json({ error: err.message });
  }
};