const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  SUPERADMIN: 'superadmin'
};

const adminMiddleware = (req, res, next) => {
  if (req.user && (req.user.role === ROLES.ADMIN || req.user.role === ROLES.SUPERADMIN)) {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden: Access is restricted to administrators.' });
  }
};

module.exports = { adminMiddleware, ROLES };
