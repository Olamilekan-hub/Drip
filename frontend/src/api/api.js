// src/api/api.js
import axios from "axios";

const API_BASE = (
  process.env.REACT_APP_API_BASE || "http://localhost:5000/api"
).replace(/\/$/, "");

// Events
export const fetchEvents = () => {
  console.log("fetchEvents called");
  return axios.get(`${API_BASE}/events`);
};
export const fetchEvent = (id) => {
  console.log("fetchEvent called with id:", id);
  return axios.get(`${API_BASE}/events/${id}`);
};
export const createEvent = (data) => {
  console.log("createEvent called with data:", data);
  return axios.post(`${API_BASE}/events`, data);
};
export const updateEvent = (id, data) => {
  console.log("updateEvent called with id:", id, "data:", data);
  return axios.put(`${API_BASE}/events/${id}`, data);
};
export const deleteEvent = (id) => {
  console.log("deleteEvent called with id:", id);
  return axios.delete(`${API_BASE}/events/${id}`);
};

// Tickets
export const fetchUserTickets = (userId) => {
  console.log("fetchUserTickets called with userId:", userId);
  return axios.get(`${API_BASE}/tickets/me/${userId}`);
};
export const purchaseTicket = (eventId, data) => {
  console.log("purchaseTicket called with eventId:", eventId, "data:", data);
  return axios.post(`${API_BASE}/tickets/${eventId}`, data);
};

// Users
export const fetchUsers = () => {
  console.log("fetchUsers called");
  return axios.get(`${API_BASE}/users`);
};
export const fetchUserProfile = (userId) => {
  console.log("fetchUserProfile called with userId:", userId);
  // Use the /users/me endpoint for the current user (with JWT), not /users/me/:id
  return axios.get(`${API_BASE}/users/me`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
};
export const updateUserProfile = (userId, data) => {
  console.log("updateUserProfile called with userId:", userId, "data:", data);
  // Use the /users/me endpoint for the current user (with JWT), not /users/me/:id
  return axios.put(`${API_BASE}/users/me`, data, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
};
export const updateUserRole = (uid, role) => {
  console.log("updateUserRole called with uid:", uid, "role:", role);
  return axios.patch(`${API_BASE}/users/${uid}/role`, { role });
};

// History
export const fetchWatchHistory = (userId) => {
  console.log("fetchWatchHistory called with userId:", userId);
  return axios.get(`${API_BASE}/history/me/${userId}`);
};

// Analytics
export const fetchAnalytics = () => {
  console.log("fetchAnalytics called");
  return axios.get(`${API_BASE}/analytics`);
};
