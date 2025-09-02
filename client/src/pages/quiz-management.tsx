"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import TopNav from "@/components/layout/topnav";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  BookOpen, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  Users, 
  Trophy, 
  BarChart3,
  Edit,
  Trash2,
  Eye,
  Play,
  Download,
  Calendar,
  Star,
  Target,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { apiService } from "@/lib/api";

interface Quiz {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  time_limit: number;
  passing_score: number;
  total_questions: number;
  is_active: boolean;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
  created_by: {
    id: string;
    name: string;
    role: string;
  };
  attempts_count: number;
  average_score: number;
}

interface Question {
  id: string;
  quiz_id?: string;
  question_text: string;
  question_type: 'mcq' | 'multiple_answer' | 'true_false' | 'multiple_true_false' | 'fill_blanks' | 'matching' | 'descriptive';
  options?: string[];
  correct_answer?: string | string[];
  points: number;
  order: number;
  explanation?: string;
  is_required: boolean;
  question_type_label?: string;
  sub_statements?: Array<{
    text: string;
    is_true: boolean;
    points: number;
  }>;
}

export default function QuizManagement() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState("quizzes");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  
  // Question management states
  const [isCreateQuestionDialogOpen, setIsCreateQuestionDialogOpen] = useState(false);
  const [isEditQuestionDialogOpen, setIsEditQuestionDialogOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [questionSearchTerm, setQuestionSearchTerm] = useState("");
  const [selectedQuestionType, setSelectedQuestionType] = useState("all");
  
  const [quizForm, setQuizForm] = useState({
    title: "",
    description: "",
    category: "",
    difficulty: "medium" as const,
    time_limit: 30,
    passing_score: 70,
    start_date: "",
    end_date: "",
    is_active: true
  });

  const [questionForm, setQuestionForm] = useState({
    question_text: "",
    question_type: "mcq" as const,
    options: ["Option 1"],
    correct_answer: "Option 1",
    points: 1,
    order: 1,
    explanation: "",
    is_required: true,
    // MTF specific fields
    sub_statements: [
      { text: "Sub-statement 1", is_true: true, points: 1 }
    ]
  });

  const isAdminOrManager = user?.role === 'admin' || user?.role === 'manager';
  const isStudent = user?.role === 'student';

  const { data: quizzesResponse, isLoading: quizzesLoading } = useQuery({
    queryKey: ["/api/quizzes", { search: searchTerm, category: selectedCategory, difficulty: selectedDifficulty }],
    enabled: isAuthenticated,
    queryFn: () => apiService.getQuizzes({ 
      search: searchTerm || undefined, 
      category: selectedCategory === "all" ? undefined : selectedCategory,
      difficulty: selectedDifficulty === "all" ? undefined : selectedDifficulty
    }),
  });

  const quizzes = quizzesResponse?.data?.data || [];
  const totalQuizzes = quizzesResponse?.data?.total || 0;

  // Questions query
  const { data: questionsResponse, isLoading: questionsLoading } = useQuery({
    queryKey: ["/api/questions", { search: questionSearchTerm, type: selectedQuestionType }],
    enabled: isAuthenticated && isAdminOrManager,
    queryFn: () => apiService.getQuestions({ 
      search: questionSearchTerm || undefined, 
      type: selectedQuestionType === "all" ? undefined : selectedQuestionType
    }),
  });

  const questions = questionsResponse?.data?.data || [];

  const createQuizMutation = useMutation({
    mutationFn: (quizData: any) => apiService.createQuiz(quizData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quizzes"] });
      setIsCreateDialogOpen(false);
      toast({ title: "Success", description: "Quiz created successfully!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create quiz", variant: "destructive" });
    },
  });

  const handleCreateQuiz = () => {
    createQuizMutation.mutate(quizForm);
  };

  // Question mutations
  const createQuestionMutation = useMutation({
    mutationFn: (questionData: any) => apiService.createQuestion(questionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/questions"] });
      setIsCreateQuestionDialogOpen(false);
      setQuestionForm({
        question_text: "",
        question_type: "mcq",
        options: ["Option 1"],
        correct_answer: "Option 1",
        points: 1,
        order: 1,
        explanation: "",
        is_required: true,
        sub_statements: [
          { text: "Sub-statement 1", is_true: true, points: 1 }
        ]
      });
      toast({ title: "Success", description: "Question created successfully!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create question", variant: "destructive" });
    },
  });

  const updateQuestionMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiService.updateQuestion(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/questions"] });
      setIsEditQuestionDialogOpen(false);
      setSelectedQuestion(null);
      toast({ title: "Success", description: "Question updated successfully!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update question", variant: "destructive" });
    },
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: (id: string) => apiService.deleteQuestion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/questions"] });
      toast({ title: "Success", description: "Question deleted successfully!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete question", variant: "destructive" });
    },
  });

  const getDifficultyBadge = (difficulty: string) => {
    const variants = {
      easy: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      hard: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    };
    return <Badge className={variants[difficulty as keyof typeof variants]}>{difficulty}</Badge>;
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Active</Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300">Inactive</Badge>
    );
  };

  // Question handlers
  const handleCreateQuestion = () => {
    createQuestionMutation.mutate(questionForm);
  };

  const handleEditQuestion = (question: Question) => {
    setSelectedQuestion(question);
    setQuestionForm({
      question_text: question.question_text,
      question_type: question.question_type,
      options: question.options || [""],
      correct_answer: Array.isArray(question.correct_answer) ? question.correct_answer[0] : question.correct_answer || "",
      points: question.points,
      order: question.order,
      explanation: question.explanation || "",
      is_required: question.is_required,
      sub_statements: question.sub_statements || [
        { text: "Sub-statement 1", is_true: true, points: 1 }
      ]
    });
    setIsEditQuestionDialogOpen(true);
  };

  const handleDeleteQuestion = (question: Question) => {
    if (confirm(`Are you sure you want to delete this question?`)) {
      deleteQuestionMutation.mutate(question.id);
    }
  };

  const addOption = () => {
    setQuestionForm(prev => ({
      ...prev,
      options: [...prev.options, `Option ${prev.options.length + 1}`]
    }));
  };

  const removeOption = (index: number) => {
    setQuestionForm(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const updateOption = (index: number, value: string) => {
    // Don't allow empty strings for options
    if (value.trim() === '') return;
    
    setQuestionForm(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }));
  };

  // MTF (Multiple True/False) handlers
  const addSubStatement = () => {
    setQuestionForm(prev => ({
      ...prev,
      sub_statements: [...prev.sub_statements, { 
        text: `Sub-statement ${prev.sub_statements.length + 1}`, 
        is_true: true, 
        points: 1 
      }]
    }));
  };

  const removeSubStatement = (index: number) => {
    setQuestionForm(prev => ({
      ...prev,
      sub_statements: prev.sub_statements.filter((_, i) => i !== index)
    }));
  };

  const updateSubStatement = (index: number, field: 'text' | 'is_true' | 'points', value: string | boolean | number) => {
    setQuestionForm(prev => ({
      ...prev,
      sub_statements: prev.sub_statements.map((stmt, i) => 
        i === index ? { ...stmt, [field]: value } : stmt
      )
    }));
  };

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <TopNav />
      <div className="flex pt-16">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Quiz Management System</h1>
                <p className="text-sm text-gray-600">
                  {isStudent ? "Browse and attempt quizzes" : "Create, manage, and monitor quizzes"}
                </p>
              </div>
              <div className="flex gap-3">
                {isAdminOrManager && (
                  <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Quiz
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Quizzes</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalQuizzes}</div>
                <p className="text-xs text-muted-foreground">Available quizzes</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Quizzes</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{quizzes.filter((q: Quiz) => q.is_active).length}</div>
                <p className="text-xs text-muted-foreground">Currently active</p>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
              {isAdminOrManager && <TabsTrigger value="questions">Questions</TabsTrigger>}
              {isAdminOrManager && <TabsTrigger value="reports">Reports</TabsTrigger>}
            </TabsList>

            <TabsContent value="quizzes" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filters
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="search">Search</Label>
                      <Input
                        id="search"
                        placeholder="Search quizzes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="All categories" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All categories</SelectItem>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="mathematics">Mathematics</SelectItem>
                          <SelectItem value="science">Science</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="difficulty">Difficulty</Label>
                      <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                        <SelectTrigger>
                          <SelectValue placeholder="All difficulties" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All difficulties</SelectItem>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button 
                        onClick={() => {
                          setSearchTerm("");
                          setSelectedCategory("all");
                          setSelectedDifficulty("all");
                        }}
                        variant="outline"
                        className="w-full"
                      >
                        Clear Filters
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {quizzesLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">Loading quizzes...</p>
                </div>
              ) : quizzes.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No quizzes found</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {quizzes.map((quiz: Quiz) => (
                    <Card key={quiz.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg mb-2">{quiz.title}</CardTitle>
                            <p className="text-sm text-gray-600 line-clamp-2">{quiz.description}</p>
                          </div>
                          <div className="flex gap-1">
                            {getDifficultyBadge(quiz.difficulty)}
                            {getStatusBadge(quiz.is_active)}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Category:</span>
                            <span className="font-medium">{quiz.category}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Time Limit:</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {quiz.time_limit} min
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Questions:</span>
                            <span className="font-medium">{quiz.total_questions}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Passing Score:</span>
                            <span className="font-medium">{quiz.passing_score}%</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 mt-4">
                          {isStudent ? (
                            <Button 
                              onClick={() => {}} 
                              className="flex-1"
                              disabled={!quiz.is_active}
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Start Quiz
                            </Button>
                          ) : (
                            <>
                              <Button 
                                onClick={() => {}} 
                                variant="outline" 
                                className="flex-1"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </Button>
                              <Button 
                                onClick={() => {}} 
                                variant="outline" 
                                size="sm"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                onClick={() => {}} 
                                variant="outline" 
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {isAdminOrManager && (
              <TabsContent value="questions" className="space-y-6">
                {/* Questions Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Question Management</h2>
                    <p className="text-sm text-gray-600">Create and manage questions for quizzes</p>
                  </div>
                  <Button onClick={() => setIsCreateQuestionDialogOpen(true)} className="bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Question
                  </Button>
                </div>

                {/* Question Filters */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      Question Filters
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="question-search">Search Questions</Label>
                        <Input
                          id="question-search"
                          placeholder="Search questions..."
                          value={questionSearchTerm}
                          onChange={(e) => setQuestionSearchTerm(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="question-type">Question Type</Label>
                        <Select value={selectedQuestionType} onValueChange={setSelectedQuestionType}>
                          <SelectTrigger>
                            <SelectValue placeholder="All types" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All types</SelectItem>
                            <SelectItem value="mcq">Multiple Choice</SelectItem>
                            <SelectItem value="multiple_answer">Multiple Answer</SelectItem>
                            <SelectItem value="true_false">True/False</SelectItem>
                            <SelectItem value="fill_blanks">Fill in Blanks</SelectItem>
                            <SelectItem value="matching">Matching</SelectItem>
                            <SelectItem value="descriptive">Descriptive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-end">
                        <Button 
                          onClick={() => {
                            setQuestionSearchTerm("");
                            setSelectedQuestionType("all");
                          }}
                          variant="outline"
                          className="w-full"
                        >
                          Clear Filters
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Questions List */}
                {questionsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-600">Loading questions...</p>
                  </div>
                ) : questions.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No questions found</p>
                      <p className="text-sm text-gray-500 mt-1">Create your first question to get started</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {questions.map((question: Question) => (
                      <Card key={question.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline">{question.question_type_label}</Badge>
                                <Badge variant="secondary">{question.points} pts</Badge>
                              </div>
                              <p className="text-sm text-gray-600 line-clamp-2">{question.question_text}</p>
                            </div>
                            <div className="flex gap-1">
                              <Button 
                                onClick={() => handleEditQuestion(question)} 
                                variant="outline" 
                                size="sm"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                onClick={() => handleDeleteQuestion(question)} 
                                variant="outline" 
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="text-xs text-gray-500">
                            ID: {question.id} • Order: {question.order} • Required: {question.is_required ? 'Yes' : 'No'}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            )}

            {isAdminOrManager && (
              <TabsContent value="reports" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Quiz Performance Reports</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{totalQuizzes}</div>
                        <div className="text-sm text-blue-600">Total Quizzes</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{questions.length}</div>
                        <div className="text-sm text-green-600">Total Questions</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">0</div>
                        <div className="text-sm text-purple-600">Total Attempts</div>
                      </div>
                    </div>
                    <div className="text-center py-8">
                      <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Detailed reports coming soon</p>
                      <p className="text-sm text-gray-500 mt-1">Advanced analytics and performance metrics will be available here</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </main>
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Quiz</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Quiz Title</Label>
              <Input
                id="title"
                value={quizForm.title}
                onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                placeholder="Enter quiz title"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={quizForm.description}
                onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
                placeholder="Enter quiz description"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={quizForm.category} onValueChange={(value) => setQuizForm({ ...quizForm, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="mathematics">Mathematics</SelectItem>
                    <SelectItem value="science">Science</SelectItem>
                    <SelectItem value="language">Language</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select value={quizForm.difficulty} onValueChange={(value: any) => setQuizForm({ ...quizForm, difficulty: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="time_limit">Time Limit (minutes)</Label>
                <Input
                  id="time_limit"
                  type="number"
                  value={quizForm.time_limit}
                  onChange={(e) => setQuizForm({ ...quizForm, time_limit: parseInt(e.target.value) })}
                  min="1"
                  max="300"
                />
              </div>
              <div>
                <Label htmlFor="passing_score">Passing Score (%)</Label>
                <Input
                  id="passing_score"
                  type="number"
                  value={quizForm.passing_score}
                  onChange={(e) => setQuizForm({ ...quizForm, passing_score: parseInt(e.target.value) })}
                  min="0"
                  max="100"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                id="is_active"
                type="checkbox"
                checked={quizForm.is_active}
                onChange={(e) => setQuizForm({ ...quizForm, is_active: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="is_active">Active Quiz</Label>
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleCreateQuiz} className="flex-1" disabled={createQuizMutation.isPending}>
                {createQuizMutation.isPending ? "Creating..." : "Create Quiz"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsCreateDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Question Dialog */}
      <Dialog open={isCreateQuestionDialogOpen} onOpenChange={setIsCreateQuestionDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Create New Question</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="question-text">Question Text</Label>
              <Textarea
                id="question-text"
                value={questionForm.question_text}
                onChange={(e) => setQuestionForm({ ...questionForm, question_text: e.target.value })}
                placeholder="Enter your question here..."
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="question-type">Question Type</Label>
                <Select value={questionForm.question_type} onValueChange={(value: any) => {
                  // Reset correct answer when question type changes
                  let newCorrectAnswer = questionForm.correct_answer;
                  if (value === 'mcq' && !questionForm.options.includes(questionForm.correct_answer)) {
                    newCorrectAnswer = questionForm.options[0] || '';
                  }
                  
                  // Initialize sub_statements for MTF questions
                  let newSubStatements = questionForm.sub_statements;
                  if (value === 'multiple_true_false' && (!newSubStatements || newSubStatements.length === 0)) {
                    newSubStatements = [
                      { text: "Sub-statement 1", is_true: true, points: 1 }
                    ];
                  }
                  
                  setQuestionForm({ 
                    ...questionForm, 
                    question_type: value, 
                    correct_answer: newCorrectAnswer,
                    sub_statements: newSubStatements
                  });
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mcq">Multiple Choice</SelectItem>
                    <SelectItem value="multiple_answer">Multiple Answer</SelectItem>
                    <SelectItem value="true_false">True/False</SelectItem>
                    <SelectItem value="multiple_true_false">Multiple True/False</SelectItem>
                    <SelectItem value="fill_blanks">Fill in Blanks</SelectItem>
                    <SelectItem value="matching">Matching</SelectItem>
                    <SelectItem value="descriptive">Descriptive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="points">Points</Label>
                <Input
                  id="points"
                  type="number"
                  value={questionForm.points}
                  onChange={(e) => setQuestionForm({ ...questionForm, points: parseInt(e.target.value) })}
                  min="1"
                  max="100"
                />
              </div>
            </div>

            {/* Options for MCQ and Multiple Answer */}
            {(questionForm.question_type === 'mcq' || questionForm.question_type === 'multiple_answer') && (
              <div>
                <Label>Options</Label>
                <div className="space-y-2">
                  {questionForm.options.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                      />
                      {questionForm.options.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeOption(index)}
                          className="text-red-600"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={addOption} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Option
                  </Button>
                </div>
              </div>
            )}

            {/* Sub-statements for Multiple True/False */}
            {questionForm.question_type === 'multiple_true_false' && (
              <div>
                <Label>Sub-statements (True/False)</Label>
                <div className="space-y-3">
                  {questionForm.sub_statements.map((statement, index) => (
                    <div key={index} className="border rounded-lg p-3 bg-gray-50">
                      <div className="flex gap-2 mb-2">
                        <Input
                          value={statement.text}
                          onChange={(e) => updateSubStatement(index, 'text', e.target.value)}
                          placeholder={`Sub-statement ${index + 1}`}
                          className="flex-1"
                        />
                        <Select 
                          value={statement.is_true.toString()} 
                          onValueChange={(value) => updateSubStatement(index, 'is_true', value === 'true')}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">True</SelectItem>
                            <SelectItem value="false">False</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          value={statement.points}
                          onChange={(e) => updateSubStatement(index, 'points', parseInt(e.target.value) || 1)}
                          min="1"
                          max="10"
                          className="w-20"
                          placeholder="Pts"
                        />
                        {questionForm.sub_statements.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeSubStatement(index)}
                            className="text-red-600"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        Correct Answer: {statement.is_true ? 'True' : 'False'} • Points: {statement.points}
                      </div>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={addSubStatement} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Sub-statement
                  </Button>
                </div>
              </div>
            )}

            {/* Correct Answer */}
            {questionForm.question_type !== 'multiple_true_false' && (
              <div>
                <Label htmlFor="correct-answer">Correct Answer</Label>
                {questionForm.question_type === 'mcq' ? (
                  <Select value={questionForm.correct_answer} onValueChange={(value) => setQuestionForm({ ...questionForm, correct_answer: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select correct answer" />
                    </SelectTrigger>
                    <SelectContent>
                      {questionForm.options
                        .filter(option => option.trim() !== '')
                        .map((option, index) => (
                          <SelectItem key={index} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                ) : questionForm.question_type === 'true_false' ? (
                  <Select value={questionForm.correct_answer} onValueChange={(value) => setQuestionForm({ ...questionForm, correct_answer: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select correct answer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">True</SelectItem>
                      <SelectItem value="false">False</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="correct-answer"
                    value={questionForm.correct_answer}
                    onChange={(e) => setQuestionForm({ ...questionForm, correct_answer: e.target.value })}
                    placeholder="Enter correct answer..."
                  />
                )}
              </div>
            )}

            {/* MTF Summary */}
            {questionForm.question_type === 'multiple_true_false' && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <Label className="text-blue-800 font-medium">Multiple True/False Summary</Label>
                <div className="mt-2 space-y-1">
                  <div className="text-sm text-blue-700">
                    Total Sub-statements: {questionForm.sub_statements.length}
                  </div>
                  <div className="text-sm text-blue-700">
                    Total Points: {questionForm.sub_statements.reduce((sum, stmt) => sum + stmt.points, 0)}
                  </div>
                  <div className="text-sm text-blue-700">
                    True Statements: {questionForm.sub_statements.filter(stmt => stmt.is_true).length}
                  </div>
                  <div className="text-sm text-blue-700">
                    False Statements: {questionForm.sub_statements.filter(stmt => !stmt.is_true).length}
                  </div>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="explanation">Explanation (Optional)</Label>
              <Textarea
                id="explanation"
                value={questionForm.explanation}
                onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                placeholder="Explain why this answer is correct..."
                rows={2}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                id="is_required"
                type="checkbox"
                checked={questionForm.is_required}
                onChange={(e) => setQuestionForm({ ...questionForm, is_required: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="is_required">Required Question</Label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleCreateQuestion} className="flex-1" disabled={createQuestionMutation.isPending}>
                {createQuestionMutation.isPending ? "Creating..." : "Create Question"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsCreateQuestionDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Question Dialog */}
      <Dialog open={isEditQuestionDialogOpen} onOpenChange={setIsEditQuestionDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-question-text">Question Text</Label>
              <Textarea
                id="edit-question-text"
                value={questionForm.question_text}
                onChange={(e) => setQuestionForm({ ...questionForm, question_text: e.target.value })}
                placeholder="Enter your question here..."
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-question-type">Question Type</Label>
                <Select value={questionForm.question_type} onValueChange={(value: any) => {
                  // Reset correct answer when question type changes
                  let newCorrectAnswer = questionForm.correct_answer;
                  if (value === 'mcq' && !questionForm.options.includes(questionForm.correct_answer)) {
                    newCorrectAnswer = questionForm.options[0] || '';
                  }
                  
                  // Initialize sub_statements for MTF questions
                  let newSubStatements = questionForm.sub_statements;
                  if (value === 'multiple_true_false' && (!newSubStatements || newSubStatements.length === 0)) {
                    newSubStatements = [
                      { text: "Sub-statement 1", is_true: true, points: 1 }
                    ];
                  }
                  
                  setQuestionForm({ 
                    ...questionForm, 
                    question_type: value, 
                    correct_answer: newCorrectAnswer,
                    sub_statements: newSubStatements
                  });
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mcq">Multiple Choice</SelectItem>
                    <SelectItem value="multiple_answer">Multiple Answer</SelectItem>
                    <SelectItem value="true_false">True/False</SelectItem>
                    <SelectItem value="multiple_true_false">Multiple True/False</SelectItem>
                    <SelectItem value="fill_blanks">Fill in Blanks</SelectItem>
                    <SelectItem value="matching">Matching</SelectItem>
                    <SelectItem value="descriptive">Descriptive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-points">Points</Label>
                <Input
                  id="edit-points"
                  type="number"
                  value={questionForm.points}
                  onChange={(e) => setQuestionForm({ ...questionForm, points: parseInt(e.target.value) })}
                  min="1"
                  max="100"
                />
              </div>
            </div>

            {/* Options for MCQ and Multiple Answer */}
            {(questionForm.question_type === 'mcq' || questionForm.question_type === 'multiple_answer') && (
              <div>
                <Label>Options</Label>
                <div className="space-y-2">
                  {questionForm.options.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                      />
                      {questionForm.options.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeOption(index)}
                          className="text-red-600"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={addOption} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Option
                  </Button>
                </div>
              </div>
            )}

            {/* Sub-statements for Multiple True/False */}
            {questionForm.question_type === 'multiple_true_false' && (
              <div>
                <Label>Sub-statements (True/False)</Label>
                <div className="space-y-3">
                  {questionForm.sub_statements.map((statement, index) => (
                    <div key={index} className="border rounded-lg p-3 bg-gray-50">
                      <div className="flex gap-2 mb-2">
                        <Input
                          value={statement.text}
                          onChange={(e) => updateSubStatement(index, 'text', e.target.value)}
                          placeholder={`Sub-statement ${index + 1}`}
                          className="flex-1"
                        />
                        <Select 
                          value={statement.is_true.toString()} 
                          onValueChange={(value) => updateSubStatement(index, 'is_true', value === 'true')}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">True</SelectItem>
                            <SelectItem value="false">False</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          value={statement.points}
                          onChange={(e) => updateSubStatement(index, 'points', parseInt(e.target.value) || 1)}
                          min="1"
                          max="10"
                          className="w-20"
                          placeholder="Pts"
                        />
                        {questionForm.sub_statements.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeSubStatement(index)}
                            className="text-red-600"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        Correct Answer: {statement.is_true ? 'True' : 'False'} • Points: {statement.points}
                      </div>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={addSubStatement} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Sub-statement
                  </Button>
                </div>
              </div>
            )}

            {/* Correct Answer */}
            {questionForm.question_type !== 'multiple_true_false' && (
              <div>
                <Label htmlFor="edit-correct-answer">Correct Answer</Label>
                {questionForm.question_type === 'mcq' ? (
                  <Select value={questionForm.correct_answer} onValueChange={(value) => setQuestionForm({ ...questionForm, correct_answer: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select correct answer" />
                    </SelectTrigger>
                    <SelectContent>
                      {questionForm.options
                        .filter(option => option.trim() !== '')
                        .map((option, index) => (
                          <SelectItem key={index} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                ) : questionForm.question_type === 'true_false' ? (
                  <Select value={questionForm.correct_answer} onValueChange={(value) => setQuestionForm({ ...questionForm, correct_answer: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select correct answer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">True</SelectItem>
                      <SelectItem value="false">False</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="edit-correct-answer"
                    value={questionForm.correct_answer}
                    onChange={(e) => setQuestionForm({ ...questionForm, correct_answer: e.target.value })}
                    placeholder="Enter correct answer..."
                  />
                )}
              </div>
            )}

            {/* MTF Summary */}
            {questionForm.question_type === 'multiple_true_false' && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <Label className="text-blue-800 font-medium">Multiple True/False Summary</Label>
                <div className="mt-2 space-y-1">
                  <div className="text-sm text-blue-700">
                    Total Sub-statements: {questionForm.sub_statements.length}
                  </div>
                  <div className="text-sm text-blue-700">
                    Total Points: {questionForm.sub_statements.reduce((sum, stmt) => sum + stmt.points, 0)}
                  </div>
                  <div className="text-sm text-blue-700">
                    True Statements: {questionForm.sub_statements.filter(stmt => stmt.is_true).length}
                  </div>
                  <div className="text-sm text-blue-700">
                    False Statements: {questionForm.sub_statements.filter(stmt => !stmt.is_true).length}
                  </div>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="edit-explanation">Explanation (Optional)</Label>
              <Textarea
                id="edit-explanation"
                value={questionForm.explanation}
                onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                placeholder="Explain why this answer is correct..."
                rows={2}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                id="edit-is_required"
                type="checkbox"
                checked={questionForm.is_required}
                onChange={(e) => setQuestionForm({ ...questionForm, is_required: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="edit-is_required">Required Question</Label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={() => updateQuestionMutation.mutate({ id: selectedQuestion!.id, data: questionForm })} className="flex-1" disabled={updateQuestionMutation.isPending}>
                {updateQuestionMutation.isPending ? "Updating..." : "Update Question"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsEditQuestionDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
