import {
  users,
  branches,
  courses,
  students,
  payments,
  classes,
  attendance,
  expenses,
  type User,
  type UpsertUser,
  type Branch,
  type Course,
  type Student,
  type Payment,
  type Class,
  type Attendance,
  type Expense,
  type InsertBranch,
  type InsertCourse,
  type InsertStudent,
  type InsertPayment,
  type InsertClass,
  type InsertAttendance,
  type InsertExpense,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, like, ilike, or, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Branch operations
  getBranches(): Promise<Branch[]>;
  createBranch(branch: InsertBranch): Promise<Branch>;

  // Course operations
  getCourses(): Promise<Course[]>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: string, course: Partial<InsertCourse>): Promise<Course>;

  // Student operations
  getStudents(filters?: {
    search?: string;
    courseId?: string;
    branchId?: string;
    paymentStatus?: string;
  }): Promise<Student[]>;
  getStudent(id: string): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: string, student: Partial<InsertStudent>): Promise<Student>;
  generateEnrollmentId(): Promise<string>;

  // Payment operations
  getPayments(studentId?: string): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPaymentsByDateRange(startDate: Date, endDate: Date): Promise<Payment[]>;

  // Class operations
  getClasses(filters?: {
    branchId?: string;
    courseId?: string;
    facultyId?: string;
  }): Promise<Class[]>;
  createClass(classData: InsertClass): Promise<Class>;
  updateClass(id: string, classData: Partial<InsertClass>): Promise<Class>;

  // Attendance operations
  getAttendance(classId: string): Promise<Attendance[]>;
  markAttendance(attendance: InsertAttendance): Promise<Attendance>;

  // Expense operations
  getExpenses(filters?: {
    branchId?: string;
    category?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Expense[]>;
  createExpense(expense: InsertExpense): Promise<Expense>;

  // Analytics operations
  getDashboardStats(branchId?: string): Promise<{
    totalStudents: number;
    monthlyIncome: number;
    pendingDues: number;
    activeCourses: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Branch operations
  async getBranches(): Promise<Branch[]> {
    return await db.select().from(branches).orderBy(asc(branches.name));
  }

  async createBranch(branch: InsertBranch): Promise<Branch> {
    const [newBranch] = await db.insert(branches).values(branch).returning();
    return newBranch;
  }

  // Course operations
  async getCourses(): Promise<Course[]> {
    return await db.select().from(courses).where(eq(courses.isActive, true)).orderBy(asc(courses.name));
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const [newCourse] = await db.insert(courses).values(course).returning();
    return newCourse;
  }

  async updateCourse(id: string, course: Partial<InsertCourse>): Promise<Course> {
    const [updatedCourse] = await db
      .update(courses)
      .set(course)
      .where(eq(courses.id, id))
      .returning();
    return updatedCourse;
  }

  // Student operations
  async getStudents(filters?: {
    search?: string;
    courseId?: string;
    branchId?: string;
    paymentStatus?: string;
  }): Promise<Student[]> {
    const conditions = [eq(students.isActive, true)];

    if (filters?.search) {
      const searchCondition = or(
        ilike(students.name, `%${filters.search}%`),
        ilike(students.enrollmentId, `%${filters.search}%`),
        ilike(students.bmdcNo, `%${filters.search}%`)
      );
      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }

    if (filters?.courseId) {
      conditions.push(eq(students.courseId, filters.courseId));
    }

    if (filters?.branchId) {
      conditions.push(eq(students.branchId, filters.branchId));
    }

    if (filters?.paymentStatus) {
      conditions.push(eq(students.paymentStatus, filters.paymentStatus));
    }

    return await db
      .select()
      .from(students)
      .where(and(...conditions))
      .orderBy(desc(students.createdAt));
  }

  async getStudent(id: string): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.id, id));
    return student;
  }

  async generateEnrollmentId(): Promise<string> {
    const lastStudent = await db
      .select({ enrollmentId: students.enrollmentId })
      .from(students)
      .orderBy(desc(students.createdAt))
      .limit(1);

    if (lastStudent.length === 0) {
      return "STD001001";
    }

    const lastId = lastStudent[0].enrollmentId;
    const numPart = parseInt(lastId.replace("STD", ""));
    const newId = numPart + 1;
    return `STD${newId.toString().padStart(6, "0")}`;
  }

  async createStudent(student: InsertStudent): Promise<Student> {
    const enrollmentId = await this.generateEnrollmentId();
    const [newStudent] = await db
      .insert(students)
      .values({
        ...student,
        enrollmentId,
      })
      .returning();
    return newStudent;
  }

  async updateStudent(id: string, student: Partial<InsertStudent>): Promise<Student> {
    const [updatedStudent] = await db
      .update(students)
      .set({
        ...student,
        updatedAt: new Date(),
      })
      .where(eq(students.id, id))
      .returning();
    return updatedStudent;
  }

  // Payment operations
  async getPayments(studentId?: string): Promise<Payment[]> {
    if (studentId) {
      return await db
        .select()
        .from(payments)
        .where(eq(payments.studentId, studentId))
        .orderBy(desc(payments.paymentDate));
    }

    return await db
      .select()
      .from(payments)
      .orderBy(desc(payments.paymentDate));
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [newPayment] = await db.insert(payments).values(payment).returning();

    // Update student payment status
    if (payment.studentId) {
      const student = await this.getStudent(payment.studentId);
      if (student) {
        const newPaidAmount = parseFloat(student.paidAmount || "0") + parseFloat(payment.amount.toString());
        const newDueAmount = parseFloat(student.totalFee) - newPaidAmount;
        
        let paymentStatus = "pending";
        if (newDueAmount <= 0) {
          paymentStatus = "paid";
        } else if (newPaidAmount > 0) {
          paymentStatus = "partial";
        }

        await this.updateStudent(payment.studentId, {
          paidAmount: newPaidAmount.toString(),
          dueAmount: Math.max(0, newDueAmount).toString(),
          paymentStatus,
        });
      }
    }

    return newPayment;
  }

  async getPaymentsByDateRange(startDate: Date, endDate: Date): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(
        and(
          sql`${payments.paymentDate} >= ${startDate}`,
          sql`${payments.paymentDate} <= ${endDate}`
        )
      )
      .orderBy(desc(payments.paymentDate));
  }

  // Class operations
  async getClasses(filters?: {
    branchId?: string;
    courseId?: string;
    facultyId?: string;
  }): Promise<Class[]> {
    const conditions = [];

    if (filters?.branchId) {
      conditions.push(eq(classes.branchId, filters.branchId));
    }

    if (filters?.courseId) {
      conditions.push(eq(classes.courseId, filters.courseId));
    }

    if (filters?.facultyId) {
      conditions.push(eq(classes.facultyId, filters.facultyId));
    }

    if (conditions.length > 0) {
      return await db
        .select()
        .from(classes)
        .where(and(...conditions))
        .orderBy(desc(classes.classDate));
    }

    return await db
      .select()
      .from(classes)
      .orderBy(desc(classes.classDate));
  }

  async createClass(classData: InsertClass): Promise<Class> {
    const [newClass] = await db.insert(classes).values(classData).returning();
    return newClass;
  }

  async updateClass(id: string, classData: Partial<InsertClass>): Promise<Class> {
    const [updatedClass] = await db
      .update(classes)
      .set(classData)
      .where(eq(classes.id, id))
      .returning();
    return updatedClass;
  }

  // Attendance operations
  async getAttendance(classId: string): Promise<Attendance[]> {
    return await db
      .select()
      .from(attendance)
      .where(eq(attendance.classId, classId))
      .orderBy(asc(attendance.createdAt));
  }

  async markAttendance(attendanceData: InsertAttendance): Promise<Attendance> {
    const [newAttendance] = await db.insert(attendance).values(attendanceData).returning();
    return newAttendance;
  }

  // Expense operations
  async getExpenses(filters?: {
    branchId?: string;
    category?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Expense[]> {
    const conditions = [];

    if (filters?.branchId) {
      conditions.push(eq(expenses.branchId, filters.branchId));
    }

    if (filters?.category) {
      conditions.push(eq(expenses.category, filters.category));
    }

    if (filters?.startDate) {
      conditions.push(sql`${expenses.expenseDate} >= ${filters.startDate}`);
    }

    if (filters?.endDate) {
      conditions.push(sql`${expenses.expenseDate} <= ${filters.endDate}`);
    }

    if (conditions.length > 0) {
      return await db
        .select()
        .from(expenses)
        .where(and(...conditions))
        .orderBy(desc(expenses.expenseDate));
    }

    return await db
      .select()
      .from(expenses)
      .orderBy(desc(expenses.expenseDate));
  }

  async createExpense(expense: InsertExpense): Promise<Expense> {
    const [newExpense] = await db.insert(expenses).values(expense).returning();
    return newExpense;
  }

  // Analytics operations
  async getDashboardStats(branchId?: string): Promise<{
    totalStudents: number;
    monthlyIncome: number;
    pendingDues: number;
    activeCourses: number;
  }> {
    // Total students
    const studentConditions = [eq(students.isActive, true)];
    if (branchId) {
      studentConditions.push(eq(students.branchId, branchId));
    }

    const [totalStudentsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(students)
      .where(and(...studentConditions));

    // Monthly income (current month)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date();
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    endOfMonth.setDate(0);
    endOfMonth.setHours(23, 59, 59, 999);

    let monthlyIncomeResult;
    if (branchId) {
      [monthlyIncomeResult] = await db
        .select({ sum: sql<number>`COALESCE(SUM(${payments.amount}), 0)` })
        .from(payments)
        .leftJoin(students, eq(payments.studentId, students.id))
        .where(
          and(
            sql`${payments.paymentDate} >= ${startOfMonth}`,
            sql`${payments.paymentDate} <= ${endOfMonth}`,
            eq(students.branchId, branchId)
          )
        );
    } else {
      [monthlyIncomeResult] = await db
        .select({ sum: sql<number>`COALESCE(SUM(${payments.amount}), 0)` })
        .from(payments)
        .where(
          and(
            sql`${payments.paymentDate} >= ${startOfMonth}`,
            sql`${payments.paymentDate} <= ${endOfMonth}`
          )
        );
    }

    // Pending dues
    const duesConditions = [
      eq(students.isActive, true),
      sql`${students.dueAmount} > 0`
    ];
    if (branchId) {
      duesConditions.push(eq(students.branchId, branchId));
    }

    const [pendingDuesResult] = await db
      .select({ sum: sql<number>`COALESCE(SUM(${students.dueAmount}), 0)` })
      .from(students)
      .where(and(...duesConditions));

    // Active courses
    const [activeCoursesResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(courses)
      .where(eq(courses.isActive, true));

    return {
      totalStudents: totalStudentsResult.count,
      monthlyIncome: monthlyIncomeResult.sum || 0,
      pendingDues: pendingDuesResult.sum || 0,
      activeCourses: activeCoursesResult.count,
    };
  }
}

export const storage = new DatabaseStorage();
