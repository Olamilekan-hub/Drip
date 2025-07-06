// backend/controllers/userController.js
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// POST /api/users (register)
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, country, city, role, preferences } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ error: "Name, email, and password are required." });
    }
    
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ error: "Email already in use." });
    }
    
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const userData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      country: country?.trim(),
      city: city?.trim(),
      role: role || "user",
    };

    // Add creator profile if role is creator or admin
    if (role === "creator" || role === "admin") {
      userData.creatorProfile = {
        bio: "",
        socialLinks: {},
        totalRevenue: 0,
        totalEvents: 0,
        followers: 0
      };
    }

    // Add preferences if provided
    if (preferences) {
      userData.preferences = preferences;
    }

    const user = await User.create(userData);
    
    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;
    
    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    
    res.status(201).json({ token, user: userResponse });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: err.message });
  }
};

// POST /api/users/login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }
    
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials." });
    }
    
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ error: "Invalid credentials." });
    }
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;
    
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    
    res.json({ token, user: userResponse });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/users/me (auth required)
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Ensure role is always present
    const userObj = user.toObject();
    if (!userObj.role) userObj.role = "user";
    
    res.json(userObj);
  } catch (err) {
    console.error("Get me error:", err);
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/users/me (auth required) - Update current user profile
export const updateMe = async (req, res) => {
  try {
    const { name, country, city, preferences, creatorProfile } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (country !== undefined) updateData.country = country.trim();
    if (city !== undefined) updateData.city = city.trim();
    if (preferences) updateData.preferences = preferences;
    if (creatorProfile && (req.user.role === 'creator' || req.user.role === 'admin')) {
      updateData.creatorProfile = creatorProfile;
    }
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json(user);
  } catch (err) {
    console.error("Update me error:", err);
    res.status(400).json({ error: err.message });
  }
};

// GET /api/users (admin only)
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 50, role, search } = req.query;
    
    const filter = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await User.countDocuments(filter);
    
    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (err) {
    console.error("Get all users error:", err);
    res.status(500).json({ error: err.message });
  }
};

// PATCH /api/users/:id/role (admin only)
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['user', 'creator', 'admin'].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // If upgrading to creator or admin, add creator profile
    if ((role === 'creator' || role === 'admin') && !user.creatorProfile) {
      user.creatorProfile = {
        bio: "",
        socialLinks: {},
        totalRevenue: 0,
        totalEvents: 0,
        followers: 0
      };
    }
    
    user.role = role;
    await user.save();
    
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.json(userResponse);
  } catch (err) {
    console.error("Update user role error:", err);
    res.status(400).json({ error: err.message });
  }
};

// DEPRECATED FUNCTIONS (kept for backward compatibility)
export const getCurrentUser = async (req, res) => {
  console.log("getCurrentUser called (deprecated)", req.params);
  try {
    const user = await User.findById(req.params.uid).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Error in getCurrentUser:", err);
    res.status(500).json({ error: err.message });
  }
};

export const updateProfile = async (req, res) => {
  console.log("updateProfile called (deprecated)", req.params, req.body);
  try {
    const updated = await User.findByIdAndUpdate(
      req.params.uid,
      req.body,
      { new: true, runValidators: true }
    ).select("-password");
    
    if (!updated) return res.status(404).json({ error: "User not found" });
    res.json(updated);
  } catch (err) {
    console.error("Error in updateProfile:", err);
    res.status(400).json({ error: err.message });
  }
};