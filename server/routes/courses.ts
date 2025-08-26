import express from 'express';
import { db } from '../db';
import { courses, course_installments, course_scholarships, students, payments, branches } from '../../shared/schema';
import { eq, and, sql, desc, count, sum } from 'drizzle-orm';
import { requireAdmin, requireManager, requireAccountant } from '../middleware/roleAuth';

const router = express.Router();

// =====================================================
// COURSE CRUD OPERATIONS
// =====================================================

// Get all courses (with role-based filtering)
router.get('/', async (req, res) => {
  try {
    const user = req.user as any;
    let query = db.select().from(courses);

    // Manager can only see courses in their branch
    if (user.role === 'manager' && user.branchId) {
      query = db.select().from(courses).where(eq(courses.branchId, user.branchId));
    }

    const allCourses = await query;
    
    // Get additional data for each course
    const coursesWithDetails = await Promise.all(
      allCourses.map(async (course) => {
        const [studentCount, totalIncome, pendingDues] = await Promise.all([
                     db.select({ count: count() }).from(students).where(eq(students.course_id, course.id)),
          db.select({ total: sum(payments.amount) }).from(payments)
            .innerJoin(students, eq(students.id, payments.studentId))
                         .where(eq(students.course_id, course.id)),
                     db.select({ total: sum(students.due_amount) }).from(students).where(eq(students.course_id, course.id))
        ]);

                 const installments = await db.select().from(course_installments)
           .where(eq(course_installments.course_id, course.id))
           .orderBy(course_installments.installment_number);

                 const scholarships = await db.select().from(course_scholarships)
           .where(eq(course_scholarships.course_id, course.id));

        const branch = await db.select().from(branches).where(eq(branches.id, course.branchId));

        return {
          ...course,
          studentCount: studentCount[0]?.count || 0,
          totalIncome: totalIncome[0]?.total || 0,
          pendingDues: pendingDues[0]?.total || 0,
          installments,
          scholarships,
          branch: branch[0]
        };
      })
    );

    res.json(coursesWithDetails);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: 'Failed to fetch courses' });
  }
});

// Get single course by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const course = await db.select().from(courses).where(eq(courses.id, id));
    
    if (course.length === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }

           const [installments, scholarships, branch] = await Promise.all([
         db.select().from(course_installments).where(eq(course_installments.course_id, id)),
         db.select().from(course_scholarships).where(eq(course_scholarships.course_id, id)),
      db.select().from(branches).where(eq(branches.id, course[0].branchId))
    ]);

    res.json({
      ...course[0],
      installments,
      scholarships,
      branch: branch[0]
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ message: 'Failed to fetch course' });
  }
});

// Create new course (Admin/Manager only)
router.post('/', requireManager, async (req, res) => {
  try {
    const user = req.user as any;
    const { name, description, duration, totalFee, admissionFee, installmentCount, batchSizeLimit, branchId, discountPercentage } = req.body;

    // Manager can only create courses in their branch
    if (user.role === 'manager' && user.branchId !== branchId) {
      return res.status(403).json({ message: 'You can only create courses in your assigned branch' });
    }

    const result = await db.insert(courses).values({
      name,
      description,
      duration,
      totalFee: parseFloat(totalFee),
      admissionFee: parseFloat(admissionFee),
      installmentCount: parseInt(installmentCount),
      batchSizeLimit: parseInt(batchSizeLimit),
      branchId,
      discountPercentage: parseFloat(discountPercentage || 0),
      isActive: true
    });
    
    // Get the inserted course
    const [newCourse] = await db.select().from(courses).where(eq(courses.id, result.insertId));

    res.status(201).json(newCourse);
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ message: 'Failed to create course' });
  }
});

// Update course (Admin/Manager only)
router.put('/:id', requireManager, async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user as any;
    const updateData = req.body;

    // Check if course exists and user has permission
    const existingCourse = await db.select().from(courses).where(eq(courses.id, id));
    if (existingCourse.length === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (user.role === 'manager' && existingCourse[0].branchId !== user.branchId) {
      return res.status(403).json({ message: 'You can only edit courses in your assigned branch' });
    }

    await db.update(courses)
      .set(updateData)
      .where(eq(courses.id, id));
    
    // Get the updated course
    const [updatedCourse] = await db.select().from(courses).where(eq(courses.id, id));

    res.json(updatedCourse);
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ message: 'Failed to update course' });
  }
});

// Delete course (Admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if course has enrolled students
    const enrolledStudents = await db.select().from(students).where(eq(students.course_id, id));
    if (enrolledStudents.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete course with enrolled students',
        studentCount: enrolledStudents.length
      });
    }

    await db.delete(courses).where(eq(courses.id, id));
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ message: 'Failed to delete course' });
  }
});

// =====================================================
// INSTALLMENT MANAGEMENT
// =====================================================

// Get installments for a course
router.get('/:id/installments', async (req, res) => {
  try {
    const { id } = req.params;
    const installments = await db.select()
      .from(course_installments)
      .where(eq(course_installments.course_id, id))
      .orderBy(course_installments.installmentNumber);

    res.json(installments);
  } catch (error) {
    console.error('Error fetching installments:', error);
    res.status(500).json({ message: 'Failed to fetch installments' });
  }
});

// Create/Update installments for a course
router.post('/:id/installments', requireManager, async (req, res) => {
  try {
    const { id } = req.params;
    const { installments } = req.body;

    // Delete existing installments
         await db.delete(course_installments).where(eq(course_installments.course_id, id));

    // Insert new installments
    if (installments && installments.length > 0) {
      await db.insert(course_installments).values(
        installments.map((inst: any) => ({
          course_id: id,
                     installment_number: inst.installmentNumber,
          amount: parseFloat(inst.amount),
                     due_date: inst.dueDate
        }))
      );
    }

    res.json({ message: 'Installments updated successfully' });
  } catch (error) {
    console.error('Error updating installments:', error);
    res.status(500).json({ message: 'Failed to update installments' });
  }
});

// =====================================================
// SCHOLARSHIP MANAGEMENT
// =====================================================

// Get scholarships for a course
router.get('/:id/scholarships', async (req, res) => {
  try {
    const { id } = req.params;
    const scholarships = await db.select()
      .from(course_scholarships)
      .where(eq(course_scholarships.course_id, id));

    res.json(scholarships);
  } catch (error) {
    console.error('Error fetching scholarships:', error);
    res.status(500).json({ message: 'Failed to fetch scholarships' });
  }
});

// Add scholarship to a course
router.post('/:id/scholarships', requireManager, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, discountPercentage, eligibilityCriteria } = req.body;

    const result = await db.insert(course_scholarships).values({
      course_id: id,
      name,
      description,
      discountPercentage: parseFloat(discountPercentage),
      eligibilityCriteria,
      isActive: true
    });
    
    // Get the inserted scholarship
    const [newScholarship] = await db.select().from(course_scholarships).where(eq(course_scholarships.id, result.insertId));

    res.status(201).json(newScholarship);
  } catch (error) {
    console.error('Error creating scholarship:', error);
    res.status(500).json({ message: 'Failed to create scholarship' });
  }
});

// =====================================================
// COURSE REPORTS
// =====================================================

// Course-wise total students
router.get('/:id/student-count', requireManager, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.select({ count: count() })
      .from(students)
      .where(eq(students.course_id, id));

    res.json({ studentCount: result[0]?.count || 0 });
  } catch (error) {
    console.error('Error fetching student count:', error);
    res.status(500).json({ message: 'Failed to fetch student count' });
  }
});

// Course-wise total income
router.get('/:id/income', requireManager, async (req, res) => {
  try {
    const { id } = req.params;
          const result = await db.select({ total: sum(payments.amount) })
        .from(payments)
        .innerJoin(students, eq(students.id, payments.studentId))
        .where(eq(students.course_id, id));

    res.json({ totalIncome: result[0]?.total || 0 });
  } catch (error) {
    console.error('Error fetching income:', error);
    res.status(500).json({ message: 'Failed to fetch income' });
  }
});

// Course-wise pending dues
router.get('/:id/pending-dues', requireManager, async (req, res) => {
  try {
    const { id } = req.params;
                const result = await db.select({ total: sum(students.due_amount) })
        .from(students)
        .where(eq(students.course_id, id));

    res.json({ pendingDues: result[0]?.total || 0 });
  } catch (error) {
    console.error('Error fetching pending dues:', error);
    res.status(500).json({ message: 'Failed to fetch pending dues' });
  }
});

// Comprehensive course report
router.get('/:id/report', requireManager, async (req, res) => {
  try {
    const { id } = req.params;
    const course = await db.select().from(courses).where(eq(courses.id, id));
    
    if (course.length === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const [studentCount, totalIncome, pendingDues, recentPayments] = await Promise.all([
      db.select({ count: count() }).from(students).where(eq(students.course_id, id)),
      db.select({ total: sum(payments.amount) }).from(payments)
        .innerJoin(students, eq(students.id, payments.studentId))
        .where(eq(students.course_id, id)),
      db.select({ total: sum(students.due_amount) }).from(students).where(eq(students.course_id, id)),
              db.select({ amount: payments.amount, date: payments.createdAt, studentName: students.name })
        .from(payments)
        .innerJoin(students, eq(students.id, payments.studentId))
        .where(eq(students.course_id, id))
        .orderBy(desc(payments.createdAt))
        .limit(10)
    ]);

    const report = {
      course: course[0],
      statistics: {
        studentCount: studentCount[0]?.count || 0,
        totalIncome: totalIncome[0]?.total || 0,
        pendingDues: pendingDues[0]?.total || 0,
        completionRate: ((totalIncome[0]?.total || 0) / course[0].totalFee) * 100
      },
      recentPayments: recentPayments
    };

    res.json(report);
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ message: 'Failed to generate report' });
  }
});

export default router;
