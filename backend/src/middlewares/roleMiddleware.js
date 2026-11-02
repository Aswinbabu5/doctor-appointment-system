export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access requires one of [${allowedRoles.join(', ')}] role(s)`
      });
    }

    next();
  };
}

export function requireApprovedDoctor(req, res, next) {
  if (!req.user || req.user.role !== 'DOCTOR') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Doctor role required'
    });
  }

  if (!req.user.doctorProfile) {
    return res.status(403).json({
      success: false,
      message: 'Doctor profile not found'
    });
  }

  if (req.user.doctorProfile.approvalStatus !== 'APPROVED') {
    return res.status(403).json({
      success: false,
      message: `Doctor account is currently in ${req.user.doctorProfile.approvalStatus} status. You cannot perform this action until approved by an administrator.`
    });
  }

  next();
}
