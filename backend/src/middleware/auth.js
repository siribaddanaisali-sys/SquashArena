import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.userRole = decoded.role;
    req.userRegionId = decoded.regionId || null;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.userRole)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// Region-based access guard: super_admin bypasses, others restricted to their region
export const regionGuard = (getRegionId) => {
  return async (req, res, next) => {
    if (req.userRole === 'super_admin') return next();

    const resourceRegionId = typeof getRegionId === 'function' ? await getRegionId(req) : null;
    if (resourceRegionId && req.userRegionId && resourceRegionId !== req.userRegionId) {
      return res.status(403).json({ error: 'Access denied: resource outside your region' });
    }
    next();
  };
};
