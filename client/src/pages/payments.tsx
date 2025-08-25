import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import TopNav from "@/components/layout/topnav";
import Sidebar from "@/components/layout/sidebar";
import PaymentForm from "@/components/payment-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Plus, 
  Search, 
  Receipt,
  Printer,
  Smartphone,
  Banknote,
  CreditCard,
  Building,
  CheckCircle
} from "lucide-react";

export default function Payments() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: payments, isLoading: paymentsLoading } = useQuery({
    queryKey: ["/api/payments"],
  });

  const { data: students } = useQuery({
    queryKey: ["/api/students"],
  });

  const createPaymentMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      await apiRequest("POST", "/api/payments", paymentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Payment collected successfully",
      });
      setShowPaymentDialog(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getPaymentMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case "bkash":
      case "nagad":
        return <Smartphone className="w-4 h-4" />;
      case "cash":
        return <Banknote className="w-4 h-4" />;
      case "bank":
      case "bank_transfer":
        return <Building className="w-4 h-4" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  const getPaymentMethodBadge = (method: string) => {
    const colors = {
      bkash: "bg-pink-100 text-pink-800",
      nagad: "bg-orange-100 text-orange-800",
      cash: "bg-green-100 text-green-800",
      bank: "bg-blue-100 text-blue-800",
      bank_transfer: "bg-blue-100 text-blue-800"
    };

    return (
      <Badge className={`${colors[method.toLowerCase() as keyof typeof colors] || "bg-gray-100 text-gray-800"} hover:${colors[method.toLowerCase() as keyof typeof colors] || "bg-gray-100"}`}>
        {getPaymentMethodIcon(method)}
        <span className="ml-1 capitalize">{method}</span>
      </Badge>
    );
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(parseFloat(amount)).replace('BDT', '৳');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStudentName = (studentId: string) => {
    const student = students?.find((s: any) => s.id === studentId);
    return student ? student.name : "Unknown Student";
  };

  const getStudentEnrollmentId = (studentId: string) => {
    const student = students?.find((s: any) => s.id === studentId);
    return student ? student.enrollmentId : "";
  };

  const filteredPayments = payments?.filter((payment: any) => {
    const studentName = getStudentName(payment.studentId).toLowerCase();
    const enrollmentId = getStudentEnrollmentId(payment.studentId).toLowerCase();
    const search = searchTerm.toLowerCase();
    
    return studentName.includes(search) || 
           enrollmentId.includes(search) ||
           payment.transactionId?.toLowerCase().includes(search);
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <TopNav />
      <div className="flex pt-16">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Fee Collection</h1>
              <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700" data-testid="button-collect-payment">
                    <Plus className="w-4 h-4 mr-2" />
                    Collect Payment
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Collect Payment</DialogTitle>
                  </DialogHeader>
                  <PaymentForm
                    onSubmit={(data) => createPaymentMutation.mutate(data)}
                    isLoading={createPaymentMutation.isPending}
                    students={students || []}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Payment Collection Form */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Quick Payment Collection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Enter Student ID or Name"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="input-student-search"
                  />
                </div>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  data-testid="input-amount"
                />
                <Select>
                  <SelectTrigger data-testid="select-payment-method">
                    <SelectValue placeholder="Payment Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bkash">bKash</SelectItem>
                    <SelectItem value="nagad">Nagad</SelectItem>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="mt-4 flex justify-end space-x-3">
                <Button variant="outline" data-testid="button-cancel-quick">
                  Cancel
                </Button>
                <Button className="bg-green-600 hover:bg-green-700" data-testid="button-collect-quick">
                  Collect Payment
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Payments */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Payments</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Date</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentsLoading ? (
                      Array.from({ length: 5 }).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell colSpan={7} className="text-center py-8">
                            Loading payments...
                          </TableCell>
                        </TableRow>
                      ))
                    ) : filteredPayments?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          {searchTerm ? "No payments found matching your search" : "No payments recorded yet"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPayments?.map((payment: any) => (
                        <TableRow key={payment.id} className="hover:bg-gray-50" data-testid={`row-payment-${payment.id}`}>
                          <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-gray-900">
                                {getStudentName(payment.studentId)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {getStudentEnrollmentId(payment.studentId)}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(payment.amount)}
                          </TableCell>
                          <TableCell>
                            {getPaymentMethodBadge(payment.paymentMethod)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {payment.paymentType || "installment"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Completed
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                title="View Receipt"
                                data-testid={`button-receipt-${payment.id}`}
                              >
                                <Receipt className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                title="Print"
                                data-testid={`button-print-${payment.id}`}
                              >
                                <Printer className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
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
