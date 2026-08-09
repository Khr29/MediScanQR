const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    console.log(
      "[DIAG requireRole]",
      req.method,
      req.originalUrl,
      "| allowedRoles:", JSON.stringify(allowedRoles),
      "| req.user.role:", JSON.stringify(req.user && req.user.role),
      "| match:", req.user && allowedRoles.includes(req.user.role),
    );
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Forbidden: Access requires one of these roles: [${allowedRoles.join(", ")}]`,
      });
    }
    next();
  };
};

module.exports = { requireRole };