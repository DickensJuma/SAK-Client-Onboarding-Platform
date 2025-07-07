const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    next();
  };
};

// Check permission for specific module and action
const checkPermission = (module, action) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!req.user.hasPermission(module, action)) {
      return res.status(403).json({
        message: `Insufficient permissions for ${action} on ${module}`,
      });
    }

    next();
  };
};

// Ensure user can only access their own data (for clients)
const ensureOwnData = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Admin can access all data
  if (req.user.role === "admin") {
    return next();
  }

  // Client users can only access their own data
  if (req.user.userType === "client") {
    const clientId = req.params.id || req.params.clientId;
    if (clientId && clientId !== req.user.clientId?.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }
  }

  next();
};

// Check if user has module access
const checkModuleAccess = (module) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const accessibleModules = req.user.getAccessibleModules();
    if (!accessibleModules.includes(module)) {
      return res.status(403).json({
        message: `Access denied to ${module} module`,
      });
    }

    next();
  };
};

module.exports = {
  authorize,
  checkPermission,
  ensureOwnData,
  checkModuleAccess,
};
