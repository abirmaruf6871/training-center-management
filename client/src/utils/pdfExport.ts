import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  bmdc_no?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  course_id?: number;
  branch_id?: number;
  batch_id?: number;
  admission_date?: string;
  total_fee?: number;
  admission_fee?: number;
  discount_amount?: number;
  final_fee?: number;
  payment_status?: string;
  status?: string;
  notes?: string;
  course?: { id: number; name: string };
  branch?: { id: number; name: string };
  batch?: { id: number; name: string };
  payment_history?: Array<{
    id: number;
    student_id: number;
    payment_type: string;
    amount: number;
    payment_date: string;
    payment_method: string;
    receipt_no: string;
    notes: string;
    created_at: string;
  }>;
}

export const exportStudentPDF = (student: Student) => {
  const doc = new jsPDF();
  
  // Set document properties
  doc.setProperties({
    title: `Student Report - ${student.first_name} ${student.last_name}`,
    subject: 'Student Information Report',
    author: 'ACMR Academy',
    creator: 'ACMR Academy Management System'
  });

  // Ultra-modern header design
  // Main background gradient effect (simulated with multiple rectangles)
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 0, 210, 50, 'F');
  
  // Secondary accent color for modern look
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, 210, 15, 'F');
  
  // Decorative line at bottom
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 48, 210, 2, 'F');
  
  // Academy name with modern typography
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('ACMR Academy', 105, 25, { align: 'center' });
  
  // Subtitle with elegant styling
  doc.setFontSize(12);
  doc.setTextColor(226, 232, 240);
  doc.setFont('helvetica', 'normal');
  doc.text('Student Information Report', 105, 38, { align: 'center' });
  
  // Decorative element - small accent line
  doc.setFillColor(255, 255, 255);
  doc.rect(85, 42, 40, 1, 'F');
  
  // Student header section with reduced spacing
  let currentY = 60;
  
  // Student name with enhanced typography
  doc.setFontSize(20);
  doc.setTextColor(30, 30, 30);
  doc.setFont('helvetica', 'bold');
  doc.text(`${student.first_name} ${student.last_name}`, 20, currentY);
  
  // Student ID with reduced spacing
  doc.setFontSize(11);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  doc.text(`Student ID: ${student.id}`, 20, currentY + 12);
  
  // BMDC Number with reduced spacing
  if (student.bmdc_no) {
    doc.setFontSize(11);
    doc.setTextColor(59, 130, 246);
    doc.setFont('helvetica', 'bold');
    doc.text(`BMDC: ${student.bmdc_no}`, 20, currentY + 24);
  }
  
  currentY = 95;
  
  // First Row: Personal Information (Left) and Academic Information (Right)
  
  // Personal Information Section - Left Column
  doc.setFontSize(14);
  doc.setTextColor(30, 30, 30);
  doc.setFont('helvetica', 'bold');
  doc.text('Personal Information', 20, currentY);
  
  const personalData = [
    ['Email Address', student.email],
    ['Phone Number', student.phone],
    ['Date of Birth', student.date_of_birth || 'N/A'],
    ['Gender', student.gender ? student.gender.charAt(0).toUpperCase() + student.gender.slice(1) : 'N/A'],
    ['Address', student.address || 'N/A'],
  ];
  
  autoTable(doc, {
    startY: currentY + 10,
    head: [['Field', 'Value']],
    body: personalData,
    theme: 'grid',
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    styles: {
      fontSize: 8,
      cellPadding: 4,
    },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: [55, 65, 81], cellWidth: 35 },
      1: { textColor: [30, 30, 30], cellWidth: 40 },
    },
    margin: { left: 20, right: 110 },
  });
  
  // Academic Information Section - Right Column
  doc.setFontSize(14);
  doc.setTextColor(30, 30, 30);
  doc.setFont('helvetica', 'bold');
  doc.text('Academic Information', 115, currentY);
  
  const academicData = [
    ['Course', student.course?.name || 'N/A'],
    ['Branch', student.branch?.name || 'N/A'],
    ['Batch', student.batch?.name || 'N/A'],
    ['Admission Date', student.admission_date || 'N/A'],
  ];
  
  autoTable(doc, {
    startY: currentY + 10,
    head: [['Field', 'Value']],
    body: academicData,
    theme: 'grid',
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    styles: {
      fontSize: 8,
      cellPadding: 4,
    },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: [55, 65, 81], cellWidth: 35 },
      1: { textColor: [30, 30, 30], cellWidth: 40 },
    },
    margin: { left: 115, right: 20 },
  });
  
  // Get the Y position after the first row tables
  const firstRowEndY = Math.max(
    currentY + 10 + (personalData.length + 1) * 12, // Personal table height
    currentY + 10 + (academicData.length + 1) * 12  // Academic table height
  );
  
  currentY = firstRowEndY + 8; // Further reduced spacing between rows
  
  // Second Row: Financial Information (Left) and Payment Status + History (Right)
  
  // Financial Information Section - Left Column
  doc.setFontSize(14);
  doc.setTextColor(30, 30, 30);
  doc.setFont('helvetica', 'bold');
  doc.text('Financial Information', 20, currentY);
  
  const financialData = [
    ['Total Fee', `BDT ${(student.total_fee || 0).toLocaleString()}`],
    ['Admission Fee', `BDT ${(student.admission_fee || 0).toLocaleString()}`],
    ['Discount Amount', `BDT ${(student.discount_amount || 0).toLocaleString()}`],
    ['Final Fee', `BDT ${(student.final_fee || 0).toLocaleString()}`],
  ];
  
  autoTable(doc, {
    startY: currentY + 8,
    head: [['Field', 'Value']],
    body: financialData,
    theme: 'grid',
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    styles: {
      fontSize: 8,
      cellPadding: 4,
    },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: [55, 65, 81], cellWidth: 35 },
      1: { textColor: [30, 30, 30], cellWidth: 40 },
    },
    margin: { left: 20, right: 110 },
  });
  
  // Payment Status Section - Right Column
  doc.setFontSize(14);
  doc.setTextColor(30, 30, 30);
  doc.setFont('helvetica', 'bold');
  doc.text('Payment Status', 115, currentY);
  
  const paymentStatusData = [
    ['Status', student.payment_status ? student.payment_status.toUpperCase() : 'N/A'],
  ];
  
  autoTable(doc, {
    startY: currentY + 8,
    head: [['Field', 'Value']],
    body: paymentStatusData,
    theme: 'grid',
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    styles: {
      fontSize: 8,
      cellPadding: 4,
    },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: [55, 65, 81], cellWidth: 35 },
      1: { textColor: [30, 30, 30], cellWidth: 40 },
    },
    margin: { left: 115, right: 20 },
  });
  
  // Payment History Section - Right Column (if available)
  if (student.payment_history && student.payment_history.length > 0) {
    doc.setFontSize(14);
    doc.setTextColor(30, 30, 30);
    doc.setFont('helvetica', 'bold');
    doc.text('Payment History', 115, currentY + 35);
    
    const paymentHistoryData = student.payment_history.map(payment => [
      payment.payment_date,
      payment.payment_type.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
      `BDT ${(payment.amount || 0).toLocaleString()}`,
      payment.payment_method.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
    ]);
    
    autoTable(doc, {
      startY: currentY + 43,
      head: [['Date', 'Type', 'Amount', 'Method']],
      body: paymentHistoryData,
      theme: 'grid',
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8,
      },
      styles: {
        fontSize: 7,
        cellPadding: 3,
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 30 },
        2: { cellWidth: 25 },
        3: { cellWidth: 25 },
      },
      margin: { left: 115, right: 20 },
    });
  }
  
  // Notes Section (if available and space permits)
  if (student.notes) {
    const notesY = currentY + 100; // Reduced spacing
    if (notesY < 280) { // Only add if there's space
      doc.setFontSize(14);
      doc.setTextColor(30, 30, 30);
      doc.setFont('helvetica', 'bold');
      doc.text('Notes', 20, notesY);
      
      doc.setFontSize(10);
      doc.setTextColor(55, 65, 81);
      doc.setFont('helvetica', 'normal');
      doc.text(student.notes, 20, notesY + 10);
    }
  }
  
  // Modern footer design
  doc.setDrawColor(226, 232, 240);
  doc.line(20, 285, 190, 285);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated on ${new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })}`, 105, 292, { align: 'center' });
  
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.setFont('helvetica', 'normal');
  doc.text('ACMR Academy - Student Management System', 105, 297, { align: 'center' });
  
  // Save the PDF
  const fileName = `student_${student.first_name}_${student.last_name}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};
