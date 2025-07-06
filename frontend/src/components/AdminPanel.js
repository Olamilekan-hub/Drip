// frontend/src/components/AdminPanel.js
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
import NavigationHeader from "./NavigationHeader";

const AdminPanel = () => {
  const { currentUser, userProfile, isAdmin } = useAuth();
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
    category: "music",
    tags: "",
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
      const [eventResult, userResult, analyticsResult] = await Promise.all([
        fetchEvents(),
        fetchUsers(),
        fetchAnalytics(),
      ]);
      
      // Handle events
      if (eventResult.error) {
        console.error("Events fetch error:", eventResult.error);
        setEvents([]);
      } else {
        setEvents(eventResult.data || []);
      }

      // Handle users
      if (userResult.error) {
        console.error("Users fetch error:", userResult.error);
        setUsers([]);
      } else {
        setUsers(userResult.data?.users || userResult.data || []);
      }

      // Handle analytics
      if (analyticsResult.error) {
        console.error("Analytics fetch error:", analyticsResult.error);
        setAnalytics({});
      } else {
        setAnalytics(analyticsResult.data || {});
      }
    } catch (err) {
      console.error("Error loading admin panel:", err);
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
      category: "music",
      tags: "",
    });
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    try {
      const eventData = {
        ...eventForm,
        creatorId: currentUser._id,
        price: parseFloat(eventForm.price),
        totalTickets: parseInt(eventForm.totalTickets),
        tags: eventForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      let result;
      if (editingEvent) {
        result = await updateEvent(editingEvent._id, eventData);
        if (!result.error) {
          setEvents(events.map(event => 
            event._id === editingEvent._id ? result.data : event
          ));
        }
      } else {
        result = await createEvent(eventData);
        if (!result.error) {
          setEvents([result.data, ...events]);
        }
      }
      
      if (result.error) {
        alert("Event submission failed: " + result.error);
      } else {
        setShowEventModal(false);
        setEditingEvent(null);
        resetForm();
        
        // Reload analytics to reflect changes
        const analyticsResult = await fetchAnalytics();
        if (!analyticsResult.error) {
          setAnalytics(analyticsResult.data || {});
        }
      }
    } catch (err) {
      alert("Event submission failed: " + err.message);
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
      category: event.category || "music",
      tags: (event.tags || []).join(', '),
    });
    setShowEventModal(true);
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        const result = await deleteEvent(eventId);
        if (result.error) {
          alert("Failed to delete event: " + result.error);
        } else {
          setEvents(events.filter(event => event._id !== eventId));
          
          // Reload analytics
          const analyticsResult = await fetchAnalytics();
          if (!analyticsResult.error) {
            setAnalytics(analyticsResult.data || {});
          }
        }
      } catch (err) {
        alert("Failed to delete event: " + err.message);
      }
    }
  };

  const handleUserRoleChange = async (userId, role) => {
    if (!userId) {
      alert("User ID is missing. Cannot update role.");
      return;
    }
    try {
      const result = await updateUserRole(userId, role);
      if (result.error) {
        alert("Failed to update role: " + result.error);
      } else {
        setUsers(users.map(u => u._id === result.data._id ? result.data : u));
        alert("Role updated successfully");
      }
    } catch (err) {
      alert("Failed to update role: " + err.message);
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-lg text-white">Loading admin panel...</div>
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
              { id: "analytics", label: "Analytics", icon: "📊" },
              { id: "events", label: "Events", icon: "📅" },
              { id: "users", label: "Users", icon: "👥" },
              { id: "content", label: "Content", icon: "📝" },
              { id: "settings", label: "Settings", icon: "⚙️" },
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

          {/* Platform Summary */}
          <div className="p-4 mt-8 rounded-lg bg-zinc-900">
            <h3 className="mb-3 text-sm font-semibold text-zinc-400">Platform Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-400">Total Users:</span>
                <span className="text-white">{users.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Total Events:</span>
                <span className="text-white">{events.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Revenue:</span>
                <span className="text-green-400">
                  {formatCurrency(analytics.totalRevenue || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Active Events:</span>
                <span className="text-red-400">
                  {events.filter(e => e.status === 'live').length}
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Platform Analytics</h2>
                <button
                  onClick={loadAdminData}
                  className="px-4 py-2 text-white transition-colors rounded-lg bg-zinc-800 hover:bg-zinc-700"
                >
                  Refresh Data
                </button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
                <div className="p-6 rounded-lg bg-zinc-900">
                  <h3 className="mb-2 text-sm text-zinc-400">Total Revenue</h3>
                  <p className="text-2xl font-bold text-green-400">
                    {formatCurrency(analytics.totalRevenue || 0)}
                  </p>
                  <div className="mt-2 text-xs text-zinc-500">
                    Platform-wide earnings
                  </div>
                </div>
                <div className="p-6 rounded-lg bg-zinc-900">
                  <h3 className="mb-2 text-sm text-zinc-400">Tickets Sold</h3>
                  <p className="text-2xl font-bold text-blue-400">
                    {analytics.totalTicketsSold || 0}
                  </p>
                  <div className="mt-2 text-xs text-zinc-500">
                    Total tickets purchased
                  </div>
                </div>
                <div className="p-6 rounded-lg bg-zinc-900">
                  <h3 className="mb-2 text-sm text-zinc-400">Total Users</h3>
                  <p className="text-2xl font-bold text-purple-400">
                    {analytics.totalUsers || users.length}
                  </p>
                  <div className="mt-2 text-xs text-zinc-500">
                    Registered accounts
                  </div>
                </div>
                <div className="p-6 rounded-lg bg-zinc-900">
                  <h3 className="mb-2 text-sm text-zinc-400">Active Events</h3>
                  <p className="text-2xl font-bold text-red-400">
                    {analytics.activeEvents || events.filter(e => e.status === 'live').length}
                  </p>
                  <div className="mt-2 text-xs text-zinc-500">
                    Currently streaming
                  </div>
                </div>
              </div>

              {/* Top Events */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="p-6 rounded-lg bg-zinc-900">
                  <h3 className="mb-4 text-lg font-semibold">Top Performing Events</h3>
                  <div className="space-y-3">
                    {analytics.topEvents?.length > 0 ? (
                      analytics.topEvents.map((event, index) => (
                        <div key={index} className="flex items-center justify-between py-2">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center justify-center w-8 h-8 text-sm font-bold text-black bg-white rounded-full">
                              {index + 1}
                            </div>
                            <span className="font-medium">{event._id || event.name}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-green-400">{formatCurrency(event.revenue || 0)}</div>
                            <div className="text-sm text-zinc-400">{event.tickets || 0} tickets</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-zinc-400">No event data available yet</p>
                    )}
                  </div>
                </div>

                <div className="p-6 rounded-lg bg-zinc-900">
                  <h3 className="mb-4 text-lg font-semibold">User Distribution</h3>
                  <div className="space-y-3">
                    {['admin', 'creator', 'user'].map(role => {
                      const count = users.filter(u => u.role === role).length;
                      const percentage = users.length > 0 ? (count / users.length * 100).toFixed(1) : 0;
                      return (
                        <div key={role} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className={`capitalize font-medium ${getRoleColor(role)}`}>
                              {role}s
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-white">{count}</div>
                            <div className="text-sm text-zinc-400">{percentage}%</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Events Tab */}
          {activeTab === "events" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Event Management ({events.length})</h2>
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
                  <h3 className="mb-2 text-lg font-semibold">No events created yet</h3>
                  <p className="mb-6 text-zinc-400">Create the first event to get started</p>
                  <button
                    onClick={() => setShowEventModal(true)}
                    className="px-6 py-3 text-black transition-colors bg-white rounded-lg hover:bg-zinc-200"
                  >
                    Create First Event
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
                  {events.map((event) => (
                    <div key={event._id} className="p-6 rounded-lg bg-zinc-900">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold truncate">{event.title}</h3>
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
                          <span className="text-zinc-400">Tickets:</span>
                          <span>{event.soldTickets || 0}/{event.totalTickets}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Revenue:</span>
                          <span className="text-green-400">
                            {formatCurrency((event.soldTickets || 0) * event.price)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Creator:</span>
                          <span className="text-xs">
                            {users.find(u => u._id === event.creatorId)?.name || 'Unknown'}
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
              <h2 className="mb-6 text-xl font-semibold">User Management ({users.length})</h2>

              {users.length === 0 ? (
                <div className="p-12 text-center rounded-lg bg-zinc-900">
                  <div className="mb-4 text-4xl">👥</div>
                  <h3 className="mb-2 text-lg font-semibold">No users found</h3>
                  <p className="text-zinc-400">Users will appear here as they register</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-lg bg-zinc-900">
                  <div className="overflow-x-auto">
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
                          <tr key={user._id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
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
                              {[user.city, user.country].filter(Boolean).join(', ') || 'Not set'}
                            </td>
                            <td className="p-4 text-sm text-zinc-400">
                              {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                            </td>
                            <td className="p-4">
                              <select
                                value={user.role}
                                onChange={(e) => handleUserRoleChange(user._id, e.target.value)}
                                className="px-3 py-1 text-sm text-white border rounded bg-zinc-800 border-zinc-700"
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
                </div>
              )}
            </div>
          )}

          {/* Content Tab */}
          {activeTab === "content" && (
            <div>
              <h2 className="mb-6 text-xl font-semibold">Content Management</h2>
              <div className="p-12 text-center rounded-lg bg-zinc-900">
                <div className="mb-4 text-4xl">📝</div>
                <h3 className="mb-2 text-lg font-semibold">Content Management</h3>
                <p className="text-zinc-400">Content management features coming soon...</p>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div>
              <h2 className="mb-6 text-xl font-semibold">Platform Settings</h2>
              <div className="p-12 text-center rounded-lg bg-zinc-900">
                <div className="mb-4 text-4xl">⚙️</div>
                <h3 className="mb-2 text-lg font-semibold">Platform Settings</h3>
                <p className="text-zinc-400">Settings management coming soon...</p>
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

export default AdminPanel;