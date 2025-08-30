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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, Search, Eye, Edit, Trash2, Building2, Users, Calendar, 
  MapPin, DollarSign, TrendingUp, TrendingDown, Loader2, X,
  BarChart3, FileText, Download, Filter, RefreshCw
} from 'lucide-react';

interface Branch {
  id: string;
  name: string;
  code: string;
  location: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  phone?: string;
  email?: string;
  manager_name?: string;
  opening_date?: string;
  is_active: boolean;
  students_count?: number;
  staff_count?: number;
  batches_count?: number;
  courses_count?: number;
  total_income?: number;
  total_expenses?: number;
  profit_loss?: number;
  outstanding_dues?: number;
  active_batches?: number;
  completed_batches?: number;
}

export default function BranchManagement() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  
  // Form states
  const [createFormData, setCreateFormData] = useState({
    name: '',
    code: '',
    location: '',
    address: '',
    city: '',
    state: '',
    country: 'Bangladesh',
    phone: '',
    email: '',
    website: '',
    manager_name: '',
    manager_phone: '',
    manager_email: '',
    opening_date: '',
    timezone: 'Asia/Dhaka',
    currency: 'BDT',
    tax_rate: '0.00',
    capacity: '',
    max_students: '',
    description: ''
  });

  const [createLoading, setCreateLoading] = useState(false);

  // Fetch branches
  const fetchBranches = async () => {
    try {
      setLoading(true);
      const response = await apiService.getBranches();
      
      if (response && response.success && response.data) {
        setBranches(response.data.data || response.data || []);
      } else {
        setBranches([]);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
      toast({
        title: "Error",
        description: "Failed to fetch branches",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  // Filter branches
  const filteredBranches = branches.filter(branch => {
    const matchesSearch = branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         branch.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         branch.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || 
                         (selectedStatus === 'active' ? branch.is_active : !branch.is_active);
    const matchesLocation = selectedLocation === 'all' || branch.location === selectedLocation;
    
    return matchesSearch && matchesStatus && matchesLocation;
  });

  // Get unique locations for filter
  const locations = Array.from(new Set(branches.map(b => b.location)));

  // Handle form input changes
  const handleCreateInputChange = (field: string, value: string) => {
    setCreateFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle create branch
  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!createFormData.name || !createFormData.code || !createFormData.location) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setCreateLoading(true);
      const response = await apiService.createBranch(createFormData);

      if (response && response.success) {
        toast({
          title: "Success",
          description: "Branch created successfully!",
        });
        setShowCreateModal(false);
        setCreateFormData({
          name: '', code: '', location: '', address: '', city: '', state: '',
          country: 'Bangladesh', phone: '', email: '', website: '', manager_name: '',
          manager_phone: '', manager_email: '', opening_date: '', timezone: 'Asia/Dhaka',
          currency: 'BDT', tax_rate: '0.00', capacity: '', max_students: '', description: ''
        });
        fetchBranches();
      } else {
        toast({
          title: "Error",
          description: response?.message || 'Failed to create branch',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error creating branch:', error);
      toast({
        title: "Error",
        description: "Failed to create branch",
        variant: "destructive",
      });
    } finally {
      setCreateLoading(false);
    }
  };

  // Handle view branch
  const handleViewBranch = (branch: Branch) => {
    setSelectedBranch(branch);
    setShowViewModal(true);
  };

  // Handle edit branch
  const handleEditBranch = (branch: Branch) => {
    setSelectedBranch(branch);
    setCreateFormData({
      name: branch.name,
      code: branch.code,
      location: branch.location,
      address: branch.address || '',
      city: branch.city || '',
      state: branch.state || '',
      country: branch.country || 'Bangladesh',
      phone: branch.phone || '',
      email: branch.email || '',
      website: '',
      manager_name: branch.manager_name || '',
      manager_phone: '',
      manager_email: '',
      opening_date: branch.opening_date || '',
      timezone: 'Asia/Dhaka',
      currency: 'BDT',
      tax_rate: '0.00',
      capacity: '',
      max_students: '',
      description: ''
    });
    setShowEditModal(true);
  };

  // Handle delete branch
  const handleDeleteBranch = async (branchId: string) => {
    if (!confirm('Are you sure you want to delete this branch? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await apiService.deleteBranch(branchId);
      
      if (response && response.success) {
        toast({
          title: "Success",
          description: "Branch deleted successfully!",
        });
        fetchBranches();
      } else {
        toast({
          title: "Error",
          description: response?.message || 'Failed to delete branch',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting branch:', error);
      toast({
        title: "Error",
        description: "Failed to delete branch",
        variant: "destructive",
      });
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

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
        <Sidebar />
        <main className="flex-1 p-6 flex items-center justify-center">
          <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
          <p className="ml-4 text-lg text-gray-700 dark:text-gray-300">Loading branches...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <main className="flex-1 p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Branch Management</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Manage all branches and their operations</p>
            </div>
            <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add New Branch
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Branches</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{branches.length}</div>
              <p className="text-xs text-muted-foreground">All locations</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Branches</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {branches.filter(b => b.is_active).length}
              </div>
              <p className="text-xs text-muted-foreground">Currently operating</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {branches.reduce((sum, branch) => sum + (branch.students_count || 0), 0)}
              </div>
              <p className="text-xs text-muted-foreground">Across all branches</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Income</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(branches.reduce((sum, branch) => sum + (branch.total_income || 0), 0))}
              </div>
              <p className="text-xs text-muted-foreground">Combined revenue</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search branches..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="All locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All locations</SelectItem>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Branches Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>All Branches ({filteredBranches.length})</span>
              <Button variant="outline" size="sm" onClick={fetchBranches}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredBranches.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No branches found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || selectedStatus !== 'all' || selectedLocation !== 'all'
                    ? 'Try adjusting your filters' 
                    : 'Create your first branch to get started'}
                </p>
                {!searchTerm && selectedStatus === 'all' && selectedLocation === 'all' && (
                  <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Branch
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Branch Info</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Manager</TableHead>
                      <TableHead>Statistics</TableHead>
                      <TableHead>Financial</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBranches.map((branch) => (
                      <TableRow key={branch.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{branch.name}</div>
                            <div className="text-sm text-gray-500">Code: {branch.code}</div>
                            {branch.opening_date && (
                              <div className="text-xs text-gray-400">
                                Opened: {formatDate(branch.opening_date)}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <div>
                              <div className="font-medium">{branch.location}</div>
                              {branch.city && (
                                <div className="text-sm text-gray-500">{branch.city}</div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            {branch.manager_name ? (
                              <>
                                <div className="font-medium">{branch.manager_name}</div>
                                {branch.phone && (
                                  <div className="text-sm text-gray-500">{branch.phone}</div>
                                )}
                              </>
                            ) : (
                              <span className="text-gray-400">Not assigned</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Users className="h-3 w-3 text-blue-500" />
                              <span>{branch.students_count || 0} students</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Building2 className="h-3 w-3 text-green-500" />
                              <span>{branch.staff_count || 0} staff</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-3 w-3 text-purple-500" />
                              <span>{branch.batches_count || 0} batches</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm">
                              <span className="text-green-600 font-medium">
                                {formatCurrency(branch.total_income || 0)}
                              </span>
                              <span className="text-gray-500"> income</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-red-600 font-medium">
                                {formatCurrency(branch.total_expenses || 0)}
                              </span>
                              <span className="text-gray-500"> expenses</span>
                            </div>
                            <div className="text-sm">
                              <span className={`font-medium ${
                                (branch.profit_loss || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {formatCurrency(branch.profit_loss || 0)}
                              </span>
                              <span className="text-gray-500"> P/L</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            branch.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }>
                            {branch.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewBranch(branch)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditBranch(branch)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteBranch(branch.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Create Branch Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Create New Branch</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCreateModal(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleCreateBranch} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Branch Name *
                  </label>
                  <Input
                    placeholder="Enter branch name"
                    value={createFormData.name}
                    onChange={(e) => handleCreateInputChange('name', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Branch Code *
                  </label>
                  <Input
                    placeholder="Enter branch code (e.g., DHA-001)"
                    value={createFormData.code}
                    onChange={(e) => handleCreateInputChange('code', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <Input
                    placeholder="Enter location (e.g., Dhaka, Mymensingh)"
                    value={createFormData.location}
                    onChange={(e) => handleCreateInputChange('location', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Opening Date
                  </label>
                  <Input
                    type="date"
                    value={createFormData.opening_date}
                    onChange={(e) => handleCreateInputChange('opening_date', e.target.value)}
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <Input
                    placeholder="Enter phone number"
                    value={createFormData.phone}
                    onChange={(e) => handleCreateInputChange('phone', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="Enter email address"
                    value={createFormData.email}
                    onChange={(e) => handleCreateInputChange('email', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Manager Name
                  </label>
                  <Input
                    placeholder="Enter manager name"
                    value={createFormData.manager_name}
                    onChange={(e) => handleCreateInputChange('manager_name', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Manager Phone
                  </label>
                  <Input
                    placeholder="Enter manager phone"
                    value={createFormData.manager_phone}
                    onChange={(e) => handleCreateInputChange('manager_phone', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <Textarea
                  placeholder="Enter full address"
                  value={createFormData.address}
                  onChange={(e) => handleCreateInputChange('address', e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <Input
                  placeholder="Enter city"
                  value={createFormData.city}
                  onChange={(e) => handleCreateInputChange('city', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State/Province
                </label>
                <Input
                  placeholder="Enter state/province"
                  value={createFormData.state}
                  onChange={(e) => handleCreateInputChange('state', e.target.value)}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateModal(false)}
                disabled={createLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {createLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Branch
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
