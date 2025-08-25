import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertStudentSchema } from "@shared/schema";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const studentFormSchema = insertStudentSchema.extend({
  totalFee: z.string().min(1, "Total fee is required"),
  dueAmount: z.string().min(1, "Due amount is required"),
});

type StudentFormData = z.infer<typeof studentFormSchema>;

interface StudentFormProps {
  onSubmit: (data: StudentFormData) => void;
  isLoading: boolean;
  courses: any[];
  branches: any[];
  student?: any;
}

export default function StudentForm({
  onSubmit,
  isLoading,
  courses,
  branches,
  student
}: StudentFormProps) {
  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      name: student?.name || "",
      email: student?.email || "",
      phone: student?.phone || "",
      bmdcNo: student?.bmdcNo || "",
      courseId: student?.courseId || "",
      branchId: student?.branchId || "",
      batchName: student?.batchName || "",
      totalFee: student?.totalFee?.toString() || "",
      dueAmount: student?.dueAmount?.toString() || "",
      paymentStatus: student?.paymentStatus || "pending",
      isActive: student?.isActive ?? true,
    },
  });

  const handleSubmit = (data: StudentFormData) => {
    const processedData = {
      ...data,
      totalFee: parseFloat(data.totalFee),
      dueAmount: parseFloat(data.dueAmount),
      paidAmount: parseFloat(data.totalFee) - parseFloat(data.dueAmount),
    };
    onSubmit(processedData as any);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Dr. John Doe" {...field} data-testid="input-student-name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="bmdcNo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>BMDC Registration No.</FormLabel>
                <FormControl>
                  <Input placeholder="B-12345" {...field} data-testid="input-bmdc-no" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="doctor@example.com" {...field} data-testid="input-email" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="+880 123 456 7890" {...field} data-testid="input-phone" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="courseId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Course</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-course">
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="branchId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Branch</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-branch">
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="batchName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Batch Name</FormLabel>
                <FormControl>
                  <Input placeholder="Batch 15" {...field} data-testid="input-batch-name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="totalFee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Fee (৳)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="25000"
                    {...field}
                    data-testid="input-total-fee"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="dueAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Due Amount (৳)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="20000"
                    {...field}
                    data-testid="input-due-amount"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-3">
          <Button type="button" variant="outline" data-testid="button-cancel">
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="bg-blue-700 hover:bg-blue-800"
            data-testid="button-submit-student"
          >
            {isLoading ? "Saving..." : student ? "Update Student" : "Add Student"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
