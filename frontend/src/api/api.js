// frontend/src/api/api.js
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle auth errors and token refresh
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      // Clear invalid token
      localStorage.removeItem("token");
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = "/login";
      }
    }
    
    return Promise.reject(error);
  }
);

// Enhanced error handling wrapper
const apiCall = async (apiFunction) => {
  try {
    const response = await apiFunction();
    return { data: response.data, error: null };
  } catch (error) {
    console.error('API Call Error:', error);
    return { 
      data: null, 
      error: error.response?.data?.error || error.message || 'An error occurred' 
    };
  }
};

// EVENTS API
export const fetchEvents = (params = {}) => 
  apiCall(() => api.get("/events", { params }));

export const fetchEvent = (id) => 
  apiCall(() => api.get(`/events/${id}`));

export const createEvent = (data) => 
  apiCall(() => api.post("/events", data));

export const updateEvent = (id, data) => 
  apiCall(() => api.put(`/events/${id}`, data));

export const deleteEvent = (id) => 
  apiCall(() => api.delete(`/events/${id}`));

// CREATOR-SPECIFIC API
export const fetchCreatorEvents = (creatorId) => 
  apiCall(() => api.get(`/events?creatorId=${creatorId}`));

export const fetchCreatorAnalytics = (creatorId) => 
  apiCall(() => api.get(`/analytics?creatorId=${creatorId}`));

// TICKETS API
export const fetchUserTickets = (userId) => 
  apiCall(() => api.get(`/tickets/me/${userId}`));

export const purchaseTicket = (eventId, data) => 
  apiCall(() => api.post(`/tickets/${eventId}`, data));

// USERS API
export const fetchUsers = (params = {}) => 
  apiCall(() => api.get("/users", { params }));

export const fetchUserProfile = () => 
  apiCall(() => api.get("/users/me"));

export const updateUserProfile = (data) => 
  apiCall(() => api.put("/users/me", data));

export const updateUserRole = (userId, role) => 
  apiCall(() => api.patch(`/users/${userId}/role`, { role }));

// HISTORY API
export const fetchWatchHistory = (userId) => 
  apiCall(() => api.get(`/history/me/${userId}`));

export const logWatchedEvent = (eventId, data) => 
  apiCall(() => api.post(`/history/${eventId}`, data));

// ANALYTICS API
export const fetchAnalytics = () => 
  apiCall(() => api.get("/analytics"));

// CONTENT API
export const fetchContentSettings = () => 
  apiCall(() => api.get("/content"));

export const updateContentSettings = (data) => 
  apiCall(() => api.put("/content", data));

// AUTH API
export const loginUser = (credentials) => 
  apiCall(() => axios.post(`${API_BASE}/users/login`, credentials));

export const registerUser = (userData) => 
  apiCall(() => axios.post(`${API_BASE}/users`, userData));

// Export the configured axios instance for direct use
export default api;