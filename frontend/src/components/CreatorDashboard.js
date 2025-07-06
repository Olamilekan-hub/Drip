// frontend/src/components/CreatorDashboard.js
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  fetchEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  fetchAnalytics,
} from "../api/api";
import NavigationHeader from "./NavigationHeader";

const CreatorDashboard = ({ activeTab: initialTab = "overview" }) => {
  const { currentUser, userProfile, logout, isCreator } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [events, setEvents] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    price: "",
    totalTickets: "",
    streamUrl: "",
    category: "music",
    tags: "",
  });

  // Redirect if not creator or admin
  useEffect(() => {
    if (!isCreator()) {
      navigate("/dashboard");
    } else {
      loadCreatorData();
    }
  }, [userProfile, navigate, isCreator]);

  const loadCreatorData = async () => {
    setLoading(true);
    try {
      // Load all events first
      const { data: allEvents, error: eventError } = await fetchEvents();
      
      if (eventError) {
        console.error("Error fetching events:", eventError);
        setEvents([]);
      } else {
        // Filter events by current user's creator ID
        const creatorEvents = (allEvents || []).filter(event => 
          event.creatorId === currentUser._id
        );
        setEvents(creatorEvents);
        
        // Calculate creator-specific analytics
        const creatorAnalytics = calculateCreatorAnalytics(creatorEvents);
        setAnalytics(creatorAnalytics);
      }
    } catch (err) {
      console.error("Error loading creator data:", err);
      setEvents([]);
      setAnalytics({});
    } finally {
      setLoading(false);
    }
  };

  const calculateCreatorAnalytics = (creatorEvents) => {
    const totalRevenue = creatorEvents.reduce((sum, event) => 
      sum + ((event.soldTickets || 0) * event.price), 0
    );
    
    const totalTicketsSold = creatorEvents.reduce((sum, event) => 
      sum + (event.soldTickets || 0), 0
    );

    const upcomingEvents = creatorEvents.filter(e => e.status === 'upcoming').length;
    const liveEvents = creatorEvents.filter(e => e.status === 'live').length;
    const pastEvents = creatorEvents.filter(e => e.status === 'past').length;

    // Calculate average ticket price
    const avgTicketPrice = creatorEvents.length > 0 
      ? creatorEvents.reduce((sum, event) => sum + event.price, 0) / creatorEvents.length 
      : 0;

    // Get top performing events
    const topEvents = creatorEvents
      .sort((a, b) => ((b.soldTickets || 0) * b.price) - ((a.soldTickets || 0) * a.price))
      .slice(0, 3);

    return {
      totalEvents: creatorEvents.length,
      totalRevenue,
      totalTicketsSold,
      upcomingEvents,
      liveEvents,
      pastEvents,
      avgTicketPrice,
      topEvents,
      // Additional metrics
      conversionRate: creatorEvents.length > 0 
        ? (totalTicketsSold / creatorEvents.reduce((sum, event) => sum + event.totalTickets, 0) * 100).toFixed(1)
        : 0,
    };
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    try {
      const eventData = {
        ...eventForm,
        creatorId: currentUser._id,
        price: parseFloat(eventForm.price),
        totalTickets: parseInt(eventForm.totalTickets),
        status: "upcoming",
        tags: eventForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      let response;
      if (editingEvent) {
        response = await updateEvent(editingEvent._id, eventData);
        if (!response.error) {
          setEvents(events.map(event => 
            event._id === editingEvent._id ? response.data : event
          ));
        }
      } else {
        response = await createEvent(eventData);
        if (!response.error) {
          setEvents([response.data, ...events]);
        }
      }
      
      if (response.error) {
        alert("Event submission failed: " + response.error);
      } else {
        setShowEventModal(false);
        setEditingEvent(null);
        resetForm();
        
        // Recalculate analytics
        const updatedEvents = editingEvent 
          ? events.map(event => event._id === editingEvent._id ? response.data : event)
          : [response.data, ...events];
        setAnalytics(calculateCreatorAnalytics(updatedEvents));
      }
    } catch (err) {
      alert("Event submission failed: " + (err.message || "Unknown error"));
      console.error(err);
    }
  };

  const resetForm = () => {
    setEventForm({
      title: "",
      description: "",
      date: "",
      time: "",
      price: "",
      totalTickets: "",
      streamUrl: "",
      category: "music",
      tags: "",
    });
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      price: event.price.toString(),
      totalTickets: event.totalTickets.toString(),
      streamUrl: event.streamUrl,
      category: event.category || "music",
      tags: (event.tags || []).join(', '),
    });
    setShowEventModal(true);
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        const { error } = await deleteEvent(eventId);
        if (error) {
          alert("Failed to delete event: " + error);
        } else {
          const updatedEvents = events.filter(event => event._id !== eventId);
          setEvents(updatedEvents);
          setAnalytics(calculateCreatorAnalytics(updatedEvents));
        }
      } catch (err) {
        alert("Failed to delete event: " + (err.message || "Unknown error"));
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "live": return "bg-red-500";
      case "upcoming": return "bg-green-500";
      case "past": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-white">Loading creator dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white bg-black">
      <NavigationHeader />

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-screen p-6 border-r border-zinc-800">
          <nav className="space-y-2">
            {[
              { id: "overview", label: "Overview", icon: "📊" },
              { id: "events", label: "My Events", icon: "📅" },
              { id: "analytics", label: "Analytics", icon: "📈" },
              { id: "content", label: "Content", icon: "🎬" },
              { id: "audience", label: "Audience", icon: "👥" },
              { id: "monetization", label: "Monetization", icon: "💰" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center space-x-3 ${
                  activeTab === tab.id
                    ? "bg-white text-black"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Creator Overview</h2>
                <button
                  onClick={() => setShowEventModal(true)}
                  className="px-4 py-2 text-black transition-colors bg-white rounded-lg hover:bg-zinc-200"
                >
                  Create Event
                </button>
              </div>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
                <div className="p-6 rounded-lg bg-zinc-900">
                  <h3 className="mb-2 text-sm text-zinc-400">Total Events</h3>
                  <p className="text-2xl font-bold text-blue-400">
                    {analytics.totalEvents || 0}
                  </p>
                  <div className="mt-2 text-xs text-zinc-500">
                    {analytics.upcomingEvents} upcoming • {analytics.liveEvents} live
                  </div>
                </div>
                <div className="p-6 rounded-lg bg-zinc-900">
                  <h3 className="mb-2 text-sm text-zinc-400">Total Revenue</h3>
                  <p className="text-2xl font-bold text-green-400">
                    {formatCurrency(analytics.totalRevenue || 0)}
                  </p>
                  <div className="mt-2 text-xs text-zinc-500">
                    Avg: {formatCurrency(analytics.avgTicketPrice || 0)}/ticket
                  </div>
                </div>
                <div className="p-6 rounded-lg bg-zinc-900">
                  <h3 className="mb-2 text-sm text-zinc-400">Tickets Sold</h3>
                  <p className="text-2xl font-bold text-purple-400">
                    {analytics.totalTicketsSold || 0}
                  </p>
                  <div className="mt-2 text-xs text-zinc-500">
                    {analytics.conversionRate}% conversion rate
                  </div>
                </div>
                <div className="p-6 rounded-lg bg-zinc-900">
                  <h3 className="mb-2 text-sm text-zinc-400">Followers</h3>
                  <p className="text-2xl font-bold text-yellow-400">
                    {userProfile?.creatorProfile?.followers || 0}
                  </p>
                  <div className="mt-2 text-xs text-zinc-500">
                    +{Math.floor(Math.random() * 20)} this week
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-3">
                <button
                  onClick={() => setShowEventModal(true)}
                  className="p-6 text-left transition-colors rounded-lg bg-zinc-900 hover:bg-zinc-800"
                >
                  <div className="mb-2 text-2xl">📅</div>
                  <h3 className="mb-2 font-semibold">Create New Event</h3>
                  <p className="text-sm text-zinc-400">Set up your next live stream</p>
                </button>
                
                <button
                  onClick={() => setActiveTab("analytics")}
                  className="p-6 text-left transition-colors rounded-lg bg-zinc-900 hover:bg-zinc-800"
                >
                  <div className="mb-2 text-2xl">📈</div>
                  <h3 className="mb-2 font-semibold">View Analytics</h3>
                  <p className="text-sm text-zinc-400">Track your performance</p>
                </button>
                
                <button
                  onClick={() => setActiveTab("audience")}
                  className="p-6 text-left transition-colors rounded-lg bg-zinc-900 hover:bg-zinc-800"
                >
                  <div className="mb-2 text-2xl">👥</div>
                  <h3 className="mb-2 font-semibold">Manage Audience</h3>
                  <p className="text-sm text-zinc-400">Connect with your fans</p>
                </button>
              </div>

              {/* Top Performing Events */}
              <div className="p-6 rounded-lg bg-zinc-900">
                <h3 className="mb-4 text-lg font-semibold">Top Performing Events</h3>
                <div className="space-y-3">
                  {analytics.topEvents?.length > 0 ? (
                    analytics.topEvents.map((event, index) => (
                      <div key={event._id} className="flex items-center justify-between py-2">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-8 h-8 text-sm font-bold text-black bg-white rounded-full">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium">{event.title}</div>
                            <div className="text-sm text-zinc-400">{event.date}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-green-400">{formatCurrency((event.soldTickets || 0) * event.price)}</div>
                          <div className="text-sm text-zinc-400">{event.soldTickets || 0} tickets</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-zinc-400">No events created yet. Create your first event to see analytics!</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Events Tab */}
          {activeTab === "events" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">My Events ({events.length})</h2>
                <button
                  onClick={() => setShowEventModal(true)}
                  className="px-4 py-2 text-black transition-colors bg-white rounded-lg hover:bg-zinc-200"
                >
                  Create Event
                </button>
              </div>

              {events.length === 0 ? (
                <div className="p-12 text-center rounded-lg bg-zinc-900">
                  <div className="mb-4 text-4xl">📅</div>
                  <h3 className="mb-2 text-lg font-semibold">No events yet</h3>
                  <p className="mb-6 text-zinc-400">Create your first event to start streaming and earning revenue</p>
                  <button
                    onClick={() => setShowEventModal(true)}
                    className="px-6 py-3 text-black transition-colors bg-white rounded-lg hover:bg-zinc-200"
                  >
                    Create Your First Event
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
                  {events.map((event) => (
                    <div key={event._id} className="p-6 rounded-lg bg-zinc-900">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">{event.title}</h3>
                        <div className="flex items-center space-x-2">
                          <span className={`w-2 h-2 rounded-full ${getStatusColor(event.status)}`}></span>
                          <span className="text-sm capitalize text-zinc-400">{event.status}</span>
                        </div>
                      </div>

                      <p className="mb-4 text-sm text-zinc-400 line-clamp-2">{event.description}</p>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Date:</span>
                          <span>{event.date} at {event.time}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Price:</span>
                          <span>{formatCurrency(event.price)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Sold:</span>
                          <span>{event.soldTickets || 0}/{event.totalTickets}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Revenue:</span>
                          <span className="text-green-400">
                            {formatCurrency((event.soldTickets || 0) * event.price)}
                          </span>
                        </div>
                      </div>

                      <div className="flex mt-4 space-x-2">
                        <button
                          onClick={() => handleEditEvent(event)}
                          className="flex-1 px-3 py-2 text-sm text-white transition-colors rounded bg-zinc-800 hover:bg-zinc-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event._id)}
                          className="flex-1 px-3 py-2 text-sm text-white transition-colors bg-red-600 rounded hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <div>
              <h2 className="mb-6 text-xl font-semibold">Creator Analytics</h2>
              
              {events.length === 0 ? (
                <div className="p-12 text-center rounded-lg bg-zinc-900">
                  <div className="mb-4 text-4xl">📊</div>
                  <h3 className="mb-2 text-lg font-semibold">No analytics yet</h3>
                  <p className="text-zinc-400">Create and host events to see detailed analytics</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Revenue Chart Placeholder */}
                  <div className="p-6 rounded-lg bg-zinc-900">
                    <h3 className="mb-4 text-lg font-semibold">Revenue Over Time</h3>
                    <div className="flex items-center justify-center h-64 rounded text-zinc-400 bg-zinc-800">
                      Revenue chart coming soon...
                    </div>
                  </div>

                  {/* Event Performance */}
                  <div className="p-6 rounded-lg bg-zinc-900">
                    <h3 className="mb-4 text-lg font-semibold">Event Performance</h3>
                    <div className="space-y-3">
                      {events.map((event) => (
                        <div key={event._id} className="flex items-center justify-between p-4 rounded bg-zinc-800">
                          <div>
                            <div className="font-medium">{event.title}</div>
                            <div className="text-sm text-zinc-400">{event.date}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-green-400">{formatCurrency((event.soldTickets || 0) * event.price)}</div>
                            <div className="text-sm text-zinc-400">
                              {((event.soldTickets || 0) / event.totalTickets * 100).toFixed(1)}% sold
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Other tabs placeholder */}
          {["content", "audience", "monetization"].includes(activeTab) && (
            <div>
              <h2 className="mb-6 text-xl font-semibold capitalize">{activeTab}</h2>
              <div className="p-6 rounded-lg bg-zinc-900">
                <p className="text-zinc-400">{activeTab} management coming soon...</p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 rounded-lg bg-zinc-900 max-h-[90vh] overflow-y-auto">
            <h3 className="mb-4 text-lg font-semibold">
              {editingEvent ? "Edit Event" : "Create New Event"}
            </h3>

            <form onSubmit={handleEventSubmit} className="space-y-4">
              <div>
                <label className="block mb-2 text-sm text-zinc-400">Title</label>
                <input
                  type="text"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  className="w-full px-3 py-2 text-white border rounded bg-zinc-800 border-zinc-700 focus:border-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 text-sm text-zinc-400">Description</label>
                <textarea
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  className="w-full h-20 px-3 py-2 text-white border rounded bg-zinc-800 border-zinc-700 focus:border-white focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm text-zinc-400">Date</label>
                  <input
                    type="date"
                    value={eventForm.date}
                    onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                    className="w-full px-3 py-2 text-white border rounded bg-zinc-800 border-zinc-700 focus:border-white focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm text-zinc-400">Time</label>
                  <input
                    type="time"
                    value={eventForm.time}
                    onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                    className="w-full px-3 py-2 text-white border rounded bg-zinc-800 border-zinc-700 focus:border-white focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm text-zinc-400">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={eventForm.price}
                    onChange={(e) => setEventForm({ ...eventForm, price: e.target.value })}
                    className="w-full px-3 py-2 text-white border rounded bg-zinc-800 border-zinc-700 focus:border-white focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm text-zinc-400">Total Tickets</label>
                  <input
                    type="number"
                    min="1"
                    value={eventForm.totalTickets}
                    onChange={(e) => setEventForm({ ...eventForm, totalTickets: e.target.value })}
                    className="w-full px-3 py-2 text-white border rounded bg-zinc-800 border-zinc-700 focus:border-white focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm text-zinc-400">Stream URL</label>
                <input
                  type="url"
                  value={eventForm.streamUrl}
                  onChange={(e) => setEventForm({ ...eventForm, streamUrl: e.target.value })}
                  className="w-full px-3 py-2 text-white border rounded bg-zinc-800 border-zinc-700 focus:border-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 text-sm text-zinc-400">Category</label>
                <select
                  value={eventForm.category}
                  onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                  className="w-full px-3 py-2 text-white border rounded bg-zinc-800 border-zinc-700 focus:border-white focus:outline-none"
                >
                  <option value="music">Music</option>
                  <option value="talk">Talk Show</option>
                  <option value="gaming">Gaming</option>
                  <option value="art">Art</option>
                  <option value="comedy">Comedy</option>
                  <option value="education">Education</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm text-zinc-400">Tags (comma separated)</label>
                <input
                  type="text"
                  value={eventForm.tags}
                  onChange={(e) => setEventForm({ ...eventForm, tags: e.target.value })}
                  placeholder="electronic, house, techno"
                  className="w-full px-3 py-2 text-white border rounded bg-zinc-800 border-zinc-700 focus:border-white focus:outline-none"
                />
              </div>

              <div className="flex mt-6 space-x-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-black transition-colors bg-white rounded hover:bg-zinc-200"
                >
                  {editingEvent ? "Update Event" : "Create Event"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEventModal(false);
                    setEditingEvent(null);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 text-white transition-colors rounded bg-zinc-800 hover:bg-zinc-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatorDashboard;