import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  fetchEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  fetchUsers,
  updateUserRole,
  fetchAnalytics,
} from "../api/api";

const AdminPanel = () => {
  const { currentUser, userProfile, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("analytics");
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
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
  });

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin()) {
      navigate("/dashboard");
      return;
    }
    loadAdminData();
  }, [userProfile, navigate, isAdmin]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [eventRes, userRes, analyticsRes] = await Promise.all([
        fetchEvents(),
        fetchUsers(),
        fetchAnalytics(),
      ]);
      
      setEvents(eventRes.data || []);
      setUsers(userRes.data || []);
      setAnalytics(analyticsRes.data || {});
    } catch (err) {
      console.error("Error loading admin panel:", err);
      // Set empty arrays to prevent crashes
      setEvents([]);
      setUsers([]);
      setAnalytics({});
    } finally {
      setLoading(false);
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
        creatorId: currentUser._id, // Admin creates events
        price: parseFloat(eventForm.price),
        totalTickets: parseInt(eventForm.totalTickets),
      };

      if (editingEvent) {
        const updated = await updateEvent(editingEvent._id, eventData);
        setEvents(events.map(event => 
          event._id === updated.data._id ? updated.data : event
        ));
      } else {
        const created = await createEvent(eventData);
        setEvents([created.data, ...events]);
      }
      
      setShowEventModal(false);
      setEditingEvent(null);
      resetForm();
      
      // Reload analytics to reflect changes
      const analyticsRes = await fetchAnalytics();
      setAnalytics(analyticsRes.data);
    } catch (err) {
      alert("Event submission failed: " + (err.response?.data?.error || err.message));
      console.error(err);
    }
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
        
        // Reload analytics
        const analyticsRes = await fetchAnalytics();
        setAnalytics(analyticsRes.data);
      } catch (err) {
        alert("Failed to delete event: " + (err.response?.data?.error || err.message));
      }
    }
  };

  const handleUserRoleChange = async (userId, role) => {
    if (!userId) {
      alert("User ID is missing. Cannot update role.");
      return;
    }
    try {
      const res = await updateUserRole(userId, role);
      setUsers(users.map(u => u._id === res.data._id ? res.data : u));
      alert("Role updated successfully");
    } catch (err) {
      alert("Failed to update role: " + (err.response?.data?.error || err.message));
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

  const getRoleColor = (role) => {
    switch (role) {
      case "admin": return "text-red-400";
      case "creator": return "text-blue-400";
      case "user": return "text-green-400";
      default: return "text-gray-400";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-white">Loading admin panel...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white bg-black">
      {/* Header */}
      <header className="px-6 py-4 border-b border-zinc-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold tracking-widest">drip</h1>
            <span className="text-zinc-400">admin panel</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-zinc-400">
              Admin: {userProfile?.name || "Admin"}
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
              { id: "analytics", label: "Analytics", icon: "📊" },
              { id: "events", label: "Events", icon: "📅" },
              { id: "users", label: "Users", icon: "👥" },
              { id: "content", label: "Content", icon: "📝" },
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
          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <div>
              <h2 className="mb-6 text-xl font-semibold">Platform Analytics</h2>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
                <div className="p-6 rounded-lg bg-zinc-900">
                  <h3 className="mb-2 text-sm text-zinc-400">Total Revenue</h3>
                  <p className="text-2xl font-bold text-green-400">
                    ${(analytics.totalRevenue || 0).toLocaleString()}
                  </p>
                </div>
                <div className="p-6 rounded-lg bg-zinc-900">
                  <h3 className="mb-2 text-sm text-zinc-400">Tickets Sold</h3>
                  <p className="text-2xl font-bold text-blue-400">
                    {analytics.totalTicketsSold || 0}
                  </p>
                </div>
                <div className="p-6 rounded-lg bg-zinc-900">
                  <h3 className="mb-2 text-sm text-zinc-400">Total Users</h3>
                  <p className="text-2xl font-bold text-purple-400">
                    {analytics.totalUsers || users.length}
                  </p>
                </div>
                <div className="p-6 rounded-lg bg-zinc-900">
                  <h3 className="mb-2 text-sm text-zinc-400">Active Events</h3>
                  <p className="text-2xl font-bold text-red-400">
                    {analytics.activeEvents || events.filter(e => e.status === 'live').length}
                  </p>
                </div>
              </div>

              {/* Top Events */}
              <div className="p-6 rounded-lg bg-zinc-900">
                <h3 className="mb-4 text-lg font-semibold">Top Performing Events</h3>
                <div className="space-y-3">
                  {analytics.topEvents?.length > 0 ? (
                    analytics.topEvents.map((event, index) => (
                      <div key={index} className="flex items-center justify-between py-2">
                        <span className="font-medium">{event._id || event.name}</span>
                        <div className="text-right">
                          <div className="text-green-400">${event.revenue}</div>
                          <div className="text-sm text-zinc-400">{event.tickets} tickets</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-zinc-400">No event data available yet</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Events Tab */}
          {activeTab === "events" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Event Management</h2>
                <button
                  onClick={() => setShowEventModal(true)}
                  className="px-4 py-2 text-black transition-colors bg-white rounded-lg hover:bg-zinc-200"
                >
                  Create Event
                </button>
              </div>

              {events.length === 0 ? (
                <div className="p-6 text-center rounded-lg bg-zinc-900">
                  <p className="text-zinc-400">No events created yet</p>
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
                          <span className="text-zinc-400">Tickets:</span>
                          <span>{event.soldTickets || 0}/{event.totalTickets}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Revenue:</span>
                          <span className="text-green-400">
                            ${((event.soldTickets || 0) * event.price).toLocaleString()}
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

          {/* Users Tab */}
          {activeTab === "users" && (
            <div>
              <h2 className="mb-6 text-xl font-semibold">User Management</h2>

              {users.length === 0 ? (
                <div className="p-6 text-center rounded-lg bg-zinc-900">
                  <p className="text-zinc-400">No users found</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-lg bg-zinc-900">
                  <table className="w-full">
                    <thead className="border-b border-zinc-800">
                      <tr>
                        <th className="p-4 text-left text-zinc-400">User</th>
                        <th className="p-4 text-left text-zinc-400">Role</th>
                        <th className="p-4 text-left text-zinc-400">Location</th>
                        <th className="p-4 text-left text-zinc-400">Joined</th>
                        <th className="p-4 text-left text-zinc-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user._id} className="border-b border-zinc-800">
                          <td className="p-4">
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-zinc-400">{user.email}</div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`capitalize font-medium ${getRoleColor(user.role)}`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="p-4 text-sm text-zinc-400">
                            {user.city}, {user.country}
                          </td>
                          <td className="p-4 text-sm text-zinc-400">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-4">
                            <select
                              value={user.role}
                              onChange={(e) => handleUserRoleChange(user._id, e.target.value)}
                              className="px-3 py-1 text-sm text-white rounded bg-zinc-800"
                            >
                              <option value="user">User</option>
                              <option value="creator">Creator</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Content Tab */}
          {activeTab === "content" && (
            <div>
              <h2 className="mb-6 text-xl font-semibold">Content Management</h2>
              <div className="p-6 rounded-lg bg-zinc-900">
                <p className="text-zinc-400">Content management features coming soon...</p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Event Modal */}
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

export default AdminPanel;