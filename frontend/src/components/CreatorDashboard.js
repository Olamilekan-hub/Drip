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

const CreatorDashboard = ({ activeTab: initialTab = "overview" }) => {
  const { currentUser, userProfile, logout, isCreator } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [events, setEvents] = useState([]);
  const [analytics, setAnalytics] = useState({});
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
    try {
      // Load creator's events and analytics
      const [eventRes, analyticsRes] = await Promise.all([
        fetchEvents(), // Filter by creator ID in real implementation
        fetchAnalytics(),
      ]);
      
      // Filter events by creator (in real app, this would be done on backend)
      const creatorEvents = eventRes.data.filter(event => 
        event.creatorId === currentUser._id
      );
      
      setEvents(creatorEvents);
      setAnalytics(analyticsRes.data);
    } catch (err) {
      console.error("Error loading creator data:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    try {
      const eventData = {
        ...eventForm,
        creatorId: currentUser._id,
        status: "upcoming"
      };

      if (editingEvent) {
        const updated = await updateEvent(editingEvent._id, eventData);
        setEvents(events.map(event => 
          event._id === updated.data._id ? updated.data : event
        ));
      } else {
        const created = await createEvent(eventData);
        setEvents([...events, created.data]);
      }
      
      setShowEventModal(false);
      setEditingEvent(null);
      resetForm();
    } catch (err) {
      alert("Event submission failed");
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
    });
    setShowEventModal(true);
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await deleteEvent(eventId);
        setEvents(events.filter(event => event._id !== eventId));
      } catch (err) {
        alert("Failed to delete event");
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

  // Mock data for demo
  const mockCreatorStats = {
    totalEvents: events.length,
    totalRevenue: events.reduce((sum, event) => sum + (event.soldTickets * event.price), 0),
    totalViews: 1250,
    totalFollowers: 89,
    recentEvents: events.slice(0, 3),
  };

  return (
    <div className="min-h-screen text-white bg-black">
      {/* Header */}
      <header className="px-6 py-4 border-b border-zinc-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold tracking-widest">drip</h1>
            <span className="text-zinc-400">creator studio</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-zinc-400">
              Creator: {userProfile?.name || "Creator"}
            </span>
            <button
              onClick={() => navigate("/user-view")}
              className="text-sm transition-colors text-zinc-400 hover:text-white"
            >
              User View
            </button>
            <button
              onClick={handleLogout}
              className="text-sm transition-colors text-zinc-400 hover:text-white"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

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
              <h2 className="mb-6 text-xl font-semibold">Creator Overview</h2>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
                <div className="p-6 rounded-lg bg-zinc-900">
                  <h3 className="mb-2 text-sm text-zinc-400">Total Events</h3>
                  <p className="text-2xl font-bold text-blue-400">
                    {mockCreatorStats.totalEvents}
                  </p>
                </div>
                <div className="p-6 rounded-lg bg-zinc-900">
                  <h3 className="mb-2 text-sm text-zinc-400">Total Revenue</h3>
                  <p className="text-2xl font-bold text-green-400">
                    ${mockCreatorStats.totalRevenue}
                  </p>
                </div>
                <div className="p-6 rounded-lg bg-zinc-900">
                  <h3 className="mb-2 text-sm text-zinc-400">Total Views</h3>
                  <p className="text-2xl font-bold text-purple-400">
                    {mockCreatorStats.totalViews}
                  </p>
                </div>
                <div className="p-6 rounded-lg bg-zinc-900">
                  <h3 className="mb-2 text-sm text-zinc-400">Followers</h3>
                  <p className="text-2xl font-bold text-yellow-400">
                    {mockCreatorStats.totalFollowers}
                  </p>
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

              {/* Recent Events */}
              <div className="p-6 rounded-lg bg-zinc-900">
                <h3 className="mb-4 text-lg font-semibold">Recent Events</h3>
                <div className="space-y-3">
                  {mockCreatorStats.recentEvents.map((event, index) => (
                    <div key={index} className="flex items-center justify-between py-2">
                      <div>
                        <div className="font-medium">{event.title}</div>
                        <div className="text-sm text-zinc-400">{event.date}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-green-400">${event.soldTickets * event.price}</div>
                        <div className="text-sm text-zinc-400">{event.soldTickets} tickets</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Events Tab */}
          {activeTab === "events" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">My Events</h2>
                <button
                  onClick={() => setShowEventModal(true)}
                  className="px-4 py-2 text-black transition-colors bg-white rounded-lg hover:bg-zinc-200"
                >
                  Create Event
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
                {events.map((event) => (
                  <div key={event.id} className="p-6 rounded-lg bg-zinc-900">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">{event.title}</h3>
                      <div className="flex items-center space-x-2">
                        <span className={`w-2 h-2 rounded-full ${getStatusColor(event.status)}`}></span>
                        <span className="text-sm capitalize text-zinc-400">{event.status}</span>
                      </div>
                    </div>

                    <p className="mb-4 text-sm text-zinc-400">{event.description}</p>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Date:</span>
                        <span>{event.date} at {event.time}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Price:</span>
                        <span>${event.price}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Sold:</span>
                        <span>{event.soldTickets}/{event.totalTickets}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Revenue:</span>
                        <span className="text-green-400">${event.soldTickets * event.price}</span>
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
                        onClick={() => handleDeleteEvent(event.id)}
                        className="flex-1 px-3 py-2 text-sm text-white transition-colors bg-red-600 rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <div>
              <h2 className="mb-6 text-xl font-semibold">Creator Analytics</h2>
              <div className="p-6 rounded-lg bg-zinc-900">
                <p className="text-zinc-400">Detailed analytics coming soon...</p>
              </div>
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

      {/* Event Modal - Same as AdminPanel */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 rounded-lg bg-zinc-900">
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