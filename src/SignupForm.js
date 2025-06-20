import React, { useState } from "react";
import { db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";
import { start } from "repl";

function SignupForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    country: "",
    city: "",
    consent: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.consent) return alert("Please consent to receive updates.");
    try {
      await addDoc(collection(db, "signups"), formData);
      alert("You're on the list. See you soon.");
      setFormData({ name: "", email: "", country: "", city: "", consent: false });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden font-press">
      {/* Video background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-60 pointer-events-none"
      >
        <source src="/blip3.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <form onSubmit={handleSubmit} className="relative z-10 w-full max-w-md space-y-5 p-4 font-vt323 mt-[-8vh] md:mt-[-10vh]">
        <div className="text-center mb-8">
          <p className="text-zinc-100/70 text-base">join the frequency</p>
        </div>
        <div>
          <input id="name" name="name" type="text" placeholder="name" onChange={handleChange} value={formData.name} className="w-full bg-transparent backdrop-blur-sm rounded-lg px-4 py-3 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white transition shadow-lg" autoComplete="off"/>
        </div>
        <div>
          <input id="email" name="email" type="email" placeholder="email address" onChange={handleChange} value={formData.email} className="w-full bg-transparent backdrop-blur-sm rounded-lg px-4 py-3 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white transition shadow-lg" autoComplete="off"/>
        </div>
        <div>
          <input id="country" name="country" type="text" placeholder="country" onChange={handleChange} value={formData.country} className="w-full bg-transparent backdrop-blur-sm rounded-lg px-4 py-3 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white transition shadow-lg" autoComplete="off"/>
        </div>
        <div>
          <input id="city" name="city" type="text" placeholder="city" onChange={handleChange} value={formData.city} className="w-full bg-transparent backdrop-blur-sm rounded-lg px-4 py-3 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white transition shadow-lg" autoComplete="off"/>
        </div>
        <div className="flex items-center">
          <input id="consent" name="consent" type="checkbox" checked={formData.consent} onChange={handleChange} className="accent-zinc-400 mr-2 bg-transparent"/>
          <label htmlFor="consent" className="text-xs text-zinc-100/70 select-none">I agree to receive updates from drip.live</label>
        </div>
        <button type="submit" className="w-full bg-white/20 text-white font-semibold py-3 rounded-lg hover:bg-white/30 transition text-lg mt-2 backdrop-blur-sm border border-zinc-200/20 shadow-lg">join now</button>
      </form>
      <h1 className="fixed bottom-4 right-4 text-white font-poppins text-4xl md:text-7xl z-20 pointer-events-none select-none drop-shadow-lg">drip..</h1>
    </div>
  );
}

export default SignupForm;
