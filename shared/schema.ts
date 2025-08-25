import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  pgEnum
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default("student"), // admin, manager, accountant, faculty, student
  branchId: varchar("branch_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Branches table
export const branches = pgTable("branches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  address: text("address"),
  phone: varchar("phone"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Courses table
export const courses = pgTable("courses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(), // CMU, DMU, ARDMS
  description: text("description"),
  duration: integer("duration").notNull(), // in months
  totalFee: decimal("total_fee", { precision: 10, scale: 2 }).notNull(),
  admissionFee: decimal("admission_fee", { precision: 10, scale: 2 }).notNull(),
  installmentCount: integer("installment_count").default(1),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Students table
export const students = pgTable("students", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  enrollmentId: varchar("enrollment_id").notNull().unique(),
  userId: varchar("user_id").references(() => users.id),
  name: varchar("name").notNull(),
  email: varchar("email"),
  phone: varchar("phone"),
  bmdcNo: varchar("bmdc_no"),
  courseId: varchar("course_id").references(() => courses.id),
  branchId: varchar("branch_id").references(() => branches.id),
  batchName: varchar("batch_name"),
  admissionDate: timestamp("admission_date").defaultNow(),
  totalFee: decimal("total_fee", { precision: 10, scale: 2 }).notNull(),
  paidAmount: decimal("paid_amount", { precision: 10, scale: 2 }).default("0"),
  dueAmount: decimal("due_amount", { precision: 10, scale: 2 }).notNull(),
  paymentStatus: varchar("payment_status").default("pending"), // paid, partial, pending, overdue
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payments table
export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").references(() => students.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar("payment_method").notNull(), // cash, bkash, nagad, bank
  paymentType: varchar("payment_type").default("installment"), // admission, installment
  transactionId: varchar("transaction_id"),
  notes: text("notes"),
  collectedBy: varchar("collected_by").references(() => users.id),
  paymentDate: timestamp("payment_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Classes table
export const classes = pgTable("classes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: varchar("course_id").references(() => courses.id),
  branchId: varchar("branch_id").references(() => branches.id),
  batchName: varchar("batch_name").notNull(),
  title: varchar("title").notNull(),
  facultyId: varchar("faculty_id").references(() => users.id),
  classDate: timestamp("class_date").notNull(),
  startTime: varchar("start_time").notNull(),
  endTime: varchar("end_time").notNull(),
  room: varchar("room"),
  isCompleted: boolean("is_completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Attendance table
export const attendance = pgTable("attendance", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  classId: varchar("class_id").references(() => classes.id),
  studentId: varchar("student_id").references(() => students.id),
  status: varchar("status").notNull(), // present, absent
  markedBy: varchar("marked_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Expenses table
export const expenses = pgTable("expenses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  category: varchar("category").notNull(), // salary, rent, utility, marketing, honorarium
  description: text("description"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  branchId: varchar("branch_id").references(() => branches.id),
  expenseDate: timestamp("expense_date").defaultNow(),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
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

export const branchesRelations = relations(branches, ({ many }) => ({
  users: many(users),
  students: many(students),
  classes: many(classes),
  expenses: many(expenses),
}));

export const coursesRelations = relations(courses, ({ many }) => ({
  students: many(students),
  classes: many(classes),
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
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  createdAt: true,
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
});

export const insertClassSchema = createInsertSchema(classes).omit({
  id: true,
  createdAt: true,
});

export const insertAttendanceSchema = createInsertSchema(attendance).omit({
  id: true,
  createdAt: true,
});

export const insertExpenseSchema = createInsertSchema(expenses).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Branch = typeof branches.$inferSelect;
export type Course = typeof courses.$inferSelect;
export type Student = typeof students.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type Class = typeof classes.$inferSelect;
export type Attendance = typeof attendance.$inferSelect;
export type Expense = typeof expenses.$inferSelect;

export type InsertBranch = z.infer<typeof insertBranchSchema>;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type InsertClass = z.infer<typeof insertClassSchema>;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
