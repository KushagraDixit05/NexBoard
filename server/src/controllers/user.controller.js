const User = require('../models/User');
const { hashPassword } = require('../utils/password');
const activityService = require('../services/activity.service');
const mongoose = require('mongoose');

// GET /api/users — Admin only
const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const filter = search
      ? { $or: [{ username: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] }
      : {};

    const users = await User.find(filter)
      .select('-password -refreshToken')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.json({ users, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
};

// GET /api/users/:id — Admin only
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password -refreshToken');
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// PUT /api/users/profile — Update own profile
const updateProfile = async (req, res, next) => {
  try {
    const { displayName, avatar } = req.body;
    const updates = {};
    if (displayName !== undefined) updates.displayName = displayName;
    if (avatar      !== undefined) updates.avatar      = avatar;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true })
      .select('-password -refreshToken');

    res.json(user);
  } catch (error) {
    next(error);
  }
};

// PUT /api/users/preferences — Update notification prefs
const updatePreferences = async (req, res, next) => {
  try {
    const { notificationPreferences } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { notificationPreferences },
      { new: true, runValidators: true }
    ).select('-password -refreshToken');

    res.json(user);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/users/:id/role — Admin only
const changeRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['admin', 'manager', 'user'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role.' });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true })
      .select('-password -refreshToken');

    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/users/:id/deactivate — Admin only
const deactivateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false, refreshToken: null },
      { new: true }
    ).select('-password -refreshToken');

    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ message: 'User deactivated.', user });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/users/:id — Admin only
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ message: 'User deleted.' });
  } catch (error) {
    next(error);
  }
};

// GET /api/users/search — Search users by email (authenticated users)
const searchUsers = async (req, res, next) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ error: 'Email query parameter is required.' });
    }

    const users = await User.find({
      email: { $regex: email, $options: 'i' },
      isActive: true
    })
      .select('_id username email displayName avatar')
      .limit(10);

    res.json(users);
  } catch (error) {
    next(error);
  }
};

// GET /api/users/activity/heatmap — Get user's activity heatmap data
const getUserActivityHeatmap = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);
    
    // Get current year boundaries - full year from Jan 1 to Dec 31 (UTC)
    const now = new Date();
    const currentYear = now.getUTCFullYear();
    const startDate = new Date(Date.UTC(currentYear, 0, 1)); // Jan 1, 00:00 UTC
    const endDate = new Date(Date.UTC(currentYear, 11, 31, 23, 59, 59)); // Dec 31, 23:59:59 UTC
    
    // Fetch activity data from service (only fetch actual data up to today)
    const activities = await activityService.getUserHeatmapData(userId, startDate, now);
    
    // Create a map for quick lookup
    const activityMap = new Map();
    activities.forEach(item => {
      activityMap.set(item.date, item.count);
    });
    
    // Calculate max count for level calculation
    const counts = activities.map(a => a.count);
    const maxCount = counts.length > 0 ? Math.max(...counts) : 1;
    const maxLevel = 4;
    
    // Generate all days from start of year to end of year
    const allDays = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD
      const count = activityMap.get(dateStr) || 0;
      const level = count === 0 ? 0 : Math.max(1, Math.ceil((count / maxCount) * maxLevel));
      
      allDays.push({
        date: dateStr,
        count,
        level
      });
      
      // Increment by 1 day
      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }
    
    // Calculate total count
    const totalCount = activities.reduce((sum, item) => sum + item.count, 0);
    
    // Calculate current streak (consecutive days with activity ending at today)
    let currentStreak = 0;
    const today = now.toISOString().split('T')[0];
    
    // Find today's index in allDays
    const todayIndex = allDays.findIndex(day => day.date === today);
    
    if (todayIndex >= 0) {
      for (let i = todayIndex; i >= 0; i--) {
        if (allDays[i].count > 0) {
          currentStreak++;
        } else {
          break;
        }
      }
    }
    
    res.json({
      data: allDays,
      totalCount,
      currentStreak
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { 
  getAllUsers, 
  getUserById, 
  updateProfile, 
  updatePreferences, 
  changeRole, 
  deactivateUser, 
  deleteUser, 
  searchUsers,
  getUserActivityHeatmap
};
