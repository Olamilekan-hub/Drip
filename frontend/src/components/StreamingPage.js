import React, { useState } from 'react';

// TVFrame: Larger, more realistic vintage-modern black TV, now responsive for mobile
const TVFrame = ({ onMute, onSettings, isMuted }) => (
  <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center">
    {/* TV Body */}
    <div
      className="relative bg-gradient-to-br from-zinc-900 via-black to-zinc-800 rounded-[2.5rem] shadow-2xl border-[16px] border-zinc-900 w-full aspect-[16/8.5] flex items-center justify-center overflow-visible
      sm:aspect-[16/8.5] sm:max-w-2xl
      md:aspect-[16/8.5] md:max-w-3xl
      lg:aspect-[16/8.5] lg:max-w-4xl
      "
      style={{
        maxWidth: '100%',
        minWidth: '0',
        boxShadow: '0 12px 60px #000, 0 0 0 20px #18181b',
      }}
    >
      {/* Bezel (outer frame) */}
      <div className="absolute inset-0 rounded-[2.2rem] border-[8px] border-zinc-800 pointer-events-none z-10" style={{ boxShadow: '0 0 32px 8px #111 inset' }} />
      {/* Speaker Grill (left side, mesh effect) */}
      <div className="absolute left-3 sm:left-8 top-1/2 -translate-y-1/2 flex flex-col space-y-0.5 z-20">
        {Array.from({ length: 18 }).map((_, i) => (
          <div key={i} className="w-1.5 sm:w-2 h-2.5 sm:h-3 bg-zinc-700/80 rounded-full" />
        ))}
      </div>
      {/* Knobs (right side, functional) */}
      <div className="absolute right-3 sm:right-8 top-1/2 -translate-y-1/2 flex flex-col items-center space-y-4 sm:space-y-6 z-20">
        {/* Mute Knob */}
        <button
          onClick={onMute}
          className={`w-7 h-7 sm:w-10 sm:h-10 rounded-full border-2 border-zinc-600 flex items-center justify-center bg-zinc-900 hover:bg-zinc-700 transition ${isMuted ? 'ring-2 ring-red-500' : ''}`}
          title="Mute"
        >
          {isMuted ? (
            <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><path d="M3 7v6h4l5 5V2L7 7H3zm13.54 2.46a1 1 0 0 0-1.42 1.42l1.42-1.42zm-1.42 1.42a1 1 0 0 0 1.42-1.42l-1.42 1.42z" fill="#fff"/></svg>
          ) : (
            <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><path d="M3 7v6h4l5 5V2L7 7H3z" fill="#fff"/><path d="M15 8.82V11.18C15 12.4 14.4 13.5 13.5 14.18" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg>
          )}
        </button>
        {/* Settings Knob */}
        <button
          onClick={onSettings}
          className="w-7 h-7 sm:w-10 sm:h-10 rounded-full border-2 border-zinc-600 flex items-center justify-center bg-zinc-900 hover:bg-zinc-700 transition"
          title="Settings"
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><circle cx="10" cy="10" r="3" stroke="#fff" strokeWidth="1.5"/><path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.93 4.93l1.41 1.41M14.66 14.66l1.41 1.41M4.93 15.07l1.41-1.41M14.66 5.34l1.41-1.41" stroke="#fff" strokeWidth="1.2"/></svg>
        </button>
        {/* Power LED */}
        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-white shadow-[0_0_8px_2px_rgba(255,255,255,0.7)] mt-1 sm:mt-2" title="Power LED" />
      </div>
      {/* TV Screen (video area, with subtle curvature) */}
      <div className="relative w-[97%] h-[88%] sm:w-[90%] sm:h-[82%] bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 rounded-[1.3rem] sm:rounded-[1.7rem] flex items-center justify-center shadow-inner overflow-hidden border-2 sm:border-4 border-zinc-800" style={{ boxShadow: '0 0 32px 8px #000 inset' }}>
        {/* Glass reflection effect */}
        <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-white/10 to-transparent pointer-events-none rounded-t-[1.3rem] sm:rounded-t-[1.7rem]" />
        {/* Brand badge */}
        <div className="absolute bottom-1 sm:bottom-2 left-1/2 -translate-x-1/2 text-[10px] sm:text-xs text-zinc-400 font-mono tracking-widest opacity-80 select-none">drip</div>
        {/* Video player placeholder (now a profile icon) */}
        <div className="relative z-10 flex flex-col items-center justify-center select-none">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 sm:w-24 sm:h-24 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 7.5a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 19.5a7.5 7.5 0 1115 0v.75a.75.75 0 01-.75.75h-13.5a.75.75 0 01-.75-.75v-.75z" />
          </svg>
        </div>
      </div>
      {/* TV Feet / Base */}
      <div className="absolute -bottom-4 sm:-bottom-6 left-4 sm:left-16 w-8 sm:w-16 h-3 sm:h-6 bg-zinc-800 rounded-b-2xl shadow-xl" />
      <div className="absolute -bottom-4 sm:-bottom-6 right-4 sm:right-16 w-8 sm:w-16 h-3 sm:h-6 bg-zinc-800 rounded-b-2xl shadow-xl" />
      <div className="absolute -bottom-6 sm:-bottom-10 left-1/2 -translate-x-1/2 w-16 sm:w-32 h-4 sm:h-8 bg-zinc-900 rounded-b-3xl shadow-2xl border-t-2 sm:border-t-4 border-zinc-800" />
    </div>
  </div>
);

const EventInfo = ({ onTicketClick }) => (
  <div className="flex flex-col items-center mt-6 mb-8">
    <div className="text-white text-xl font-semibold mb-2">drip001/toronto</div>
    <button
      className="border border-white text-white px-6 py-2 rounded-lg hover:bg-white hover:text-black transition font-semibold"
      onClick={onTicketClick}
    >
      TICKET
    </button>
  </div>
);

const CollectedVideos = ({ genres }) => (
  <div className="w-full max-w-5xl mx-auto mt-12">
    <h2 className="text-white text-lg font-semibold mb-6 text-center">Collected videos</h2>
    {genres.map((genre) => (
      <div key={genre.name} className="mb-8">
        <h3 className="text-white text-base font-bold mb-4 uppercase">{genre.name}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {genre.videos.map((video, idx) => (
            <div key={idx} className="bg-black rounded-lg overflow-hidden shadow-lg flex flex-col items-center">
              <div className="w-full aspect-video bg-zinc-900 flex items-center justify-center">
                {/* Thumbnail placeholder */}
                <span className="text-zinc-500">Video</span>
              </div>
              <button className="border border-white text-white px-4 py-1.5 m-4 rounded hover:bg-white hover:text-black transition text-xs font-semibold">TICKET</button>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

const TicketModal = ({ open, onClose }) => (
  open ? (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-zinc-900 p-8 rounded-xl shadow-2xl w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-white text-xl">&times;</button>
        <div className="text-white text-lg font-bold mb-4">Get your ticket</div>
        <div className="text-zinc-300 mb-6">(In-house ticketing UI goes here)</div>
        <button onClick={onClose} className="w-full bg-white text-black py-2 rounded font-semibold">Close</button>
      </div>
    </div>
  ) : null
);

const MobileSidebar = ({ open, onClose, genres }) => (
  <div className={`fixed inset-y-0 right-0 w-80 bg-black z-50 transform ${open ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 shadow-2xl md:hidden`}>
    <button onClick={onClose} className="absolute top-4 right-4 text-white text-2xl">&times;</button>
    <div className="p-6 overflow-y-auto h-full">
      <h2 className="text-white text-lg font-semibold mb-6 text-center">Collected videos</h2>
      {genres.map((genre) => (
        <div key={genre.name} className="mb-8">
          <h3 className="text-white text-base font-bold mb-4 uppercase">{genre.name}</h3>
          <div className="grid grid-cols-1 gap-4">
            {genre.videos.map((video, idx) => (
              <div key={idx} className="bg-zinc-900 rounded-lg overflow-hidden shadow flex flex-col items-center">
                <div className="w-full aspect-video bg-zinc-800 flex items-center justify-center">
                  <span className="text-zinc-500">Video</span>
                </div>
                <button className="border border-white text-white px-4 py-1.5 m-4 rounded hover:bg-white hover:text-black transition text-xs font-semibold">TICKET</button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const genresSample = [
  { name: 'HOUSE', videos: [{}, {}, {}] },
  { name: 'TECHNO', videos: [{}, {}, {}, {}, {}, {}] },
];

const StreamingPage = () => {
  const [ticketOpen, setTicketOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Responsive: show sidebar on mobile, grid on desktop
  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <div className="text-white text-3xl font-bold tracking-widest">drip</div>
        <div className="flex items-center space-x-4">
          <button className="md:hidden" onClick={() => setSidebarOpen(true)}>
            <span className="text-white text-2xl">&#9776;</span>
          </button>
          <span className="ml-2"><img src="https://upload.wikimedia.org/wikipedia/commons/c/cf/Flag_of_Canada.png" alt="Canada" className="w-7 h-5 rounded shadow" /></span>
        </div>
      </header>

      {/* TV Frame */}
      <main className="flex-1 flex flex-col items-center justify-start px-2 md:px-0">
        <TVFrame 
          onMute={() => setIsMuted((m) => !m)} 
          onSettings={() => setSettingsOpen(true)} 
          isMuted={isMuted} 
        />
        <EventInfo onTicketClick={() => setTicketOpen(true)} />
        {/* Desktop Collected Videos */}
        <div className="hidden md:block w-full">
          <CollectedVideos genres={genresSample} />
        </div>
      </main>

      {/* Mobile Sidebar for Collected Videos */}
      <MobileSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} genres={genresSample} />

      {/* Ticket Modal */}
      <TicketModal open={ticketOpen} onClose={() => setTicketOpen(false)} />
      {/* Settings Modal (placeholder) */}
      {settingsOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-zinc-900 p-8 rounded-xl shadow-2xl w-full max-w-md relative">
            <button onClick={() => setSettingsOpen(false)} className="absolute top-2 right-2 text-white text-xl">&times;</button>
            <div className="text-white text-lg font-bold mb-4">Settings</div>
            <div className="text-zinc-300 mb-6">(Settings UI goes here)</div>
            <button onClick={() => setSettingsOpen(false)} className="w-full bg-white text-black py-2 rounded font-semibold">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StreamingPage; 