"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Settings,
  Home,
  Edit,
  Save,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Image as ImageIcon,
  Upload,
  Globe,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  BookOpen,
  Users,
  GraduationCap
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

interface SystemSettings {
  site_name: string;
  site_description: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  social_links: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
  logo_url?: string;
  favicon_url?: string;
}

export default function AdminSettings() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState("home-content");
  const [editingContent, setEditingContent] = useState<HomeContent | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [isImageUploadOpen, setIsImageUploadOpen] = useState(false);
  const [uploadingSection, setUploadingSection] = useState<string>("");
  
  const isAdmin = user?.role === 'admin';

  // Fetch home page content
  const { data: homeContent, isLoading: contentLoading } = useQuery({
    queryKey: ["/api/home-content"],
    enabled: isAuthenticated && isAdmin,
    queryFn: () => apiService.getHomeContent(),
  });

  const updateContentMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiService.updateHomeContent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/home-content"] });
      setEditingContent(null);
      toast({ title: "Success", description: "Content updated successfully!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update content", variant: "destructive" });
    },
  });

  const initializeContentMutation = useMutation({
    mutationFn: () => apiService.post('/home-content/initialize'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/home-content"] });
      toast({ title: "Success", description: "Home content initialized successfully!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to initialize content", variant: "destructive" });
    },
  });

  const handleEditContent = (content: HomeContent) => {
    setEditingContent(content);
    setEditForm(content.content);
  };

  const handleSaveContent = () => {
    if (editingContent) {
      updateContentMutation.mutate({ 
        id: editingContent.id, 
        data: { content: editForm } 
      });
    }
  };

  const handleReorder = (content: HomeContent, direction: 'up' | 'down') => {
    const currentOrder = content.order;
    const newOrder = direction === 'up' ? currentOrder - 1 : currentOrder + 1;
    
    // Find the content to swap with
    const otherContent = homeContent?.data?.find((c: HomeContent) => c.order === newOrder);
    
    if (otherContent) {
      // Update both content items
      Promise.all([
        updateContentMutation.mutateAsync({ id: content.id, data: { order: newOrder } }),
        updateContentMutation.mutateAsync({ id: otherContent.id, data: { order: currentOrder } })
      ]).then(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/home-content"] });
      });
    }
  };

  const toggleContentStatus = (content: HomeContent) => {
    updateContentMutation.mutate({ 
      id: content.id, 
      data: { is_active: !content.is_active } 
    });
  };

  if (isLoading || !isAuthenticated) {
    return null;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50">
        <TopNav />
        <div className="flex pt-16">
          <Sidebar />
          <main className="flex-1 p-6">
            <div className="text-center py-12">
              <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
              <p className="text-gray-600">You don't have permission to access admin settings.</p>
            </div>
          </main>
        </div>
      </div>
    );
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
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Settings</h1>
                <p className="text-sm text-gray-600">Manage home page content and system settings</p>
              </div>
              <Button 
                onClick={() => initializeContentMutation.mutate()}
                disabled={initializeContentMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {initializeContentMutation.isPending ? "Initializing..." : "Initialize Home Content"}
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="home-content">Home Content</TabsTrigger>
              <TabsTrigger value="system-settings">System Settings</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
            </TabsList>

            {/* Home Content Tab */}
            <TabsContent value="home-content" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5" />
                    Home Page Content Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Edit and manage all sections of your home page. You can modify text, images, and layout settings.
                  </p>
                  
                  {contentLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                      <p className="mt-2 text-sm text-gray-600">Loading content...</p>
                    </div>
                  ) : homeContent?.data?.length === 0 ? (
                    <div className="text-center py-8">
                      <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No home content found</p>
                      <p className="text-sm text-gray-500 mt-1">Click "Initialize Home Content" to get started</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {homeContent?.data?.map((content: HomeContent) => (
                        <Card key={content.id} className="hover:shadow-md transition-shadow">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant={content.is_active ? "default" : "secondary"}>
                                    {content.section}
                                  </Badge>
                                  <Badge variant="outline">Order: {content.order}</Badge>
                                  <Badge variant={content.is_active ? "default" : "secondary"}>
                                    {content.is_active ? "Active" : "Inactive"}
                                  </Badge>
                                </div>
                                <h3 className="font-semibold text-lg mb-1">{content.title}</h3>
                                {content.subtitle && (
                                  <p className="text-sm text-gray-600 mb-2">{content.subtitle}</p>
                                )}
                                {content.description && (
                                  <p className="text-sm text-gray-500">{content.description}</p>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => handleEditContent(content)}
                                  variant="outline"
                                  size="sm"
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </Button>
                                <Button
                                  onClick={() => toggleContentStatus(content)}
                                  variant={content.is_active ? "outline" : "default"}
                                  size="sm"
                                >
                                  {content.is_active ? (
                                    <EyeOff className="h-4 w-4 mr-2" />
                                  ) : (
                                    <Eye className="h-4 w-4 mr-2" />
                                  )}
                                  {content.is_active ? "Hide" : "Show"}
                                </Button>
                                <Button
                                  onClick={() => handleReorder(content, 'up')}
                                  variant="outline"
                                  size="sm"
                                  disabled={content.order <= 1}
                                >
                                  <ArrowUp className="h-4 w-4" />
                                </Button>
                                <Button
                                  onClick={() => handleReorder(content, 'down')}
                                  variant="outline"
                                  size="sm"
                                  disabled={content.order >= (homeContent?.data?.length || 0)}
                                >
                                  <ArrowDown className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* System Settings Tab */}
            <TabsContent value="system-settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    System Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="site-name">Site Name</Label>
                      <Input
                        id="site-name"
                        placeholder="ACMR Academy"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="site-description">Site Description</Label>
                      <Input
                        id="site-description"
                        placeholder="Premium online learning platform"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact-email">Contact Email</Label>
                      <Input
                        id="contact-email"
                        type="email"
                        placeholder="contact@acmr.com"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact-phone">Contact Phone</Label>
                      <Input
                        id="contact-phone"
                        placeholder="+880 1234-567890"
                        className="mt-1"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        placeholder="23/A, Dhaka Cantonment Road, Mirpur-11, Dhaka"
                        rows={2}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-semibold mb-3">Social Media Links</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="facebook">Facebook URL</Label>
                        <Input
                          id="facebook"
                          placeholder="https://facebook.com/acmr"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="twitter">Twitter URL</Label>
                        <Input
                          id="twitter"
                          placeholder="https://twitter.com/acmr"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="linkedin">LinkedIn URL</Label>
                        <Input
                          id="linkedin"
                          placeholder="https://linkedin.com/company/acmr"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="instagram">Instagram URL</Label>
                        <Input
                          id="instagram"
                          placeholder="https://instagram.com/acmr"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Save className="h-4 w-4 mr-2" />
                      Save System Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Appearance Tab */}
            <TabsContent value="appearance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Branding & Appearance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="logo">Logo</Label>
                      <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Upload your logo</p>
                        <Button variant="outline" size="sm" className="mt-2">
                          <Upload className="h-4 w-4 mr-2" />
                          Choose File
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="favicon">Favicon</Label>
                      <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Upload favicon (32x32)</p>
                        <Button variant="outline" size="sm" className="mt-2">
                          <Upload className="h-4 w-4 mr-2" />
                          Choose File
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-semibold mb-3">Color Scheme</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="primary-color">Primary Color</Label>
                        <Input
                          id="primary-color"
                          type="color"
                          defaultValue="#2563eb"
                          className="mt-1 h-12"
                        />
                      </div>
                      <div>
                        <Label htmlFor="secondary-color">Secondary Color</Label>
                        <Input
                          id="secondary-color"
                          type="color"
                          defaultValue="#16a34a"
                          className="mt-1 h-12"
                        />
                      </div>
                      <div>
                        <Label htmlFor="accent-color">Accent Color</Label>
                        <Input
                          id="accent-color"
                          type="color"
                          defaultValue="#7c3aed"
                          className="mt-1 h-12"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Save className="h-4 w-4 mr-2" />
                      Save Appearance Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* Edit Content Dialog */}
      <Dialog open={!!editingContent} onOpenChange={() => setEditingContent(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit {editingContent?.title}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {editingContent?.section === "hero" && (
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
                <div>
                  <Label>Search Placeholder</Label>
                  <Input
                    value={editForm.search_placeholder || ""}
                    onChange={(e) => setEditForm({ ...editForm, search_placeholder: e.target.value })}
                    placeholder="Enter search placeholder text"
                  />
                </div>
                <div>
                  <Label>CTA Button Text</Label>
                  <Input
                    value={editForm.cta_text || ""}
                    onChange={(e) => setEditForm({ ...editForm, cta_text: e.target.value })}
                    placeholder="Enter CTA button text"
                  />
                </div>
              </>
            )}

            {editingContent?.section === "features" && (
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
                  <Label>Features</Label>
                  <div className="space-y-3">
                    {(editForm.features || []).map((feature: any, index: number) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <Input
                            value={feature.title || ""}
                            onChange={(e) => {
                              const newFeatures = [...editForm.features];
                              newFeatures[index].title = e.target.value;
                              setEditForm({ ...editForm, features: newFeatures });
                            }}
                            placeholder="Feature title"
                          />
                          <Input
                            value={feature.description || ""}
                            onChange={(e) => {
                              const newFeatures = [...editForm.features];
                              newFeatures[index].description = e.target.value;
                              setEditForm({ ...editForm, features: newFeatures });
                            }}
                            placeholder="Feature description"
                          />
                          <Select
                            value={feature.icon || "users"}
                            onValueChange={(value) => {
                              const newFeatures = [...editForm.features];
                              newFeatures[index].icon = value;
                              setEditForm({ ...editForm, features: newFeatures });
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="users">Users</SelectItem>
                              <SelectItem value="book-open">Book Open</SelectItem>
                              <SelectItem value="graduation-cap">Graduation Cap</SelectItem>
                              <SelectItem value="star">Star</SelectItem>
                              <SelectItem value="check-circle">Check Circle</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {editingContent?.section === "courses" && (
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
                <div>
                  <Label>Categories</Label>
                  <div className="space-y-2">
                    {(editForm.categories || []).map((category: string, index: number) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={category}
                          onChange={(e) => {
                            const newCategories = [...editForm.categories];
                            newCategories[index] = e.target.value;
                            setEditForm({ ...editForm, categories: newCategories });
                          }}
                          placeholder="Category name"
                        />
                        <Button
                          onClick={() => {
                            const newCategories = editForm.categories.filter((_: string, i: number) => i !== index);
                            setEditForm({ ...editForm, categories: newCategories });
                          }}
                          variant="outline"
                          size="sm"
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      onClick={() => {
                        const newCategories = [...(editForm.categories || []), "New Category"];
                        setEditForm({ ...editForm, categories: newCategories });
                      }}
                      variant="outline"
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Category
                    </Button>
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSaveContent} className="flex-1" disabled={updateContentMutation.isPending}>
                {updateContentMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setEditingContent(null)}
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

