import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertBranchSchema,
  insertCourseSchema,
  insertStudentSchema,
  insertPaymentSchema,
  insertClassSchema,
  insertExpenseSchema
} from "@shared/schema";
import { z } from "zod";
import courseRoutes from "./routes/courses";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Course routes
  app.use('/api/courses', courseRoutes);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      // For local auth, return the user directly from session
      res.json(req.user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Branch routes
  app.get("/api/branches", isAuthenticated, async (req, res) => {
    try {
      const branches = await storage.getBranches();
      res.json(branches);
    } catch (error) {
      console.error("Error fetching branches:", error);
      res.status(500).json({ message: "Failed to fetch branches" });
    }
  });

  app.post("/api/branches", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      if (!user || (user.role !== "admin" && user.role !== "manager")) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const branchData = insertBranchSchema.parse(req.body);
      const branch = await storage.createBranch(branchData);
      res.json(branch);
    } catch (error) {
      console.error("Error creating branch:", error);
      res.status(500).json({ message: "Failed to create branch" });
    }
  });

  // Course routes
  app.get("/api/courses", isAuthenticated, async (req, res) => {
    try {
      const courses = await storage.getCourses();
      res.json(courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  app.post("/api/courses", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      if (!user || (user.role !== "admin" && user.role !== "manager")) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const courseData = insertCourseSchema.parse(req.body);
      const course = await storage.createCourse(courseData);
      res.json(course);
    } catch (error) {
      console.error("Error creating course:", error);
      res.status(500).json({ message: "Failed to create course" });
    }
  });

  app.put("/api/courses/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      if (!user || (user.role !== "admin" && user.role !== "manager")) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const courseData = insertCourseSchema.partial().parse(req.body);
      const course = await storage.updateCourse(req.params.id, courseData);
      res.json(course);
    } catch (error) {
      console.error("Error updating course:", error);
      res.status(500).json({ message: "Failed to update course" });
    }
  });

  // Student routes
  app.get("/api/students", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user) {
        return res.status(403).json({ message: "User not found" });
      }

      const filters: any = {};
      
      // Branch managers can only see their branch students
      if (user.role === "manager" && user.branchId) {
        filters.branchId = user.branchId;
      }

      if (req.query.search) filters.search = req.query.search as string;
      if (req.query.courseId) filters.courseId = req.query.courseId as string;
      if (req.query.branchId && user.role === "admin") filters.branchId = req.query.branchId as string;
      if (req.query.paymentStatus) filters.paymentStatus = req.query.paymentStatus as string;

      const students = await storage.getStudents(filters);
      res.json(students);
    } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  app.get("/api/students/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      const student = await storage.getStudent(req.params.id);
      
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      // Check permissions
      if (user?.role === "manager" && user.branchId !== student.branchId) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      res.json(student);
    } catch (error) {
      console.error("Error fetching student:", error);
      res.status(500).json({ message: "Failed to fetch student" });
    }
  });

  app.post("/api/students", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || (user.role !== "admin" && user.role !== "manager" && user.role !== "accountant")) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const studentData = insertStudentSchema.parse(req.body);
      
      // Branch managers can only add students to their branch
      if (user.role === "manager" && user.branchId) {
        studentData.branchId = user.branchId;
      }

      const student = await storage.createStudent(studentData);
      res.json(student);
    } catch (error) {
      console.error("Error creating student:", error);
      res.status(500).json({ message: "Failed to create student" });
    }
  });

  app.put("/api/students/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || (user.role !== "admin" && user.role !== "manager" && user.role !== "accountant")) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const studentData = insertStudentSchema.partial().parse(req.body);
      const student = await storage.updateStudent(req.params.id, studentData);
      res.json(student);
    } catch (error) {
      console.error("Error updating student:", error);
      res.status(500).json({ message: "Failed to update student" });
    }
  });

  // Payment routes
  app.get("/api/payments", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || (user.role !== "admin" && user.role !== "manager" && user.role !== "accountant")) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const studentId = req.query.studentId as string;
      const payments = await storage.getPayments(studentId);
      res.json(payments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  app.post("/api/payments", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || (user.role !== "admin" && user.role !== "manager" && user.role !== "accountant")) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const paymentData = insertPaymentSchema.parse({
        ...req.body,
        collectedBy: user.id,
      });

      const payment = await storage.createPayment(paymentData);
      res.json(payment);
    } catch (error) {
      console.error("Error creating payment:", error);
      res.status(500).json({ message: "Failed to create payment" });
    }
  });

  // Class routes
  app.get("/api/classes", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user) {
        return res.status(403).json({ message: "User not found" });
      }

      const filters: any = {};
      
      // Branch managers can only see their branch classes
      if (user.role === "manager" && user.branchId) {
        filters.branchId = user.branchId;
      }
      
      // Faculty can only see their assigned classes
      if (user.role === "faculty") {
        filters.facultyId = user.id;
      }

      if (req.query.branchId && user.role === "admin") filters.branchId = req.query.branchId as string;
      if (req.query.courseId) filters.courseId = req.query.courseId as string;

      const classes = await storage.getClasses(filters);
      res.json(classes);
    } catch (error) {
      console.error("Error fetching classes:", error);
      res.status(500).json({ message: "Failed to fetch classes" });
    }
  });

  app.post("/api/classes", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || (user.role !== "admin" && user.role !== "manager")) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const classData = insertClassSchema.parse(req.body);
      const newClass = await storage.createClass(classData);
      res.json(newClass);
    } catch (error) {
      console.error("Error creating class:", error);
      res.status(500).json({ message: "Failed to create class" });
    }
  });

  // Expense routes
  app.get("/api/expenses", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || (user.role !== "admin" && user.role !== "manager" && user.role !== "accountant")) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const filters: any = {};
      
      // Branch managers can only see their branch expenses
      if (user.role === "manager" && user.branchId) {
        filters.branchId = user.branchId;
      }

      if (req.query.branchId && user.role === "admin") filters.branchId = req.query.branchId as string;
      if (req.query.category) filters.category = req.query.category as string;
      if (req.query.startDate) filters.startDate = new Date(req.query.startDate as string);
      if (req.query.endDate) filters.endDate = new Date(req.query.endDate as string);

      const expenses = await storage.getExpenses(filters);
      res.json(expenses);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      res.status(500).json({ message: "Failed to fetch expenses" });
    }
  });

  app.post("/api/expenses", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || (user.role !== "admin" && user.role !== "manager" && user.role !== "accountant")) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const expenseData = insertExpenseSchema.parse({
        ...req.body,
        createdBy: user.id,
      });

      const expense = await storage.createExpense(expenseData);
      res.json(expense);
    } catch (error) {
      console.error("Error creating expense:", error);
      res.status(500).json({ message: "Failed to create expense" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user) {
        return res.status(403).json({ message: "User not found" });
      }

      let branchId: string | undefined;
      
      // Branch managers can only see their branch stats
      if (user.role === "manager" && user.branchId) {
        branchId = user.branchId;
      } else if (req.query.branchId && user.role === "admin") {
        branchId = req.query.branchId as string;
      }

      const stats = await storage.getDashboardStats(branchId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
