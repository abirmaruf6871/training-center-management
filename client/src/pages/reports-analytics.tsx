import React, { useState, useEffect } from 'react';
import { useLocation } from "wouter";
import { apiService } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import Sidebar from '@/components/layout/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, FileText, DollarSign, TrendingUp, TrendingDown, 
  Users, Calendar, BookOpen, AlertTriangle, Download, Filter,
  RefreshCw, Loader2, PieChart, LineChart, Activity
} from 'lucide-react';

interface FinancialReport {
  total_income: number;
  total_expense: number;
  profit_loss: number;
  profit_margin: number;
}

interface EnrollmentTrend {
  trends: Record<string, Record<string, number>>;
  raw_data: Array<{
    course_name: string;
    month: string;
    enrollment_count: number;
  }>;
}

interface OutstandingDues {
  total_students_with_dues: number;
  total_outstanding_amount: number;
  batch_wise_dues: Record<string, any>;
  student_wise_dues: Array<any>;
}

export default function ReportsAnalytics() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // State for different report types
  const [activeTab, setActiveTab] = useState('financial');
  const [loading, setLoading] = useState(false);
  
  // Financial Reports State
  const [financialData, setFinancialData] = useState<FinancialReport | null>(null);
  const [dateRange, setDateRange] = useState({
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  });
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [branches, setBranches] = useState([]);
  
  // Academic Reports State
  const [enrollmentData, setEnrollmentData] = useState<EnrollmentTrend | null>(null);
  const [selectedBatch, setSelectedBatch] = useState('all');
  const [batches, setBatches] = useState([]);
  
  // Outstanding Dues State
  const [duesData, setDuesData] = useState<OutstandingDues | null>(null);
  
  // Fetch branches for filtering
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await apiService.getBranches();
        if (response && response.success && response.data) {
          setBranches(response.data.data || response.data || []);
        }
      } catch (error) {
        console.error('Error fetching branches:', error);
      }
    };
    
    fetchBranches();
  }, []);

  // Fetch batches for filtering
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const response = await apiService.getBatches();
        if (response && response.success && response.data) {
          setBatches(response.data.data || response.data || []);
        }
      } catch (error) {
        console.error('Error fetching batches:', error);
      }
    };
    
    fetchBatches();
  }, []);

  // Generate Financial Report
  const generateFinancialReport = async () => {
    setLoading(true);
    try {
      const response = await apiService.customRequest('GET', '/reports/income-vs-expense', {
        start_date: dateRange.start_date,
        end_date: dateRange.end_date,
        branch_id: selectedBranch !== 'all' ? selectedBranch : undefined
      });
      
      if (response && response.success) {
        setFinancialData(response.data);
        toast({
          title: "Success",
          description: "Financial report generated successfully!",
        });
      }
    } catch (error) {
      console.error('Error generating financial report:', error);
      toast({
        title: "Error",
        description: "Failed to generate financial report",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Generate Enrollment Trend Report
  const generateEnrollmentTrend = async () => {
    setLoading(true);
    try {
      const response = await apiService.customRequest('GET', '/reports/enrollment-trend', {
        start_date: dateRange.start_date,
        end_date: dateRange.end_date,
        branch_id: selectedBranch !== 'all' ? selectedBranch : undefined
      });
      
      if (response && response.success) {
        setEnrollmentData(response.data);
        toast({
          title: "Success",
          description: "Enrollment trend report generated successfully!",
        });
      }
    } catch (error) {
      console.error('Error generating enrollment trend:', error);
      toast({
        title: "Error",
        description: "Failed to generate enrollment trend report",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Generate Outstanding Dues Report
  const generateOutstandingDues = async () => {
    setLoading(true);
    try {
      const response = await apiService.customRequest('GET', '/reports/outstanding-dues', {
        branch_id: selectedBranch !== 'all' ? selectedBranch : undefined,
        batch_id: selectedBatch !== 'all' ? selectedBatch : undefined
      });
      
      if (response && response.success) {
        setDuesData(response.data);
        toast({
          title: "Success",
          description: "Outstanding dues report generated successfully!",
        });
      }
    } catch (error) {
      console.error('Error generating outstanding dues report:', error);
      toast({
        title: "Error",
        description: "Failed to generate outstanding dues report",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    if (isNaN(amount)) return '৳0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    if (isNaN(value)) return '0%';
    return `${value.toFixed(2)}%`;
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Reports & Analytics</h1>
              <p className="text-sm text-gray-600">Comprehensive financial, academic, and operational reports</p>
            </div>
            <Button 
              onClick={() => {
                if (activeTab === 'financial') generateFinancialReport();
                else if (activeTab === 'academic') generateEnrollmentTrend();
                else if (activeTab === 'outstanding') generateOutstandingDues();
              }}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Generate Report
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Report Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <Input
                  type="date"
                  value={dateRange.start_date}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start_date: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <Input
                  type="date"
                  value={dateRange.end_date}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end_date: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Branch</label>
                <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                  <SelectTrigger>
                    <SelectValue placeholder="All branches" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All branches</SelectItem>
                    {branches.map((branch: any) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Batch (for Dues)</label>
                <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                  <SelectTrigger>
                    <SelectValue placeholder="All batches" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All batches</SelectItem>
                    {batches.map((batch: any) => (
                      <SelectItem key={batch.id} value={batch.id}>
                        {batch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reports Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="financial" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Financial Reports
            </TabsTrigger>
            <TabsTrigger value="academic" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Academic Reports
            </TabsTrigger>
            <TabsTrigger value="outstanding" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Outstanding Reports
            </TabsTrigger>
          </TabsList>

          {/* Financial Reports Tab */}
          <TabsContent value="financial" className="space-y-6">
            {financialData && (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(financialData.total_income)}
                      </div>
                      <p className="text-xs text-muted-foreground">Period total</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">
                        {formatCurrency(financialData.total_expense)}
                      </div>
                      <p className="text-xs text-muted-foreground">Period total</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Profit/Loss</CardTitle>
                      <Activity className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                      <div className={`text-2xl font-bold ${
                        financialData.profit_loss >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(financialData.profit_loss)}
                      </div>
                      <p className="text-xs text-muted-foreground">Net result</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
                      <PieChart className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                      <div className={`text-2xl font-bold ${
                        financialData.profit_margin >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatPercentage(financialData.profit_margin)}
                      </div>
                      <p className="text-xs text-muted-foreground">Percentage</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Chart Placeholder */}
                <Card>
                  <CardHeader>
                    <CardTitle>Income vs Expense Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                      <div className="text-center text-gray-500">
                        <LineChart className="h-16 w-16 mx-auto mb-2" />
                        <p>Chart visualization would be implemented here</p>
                        <p className="text-sm">Using libraries like Chart.js or Recharts</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {!financialData && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-gray-500">
                    <BarChart3 className="h-16 w-16 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Financial Data</h3>
                    <p>Click "Generate Report" to create a financial report for the selected period.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Academic Reports Tab */}
          <TabsContent value="academic" className="space-y-6">
            {enrollmentData && (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
                      <Users className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">
                        {enrollmentData.raw_data.reduce((sum, item) => sum + item.enrollment_count, 0)}
                      </div>
                      <p className="text-xs text-muted-foreground">Period total</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
                      <BookOpen className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        {Object.keys(enrollmentData.trends).length}
                      </div>
                      <p className="text-xs text-muted-foreground">With enrollments</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Period</CardTitle>
                      <Calendar className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-purple-600">
                        {enrollmentData.raw_data.length > 0 ? 
                          `${enrollmentData.raw_data.length} months` : 'N/A'
                        }
                      </div>
                      <p className="text-xs text-muted-foreground">Data points</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Enrollment Trends Table */}
                <Card>
                  <CardHeader>
                    <CardTitle>Enrollment Trends by Course</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Course</TableHead>
                            <TableHead>Total Enrollments</TableHead>
                            <TableHead>Trend</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {Object.entries(enrollmentData.trends).map(([courseName, trendData]) => {
                            const totalEnrollments = Object.values(trendData).reduce((sum: any, count: any) => sum + count, 0);
                            const months = Object.keys(trendData).sort();
                            const trend = months.length >= 2 ? 
                              (trendData[months[months.length - 1]] - trendData[months[0]]) : 0;
                            
                            return (
                              <TableRow key={courseName}>
                                <TableCell className="font-medium">{courseName}</TableCell>
                                <TableCell>{totalEnrollments}</TableCell>
                                <TableCell>
                                  <Badge className={
                                    trend > 0 ? 'bg-green-100 text-green-800' :
                                    trend < 0 ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                                  }>
                                    {trend > 0 ? '↗️ Growing' : trend < 0 ? '↘️ Declining' : '→ Stable'}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {!enrollmentData && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-gray-500">
                    <BookOpen className="h-16 w-16 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Academic Data</h3>
                    <p>Click "Generate Report" to create an enrollment trend report for the selected period.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Outstanding Reports Tab */}
          <TabsContent value="outstanding" className="space-y-6">
            {duesData && (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Students with Dues</CardTitle>
                      <Users className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-orange-600">
                        {duesData.total_students_with_dues}
                      </div>
                      <p className="text-xs text-muted-foreground">Total count</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Outstanding Amount</CardTitle>
                      <DollarSign className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">
                        {formatCurrency(duesData.total_outstanding_amount)}
                      </div>
                      <p className="text-xs text-muted-foreground">Total dues</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Batch-wise Dues */}
                <Card>
                  <CardHeader>
                    <CardTitle>Batch-wise Outstanding Dues</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Batch</TableHead>
                            <TableHead>Students with Dues</TableHead>
                            <TableHead>Total Amount</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {Object.entries(duesData.batch_wise_dues).map(([batchId, batchData]: [string, any]) => (
                            <TableRow key={batchId}>
                              <TableCell className="font-medium">{batchData.batch_name}</TableCell>
                              <TableCell>{batchData.total_students}</TableCell>
                              <TableCell className="font-medium text-red-600">
                                {formatCurrency(batchData.total_dues)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>

                {/* Student-wise Dues */}
                <Card>
                  <CardHeader>
                    <CardTitle>Student-wise Outstanding Dues</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Student Name</TableHead>
                            <TableHead>Course</TableHead>
                            <TableHead>Batch</TableHead>
                            <TableHead>Branch</TableHead>
                            <TableHead>Outstanding Amount</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {duesData.student_wise_dues.map((student: any) => (
                            <TableRow key={student.id}>
                              <TableCell className="font-medium">{student.name}</TableCell>
                              <TableCell>{student.course}</TableCell>
                              <TableCell>{student.batch}</TableCell>
                              <TableCell>{student.branch}</TableCell>
                              <TableCell className="font-medium text-red-600">
                                {formatCurrency(student.outstanding_dues)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {!duesData && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-gray-500">
                    <AlertTriangle className="h-16 w-16 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Outstanding Dues Data</h3>
                    <p>Click "Generate Report" to create an outstanding dues report for the selected filters.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
