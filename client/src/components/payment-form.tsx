import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPaymentSchema } from "@shared/schema";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";

const paymentFormSchema = insertPaymentSchema.extend({
  amount: z.string().min(1, "Amount is required"),
}).omit({
  collectedBy: true,
});

type PaymentFormData = z.infer<typeof paymentFormSchema>;

interface PaymentFormProps {
  onSubmit: (data: PaymentFormData) => void;
  isLoading: boolean;
  students: any[];
}

export default function PaymentForm({
  onSubmit,
  isLoading,
  students
}: PaymentFormProps) {
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      studentId: "",
      amount: "",
      paymentMethod: "",
      paymentType: "installment",
      transactionId: "",
      notes: "",
    },
  });

  const handleStudentSelect = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    setSelectedStudent(student);
    form.setValue("studentId", studentId);
  };

  const handleSubmit = (data: PaymentFormData) => {
    const processedData = {
      ...data,
      amount: parseFloat(data.amount),
    };
    onSubmit(processedData as any);
  };

  const formatCurrency = (amount: string) => {
    if (!amount) return "৳0";
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(parseFloat(amount)).replace('BDT', '৳');
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Student Selection */}
        <FormField
          control={form.control}
          name="studentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select Student</FormLabel>
              <Select onValueChange={handleStudentSelect} value={field.value}>
                <FormControl>
                  <SelectTrigger data-testid="select-student">
                    <SelectValue placeholder="Choose student to collect payment from" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name} ({student.enrollmentId})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Student Details Card */}
        {selectedStudent && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Student Name</p>
                  <p className="font-medium" data-testid="text-selected-student-name">
                    {selectedStudent.name}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Total Fee</p>
                  <p className="font-medium">
                    {formatCurrency(selectedStudent.totalFee)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Paid Amount</p>
                  <p className="font-medium text-green-600">
                    {formatCurrency(selectedStudent.paidAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Due Amount</p>
                  <p className="font-medium text-red-600" data-testid="text-due-amount">
                    {formatCurrency(selectedStudent.dueAmount)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Amount (৳)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Enter amount"
                    {...field}
                    data-testid="input-payment-amount"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Method</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-payment-method">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bkash">bKash</SelectItem>
                    <SelectItem value="nagad">Nagad</SelectItem>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="paymentType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-payment-type">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="admission">Admission Fee</SelectItem>
                    <SelectItem value="installment">Installment</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="transactionId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Transaction ID (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="For digital payments"
                    {...field}
                    data-testid="input-transaction-id"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Any additional notes about the payment..."
                  {...field}
                  data-testid="input-payment-notes"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-3">
          <Button type="button" variant="outline" data-testid="button-cancel-payment">
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading || !selectedStudent}
            className="bg-green-600 hover:bg-green-700"
            data-testid="button-collect-payment"
          >
            {isLoading ? "Processing..." : "Collect Payment"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
