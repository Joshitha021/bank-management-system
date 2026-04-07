module.exports = function(req, res, next) {
  // Check if role is admin
  if (req.user && req.user.role === 'Admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied: Requires Admin privileges' });
  }
};
