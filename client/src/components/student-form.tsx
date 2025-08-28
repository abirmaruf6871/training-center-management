import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";

// Define the student schema locally since @shared/schema was deleted
const insertStudentSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone is required"),
  bmdc_no: z.string().optional(),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["male", "female", "other"]),
  address: z.string().min(1, "Address is required"),
  course_id: z.string().min(1, "Course is required"),
  branch_id: z.string().min(1, "Branch is required"),
  batch_id: z.string().min(1, "Batch is required"),
  admission_date: z.string().min(1, "Admission date is required"),
  total_fee: z.string().min(1, "Total fee is required"),
  admission_fee: z.string().min(1, "Admission fee is required"),
  discount_amount: z.string().optional(),
  status: z.enum(["active", "inactive"]).default("active"),
  notes: z.string().optional(),
});
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

type StudentFormData = z.infer<typeof insertStudentSchema>;

interface StudentFormProps {
  onSubmit: (data: StudentFormData) => void;
  isLoading: boolean;
  courses: any[];
  branches: any[];
  batches: any[];
  student?: any;
}

export default function StudentForm({
  onSubmit,
  isLoading,
  courses,
  branches,
  batches,
  student
}: StudentFormProps) {
  const form = useForm<StudentFormData>({
    resolver: zodResolver(insertStudentSchema),
    defaultValues: {
      first_name: student?.first_name || "",
      last_name: student?.last_name || "",
      email: student?.email || "",
      phone: student?.phone || "",
      bmdc_no: student?.bmdc_no || "",
      date_of_birth: student?.date_of_birth || "",
      gender: student?.gender || "male",
      address: student?.address || "",
      course_id: student?.course_id || "",
      branch_id: student?.branch_id || "",
      batch_id: student?.batch_id || "",
      admission_date: student?.admission_date || "",
      total_fee: student?.total_fee?.toString() || "",
      admission_fee: student?.admission_fee?.toString() || "",
      discount_amount: student?.discount_amount?.toString() || "0",
      status: student?.status || "active",
      notes: student?.notes || "",
    },
  });

  const handleSubmit = (data: StudentFormData) => {
    const processedData = {
      ...data,
      total_fee: parseFloat(data.total_fee),
      admission_fee: parseFloat(data.admission_fee),
      discount_amount: parseFloat(data.discount_amount || "0"),
    };
    onSubmit(processedData as any);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="John" {...field} data-testid="input-student-first-name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Doe" {...field} data-testid="input-student-last-name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="bmdc_no"
            render={({ field }) => (
              <FormItem>
                <FormLabel>BMDC Registration No.</FormLabel>
                <FormControl>
                  <Input placeholder="B-12345" {...field} value={field.value || ""} data-testid="input-bmdc-no" />
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
                  <Input type="email" placeholder="doctor@example.com" {...field} value={field.value || ""} data-testid="input-email" />
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
                  <Input placeholder="+880 123 456 7890" {...field} value={field.value || ""} data-testid="input-phone" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date_of_birth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date of Birth</FormLabel>
                <FormControl>
                  <Input type="date" {...field} data-testid="input-date-of-birth" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <FormControl>
                    <SelectTrigger data-testid="select-gender">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input placeholder="Full address" {...field} data-testid="input-address" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="admission_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Admission Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} data-testid="input-admission-date" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="discount_amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discount Amount (৳)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0"
                    {...field}
                    data-testid="input-discount-amount"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="course_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Course</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""}>
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
            name="branch_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Branch</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""}>
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
            name="batch_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Batch</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <FormControl>
                    <SelectTrigger data-testid="select-batch">
                      <SelectValue placeholder="Select batch" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {batches?.map((batch) => (
                      <SelectItem key={batch.id} value={batch.id}>
                        {batch.name}
                      </SelectItem>
                    ))}
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
            name="total_fee"
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
            name="admission_fee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Admission Fee (৳)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="5000"
                    {...field}
                    data-testid="input-admission-fee"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || "active"}>
                  <FormControl>
                    <SelectTrigger data-testid="select-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Additional notes (optional)"
                    {...field}
                    value={field.value || ""}
                    data-testid="input-notes"
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
