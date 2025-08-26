import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  index,
  json,
  mysqlTable,
  timestamp,
  varchar,
  text,
  int,
  decimal,
  boolean,
  mysqlEnum
} from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
export const sessions = mysqlTable(
  "sessions",
  {
    sid: varchar("sid", { length: 255 }).primaryKey(),
    sess: json("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDD_session_expire").on(table.expire)],
);

// User storage table.
export const users = mysqlTable("users", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  username: varchar("username", { length: 255 }).unique().notNull(),
  email: varchar("email", { length: 255 }).unique(),
  password: varchar("password", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("last_name", { length: 255 }).notNull(),
  profileImageUrl: varchar("profile_image_url", { length: 500 }),
  role: varchar("role", { length: 50 }).notNull().default("student"), // admin, manager, accountant, faculty, student
  branchId: varchar("branch_id", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  isActive: boolean("is_active").default(true),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Branches table
export const branches = mysqlTable("branches", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address").notNull(),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  managerId: varchar("manager_id", { length: 255 }).references(() => users.id),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Batches table
export const batches = mysqlTable("batches", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  name: varchar("name", { length: 255 }).notNull(),
  courseId: varchar("course_id", { length: 255 }).notNull().references(() => courses.id),
  branchId: varchar("branch_id", { length: 255 }).notNull().references(() => branches.id),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  maxStudents: int("max_students").default(30),
  currentStudents: int("current_students").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Courses table
export const courses = mysqlTable("courses", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  name: varchar("name", { length: 255 }).notNull(), // CMU, DMU, ARDMS
  description: text("description"),
  duration: int("duration").notNull(), // in months
  totalFee: decimal("total_fee", { precision: 10, scale: 2 }).notNull(),
  admissionFee: decimal("admission_fee", { precision: 10, scale: 2 }).notNull(),
  installmentCount: int("installment_count").default(1),
  batchSizeLimit: int("batch_size_limit").default(30),
  branchId: varchar("branch_id", { length: 255 }).references(() => branches.id),
  discountPercentage: decimal("discount_percentage", { precision: 5, scale: 2 }).default("0"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Course installments table
export const course_installments = mysqlTable("course_installments", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  courseId: varchar("course_id", { length: 255 }).notNull().references(() => courses.id),
  installmentNumber: int("installment_number").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  dueDate: timestamp("due_date").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Course scholarships table
export const course_scholarships = mysqlTable("course_scholarships", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  courseId: varchar("course_id", { length: 255 }).notNull().references(() => courses.id),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  discountPercentage: decimal("discount_percentage", { precision: 5, scale: 2 }).notNull(),
  eligibilityCriteria: text("eligibility_criteria"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Students table
export const students = mysqlTable("students", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  enrollmentId: varchar("enrollment_id", { length: 255 }).notNull().unique(),
  userId: varchar("user_id", { length: 255 }).references(() => users.id),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  bmdcNo: varchar("bmdc_no", { length: 255 }),
  courseId: varchar("course_id", { length: 255 }).notNull().references(() => courses.id),
  branchId: varchar("branch_id", { length: 255 }).notNull().references(() => branches.id),
  batchId: varchar("batch_id", { length: 255 }).notNull().references(() => batches.id),
  admissionDate: timestamp("admission_date").notNull(),
  totalFee: decimal("total_fee", { precision: 10, scale: 2 }).notNull(),
  paidAmount: decimal("paid_amount", { precision: 10, scale: 2 }).default("0"),
  dueAmount: decimal("due_amount", { precision: 10, scale: 2 }).notNull(),
  paymentStatus: mysqlEnum("payment_status", ["pending", "partial", "paid", "overdue"]).default("pending"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payments table
export const payments = mysqlTable("payments", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  studentId: varchar("student_id", { length: 255 }).notNull().references(() => students.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: mysqlEnum("payment_method", ["cash", "bkash", "nagad", "bank", "card"]).notNull(),
  paymentType: mysqlEnum("payment_type", ["admission", "installment", "fine", "other"]).default("installment"),
  installmentNumber: int("installment_number"),
  transactionId: varchar("transaction_id", { length: 255 }),
  notes: text("notes"),
  collectedBy: varchar("collected_by", { length: 255 }).notNull().references(() => users.id),
  paymentDate: timestamp("payment_date").defaultNow(),
  invoiceNumber: varchar("invoice_number", { length: 255 }).unique(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Classes table
export const classes = mysqlTable("classes", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  courseId: varchar("course_id", { length: 255 }).notNull().references(() => courses.id),
  branchId: varchar("branch_id", { length: 255 }).notNull().references(() => branches.id),
  batchId: varchar("batch_id", { length: 255 }).notNull().references(() => batches.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  facultyId: varchar("faculty_id", { length: 255 }).notNull().references(() => users.id),
  classDate: timestamp("class_date").notNull(),
  startTime: varchar("start_time", { length: 50 }).notNull(),
  endTime: varchar("end_time", { length: 50 }).notNull(),
  room: varchar("room", { length: 100 }),
  isCompleted: boolean("is_completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Attendance table
export const attendance = mysqlTable("attendance", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  classId: varchar("class_id", { length: 255 }).notNull().references(() => classes.id),
  studentId: varchar("student_id", { length: 255 }).notNull().references(() => students.id),
  status: mysqlEnum("status", ["present", "absent", "late", "excused"]).notNull(),
  markedBy: varchar("marked_by", { length: 255 }).notNull().references(() => users.id),
  remarks: text("remarks"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Expenses table
export const expenses = mysqlTable("expenses", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  category: mysqlEnum("category", ["salary", "rent", "utility", "marketing", "honorarium", "equipment", "maintenance", "other"]).notNull(),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  branchId: varchar("branch_id", { length: 255 }).notNull().references(() => branches.id),
  expenseDate: timestamp("expense_date").notNull(),
  createdBy: varchar("created_by", { length: 255 }).notNull().references(() => users.id),
  approvedBy: varchar("approved_by", { length: 255 }).references(() => users.id),
  approvalStatus: mysqlEnum("approval_status", ["pending", "approved", "rejected"]).default("pending"),
  receiptNumber: varchar("receipt_number", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  branch: one(branches, {
    fields: [users.branchId],
    references: [branches.id],
  }),
  student: one(students, {
    fields: [users.id],
    references: [students.userId],
  }),
  paymentsCollected: many(payments),
  classesTeaching: many(classes),
  attendanceMarked: many(attendance),
  expensesCreated: many(expenses),
}));

export const branchesRelations = relations(branches, ({ one, many }) => ({
  manager: one(users, {
    fields: [branches.managerId],
    references: [users.id],
  }),
  users: many(users),
  students: many(students),
  classes: many(classes),
  expenses: many(expenses),
  batches: many(batches),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  branch: one(branches, {
    fields: [courses.branchId],
    references: [branches.id],
  }),
  students: many(students),
  classes: many(classes),
  batches: many(batches),
  installments: many(course_installments),
  scholarships: many(course_scholarships),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  user: one(users, {
    fields: [students.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [students.courseId],
    references: [courses.id],
  }),
  branch: one(branches, {
    fields: [students.branchId],
    references: [branches.id],
  }),
  batch: one(batches, {
    fields: [students.batchId],
    references: [batches.id],
  }),
  payments: many(payments),
  attendance: many(attendance),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  student: one(students, {
    fields: [payments.studentId],
    references: [students.id],
  }),
  collector: one(users, {
    fields: [payments.collectedBy],
    references: [users.id],
  }),
}));

export const classesRelations = relations(classes, ({ one, many }) => ({
  course: one(courses, {
    fields: [classes.courseId],
    references: [courses.id],
  }),
  branch: one(branches, {
    fields: [classes.branchId],
    references: [branches.id],
  }),
  batch: one(batches, {
    fields: [classes.batchId],
    references: [batches.id],
  }),
  faculty: one(users, {
    fields: [classes.facultyId],
    references: [users.id],
  }),
  attendance: many(attendance),
}));

export const attendanceRelations = relations(attendance, ({ one }) => ({
  class: one(classes, {
    fields: [attendance.classId],
    references: [classes.id],
  }),
  student: one(students, {
    fields: [attendance.studentId],
    references: [students.id],
  }),
  markedBy: one(users, {
    fields: [attendance.markedBy],
    references: [users.id],
  }),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  branch: one(branches, {
    fields: [expenses.branchId],
    references: [branches.id],
  }),
  createdBy: one(users, {
    fields: [expenses.createdBy],
    references: [users.id],
  }),
  approvedBy: one(users, {
    fields: [expenses.approvedBy],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBranchSchema = createInsertSchema(branches).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBatchSchema = createInsertSchema(batches).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
  enrollmentId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertClassSchema = createInsertSchema(classes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAttendanceSchema = createInsertSchema(attendance).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertExpenseSchema = createInsertSchema(expenses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCourseInstallmentSchema = createInsertSchema(course_installments).omit({
  id: true,
  createdAt: true,
});

export const insertCourseScholarshipSchema = createInsertSchema(course_scholarships).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Branch = typeof branches.$inferSelect;
export type Course = typeof courses.$inferSelect;
export type Batch = typeof batches.$inferSelect;
export type Student = typeof students.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type Class = typeof classes.$inferSelect;
export type Attendance = typeof attendance.$inferSelect;
export type Expense = typeof expenses.$inferSelect;
export type CourseInstallment = typeof course_installments.$inferSelect;
export type CourseScholarship = typeof course_scholarships.$inferSelect;

export type InsertBranch = z.infer<typeof insertBranchSchema>;
export type InsertBatch = z.infer<typeof insertBatchSchema>;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type InsertClass = z.infer<typeof insertClassSchema>;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type InsertCourseInstallment = z.infer<typeof insertCourseInstallmentSchema>;
export type InsertCourseScholarship = z.infer<typeof insertCourseScholarshipSchema>;

export const batchesRelations = relations(batches, ({ one, many }) => ({
  course: one(courses, {
    fields: [batches.courseId],
    references: [courses.id],
  }),
  branch: one(branches, {
    fields: [batches.branchId],
    references: [branches.id],
  }),
  students: many(students),
}));

export const courseInstallmentsRelations = relations(course_installments, ({ one }) => ({
  course: one(courses, {
    fields: [course_installments.courseId],
    references: [courses.id],
  }),
}));

export const courseScholarshipsRelations = relations(course_scholarships, ({ one }) => ({
  course: one(courses, {
    fields: [course_scholarships.courseId],
    references: [courses.id],
  }),
}));
