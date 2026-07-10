const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.email !== 'tanakorn.tip@student.mahidol.edu') {
    return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
  }
  next();
};

module.exports = adminMiddleware;
