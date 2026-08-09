const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Forbidden: Access requires one of these roles: [${allowedRoles.join(", ")}]`,
      });
    }
    next();
  };
};

module.exports = { requireRole };