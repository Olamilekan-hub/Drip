import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminPanel = () => {
  const { currentUser, userProfile, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('events');
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    price: '',
    totalTickets: '',
    streamUrl: ''
  });

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin()) {
      navigate('/dashboard');
    }
  }, [userProfile, navigate, isAdmin]);

  // Load mock data
  useEffect(() => {
    const mockEvents = [
      {
        id: 1,
        title: 'drip001/toronto',
        description: 'Electronic music experience in Toronto',
        date: '2025-07-15',
        time: '20:00',
        price: 25,
        totalTickets: 200,
        soldTickets: 150,
        status: 'upcoming',
        streamUrl: 'https://stream.castr.com/event1',
        createdAt: '2025-06-01'
      },
      {
        id: 2,
        title: 'drip002/montreal',
        description: 'Underground house session',
        date: '2025-06-28',
        time: '21:00',
        price: 30,
        totalTickets: 100,
        soldTickets: 100,
        status: 'live',
        streamUrl: 'https://stream.castr.com/event2',
        createdAt: '2025-06-15'
      },
      {
        id: 3,
        title: 'drip000/vancouver',
        description: 'Debut Vancouver show',
        date: '2025-06-10',
        time: '19:30',
        price: 20,
        totalTickets: 75,
        soldTickets: 75,
        status: 'past',
        streamUrl: 'https://stream.castr.com/event3',
        createdAt: '2025-05-20'
      }
    ];

    const mockUsers = [
      {
        id: 'user1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'user',
        country: 'Canada',
        city: 'Toronto',
        joinDate: '2025-05-15',
        ticketsPurchased: 3,
        totalSpent: 75
      },
      {
        id: 'user2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'creator',
        country: 'Canada',
        city: 'Montreal',
        joinDate: '2025-04-20',
        ticketsPurchased: 5,
        totalSpent: 125
      },
      {
        id: 'user3',
        name: 'Admin User',
        email: 'admin@drip.live',
        role: 'admin',
        country: 'Canada',
        city: 'Vancouver',
        joinDate: '2025-01-01',
        ticketsPurchased: 0,
        totalSpent: 0
      }
    ];

    const mockAnalytics = {
      totalRevenue: 8750,
      totalTicketsSold: 325,
      totalUsers: 156,
      activeEvents: 1,
      monthlyRevenue: [
        { month: 'Jan', revenue: 1200 },
        { month: 'Feb', revenue: 1800 },
        { month: 'Mar', revenue: 2100 },
        { month: 'Apr', revenue: 1900 },
        { month: 'May', revenue: 2200 },
        { month: 'Jun', revenue: 2500 }
      ],
      topEvents: [
        { name: 'drip002/montreal', revenue: 3000, tickets: 100 },
        { name: 'drip001/toronto', revenue: 3750, tickets: 150 },
        { name: 'drip000/vancouver', revenue: 1500, tickets: 75 }
      ]
    };

    setEvents(mockEvents);
    setUsers(mockUsers);
    setAnalytics(mockAnalytics);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleEventSubmit = (e) => {
    e.preventDefault();
    
    if (editingEvent) {
      // Update existing event
      setEvents(events.map(event => 
        event.id === editingEvent.id 
          ? { ...event, ...eventForm, id: editingEvent.id }
          : event
      ));
    } else {
      // Create new event
      const newEvent = {
        ...eventForm,
        id: Date.now(),
        soldTickets: 0,
        status: 'upcoming',
        createdAt: new Date().toISOString().split('T')[0]
      };
      setEvents([...events, newEvent]);
    }

    setShowEventModal(false);
    setEditingEvent(null);
    setEventForm({
      title: '',
      description: '',
      date: '',
      time: '',
      price: '',
      totalTickets: '',
      streamUrl: ''
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
      streamUrl: event.streamUrl
    });
    setShowEventModal(true);
  };

  const handleDeleteEvent = (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      setEvents(events.filter(event => event.id !== eventId));
    }
  };

  const handleUserRoleChange = (userId, newRole) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, role: newRole } : user
    ));
    alert(`User role updated to ${newRole}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'live': return 'bg-red-500';
      case 'upcoming': return 'bg-green-500';
      case 'past': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'text-red-400';
      case 'creator': return 'text-blue-400';
      case 'user': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

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
              Admin: {userProfile?.name || userProfile?.displayName || 'Admin'}
            </span>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-sm transition-colors text-zinc-400 hover:text-white"
            >
              User Dashboard
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
              { id: 'analytics', label: 'Analytics', icon: '📊' },
              { id: 'events', label: 'Events', icon: '📅' },
              { id: 'users', label: 'Users', icon: '👥' },
              { id: 'content', label: 'Content', icon: '📝' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center space-x-3 ${
                  activeTab === tab.id 
                    ? 'bg-white text-black' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
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
          {activeTab === 'analytics' && (
            <div>
              <h2 className="mb-6 text-xl font-semibold">Platform Analytics</h2>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
                <div className="p-6 rounded-lg bg-zinc-900">
                  <h3 className="mb-2 text-sm text-zinc-400">Total Revenue</h3>
                  <p className="text-2xl font-bold text-green-400">${analytics.totalRevenue?.toLocaleString()}</p>
                </div>
                <div className="p-6 rounded-lg bg-zinc-900">
                  <h3 className="mb-2 text-sm text-zinc-400">Tickets Sold</h3>
                  <p className="text-2xl font-bold text-blue-400">{analytics.totalTicketsSold}</p>
                </div>
                <div className="p-6 rounded-lg bg-zinc-900">
                  <h3 className="mb-2 text-sm text-zinc-400">Total Users</h3>
                  <p className="text-2xl font-bold text-purple-400">{analytics.totalUsers}</p>
                </div>
                <div className="p-6 rounded-lg bg-zinc-900">
                  <h3 className="mb-2 text-sm text-zinc-400">Active Events</h3>
                  <p className="text-2xl font-bold text-red-400">{analytics.activeEvents}</p>
                </div>
              </div>

              {/* Top Events */}
              <div className="p-6 rounded-lg bg-zinc-900">
                <h3 className="mb-4 text-lg font-semibold">Top Performing Events</h3>
                <div className="space-y-3">
                  {analytics.topEvents?.map((event, index) => (
                    <div key={index} className="flex items-center justify-between py-2">
                      <span className="font-medium">{event.name}</span>
                      <div className="text-right">
                        <div className="text-green-400">${event.revenue}</div>
                        <div className="text-sm text-zinc-400">{event.tickets} tickets</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Events Tab */}
          {activeTab === 'events' && (
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

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
                {events.map(event => (
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
                        <span className="text-zinc-400">Tickets:</span>
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

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div>
              <h2 className="mb-6 text-xl font-semibold">User Management</h2>
              
              <div className="overflow-hidden rounded-lg bg-zinc-900">
                <table className="w-full">
                  <thead className="border-b border-zinc-800">
                    <tr>
                      <th className="p-4 text-left text-zinc-400">User</th>
                      <th className="p-4 text-left text-zinc-400">Role</th>
                      <th className="p-4 text-left text-zinc-400">Location</th>
                      <th className="p-4 text-left text-zinc-400">Joined</th>
                      <th className="p-4 text-left text-zinc-400">Activity</th>
                      <th className="p-4 text-left text-zinc-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id} className="border-b border-zinc-800">
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
                          {user.joinDate}
                        </td>
                        <td className="p-4 text-sm text-zinc-400">
                          <div>{user.ticketsPurchased} tickets</div>
                          <div className="text-green-400">${user.totalSpent}</div>
                        </td>
                        <td className="p-4">
                          <select
                            value={user.role}
                            onChange={(e) => handleUserRoleChange(user.id, e.target.value)}
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
            </div>
          )}

          {/* Content Tab */}
          {activeTab === 'content' && (
            <div>
              <h2 className="mb-6 text-xl font-semibold">Content Management</h2>
              
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="p-6 rounded-lg bg-zinc-900">
                  <h3 className="mb-4 text-lg font-semibold">Site Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block mb-2 text-sm text-zinc-400">Platform Name</label>
                      <input
                        type="text"
                        defaultValue="drip"
                        className="w-full px-3 py-2 text-white border rounded bg-zinc-800 border-zinc-700 focus:border-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-sm text-zinc-400">Platform Description</label>
                      <textarea
                        defaultValue="Live streaming music events platform"
                        className="w-full h-20 px-3 py-2 text-white border rounded bg-zinc-800 border-zinc-700 focus:border-white focus:outline-none"
                      />
                    </div>
                    <button className="px-4 py-2 text-black transition-colors bg-white rounded hover:bg-zinc-200">
                      Save Settings
                    </button>
                  </div>
                </div>

                <div className="p-6 rounded-lg bg-zinc-900">
                  <h3 className="mb-4 text-lg font-semibold">Featured Content</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block mb-2 text-sm text-zinc-400">Featured Event</label>
                      <select className="w-full px-3 py-2 text-white border rounded bg-zinc-800 border-zinc-700 focus:border-white focus:outline-none">
                        <option>Select event...</option>
                        {events.map(event => (
                          <option key={event.id} value={event.id}>{event.title}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block mb-2 text-sm text-zinc-400">Homepage Banner Text</label>
                      <input
                        type="text"
                        defaultValue="Experience live music like never before"
                        className="w-full px-3 py-2 text-white border rounded bg-zinc-800 border-zinc-700 focus:border-white focus:outline-none"
                      />
                    </div>
                    <button className="px-4 py-2 text-black transition-colors bg-white rounded hover:bg-zinc-200">
                      Update Content
                    </button>
                  </div>
                </div>
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
              {editingEvent ? 'Edit Event' : 'Create New Event'}
            </h3>
            
            <form onSubmit={handleEventSubmit} className="space-y-4">
              <div>
                <label className="block mb-2 text-sm text-zinc-400">Title</label>
                <input
                  type="text"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({...eventForm, title: e.target.value})}
                  className="w-full px-3 py-2 text-white border rounded bg-zinc-800 border-zinc-700 focus:border-white focus:outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block mb-2 text-sm text-zinc-400">Description</label>
                <textarea
                  value={eventForm.description}
                  onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
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
                    onChange={(e) => setEventForm({...eventForm, date: e.target.value})}
                    className="w-full px-3 py-2 text-white border rounded bg-zinc-800 border-zinc-700 focus:border-white focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm text-zinc-400">Time</label>
                  <input
                    type="time"
                    value={eventForm.time}
                    onChange={(e) => setEventForm({...eventForm, time: e.target.value})}
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
                    onChange={(e) => setEventForm({...eventForm, price: e.target.value})}
                    className="w-full px-3 py-2 text-white border rounded bg-zinc-800 border-zinc-700 focus:border-white focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm text-zinc-400">Total Tickets</label>
                  <input
                    type="number"
                    value={eventForm.totalTickets}
                    onChange={(e) => setEventForm({...eventForm, totalTickets: e.target.value})}
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
                  onChange={(e) => setEventForm({...eventForm, streamUrl: e.target.value})}
                  className="w-full px-3 py-2 text-white border rounded bg-zinc-800 border-zinc-700 focus:border-white focus:outline-none"
                  required
                />
              </div>
              
              <div className="flex mt-6 space-x-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-black transition-colors bg-white rounded hover:bg-zinc-200"
                >
                  {editingEvent ? 'Update Event' : 'Create Event'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEventModal(false);
                    setEditingEvent(null);
                    setEventForm({
                      title: '',
                      description: '',
                      date: '',
                      time: '',
                      price: '',
                      totalTickets: '',
                      streamUrl: ''
                    });
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