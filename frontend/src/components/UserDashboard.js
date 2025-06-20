import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('events');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [events, setEvents] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [watchHistory, setWatchHistory] = useState([]);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    country: '',
    city: ''
  });

  // Mock data - replace with API calls
  useEffect(() => {
    // Load mock events
    const mockEvents = [
      {
        id: 1,
        title: 'drip001/toronto',
        date: '2025-07-15',
        time: '20:00',
        price: 25,
        status: 'upcoming',
        image: '/api/placeholder/300/200',
        description: 'Electronic music experience in Toronto',
        ticketsAvailable: 150,
        totalTickets: 200
      },
      {
        id: 2,
        title: 'drip002/montreal',
        date: '2025-06-28',
        time: '21:00',
        price: 30,
        status: 'live',
        image: '/api/placeholder/300/200',
        description: 'Underground house session',
        ticketsAvailable: 0,
        totalTickets: 100
      },
      {
        id: 3,
        title: 'drip000/vancouver',
        date: '2025-06-10',
        time: '19:30',
        price: 20,
        status: 'past',
        image: '/api/placeholder/300/200',
        description: 'Debut Vancouver show',
        ticketsAvailable: 0,
        totalTickets: 75
      }
    ];

    // Load mock tickets
    const mockTickets = [
      {
        id: 'ticket_001',
        eventId: 1,
        eventTitle: 'drip001/toronto',
        purchaseDate: '2025-06-15',
        price: 25,
        status: 'active',
        qrCode: 'QR_CODE_DATA_001'
      },
      {
        id: 'ticket_002',
        eventId: 3,
        eventTitle: 'drip000/vancouver',
        purchaseDate: '2025-06-01',
        price: 20,
        status: 'used',
        qrCode: 'QR_CODE_DATA_002'
      }
    ];

    // Load mock watch history
    const mockHistory = [
      {
        id: 1,
        eventTitle: 'drip000/vancouver',
        watchDate: '2025-06-10',
        duration: '2h 15m',
        thumbnail: '/api/placeholder/150/100'
      },
      {
        id: 2,
        eventTitle: 'drip002/montreal',
        watchDate: '2025-06-28',
        duration: '1h 45m',
        thumbnail: '/api/placeholder/150/100'
      }
    ];

    setEvents(mockEvents);
    setTickets(mockTickets);
    setWatchHistory(mockHistory);

    // Initialize profile form
    if (userProfile) {
      setProfileForm({
        name: userProfile.name || userProfile.displayName || '',
        email: userProfile.email || '',
        country: userProfile.country || '',
        city: userProfile.city || ''
      });
    }
  }, [userProfile]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    // In real app, this would call an API
    console.log('Profile updated:', profileForm);
    setIsEditingProfile(false);
    // Show success message
    alert('Profile updated successfully!');
  };

  const handleEventClick = (eventId) => {
    navigate(`/stream/${eventId}`);
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || event.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'live': return 'bg-red-500';
      case 'upcoming': return 'bg-green-500';
      case 'past': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getTicketStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'used': return 'text-gray-400';
      case 'expired': return 'text-red-400';
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
            <span className="text-zinc-400">dashboard</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-zinc-400">
              Welcome, {userProfile?.name || userProfile?.displayName || 'User'}
            </span>
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
              { id: 'events', label: 'Events', icon: '📅' },
              { id: 'tickets', label: 'My Tickets', icon: '🎫' },
              { id: 'history', label: 'Watch History', icon: '📺' },
              { id: 'profile', label: 'Profile', icon: '👤' }
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
          {/* Events Tab */}
          {activeTab === 'events' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Events</h2>
                <div className="flex items-center space-x-4">
                  <input
                    type="text"
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="px-4 py-2 text-white border rounded-lg bg-zinc-800 border-zinc-700 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-white/30"
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

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredEvents.map(event => (
                  <div key={event.id} className="overflow-hidden transition-colors rounded-lg bg-zinc-900 hover:bg-zinc-800">
                    <div className="flex items-center justify-center aspect-video bg-zinc-800">
                      <span className="text-zinc-500">Event Image</span>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{event.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs text-white ${getStatusColor(event.status)}`}>
                          {event.status}
                        </span>
                      </div>
                      <p className="mb-3 text-sm text-zinc-400">{event.description}</p>
                      <div className="mb-3 text-sm text-zinc-300">
                        <div>{event.date} at {event.time}</div>
                        <div>${event.price}</div>
                      </div>
                      <button
                        onClick={() => handleEventClick(event.id)}
                        className="w-full py-2 font-semibold text-black transition-colors bg-white rounded-lg hover:bg-zinc-200"
                      >
                        {event.status === 'live' ? 'Watch Now' : 
                         event.status === 'upcoming' ? 'Get Ticket' : 'View'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tickets Tab */}
          {activeTab === 'tickets' && (
            <div>
              <h2 className="mb-6 text-xl font-semibold">My Tickets</h2>
              <div className="space-y-4">
                {tickets.map(ticket => (
                  <div key={ticket.id} className="flex items-center justify-between p-6 rounded-lg bg-zinc-900">
                    <div>
                      <h3 className="mb-1 font-semibold">{ticket.eventTitle}</h3>
                      <p className="mb-2 text-sm text-zinc-400">
                        Purchased: {ticket.purchaseDate} • ${ticket.price}
                      </p>
                      <span className={`text-sm font-medium ${getTicketStatusColor(ticket.status)}`}>
                        {ticket.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-16 h-16 bg-white rounded-lg">
                        <span className="text-xs text-black">QR</span>
                      </div>
                      <button className="px-4 py-2 text-sm transition-colors rounded-lg bg-zinc-800 hover:bg-zinc-700">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Watch History Tab */}
          {activeTab === 'history' && (
            <div>
              <h2 className="mb-6 text-xl font-semibold">Watch History</h2>
              <div className="space-y-4">
                {watchHistory.map(item => (
                  <div key={item.id} className="flex items-center p-4 space-x-4 rounded-lg bg-zinc-900">
                    <div className="flex items-center justify-center w-24 h-16 rounded-lg bg-zinc-800">
                      <span className="text-xs text-zinc-500">Thumb</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-1 font-semibold">{item.eventTitle}</h3>
                      <p className="text-sm text-zinc-400">
                        Watched on {item.watchDate} • {item.duration}
                      </p>
                    </div>
                    <button className="px-4 py-2 text-sm transition-colors rounded-lg bg-zinc-800 hover:bg-zinc-700">
                      Watch Again
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Profile</h2>
                <button
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className="px-4 py-2 text-black transition-colors bg-white rounded-lg hover:bg-zinc-200"
                >
                  {isEditingProfile ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>

              {isEditingProfile ? (
                <form onSubmit={handleProfileUpdate} className="max-w-md space-y-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium">Name</label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                      className="w-full px-4 py-2 text-white border rounded-lg bg-zinc-800 border-zinc-700 focus:outline-none focus:ring-2 focus:ring-white/30"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">Email</label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                      className="w-full px-4 py-2 text-white border rounded-lg bg-zinc-800 border-zinc-700 focus:outline-none focus:ring-2 focus:ring-white/30"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">Country</label>
                    <input
                      type="text"
                      value={profileForm.country}
                      onChange={(e) => setProfileForm({...profileForm, country: e.target.value})}
                      className="w-full px-4 py-2 text-white border rounded-lg bg-zinc-800 border-zinc-700 focus:outline-none focus:ring-2 focus:ring-white/30"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">City</label>
                    <input
                      type="text"
                      value={profileForm.city}
                      onChange={(e) => setProfileForm({...profileForm, city: e.target.value})}
                      className="w-full px-4 py-2 text-white border rounded-lg bg-zinc-800 border-zinc-700 focus:outline-none focus:ring-2 focus:ring-white/30"
                    />
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
                      <p className="text-white">{userProfile?.name || userProfile?.displayName || 'Not set'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-zinc-400">Email</label>
                      <p className="text-white">{userProfile?.email}</p>
                    </div>
                    <div>
                      <label className="text-sm text-zinc-400">Country</label>
                      <p className="text-white">{userProfile?.country || 'Not set'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-zinc-400">City</label>
                      <p className="text-white">{userProfile?.city || 'Not set'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-zinc-400">Member Since</label>
                      <p className="text-white">{userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : 'Unknown'}</p>
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