import React, { useState, useEffect } from 'react';
import { useLocation } from "wouter";
import { apiService } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import Sidebar from '@/components/layout/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, MessageSquare, Mail, Send, Users, Calendar, 
  BookOpen, AlertTriangle, CheckCircle, Clock, Filter,
  RefreshCw, Loader2, Phone, Smartphone
} from 'lucide-react';

interface NotificationHistory {
  id: string;
  recipient_id: string;
  type: string;
  message: string;
  channel: string;
  status: string;
  sent_at: string;
  read_at?: string;
}

export default function NotificationsAutomation() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // State for different notification types
  const [activeTab, setActiveTab] = useState('payment-reminder');
  const [loading, setLoading] = useState(false);
  
  // Common state
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedBatch, setSelectedBatch] = useState('all');
  const [branches, setBranches] = useState([]);
  const [batches, setBatches] = useState([]);
  
  // Payment Reminder State
  const [paymentReminderData, setPaymentReminderData] = useState({
    student_id: '',
    batch_id: 'all',
    branch_id: 'all'
  });
  
  // Class Reminder State
  const [classReminderData, setClassReminderData] = useState({
    batch_id: 'all',
    class_date: '',
    reminder_type: 'both'
  });
  
  // Exam Notice State
  const [examNoticeData, setExamNoticeData] = useState({
    batch_id: 'all',
    exam_date: '',
    exam_subject: '',
    exam_time: '',
    exam_venue: '',
    notice_type: 'both'
  });
  
  // Batch Announcement State
  const [batchAnnouncementData, setBatchAnnouncementData] = useState({
    batch_id: 'all',
    announcement_type: 'both'
  });
  
  // Notification History State
  const [notificationHistory, setNotificationHistory] = useState<NotificationHistory[]>([]);
  
  // Fetch branches and batches for filtering
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [branchesResponse, batchesResponse] = await Promise.all([
          apiService.getBranches(),
          apiService.customRequest('GET', '/batches-public')
        ]);
        
        if (branchesResponse && branchesResponse.success && branchesResponse.data) {
          setBranches(branchesResponse.data.data || branchesResponse.data || []);
        }
        
        if (batchesResponse && batchesResponse.success && batchesResponse.data) {
          setBatches(batchesResponse.data.data || batchesResponse.data || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    fetchData();
  }, []);

  // Send Payment Due Reminder
  const sendPaymentReminder = async () => {
    setLoading(true);
    try {
      const response = await apiService.customRequest('POST', '/notifications/payment-reminder', {
        student_id: paymentReminderData.student_id || undefined,
        batch_id: paymentReminderData.batch_id !== 'all' ? paymentReminderData.batch_id : undefined,
        branch_id: paymentReminderData.branch_id !== 'all' ? paymentReminderData.branch_id : undefined
      });
      
      if (response && response.success) {
        toast({
          title: "Success",
          description: `Payment reminders sent to ${response.data.sent_count} students!`,
        });
        // Reset form
        setPaymentReminderData({
          student_id: '',
          batch_id: 'all',
          branch_id: 'all'
        });
      }
    } catch (error) {
      console.error('Error sending payment reminders:', error);
      toast({
        title: "Error",
        description: "Failed to send payment reminders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Send Class Reminder
  const sendClassReminder = async () => {
    setLoading(true);
    try {
      const response = await apiService.customRequest('POST', '/notifications/class-reminder', {
        batch_id: classReminderData.batch_id !== 'all' ? classReminderData.batch_id : undefined,
        class_date: classReminderData.class_date,
        reminder_type: classReminderData.reminder_type
      });
      
      if (response && response.success) {
        toast({
          title: "Success",
          description: `Class reminders sent to ${response.data.sent_count} students!`,
        });
        // Reset form
        setClassReminderData({
          batch_id: 'all',
          class_date: '',
          reminder_type: 'both'
        });
      }
    } catch (error) {
      console.error('Error sending class reminders:', error);
      toast({
        title: "Error",
        description: "Failed to send class reminders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Send Exam Notice
  const sendExamNotice = async () => {
    setLoading(true);
    try {
      const response = await apiService.customRequest('POST', '/notifications/exam-notice', {
        batch_id: examNoticeData.batch_id !== 'all' ? examNoticeData.batch_id : undefined,
        exam_date: examNoticeData.exam_date,
        exam_subject: examNoticeData.exam_subject,
        exam_time: examNoticeData.exam_time,
        exam_venue: examNoticeData.exam_venue,
        notice_type: examNoticeData.notice_type
      });
      
      if (response && response.success) {
        toast({
          title: "Success",
          description: `Exam notices sent to ${response.data.sent_count} students!`,
        });
        // Reset form
        setExamNoticeData({
          batch_id: 'all',
          exam_date: '',
          exam_subject: '',
          exam_time: '',
          exam_venue: '',
          notice_type: 'both'
        });
      }
    } catch (error) {
      console.error('Error sending exam notices:', error);
      toast({
        title: "Error",
        description: "Failed to send exam notices",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Send Batch Starting Announcement
  const sendBatchAnnouncement = async () => {
    setLoading(true);
    try {
      const response = await apiService.customRequest('POST', '/notifications/batch-announcement', {
        batch_id: batchAnnouncementData.batch_id !== 'all' ? batchAnnouncementData.batch_id : undefined,
        announcement_type: batchAnnouncementData.announcement_type
      });
      
      if (response && response.success) {
        toast({
          title: "Success",
          description: `Batch announcements sent to ${response.data.sent_count} students!`,
        });
        // Reset form
        setBatchAnnouncementData({
          batch_id: 'all',
          announcement_type: 'both'
        });
      }
    } catch (error) {
      console.error('Error sending batch announcements:', error);
      toast({
        title: "Error",
        description: "Failed to send batch announcements",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch Notification History
  const fetchNotificationHistory = async () => {
    try {
      const response = await apiService.customRequest('GET', '/notifications/history');
      if (response && response.success && response.data) {
        setNotificationHistory(response.data.data || response.data || []);
      }
    } catch (error) {
      console.error('Error fetching notification history:', error);
    }
  };

  useEffect(() => {
    fetchNotificationHistory();
  }, []);

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const badges = {
      sent: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Notifications & Automation</h1>
              <p className="text-sm text-gray-600">Send automated SMS/Email notifications to students</p>
            </div>
            <Button 
              onClick={fetchNotificationHistory}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh History
            </Button>
          </div>
        </div>

        {/* Notification Types Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="payment-reminder" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Payment Reminders
            </TabsTrigger>
            <TabsTrigger value="class-reminder" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Class Reminders
            </TabsTrigger>
            <TabsTrigger value="exam-notice" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Exam Notices
            </TabsTrigger>
            <TabsTrigger value="batch-announcement" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Batch Announcements
            </TabsTrigger>
          </TabsList>

          {/* Payment Reminder Tab */}
          <TabsContent value="payment-reminder" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Send Payment Due Reminders
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Branch</label>
                    <Select 
                      value={paymentReminderData.branch_id} 
                      onValueChange={(value) => setPaymentReminderData(prev => ({ ...prev, branch_id: value }))}
                    >
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Batch</label>
                    <Select 
                      value={paymentReminderData.batch_id} 
                      onValueChange={(value) => setPaymentReminderData(prev => ({ ...prev, batch_id: value }))}
                    >
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
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Student ID (Optional)</label>
                    <Input
                      placeholder="Specific student ID"
                      value={paymentReminderData.student_id}
                      onChange={(e) => setPaymentReminderData(prev => ({ ...prev, student_id: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> This will send payment due reminders to all students with outstanding dues 
                    based on the selected filters. Leave all fields empty to send to all students with dues.
                  </p>
                </div>
                
                <Button 
                  onClick={sendPaymentReminder}
                  disabled={loading}
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Payment Reminders
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Class Reminder Tab */}
          <TabsContent value="class-reminder" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Send Class Reminders
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Batch</label>
                    <Select 
                      value={classReminderData.batch_id} 
                      onValueChange={(value) => setClassReminderData(prev => ({ ...prev, batch_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select batch" />
                      </SelectTrigger>
                      <SelectContent>
                        {batches.map((batch: any) => (
                          <SelectItem key={batch.id} value={batch.id}>
                            {batch.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Class Date</label>
                    <Input
                      type="date"
                      value={classReminderData.class_date}
                      onChange={(e) => setClassReminderData(prev => ({ ...prev, class_date: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Reminder Type</label>
                    <Select 
                      value={classReminderData.reminder_type} 
                      onValueChange={(value) => setClassReminderData(prev => ({ ...prev, reminder_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sms">SMS Only</SelectItem>
                        <SelectItem value="email">Email Only</SelectItem>
                        <SelectItem value="both">SMS & Email</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Button 
                  onClick={sendClassReminder}
                  disabled={loading || !classReminderData.batch_id || !classReminderData.class_date}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Class Reminders
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Exam Notice Tab */}
          <TabsContent value="exam-notice" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Send Exam Notices
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Batch</label>
                    <Select 
                      value={examNoticeData.batch_id} 
                      onValueChange={(value) => setExamNoticeData(prev => ({ ...prev, batch_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select batch" />
                      </SelectTrigger>
                      <SelectContent>
                        {batches.map((batch: any) => (
                          <SelectItem key={batch.id} value={batch.id}>
                            {batch.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notice Type</label>
                    <Select 
                      value={examNoticeData.notice_type} 
                      onValueChange={(value) => setExamNoticeData(prev => ({ ...prev, notice_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sms">SMS Only</SelectItem>
                        <SelectItem value="email">Email Only</SelectItem>
                        <SelectItem value="both">SMS & Email</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Exam Date</label>
                    <Input
                      type="date"
                      value={examNoticeData.exam_date}
                      onChange={(e) => setExamNoticeData(prev => ({ ...prev, exam_date: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Exam Time</label>
                    <Input
                      type="time"
                      value={examNoticeData.exam_time}
                      onChange={(e) => setExamNoticeData(prev => ({ ...prev, exam_time: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                    <Input
                      placeholder="e.g., Mathematics, Physics"
                      value={examNoticeData.exam_subject}
                      onChange={(e) => setExamNoticeData(prev => ({ ...prev, exam_subject: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Venue</label>
                    <Input
                      placeholder="e.g., Room 101, Main Hall"
                      value={examNoticeData.exam_venue}
                      onChange={(e) => setExamNoticeData(prev => ({ ...prev, exam_venue: e.target.value }))}
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={sendExamNotice}
                  disabled={loading || !examNoticeData.batch_id || !examNoticeData.exam_date || !examNoticeData.exam_subject || !examNoticeData.exam_time || !examNoticeData.exam_venue}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Exam Notices
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Batch Announcement Tab */}
          <TabsContent value="batch-announcement" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Send Batch Starting Announcements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Batch</label>
                    <Select 
                      value={batchAnnouncementData.batch_id} 
                      onValueChange={(value) => setBatchAnnouncementData(prev => ({ ...prev, batch_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select batch" />
                      </SelectTrigger>
                      <SelectContent>
                        {batches.map((batch: any) => (
                          <SelectItem key={batch.id} value={batch.id}>
                            {batch.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Announcement Type</label>
                    <Select 
                      value={batchAnnouncementData.announcement_type} 
                      onValueChange={(value) => setBatchAnnouncementData(prev => ({ ...prev, announcement_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sms">SMS Only</SelectItem>
                        <SelectItem value="email">Email Only</SelectItem>
                        <SelectItem value="both">SMS & Email</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Note:</strong> This will send welcome announcements to all students enrolled in the selected batch, 
                    including batch details, start date, faculty information, and venue details.
                  </p>
                </div>
                
                <Button 
                  onClick={sendBatchAnnouncement}
                  disabled={loading || !batchAnnouncementData.batch_id}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Batch Announcements
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Notification History */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Notification History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent At</TableHead>
                    <TableHead>Read At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notificationHistory.map((notification) => (
                    <TableRow key={notification.id}>
                      <TableCell>
                        <Badge variant="outline">
                          {notification.type.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {notification.channel === 'sms' && <Smartphone className="h-4 w-4 text-blue-600" />}
                          {notification.channel === 'email' && <Mail className="h-4 w-4 text-green-600" />}
                          {notification.channel === 'both' && (
                            <>
                              <Smartphone className="h-4 w-4 text-blue-600" />
                              <Mail className="h-4 w-4 text-green-600" />
                            </>
                          )}
                          <span className="capitalize">{notification.channel}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(notification.status)}>
                          {notification.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(notification.sent_at)}</TableCell>
                      <TableCell>
                        {notification.read_at ? (
                          <span className="text-green-600">{formatDate(notification.read_at)}</span>
                        ) : (
                          <span className="text-gray-400">Not read</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {notificationHistory.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Bell className="h-16 w-16 mx-auto mb-4" />
                  <p>No notifications sent yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
