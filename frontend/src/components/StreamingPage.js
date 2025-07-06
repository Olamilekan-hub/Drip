import React, { useState, useEffect } from 'react';

const StreamingPage = ({ eventId = "sample-event", onNavigate }) => {
  // Mock data for demo purposes
  const [event] = useState({
    _id: "sample-event",
    title: "drip001/toronto",
    description: "An exclusive underground electronic music experience",
    price: 25,
    status: "live",
    creatorId: "creator-1"
  });
  
  const [currentUser] = useState({
    _id: "user-1",
    name: "John Doe",
    email: "john@example.com"
  });
  
  const [userTickets] = useState([
    { eventId: "sample-event", status: "active", _id: "ticket-1" }
  ]);
  
  const [loading, setLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);

  // Mock chat messages for demo
  const [chatMessages, setChatMessages] = useState([
    { id: 1, user: 'Alex', message: 'Amazing show! 🔥', timestamp: '10:23' },
    { id: 2, user: 'Sarah', message: 'The sound quality is incredible', timestamp: '10:24' },
    { id: 3, user: 'Mike', message: 'This is exactly what I needed tonight', timestamp: '10:25' },
    { id: 4, user: 'Emma', message: 'Best stream I\'ve watched all year', timestamp: '10:26' },
  ]);

  const hasValidTicket = () => {
    return userTickets.some(ticket => 
      ticket.eventId === eventId && ticket.status === 'active'
    );
  };

  const handleTicketPurchase = () => {
    // Mock purchase - in real app would call API
    setShowTicketModal(false);
    alert('Ticket purchased successfully!');
  };

  const sendChatMessage = () => {
    if (!chatMessage.trim()) return;
    
    const newMessage = {
      id: Date.now(),
      user: currentUser?.name || 'Anonymous',
      message: chatMessage,
      timestamp: new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
    
    setChatMessages(prev => [...prev, newMessage]);
    setChatMessage('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-lg text-white">Loading stream...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <h2 className="mb-4 text-xl text-white">Event not found</h2>
          <button 
            onClick={() => onNavigate?.('/dashboard')}
            className="px-6 py-2 text-black transition-colors bg-white rounded-lg hover:bg-zinc-200"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const canWatchStream = hasValidTicket() || event.status === 'live';

  return (
    <div className="min-h-screen text-white bg-gradient-to-br from-zinc-950 via-black to-zinc-900">
      {/* Custom Header */}
      <header className="px-6 py-4 border-b border-zinc-800 bg-black/95 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold tracking-widest text-white">drip</h1>
            <div className="items-center hidden space-x-2 sm:flex">
              <span className="text-zinc-400">•</span>
              <span className="text-sm text-zinc-400">Live Stream</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-zinc-400">{currentUser?.name}</span>
            <button
              onClick={() => onNavigate?.('/dashboard')}
              className="text-sm transition-colors text-zinc-400 hover:text-white"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>
      
      <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)]">
        {/* Main Video Area */}
        <div className={`flex-1 flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : ''}`}>
          {/* Video Container */}
          <div className="relative flex-1 bg-black group">
            {/* Video Player */}
            <div className="absolute inset-0 flex items-center justify-center">
              {canWatchStream ? (
                <div className="relative w-full h-full">
                  {/* Placeholder for actual video player */}
                  <div className="relative flex items-center justify-center w-full h-full overflow-hidden bg-gradient-to-br from-zinc-900 to-black">
                    {/* Animated background pattern */}
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-pink-500/10 animate-pulse"></div>
                      <div className="absolute w-32 h-32 rounded-full top-1/4 left-1/4 bg-blue-500/5 blur-xl animate-bounce"></div>
                      <div className="absolute w-24 h-24 delay-1000 rounded-full top-3/4 right-1/4 bg-purple-500/5 blur-xl animate-bounce"></div>
                    </div>
                    
                    {/* Live indicator */}
                    <div className="absolute flex items-center px-4 py-2 space-x-2 rounded-full top-6 left-6 bg-red-500/90 backdrop-blur-sm">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-white">LIVE</span>
                    </div>

                    {/* Viewer count */}
                    <div className="absolute px-4 py-2 rounded-full top-6 right-6 bg-black/50 backdrop-blur-sm">
                      <span className="text-sm text-white">👥 {Math.floor(Math.random() * 500) + 100} watching</span>
                    </div>

                    {/* Center play controls */}
                    <div className="flex items-center justify-center">
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="flex items-center justify-center w-20 h-20 transition-all duration-300 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm hover:scale-110"
                      >
                        {isPlaying ? (
                          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-8 h-8 ml-1 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    </div>

                    {/* Bottom controls overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 transition-opacity duration-300 opacity-0 bg-gradient-to-t from-black/80 to-transparent group-hover:opacity-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="text-white transition-colors hover:text-zinc-300"
                          >
                            {isPlaying ? (
                              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                              </svg>
                            )}
                          </button>

                          {/* Volume control */}
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setIsMuted(!isMuted)}
                              className="text-white transition-colors hover:text-zinc-300"
                            >
                              {isMuted ? (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.76L4.414 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.414l3.969-3.76a1 1 0 011.617.76zm6.617 5.924a1 1 0 00-1.414-1.414L13 9.172l-1.586-1.586a1 1 0 00-1.414 1.414L11.586 10.5l-1.586 1.586a1 1 0 101.414 1.414L13 11.914l1.586 1.586a1 1 0 001.414-1.414L14.414 10.5 16 8.914z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.76L4.414 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.414l3.969-3.76a1 1 0 011.617.76zM14 5a1 1 0 011 1v8a1 1 0 11-2 0V6a1 1 0 011-1z" clipRule="evenodd" />
                                </svg>
                              )}
                            </button>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={isMuted ? 0 : volume}
                              onChange={(e) => setVolume(e.target.value)}
                              className="w-20 h-1 rounded-lg appearance-none cursor-pointer bg-zinc-600 slider"
                            />
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setShowChat(!showChat)}
                            className="text-white transition-colors hover:text-zinc-300 lg:hidden"
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                          </button>
                          
                          <button
                            onClick={() => setIsFullscreen(!isFullscreen)}
                            className="text-white transition-colors hover:text-zinc-300"
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V6a2 2 0 012-2h2M4 16v2a2 2 0 002 2h2M16 4h2a2 2 0 012 2v2M16 20h2a2 2 0 002-2v-2" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Access restricted view
                <div className="flex flex-col items-center justify-center h-full px-8 space-y-6 text-center">
                  <div className="flex items-center justify-center w-24 h-24 rounded-full bg-zinc-800">
                    <svg className="w-12 h-12 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="mb-2 text-xl font-semibold">Premium Content</h3>
                    <p className="max-w-md mb-6 text-zinc-400">
                      This is an exclusive live stream. Purchase a ticket to access the full experience.
                    </p>
                    <button
                      onClick={() => setShowTicketModal(true)}
                      className="px-8 py-3 font-semibold text-black transition-colors bg-white rounded-lg hover:bg-zinc-200"
                    >
                      Get Access - ${event.price}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Event Info Bar */}
          <div className="p-4 border-t bg-zinc-900/95 backdrop-blur-sm border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold">{event.title}</h1>
                <p className="text-sm text-zinc-400">{event.description}</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm text-zinc-400">Price</div>
                  <div className="font-semibold">${event.price}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-zinc-400">Status</div>
                  <div className={`font-semibold ${
                    event.status === 'live' ? 'text-red-400' : 
                    event.status === 'upcoming' ? 'text-green-400' : 'text-zinc-400'
                  }`}>
                    {event.status.toUpperCase()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Sidebar */}
        <div className={`w-full lg:w-80 bg-zinc-900/95 backdrop-blur-sm border-l border-zinc-800 flex flex-col ${
          showChat ? 'block' : 'hidden lg:flex'
        }`}>
          {/* Chat Header */}
          <div className="p-4 border-b border-zinc-800">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Live Chat</h3>
              <button
                onClick={() => setShowChat(false)}
                className="transition-colors text-zinc-400 hover:text-white lg:hidden"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 space-y-3 overflow-y-auto">
            {chatMessages.map((msg) => (
              <div key={msg.id} className="text-sm">
                <div className="flex items-baseline space-x-2">
                  <span className="font-medium text-white">{msg.user}</span>
                  <span className="text-xs text-zinc-500">{msg.timestamp}</span>
                </div>
                <div className="mt-1 text-zinc-300">{msg.message}</div>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          {canWatchStream && (
            <div className="p-4 border-t border-zinc-800">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 text-sm text-white border rounded-lg bg-zinc-800 border-zinc-700 placeholder-zinc-400 focus:outline-none focus:border-zinc-500"
                />
                <button
                  onClick={sendChatMessage}
                  className="px-4 py-2 text-sm font-medium text-black transition-colors bg-white rounded-lg hover:bg-zinc-200"
                >
                  Send
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ticket Purchase Modal */}
      {showTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 border bg-zinc-900 rounded-2xl border-zinc-800">
            <div className="mb-6 text-center">
              <h3 className="mb-2 text-xl font-bold">Get Access</h3>
              <p className="text-zinc-400">Purchase a ticket to watch this exclusive live stream</p>
            </div>

            <div className="p-4 mb-6 rounded-lg bg-zinc-800/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-zinc-400">Event</span>
                <span className="font-medium">{event.title}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-zinc-400">Price</span>
                <span className="text-lg font-bold">${event.price}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Access</span>
                <span className="text-green-400">Lifetime</span>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowTicketModal(false)}
                className="flex-1 px-4 py-3 text-white transition-colors rounded-lg bg-zinc-800 hover:bg-zinc-700"
              >
                Cancel
              </button>
              <button
                onClick={handleTicketPurchase}
                className="flex-1 px-4 py-3 font-semibold text-black transition-colors bg-white rounded-lg hover:bg-zinc-200"
              >
                Purchase
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen overlay close */}
      {isFullscreen && (
        <button
          onClick={() => setIsFullscreen(false)}
          className="fixed flex items-center justify-center w-10 h-10 text-white transition-colors rounded-full top-4 right-4 z-60 bg-black/50 hover:bg-black/70"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default StreamingPage;