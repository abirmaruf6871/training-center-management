import { Request, Response, NextFunction } from 'express';

// Role-based access control middleware
export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const user = req.user as any;
    if (!user || !user.role) {
      return res.status(403).json({ message: "User role not found" });
    }

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ 
        message: "Insufficient permissions",
        required: allowedRoles,
        current: user.role
      });
    }

    next();
  };
};

// Specific role middleware functions
export const requireAdmin = requireRole(['admin']);
export const requireManager = requireRole(['admin', 'manager']);
export const requireAccountant = requireRole(['admin', 'accountant']);
export const requireFaculty = requireRole(['admin', 'faculty']);
export const requireStudent = requireRole(['admin', 'student']);

// Branch-specific access control
export const requireBranchAccess = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const user = req.user as any;
  const requestedBranchId = req.params.branchId || req.body.branchId;

  // Admin can access all branches
  if (user.role === 'admin') {
    return next();
  }

  // Manager can only access their assigned branch
  if (user.role === 'manager' && user.branchId === requestedBranchId) {
    return next();
  }

  // Faculty can access their assigned branch
  if (user.role === 'faculty' && user.branchId === requestedBranchId) {
    return next();
  }

  // Accountant can access their assigned branch
  if (user.role === 'accountant' && user.branchId === requestedBranchId) {
    return next();
  }

  return res.status(403).json({ 
    message: "Access denied to this branch",
    userBranch: user.branchId,
    requestedBranch: requestedBranchId
  });
};

// Student-specific access control
export const requireStudentAccess = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const user = req.user as any;
  const requestedStudentId = req.params.studentId || req.body.studentId;

  // Admin can access all students
  if (user.role === 'admin') {
    return next();
  }

  // Manager can access students in their branch
  if (user.role === 'manager') {
    // This will be checked in the route handler
    return next();
  }

  // Faculty can access students in their assigned classes
  if (user.role === 'faculty') {
    // This will be checked in the route handler
    return next();
  }

  // Student can only access their own data
  if (user.role === 'student') {
    // This will be checked in the route handler
    return next();
  }

  return res.status(403).json({ 
    message: "Access denied to student data"
  });
};

// Course-specific access control
export const requireCourseAccess = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const user = req.user as any;
  const requestedCourseId = req.params.courseId || req.body.courseId;

  // Admin can access all courses
  if (user.role === 'admin') {
    return next();
  }

  // Manager can access courses in their branch
  if (user.role === 'manager') {
    // This will be checked in the route handler
    return next();
  }

  // Faculty can access courses they teach
  if (user.role === 'faculty') {
    // This will be checked in the route handler
    return next();
  }

  // Student can access courses they're enrolled in
  if (user.role === 'student') {
    // This will be checked in the route handler
    return next();
  }

  return res.status(403).json({ 
    message: "Access denied to course data"
  });
};

// Financial data access control
export const requireFinancialAccess = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const user = req.user as any;

  // Only admin, manager, and accountant can access financial data
  if (['admin', 'manager', 'accountant'].includes(user.role)) {
    return next();
  }

  return res.status(403).json({ 
    message: "Access denied to financial data",
    required: ['admin', 'manager', 'accountant'],
    current: user.role
  });
};

// Attendance and exam data access control
export const requireAcademicAccess = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const user = req.user as any;

  // Admin, manager, faculty can access academic data
  if (['admin', 'manager', 'faculty'].includes(user.role)) {
    return next();
  }

  // Student can access their own academic data
  if (user.role === 'student') {
    return next();
  }

  return res.status(403).json({ 
    message: "Access denied to academic data",
    required: ['admin', 'manager', 'faculty', 'student'],
    current: user.role
  });
};

