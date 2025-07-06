// src/api/api.js
import axios from "axios";

const API_BASE = (
  process.env.REACT_APP_API_BASE || "http://localhost:5000/api"
).replace(/\/$/, "");

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// EVENTS API
export const fetchEvents = (params = {}) => {
  console.log("fetchEvents called with params:", params);
  return api.get("/events", { params });
};

export const fetchEvent = (id) => {
  console.log("fetchEvent called with id:", id);
  return api.get(`/events/${id}`);
};

export const createEvent = (data) => {
  console.log("createEvent called with data:", data);
  return api.post("/events", data);
};

export const updateEvent = (id, data) => {
  console.log("updateEvent called with id:", id, "data:", data);
  return api.put(`/events/${id}`, data);
};

export const deleteEvent = (id) => {
  console.log("deleteEvent called with id:", id);
  return api.delete(`/events/${id}`);
};

// TICKETS API
export const fetchUserTickets = (userId) => {
  console.log("fetchUserTickets called with userId:", userId);
  return api.get(`/tickets/me/${userId}`);
};

export const purchaseTicket = (eventId, data) => {
  console.log("purchaseTicket called with eventId:", eventId, "data:", data);
  return api.post(`/tickets/${eventId}`, data);
};

// USERS API
export const fetchUsers = (params = {}) => {
  console.log("fetchUsers called with params:", params);
  return api.get("/users", { params });
};

export const fetchUserProfile = () => {
  console.log("fetchUserProfile called");
  return api.get("/users/me");
};

export const updateUserProfile = (userId, data) => {
  console.log("updateUserProfile called with userId:", userId, "data:", data);
  // Use the new endpoint
  return api.put("/users/me", data);
};

export const updateUserRole = (userId, role) => {
  console.log("updateUserRole called with userId:", userId, "role:", role);
  return api.patch(`/users/${userId}/role`, { role });
};

// HISTORY API
export const fetchWatchHistory = (userId) => {
  console.log("fetchWatchHistory called with userId:", userId);
  return api.get(`/history/me/${userId}`);
};

export const logWatchedEvent = (eventId, data) => {
  console.log("logWatchedEvent called with eventId:", eventId, "data:", data);
  return api.post(`/history/${eventId}`, data);
};

// ANALYTICS API
export const fetchAnalytics = () => {
  console.log("fetchAnalytics called");
  return api.get("/analytics");
};

// CONTENT API
export const fetchContentSettings = () => {
  console.log("fetchContentSettings called");
  return api.get("/content");
};

export const updateContentSettings = (data) => {
  console.log("updateContentSettings called with data:", data);
  return api.put("/content", data);
};

// AUTH API (for non-context usage)
export const loginUser = (credentials) => {
  console.log("loginUser called");
  return axios.post(`${API_BASE}/users/login`, credentials);
};

export const registerUser = (userData) => {
  console.log("registerUser called");
  return axios.post(`${API_BASE}/users`, userData);
};

// CREATOR-SPECIFIC API
export const fetchCreatorEvents = (creatorId) => {
  console.log("fetchCreatorEvents called with creatorId:", creatorId);
  return api.get(`/events?creatorId=${creatorId}`);
};

export const fetchCreatorAnalytics = (creatorId) => {
  console.log("fetchCreatorAnalytics called with creatorId:", creatorId);
  return api.get(`/analytics?creatorId=${creatorId}`);
};

// Export the configured axios instance for direct use
export default api;