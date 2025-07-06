// frontend/src/components/UserDashboard.js
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  fetchEvents,
  fetchUserTickets,
  fetchWatchHistory,
  updateUserProfile,
  purchaseTicket,
} from "../api/api";
import NavigationHeader from "./NavigationHeader";

const UserDashboard = () => {
  const { currentUser, userProfile, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("events");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [events, setEvents] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [watchHistory, setWatchHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    country: "",
    city: "",
    preferences: {
      notifications: true,
      newsletter: false
    }
  });

  useEffect(() => {
    if (currentUser?._id) {
      loadUserData();
    }
  }, [currentUser]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const [eventsResult, ticketsResult, historyResult] = await Promise.all([
        fetchEvents(),
        fetchUserTickets(currentUser._id),
        fetchWatchHistory(currentUser._id),
      ]);

      // Handle events
      if (eventsResult.error) {
        console.error("Events fetch error:", eventsResult.error);
        setEvents([]);
      } else {
        setEvents(eventsResult.data || []);
      }

      // Handle tickets
      if (ticketsResult.error) {
        console.error("Tickets fetch error:", ticketsResult.error);
        setTickets([]);
      } else {
        setTickets(ticketsResult.data || []);
      }

      // Handle history
      if (historyResult.error) {
        console.error("History fetch error:", historyResult.error);
        setWatchHistory([]);
      } else {
        setWatchHistory(historyResult.data || []);
      }

      // Set profile form data
      setProfileForm({
        name: userProfile?.name || "",
        country: userProfile?.country || "",
        city: userProfile?.city || "",
        preferences: {
          notifications: userProfile?.preferences?.notifications ?? true,
          newsletter: userProfile?.preferences?.newsletter ?? false
        }
      });
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      setEvents([]);
      setTickets([]);
      setWatchHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(profileForm);
      alert("Profile updated successfully!");
      setIsEditingProfile(false);
    } catch (err) {
      alert("Failed to update profile: " + err.message);
      console.error(err);
    }
  };

  const handleEventClick = (eventId) => {
    navigate(`/stream/${eventId}`);
  };

  const handleBuyTicket = async (event) => {
    try {
      const ticketData = {
        userId: currentUser._id,
        eventTitle: event.title,
        price: event.price,
      };
      
      const result = await purchaseTicket(event._id, ticketData);
      
      if (result.error) {
        alert("Purchase failed: " + result.error);
      } else {
        alert("Ticket purchased successfully!");
        setTickets((prev) => [...prev, result.data]);
        
        // Reload events to update sold ticket count
        const eventsResult = await fetchEvents();
        if (!eventsResult.error) {
          setEvents(eventsResult.data || []);
        }
      }
    } catch (err) {
      alert("Purchase failed: " + err.message);
    }
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || event.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "live": return "bg-red-500";
      case "upcoming": return "bg-green-500";
      case "past": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  const getTicketStatusColor = (status) => {
    switch (status) {
      case "active": return "text-green-400";
      case "used": return "text-gray-400";
      case "expired": return "text-red-400";
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
        <div className="text-lg text-white">Loading dashboard...</div>
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
              { id: "events", label: "Browse Events", icon: "📅" },
              { id: "tickets", label: "My Tickets", icon: "🎫" },
              { id: "history", label: "Watch History", icon: "📺" },
              { id: "profile", label: "Profile", icon: "👤" },
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

          {/* Quick Stats */}
          <div className="p-4 mt-8 rounded-lg bg-zinc-900">
            <h3 className="mb-3 text-sm font-semibold text-zinc-400">Quick Stats</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-400">Tickets Owned:</span>
                <span className="text-white">{tickets.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Events Watched:</span>
                <span className="text-white">{watchHistory.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Total Spent:</span>
                <span className="text-green-400">
                  {formatCurrency(tickets.reduce((sum, ticket) => sum + (ticket.price || 0), 0))}
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Events Tab */}
          {activeTab === "events" && (
            <div>
              <div className="flex flex-col justify-between gap-4 mb-6 sm:flex-row sm:items-center">
                <h2 className="text-xl font-semibold">Browse Events</h2>
                <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                  <input
                    type="text"
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="px-4 py-2 text-white border rounded-lg bg-zinc-800 border-zinc-700 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-white/30 min-w-0 sm:min-w-[200px]"
                  />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 text-white border rounded-lg bg-zinc-800 border-zinc-700 focus:outline-none focus:ring-2 focus:ring-white/30"
                  >
                    <option value="all">All Events</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="live">Live Now</option>
                    <option value="past">Past</option>
                  </select>
                </div>
              </div>

              {filteredEvents.length === 0 ? (
                <div className="p-12 text-center rounded-lg bg-zinc-900">
                  <div className="mb-4 text-4xl">🎪</div>
                  <h3 className="mb-2 text-lg font-semibold">
                    {searchQuery || filterStatus !== "all" 
                      ? "No events match your criteria" 
                      : "No events available yet"}
                  </h3>
                  <p className="text-zinc-400">
                    {searchQuery || filterStatus !== "all"
                      ? "Try adjusting your search or filters"
                      : "Check back soon for exciting live events!"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredEvents.map((event) => {
                    const userHasTicket = tickets.some(ticket => 
                      ticket.eventId === event._id && ticket.status === 'active'
                    );
                    const isSoldOut = (event.soldTickets || 0) >= event.totalTickets;
                    
                    return (
                      <div
                        key={event._id}
                        className="overflow-hidden transition-all duration-200 rounded-lg bg-zinc-900 hover:bg-zinc-800 hover:scale-[1.02]"
                      >
                        <div className="relative flex items-center justify-center aspect-video bg-zinc-800">
                          <span className="text-zinc-500">Event Image</span>
                          {event.status === 'live' && (
                            <div className="absolute flex items-center px-2 py-1 space-x-1 bg-red-500 rounded-full top-3 left-3">
                              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                              <span className="text-xs font-medium text-white">LIVE</span>
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold truncate">{event.title}</h3>
                            <span
                              className={`px-2 py-1 rounded-full text-xs text-white ${getStatusColor(
                                event.status
                              )}`}
                            >
                              {event.status}
                            </span>
                          </div>
                          <p className="mb-3 text-sm text-zinc-400 line-clamp-2">
                            {event.description}
                          </p>
                          <div className="mb-4 space-y-1 text-sm text-zinc-300">
                            <div className="flex justify-between">
                              <span className="text-zinc-400">Date:</span>
                              <span>{event.date} at {event.time}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-zinc-400">Price:</span>
                              <span className="font-medium">{formatCurrency(event.price)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-zinc-400">Available:</span>
                              <span className={isSoldOut ? "text-red-400" : "text-green-400"}>
                                {event.totalTickets - (event.soldTickets || 0)}/{event.totalTickets}
                              </span>
                            </div>
                          </div>
                          
                          {userHasTicket ? (
                            <button
                              onClick={() => handleEventClick(event._id)}
                              className="w-full py-2 font-semibold text-black transition-colors bg-green-400 rounded-lg hover:bg-green-500"
                            >
                              {event.status === "live" ? "Watch Now" : "Access Event"}
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                if (event.status === "live" && !userHasTicket) {
                                  handleBuyTicket(event);
                                } else if (event.status === "upcoming" && !isSoldOut) {
                                  handleBuyTicket(event);
                                } else if (event.status === "live" && userHasTicket) {
                                  handleEventClick(event._id);
                                }
                              }}
                              className={`w-full py-2 font-semibold transition-colors rounded-lg ${
                                isSoldOut 
                                  ? "bg-zinc-700 text-zinc-400 cursor-not-allowed"
                                  : "bg-white text-black hover:bg-zinc-200"
                              }`}
                              disabled={isSoldOut}
                            >
                              {isSoldOut
                                ? "Sold Out"
                                : event.status === "live"
                                ? `Buy Ticket & Watch - ${formatCurrency(event.price)}`
                                : event.status === "upcoming"
                                ? `Get Ticket - ${formatCurrency(event.price)}`
                                : "View Details"}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tickets Tab */}
          {activeTab === "tickets" && (
            <div>
              <h2 className="mb-6 text-xl font-semibold">My Tickets ({tickets.length})</h2>
              {tickets.length === 0 ? (
                <div className="p-12 text-center rounded-lg bg-zinc-900">
                  <div className="mb-4 text-4xl">🎫</div>
                  <h3 className="mb-2 text-lg font-semibold">No tickets yet</h3>
                  <p className="mb-6 text-zinc-400">Purchase tickets to access exclusive live events</p>
                  <button
                    onClick={() => setActiveTab("events")}
                    className="px-6 py-3 text-black transition-colors bg-white rounded-lg hover:bg-zinc-200"
                  >
                    Browse Events
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {tickets.map((ticket) => (
                    <div
                      key={ticket._id}
                      className="flex flex-col justify-between gap-4 p-6 rounded-lg sm:flex-row sm:items-center bg-zinc-900"
                    >
                      <div className="flex-1">
                        <h3 className="mb-1 font-semibold">{ticket.eventTitle}</h3>
                        <p className="mb-2 text-sm text-zinc-400">
                          Purchased: {ticket.purchaseDate} • {formatCurrency(ticket.price)}
                        </p>
                        <span
                          className={`text-sm font-medium ${getTicketStatusColor(
                            ticket.status
                          )}`}
                        >
                          {ticket.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-16 h-16 bg-white rounded-lg">
                          <span className="font-mono text-xs text-black">QR</span>
                        </div>
                        <div className="flex flex-col space-y-2">
                          <button 
                            onClick={() => {
                              // Find the event for this ticket
                              const event = events.find(e => e._id === ticket.eventId);
                              if (event && event.status === 'live') {
                                handleEventClick(ticket.eventId);
                              } else {
                                alert('Event is not currently live');
                              }
                            }}
                            className="px-4 py-2 text-sm transition-colors rounded-lg bg-zinc-800 hover:bg-zinc-700"
                          >
                            {events.find(e => e._id === ticket.eventId)?.status === 'live' ? 'Watch Now' : 'View Details'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Watch History Tab */}
          {activeTab === "history" && (
            <div>
              <h2 className="mb-6 text-xl font-semibold">Watch History ({watchHistory.length})</h2>
              {watchHistory.length === 0 ? (
                <div className="p-12 text-center rounded-lg bg-zinc-900">
                  <div className="mb-4 text-4xl">📺</div>
                  <h3 className="mb-2 text-lg font-semibold">No watch history yet</h3>
                  <p className="text-zinc-400">Your viewing history will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {watchHistory.map((item) => (
                    <div
                      key={item._id}
                      className="flex items-center p-4 space-x-4 rounded-lg bg-zinc-900"
                    >
                      <div className="flex items-center justify-center w-24 h-16 rounded-lg bg-zinc-800">
                        <span className="text-xs text-zinc-500">Thumb</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="mb-1 font-semibold">{item.eventTitle}</h3>
                        <p className="text-sm text-zinc-400">
                          Watched on {item.watchDate} • Duration: {item.duration}
                        </p>
                      </div>
                      <button className="px-4 py-2 text-sm transition-colors rounded-lg bg-zinc-800 hover:bg-zinc-700">
                        Watch Again
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Profile Settings</h2>
                <button
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className="px-4 py-2 text-black transition-colors bg-white rounded-lg hover:bg-zinc-200"
                >
                  {isEditingProfile ? "Cancel" : "Edit Profile"}
                </button>
              </div>

              {isEditingProfile ? (
                <form onSubmit={handleProfileUpdate} className="max-w-md space-y-6">
                  <div>
                    <label className="block mb-2 text-sm font-medium">Name</label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, name: e.target.value })
                      }
                      className="w-full px-4 py-2 text-white border rounded-lg bg-zinc-800 border-zinc-700 focus:outline-none focus:ring-2 focus:ring-white/30"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-2 text-sm font-medium">Country</label>
                    <input
                      type="text"
                      value={profileForm.country}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, country: e.target.value })
                      }
                      className="w-full px-4 py-2 text-white border rounded-lg bg-zinc-800 border-zinc-700 focus:outline-none focus:ring-2 focus:ring-white/30"
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-2 text-sm font-medium">City</label>
                    <input
                      type="text"
                      value={profileForm.city}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, city: e.target.value })
                      }
                      className="w-full px-4 py-2 text-white border rounded-lg bg-zinc-800 border-zinc-700 focus:outline-none focus:ring-2 focus:ring-white/30"
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="block text-sm font-medium">Preferences</label>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={profileForm.preferences.notifications}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              preferences: {
                                ...profileForm.preferences,
                                notifications: e.target.checked
                              }
                            })
                          }
                          className="w-4 h-4 mr-3 accent-white"
                        />
                        <span className="text-sm">Receive event notifications</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={profileForm.preferences.newsletter}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              preferences: {
                                ...profileForm.preferences,
                                newsletter: e.target.checked
                              }
                            })
                          }
                          className="w-4 h-4 mr-3 accent-white"
                        />
                        <span className="text-sm">Subscribe to newsletter</span>
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2 font-semibold text-black transition-colors bg-white rounded-lg hover:bg-zinc-200"
                  >
                    Save Changes
                  </button>
                </form>
              ) : (
                <div className="max-w-md p-6 rounded-lg bg-zinc-900">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-zinc-400">Name</label>
                      <p className="text-white">{userProfile?.name || "Not set"}</p>
                    </div>
                    <div>
                      <label className="text-sm text-zinc-400">Email</label>
                      <p className="text-white">{userProfile?.email}</p>
                    </div>
                    <div>
                      <label className="text-sm text-zinc-400">Role</label>
                      <p className="text-white capitalize">{userProfile?.role || "user"}</p>
                    </div>
                    <div>
                      <label className="text-sm text-zinc-400">Location</label>
                      <p className="text-white">
                        {[userProfile?.city, userProfile?.country].filter(Boolean).join(', ') || "Not set"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-zinc-400">Member Since</label>
                      <p className="text-white">
                        {userProfile?.createdAt
                          ? new Date(userProfile.createdAt).toLocaleDateString()
                          : "Unknown"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;