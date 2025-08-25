import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import TopNav from "@/components/layout/topnav";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  BarChart3, 
  TrendingUp,
  Download,
  FileSpreadsheet,
  FileText
} from "lucide-react";

export default function Reports() {
  const [reportType, setReportType] = useState("financial");
  const [dateRange, setDateRange] = useState("this_month");
  const [selectedBranch, setSelectedBranch] = useState("");

  const { data: branches } = useQuery({
    queryKey: ["/api/branches"],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats", selectedBranch],
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(amount).replace('BDT', '৳');
  };

  // Mock data for demonstration
  const financialSummary = [
    {
      branch: "Dhaka",
      totalIncome: 345000,
      totalExpense: 125000,
      netProfit: 220000,
      students: 758,
      pendingDues: 45000
    },
    {
      branch: "Mymensingh",
      totalIncome: 185000,
      totalExpense: 75000,
      netProfit: 110000,
      students: 324,
      pendingDues: 15000
    },
    {
      branch: "Kishoreganj",
      totalIncome: 95000,
      totalExpense: 35000,
      netProfit: 60000,
      students: 165,
      pendingDues: 7500
    },
  ];

  const totalSummary = financialSummary.reduce(
    (acc, curr) => ({
      totalIncome: acc.totalIncome + curr.totalIncome,
      totalExpense: acc.totalExpense + curr.totalExpense,
      netProfit: acc.netProfit + curr.netProfit,
      students: acc.students + curr.students,
      pendingDues: acc.pendingDues + curr.pendingDues,
    }),
    { totalIncome: 0, totalExpense: 0, netProfit: 0, students: 0, pendingDues: 0 }
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <TopNav />
      <div className="flex pt-16">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          </div>

          {/* Report Filters */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger data-testid="select-report-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="financial">Financial Summary</SelectItem>
                      <SelectItem value="enrollment">Student Enrollment</SelectItem>
                      <SelectItem value="payment">Payment Status</SelectItem>
                      <SelectItem value="course">Course Performance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger data-testid="select-date-range">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="this_month">This Month</SelectItem>
                      <SelectItem value="last_month">Last Month</SelectItem>
                      <SelectItem value="this_quarter">This Quarter</SelectItem>
                      <SelectItem value="this_year">This Year</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Branch</label>
                  <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                    <SelectTrigger data-testid="select-branch">
                      <SelectValue placeholder="All Branches" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Branches</SelectItem>
                      {branches?.map((branch: any) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700" data-testid="button-generate-report">
                    Generate Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Report Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Income vs Expense Chart */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Income vs Expense</CardTitle>
                  <Button variant="ghost" size="sm" data-testid="button-download-chart">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                    <p className="text-gray-500">Income vs Expense Chart</p>
                    <p className="text-sm text-gray-400">Chart will be rendered here</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Student Enrollment Trend */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Student Enrollment Trend</CardTitle>
                  <Button variant="ghost" size="sm" data-testid="button-download-trend">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                    <p className="text-gray-500">Enrollment Trend Chart</p>
                    <p className="text-sm text-gray-400">Chart will be rendered here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Reports Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Financial Summary Report</CardTitle>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" data-testid="button-export-excel">
                    <FileSpreadsheet className="w-4 h-4 mr-1" />
                    Export Excel
                  </Button>
                  <Button variant="outline" size="sm" data-testid="button-export-pdf">
                    <FileText className="w-4 h-4 mr-1" />
                    Export PDF
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Branch</TableHead>
                      <TableHead>Total Income</TableHead>
                      <TableHead>Total Expense</TableHead>
                      <TableHead>Net Profit</TableHead>
                      <TableHead>Students</TableHead>
                      <TableHead>Pending Dues</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {financialSummary.map((row, index) => (
                      <TableRow key={index} className="hover:bg-gray-50" data-testid={`row-branch-${row.branch.toLowerCase()}`}>
                        <TableCell className="font-medium">{row.branch}</TableCell>
                        <TableCell className="text-green-600 font-medium">
                          {formatCurrency(row.totalIncome)}
                        </TableCell>
                        <TableCell className="text-red-600">
                          {formatCurrency(row.totalExpense)}
                        </TableCell>
                        <TableCell className="text-green-600 font-medium">
                          {formatCurrency(row.netProfit)}
                        </TableCell>
                        <TableCell>{row.students}</TableCell>
                        <TableCell className="text-red-600">
                          {formatCurrency(row.pendingDues)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-gray-100 font-medium">
                      <TableCell>Total</TableCell>
                      <TableCell className="text-green-600">
                        {formatCurrency(totalSummary.totalIncome)}
                      </TableCell>
                      <TableCell className="text-red-600">
                        {formatCurrency(totalSummary.totalExpense)}
                      </TableCell>
                      <TableCell className="text-green-600">
                        {formatCurrency(totalSummary.netProfit)}
                      </TableCell>
                      <TableCell>{totalSummary.students}</TableCell>
                      <TableCell className="text-red-600">
                        {formatCurrency(totalSummary.pendingDues)}
                      </TableCell>
                    </TableRow>
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
