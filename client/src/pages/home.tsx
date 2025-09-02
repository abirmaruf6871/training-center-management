"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import PublicHeader from "@/components/layout/public-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  BookOpen, 
  Users, 
  GraduationCap,
  Star,
  Play,
  Search,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Edit,
  Settings,
  Plus,
  Trash2,
  Image as ImageIcon,
  Save,
  X
} from "lucide-react";
import { apiService } from "@/lib/api";

interface HomeContent {
  id: string;
  section: string;
  title: string;
  subtitle?: string;
  description?: string;
  content: any;
  is_active: boolean;
  order: number;
}

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  rating: number;
  image_url?: string;
  category: string;
  instructor: string;
}

interface Instructor {
  id: string;
  name: string;
  role: string;
  image_url?: string;
  social_links: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
}

export default function Home() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const queryClient = useQueryClient();
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  
  const isAdmin = user?.role === 'admin';

  // Fetch home page content (public, no auth required)
  const { data: homeContent, isLoading: contentLoading, error: contentError } = useQuery({
    queryKey: ["/api/home-content"],
    queryFn: () => apiService.getHomeContent(),
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch courses for display (public, no auth required)
  const { data: coursesResponse, error: coursesError } = useQuery({
    queryKey: ["/api/courses", { featured: true, limit: 6 }],
    queryFn: () => apiService.getCourses({ featured: true, limit: 6 }),
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch instructors (public, no auth required)
  const { data: instructorsResponse, error: instructorsError } = useQuery({
    queryKey: ["/api/instructors", { featured: true, limit: 4 }],
    queryFn: () => apiService.getInstructors({ featured: true, limit: 4 }),
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fallback data in case API calls fail
  const fallbackCourses = [
    {
      id: '1',
      title: 'Medical Ultrasound Training',
      description: 'Comprehensive ultrasound training for medical professionals',
      price: 25000,
      rating: 4.8,
      category: 'Medical',
      instructor: 'Dr. Sarah Ahmed'
    },
    {
      id: '2',
      title: 'ECG Interpretation Course',
      description: 'Learn to interpret ECG readings accurately',
      price: 15000,
      rating: 4.6,
      category: 'Cardiology',
      instructor: 'Dr. Mohammad Rahman'
    },
    {
      id: '3',
      title: 'Emergency Medicine Training',
      description: 'Essential skills for emergency medical situations',
      price: 30000,
      rating: 4.9,
      category: 'Emergency',
      instructor: 'Dr. Fatima Khan'
    }
  ];

  const fallbackInstructors = [
    {
      id: '1',
      name: 'Dr. Sarah Ahmed',
      role: 'Senior Medical Consultant',
      social_links: {
        facebook: 'https://facebook.com/drsarah',
        linkedin: 'https://linkedin.com/in/drsarah'
      }
    },
    {
      id: '2',
      name: 'Dr. Mohammad Rahman',
      role: 'Cardiology Specialist',
      social_links: {
        twitter: 'https://twitter.com/drmohammad',
        linkedin: 'https://linkedin.com/in/drmohammad'
      }
    }
  ];

  const courses = coursesResponse?.data?.data || fallbackCourses;
  const instructors = instructorsResponse?.data?.data || fallbackInstructors;
  
  // Fallback home content
  const fallbackHomeContent = {
    data: [
      {
        id: '1',
        section: 'hero',
        title: 'Hero Section',
        content: {
          heading: 'Find Medical Courses & Develop Your Skills',
          subtitle: 'Premium Online & Offline Courses from Bangladesh & International Students.'
        },
        is_active: true,
        order: 1
      },
      {
        id: '2',
        section: 'courses',
        title: 'Popular Courses',
        content: {
          title: 'Our Most Popular Courses'
        },
        is_active: true,
        order: 2
      }
    ]
  };
  
  const homeContentData = homeContent || fallbackHomeContent;

  const updateContentMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiService.updateHomeContent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/home-content"] });
      setEditingSection(null);
      toast({ title: "Success", description: "Content updated successfully!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update content", variant: "destructive" });
    },
  });

  const handleEditSection = (section: HomeContent) => {
    setEditingSection(section.section);
    setEditForm(section.content);
  };

  const handleSaveContent = () => {
    if (editingSection) {
      const section = homeContentData?.data?.find((s: HomeContent) => s.section === editingSection);
      if (section) {
        updateContentMutation.mutate({ id: section.id, data: { content: editForm } });
      }
    }
  };

  // Debug logging
  console.log('Home component state:', {
    isLoading,
    contentLoading,
    contentError,
    coursesError,
    instructorsError,
    homeContent,
    coursesResponse,
    instructorsResponse
  });

  // Don't show loading state for public home page
  if (isLoading) {
    return null;
  }

  // Show error state if there are critical errors
  if (contentError || coursesError || instructorsError) {
    console.error('API Errors:', { contentError, coursesError, instructorsError });
  }

  // Show loading state only briefly, then show content with fallback data
  if (contentLoading && !homeContent) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />
      <main>
          {/* Admin Edit Mode Toggle */}
          {isAdmin && (
            <div className="bg-blue-50 border-b border-blue-200 p-4">
              <div className="flex items-center justify-between max-w-7xl mx-auto">
                <div className="flex items-center gap-3">
                  <Settings className="h-5 w-5 text-blue-600" />
                  <span className="text-blue-800 font-medium">Admin Mode</span>
                  <Badge variant={isEditMode ? "default" : "secondary"}>
                    {isEditMode ? "Editing" : "View Only"}
                  </Badge>
                </div>
                <Button
                  onClick={() => setIsEditMode(!isEditMode)}
                  variant={isEditMode ? "outline" : "default"}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isEditMode ? "Exit Edit Mode" : "Enter Edit Mode"}
                </Button>
              </div>
            </div>
          )}

          {/* Hero Section */}
          <section className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white py-20">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    {isEditMode && (
                      <Button
                        onClick={() => handleEditSection({ 
                          id: "hero", 
                          section: "hero", 
                          title: "Hero Section",
                          content: { heading: "Find Medical Courses & Develop Your Skills", subtitle: "Premium Online & Offline Courses from Bangladesh & International Students." },
                          is_active: true,
                          order: 1
                        })}
                        variant="outline"
                        size="sm"
                        className="text-white border-white hover:bg-white hover:text-blue-900"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    <h1 className="text-4xl lg:text-6xl font-bold">
                      {homeContentData?.data?.find((s: HomeContent) => s.section === "hero")?.content?.heading || 
                       "Find Medical Courses & Develop Your Skills"}
                    </h1>
                  </div>
                  <p className="text-xl text-blue-100">
                    {homeContentData?.data?.find((s: HomeContent) => s.section === "hero")?.content?.subtitle || 
                     "Premium Online & Offline Courses from Bangladesh & International Students."}
                  </p>
                  <div className="flex gap-4">
                    <div className="flex-1 relative">
                      <Input
                        placeholder="Search from 1000+ courses"
                        className="h-12 pl-4 pr-32 text-gray-900"
                      />
                      <Button className="absolute right-1 top-1 h-10 bg-blue-600 hover:bg-blue-700">
                        Find Course
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="hidden lg:block">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8">
                    <div className="text-center">
                      <GraduationCap className="h-24 w-24 mx-auto text-blue-200 mb-4" />
                      <h3 className="text-2xl font-semibold mb-2">Start Learning Today</h3>
                      <p className="text-blue-100">Join thousands of students already learning</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  {
                    icon: Users,
                    title: "Learn With Experts",
                    description: "Gain valuable insights from industry leaders."
                  },
                  {
                    icon: BookOpen,
                    title: "Hands-On Skill Builder",
                    description: "Practice real-world scenarios to master your craft."
                  },
                  {
                    icon: GraduationCap,
                    title: "Get Online Certificate",
                    description: "Receive a recognized certificate upon completion."
                  },
                  {
                    icon: Users,
                    title: "Low Clinical Batches",
                    description: "Small class sizes for personalized attention."
                  }
                ].map((feature, index) => (
                  <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <feature.icon className="h-8 w-8 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                      <p className="text-gray-600 text-sm">{feature.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Popular Courses Section */}
          <section className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-gray-900">Our Most Popular Courses</h2>
                {isEditMode && (
                  <Button
                    onClick={() => handleEditSection({ 
                      id: "courses", 
                      section: "courses", 
                      title: "Popular Courses",
                      content: { title: "Our Most Popular Courses" },
                      is_active: true,
                      order: 2
                    })}
                    variant="outline"
                    size="sm"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Section
                  </Button>
                )}
              </div>
              
              {/* Category Tabs */}
              <div className="flex gap-4 mb-8 overflow-x-auto">
                {["All Categories", "Development", "Design", "Marketing", "Business", "Photography", "Music"].map((category) => (
                  <Badge key={category} variant="outline" className="whitespace-nowrap cursor-pointer hover:bg-blue-50">
                    {category}
                  </Badge>
                ))}
              </div>

              {/* Courses Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course: Course) => (
                  <Card key={course.id} className="hover:shadow-lg transition-shadow">
                    <div className="aspect-video bg-gray-200 rounded-t-lg flex items-center justify-center">
                      {course.image_url ? (
                        <img src={course.image_url} alt={course.title} className="w-full h-full object-cover rounded-t-lg" />
                      ) : (
                        <BookOpen className="h-12 w-12 text-gray-400" />
                      )}
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">{course.category}</Badge>
                        <div className="flex items-center gap-1 ml-auto">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600">{course.rating}</span>
                        </div>
                      </div>
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">{course.title}</h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{course.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-blue-600">৳{course.price.toLocaleString()}</span>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          <Play className="h-4 w-4 mr-2" />
                          Learn More
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="text-center mt-8">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  See All Courses
                </Button>
              </div>
            </div>
          </section>

          {/* Call to Action Banner */}
          <section className="py-16 bg-blue-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl font-bold mb-4">Finding Your Right Courses</h2>
              <p className="text-xl text-blue-100 mb-8">Unlock Your Powerful By Joining Our Vibrant Learning Community</p>
              <Button size="lg" className="bg-green-600 hover:bg-green-700">
                Get Started
              </Button>
            </div>
          </section>

          {/* Instructors Section */}
          <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Top Class & Expert Instructors In One Place</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Learn from industry experts who are passionate about sharing their knowledge and experience.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {instructors.map((instructor: Instructor) => (
                  <Card key={instructor.id} className="text-center hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                        {instructor.image_url ? (
                          <img src={instructor.image_url} alt={instructor.name} className="w-full h-full object-cover rounded-full" />
                        ) : (
                          <Users className="h-12 w-12 text-gray-400" />
                        )}
                      </div>
                      <h3 className="font-semibold text-lg mb-1">{instructor.name}</h3>
                      <p className="text-gray-600 text-sm mb-4">{instructor.role}</p>
                      <div className="flex justify-center gap-3">
                        {Object.entries(instructor.social_links).map(([platform, url]) => {
                          if (!url) return null;
                          const Icon = platform === 'facebook' ? Facebook : 
                                     platform === 'twitter' ? Twitter : 
                                     platform === 'linkedin' ? Linkedin : Instagram;
                          return (
                            <a key={platform} href={url} target="_blank" rel="noopener noreferrer" 
                               className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-blue-100 transition-colors">
                              <Icon className="h-4 w-4 text-gray-600" />
                            </a>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="text-center mt-8">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  See All Instructors
                </Button>
              </div>
            </div>
          </section>

          {/* Newsletter Section */}
          <section className="py-16 bg-blue-600 text-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl font-bold mb-4">Want To Stay Informed About New Courses & Study?</h2>
              <div className="flex gap-4 max-w-md mx-auto">
                <Input
                  placeholder="Enter your email"
                  className="flex-1 text-gray-900"
                />
                <Button className="bg-green-600 hover:bg-green-700">
                  Subscribe Now
                </Button>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="bg-gray-900 text-white py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                  <h3 className="text-xl font-bold mb-4">ACMR ACADEMY</h3>
                  <p className="text-gray-400 mb-4">
                    Empowering students with quality education and practical skills for a successful career in healthcare.
                  </p>
                  <div className="space-y-2 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>23/A, Dhaka Cantonment Road, Mirpur-11, Dhaka</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>+880 1234-567890</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>contact@acmr.com</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-4">Useful Links</h4>
                  <ul className="space-y-2 text-gray-400">
                    <li><a href="#" className="hover:text-white transition-colors">Home</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Career</a></li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-4">Our Company</h4>
                  <ul className="space-y-2 text-gray-400">
                    <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Terms and Conditions</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Instructor</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">All Courses</a></li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-4">Get In Touch</h4>
                  <p className="text-gray-400 mb-4">
                    If you need any kind of help you can contact us directly.
                  </p>
                  <div className="flex gap-3">
                    <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                      <Facebook className="h-5 w-5" />
                    </a>
                    <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                      <Twitter className="h-5 w-5" />
                    </a>
                    <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                      <Linkedin className="h-5 w-5" />
                    </a>
                    <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                      <Instagram className="h-5 w-5" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                <p>© 2024 ACMR Academy. All rights reserved.</p>
              </div>
            </div>
          </footer>
      </main>

      {/* Edit Content Dialog */}
      <Dialog open={!!editingSection} onOpenChange={() => setEditingSection(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit {editingSection} Section</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {editingSection === "hero" && (
              <>
                <div>
                  <Label>Main Heading</Label>
                  <Input
                    value={editForm.heading || ""}
                    onChange={(e) => setEditForm({ ...editForm, heading: e.target.value })}
                    placeholder="Enter main heading"
                  />
                </div>
                <div>
                  <Label>Subtitle</Label>
                  <Textarea
                    value={editForm.subtitle || ""}
                    onChange={(e) => setEditForm({ ...editForm, subtitle: e.target.value })}
                    placeholder="Enter subtitle"
                    rows={3}
                  />
                </div>
              </>
            )}

            {editingSection === "courses" && (
              <>
                <div>
                  <Label>Section Title</Label>
                  <Input
                    value={editForm.title || ""}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    placeholder="Enter section title"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={editForm.description || ""}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    placeholder="Enter section description"
                    rows={3}
                  />
                </div>
              </>
            )}

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSaveContent} className="flex-1" disabled={updateContentMutation.isPending}>
                {updateContentMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setEditingSection(null)}
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
