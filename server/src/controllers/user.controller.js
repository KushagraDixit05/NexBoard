const User = require('../models/User');
const { hashPassword } = require('../utils/password');

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

module.exports = { getAllUsers, getUserById, updateProfile, updatePreferences, changeRole, deactivateUser, deleteUser };
