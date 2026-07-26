const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

// @desc Get all pending doctor & pharmacy approvals
exports.getPendingApprovals = async (req, res) => {
  try {
    const pendingUsers = await User.find({ isApproved: false }).select('-password');
    return res.status(200).json(pendingUsers);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc Approve or suspend a user account
exports.toggleUserApproval = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isApproved } = req.body;

    const user = await User.findByIdAndUpdate(userId, { isApproved }, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json({ message: `User status updated to ${isApproved ? 'Approved' : 'Suspended'}`, user });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc Fetch all system audit logs
exports.getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(100);
    return res.status(200).json(logs);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}; //test