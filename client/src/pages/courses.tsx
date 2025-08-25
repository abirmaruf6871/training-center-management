import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import TopNav from "@/components/layout/topnav";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCourseSchema } from "@shared/schema";
import { z } from "zod";
import { 
  BookOpen, 
  Plus, 
  Edit,
  Users,
  Clock,
  DollarSign
} from "lucide-react";

const courseFormSchema = insertCourseSchema.extend({
  totalFee: z.string().min(1, "Total fee is required"),
  admissionFee: z.string().min(1, "Admission fee is required"),
});

type CourseFormData = z.infer<typeof courseFormSchema>;

export default function Courses() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: courses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ["/api/courses"],
  });

  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      name: "",
      description: "",
      duration: 1,
      totalFee: "",
      admissionFee: "",
      installmentCount: 1,
      isActive: true,
    },
  });

  const createCourseMutation = useMutation({
    mutationFn: async (courseData: any) => {
      await apiRequest("POST", "/api/courses", {
        ...courseData,
        totalFee: parseFloat(courseData.totalFee),
        admissionFee: parseFloat(courseData.admissionFee),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      toast({
        title: "Success",
        description: "Course created successfully",
      });
      setShowAddDialog(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateCourseMutation = useMutation({
    mutationFn: async ({ id, courseData }: { id: string; courseData: any }) => {
      await apiRequest("PUT", `/api/courses/${id}`, {
        ...courseData,
        totalFee: parseFloat(courseData.totalFee),
        admissionFee: parseFloat(courseData.admissionFee),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      toast({
        title: "Success",
        description: "Course updated successfully",
      });
      setEditingCourse(null);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CourseFormData) => {
    if (editingCourse) {
      updateCourseMutation.mutate({ id: editingCourse.id, courseData: data });
    } else {
      createCourseMutation.mutate(data);
    }
  };

  const handleEdit = (course: any) => {
    setEditingCourse(course);
    form.reset({
      name: course.name,
      description: course.description || "",
      duration: course.duration,
      totalFee: course.totalFee.toString(),
      admissionFee: course.admissionFee.toString(),
      installmentCount: course.installmentCount || 1,
      isActive: course.isActive,
    });
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(parseFloat(amount)).replace('BDT', '৳');
  };

  const isDialogOpen = showAddDialog || editingCourse !== null;
  const setDialogOpen = (open: boolean) => {
    if (!open) {
      setShowAddDialog(false);
      setEditingCourse(null);
      form.reset();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <TopNav />
      <div className="flex pt-16">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Course Management</h1>
              <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="bg-blue-700 hover:bg-blue-800" 
                    onClick={() => setShowAddDialog(true)}
                    data-testid="button-add-course"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Course
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingCourse ? "Edit Course" : "Add New Course"}
                    </DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Course Name</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., DMU, CMU, ARDMS" {...field} data-testid="input-course-name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="duration"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Duration (months)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  {...field} 
                                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                                  data-testid="input-duration"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Course description..."
                                {...field}
                                data-testid="input-description"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                          name="admissionFee"
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
                        <FormField
                          control={form.control}
                          name="installmentCount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Installment Count</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                                  data-testid="input-installment-count"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex justify-end space-x-3">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setDialogOpen(false)}
                          data-testid="button-cancel"
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={createCourseMutation.isPending || updateCourseMutation.isPending}
                          data-testid="button-submit"
                        >
                          {editingCourse ? "Update Course" : "Create Course"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
            {coursesLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (courses as any[])?.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No courses yet</h3>
                <p className="text-gray-500">Get started by creating your first course.</p>
              </div>
            ) : (
              (courses as any[])?.map((course: any) => (
                <Card key={course.id} className="hover:shadow-md transition-shadow" data-testid={`card-course-${course.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{course.name}</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">
                          {course.duration} month{course.duration > 1 ? 's' : ''} program
                        </p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEdit(course)}
                        data-testid={`button-edit-course-${course.id}`}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {course.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {course.description}
                      </p>
                    )}
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Total Fee</span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(course.totalFee)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Admission Fee</span>
                        <span className="font-medium text-gray-700">
                          {formatCurrency(course.admissionFee)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Installments</span>
                        <span className="text-sm text-gray-700">
                          {course.installmentCount} payment{course.installmentCount > 1 ? 's' : ''}
                        </span>
                      </div>
                      
                      <div className="pt-2 flex items-center justify-between">
                        <Badge 
                          variant={course.isActive ? "default" : "secondary"}
                          className={course.isActive ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
                        >
                          {course.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <Users className="w-3 h-3" />
                          <span>0 enrolled</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Courses Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Courses</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Course Name</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Total Fee</TableHead>
                      <TableHead>Admission Fee</TableHead>
                      <TableHead>Installments</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(courses as any[])?.map((course: any) => (
                      <TableRow key={course.id} className="hover:bg-gray-50" data-testid={`row-course-${course.id}`}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900">{course.name}</div>
                            {course.description && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {course.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span>{course.duration} month{course.duration > 1 ? 's' : ''}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(course.totalFee)}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(course.admissionFee)}
                        </TableCell>
                        <TableCell>{course.installmentCount}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={course.isActive ? "default" : "secondary"}
                            className={course.isActive ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
                          >
                            {course.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEdit(course)}
                            data-testid={`button-edit-table-${course.id}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
