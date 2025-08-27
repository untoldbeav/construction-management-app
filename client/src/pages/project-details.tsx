import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PhotoUpload from "@/components/photo-upload";
import PhotoManager from "@/components/photo-manager";
import DocumentUpload from "@/components/document-upload";
import DocumentManager from "@/components/document-manager";
import { ArrowLeft, MapPin, Building, Calendar, FileText, Camera, Clock } from "lucide-react";
import { type ProjectWithCounts } from "@shared/schema";

export default function ProjectDetails() {
  const { projectId } = useParams<{ projectId: string }>();
  const [, setLocation] = useLocation();

  const { data: projects = [], isLoading } = useQuery<ProjectWithCounts[]>({
    queryKey: ["/api/projects"],
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-6"></div>
          <div className="h-32 bg-muted rounded mb-6"></div>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const project = projects.find(p => p.id === projectId);

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-muted-foreground mb-4">Project Not Found</h1>
          <p className="text-muted-foreground mb-6">The project you're looking for doesn't exist.</p>
          <Button onClick={() => setLocation("/projects")} data-testid="button-back-to-projects">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "review": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "complete": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "building": return <Building className="w-4 h-4" />;
      case "infrastructure": return <Building className="w-4 h-4" />;
      case "residential": return <Building className="w-4 h-4" />;
      default: return <Building className="w-4 h-4" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Button 
            variant="ghost" 
            onClick={() => setLocation("/projects")}
            className="mb-3"
            data-testid="button-back-to-projects"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
          <h1 className="text-3xl font-bold" data-testid="text-project-name">{project.name}</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={getStatusColor(project.status)} data-testid={`badge-status-${project.status}`}>
            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
          </Badge>
          <Badge variant="outline" className="flex items-center" data-testid={`badge-type-${project.type}`}>
            {getTypeIcon(project.type)}
            <span className="ml-1 capitalize">{project.type}</span>
          </Badge>
        </div>
      </div>

      {/* Project Overview */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Project Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-muted-foreground" data-testid="text-project-description">
                  {project.description || "No description provided"}
                </p>
              </div>
              
              {project.location && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    Location
                  </h4>
                  <p className="text-muted-foreground" data-testid="text-project-location">{project.location}</p>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Camera className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold" data-testid="text-photo-count">{project.photoCount}</div>
                  <div className="text-sm text-muted-foreground">Photos</div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <FileText className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold" data-testid="text-document-count">{project.documentCount}</div>
                  <div className="text-sm text-muted-foreground">Documents</div>
                </div>
              </div>
              
              {project.nextInspection && (
                <div className="bg-orange-50 dark:bg-orange-950 p-3 rounded-lg">
                  <div className="flex items-center text-orange-800 dark:text-orange-200">
                    <Clock className="w-4 h-4 mr-2" />
                    <span className="font-medium">Next Inspection</span>
                  </div>
                  <p className="text-orange-700 dark:text-orange-300 mt-1" data-testid="text-next-inspection">
                    {project.nextInspection}
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="photos" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="photos" data-testid="tab-photos">Photos</TabsTrigger>
          <TabsTrigger value="documents" data-testid="tab-documents">Documents</TabsTrigger>
          <TabsTrigger value="reminders" data-testid="tab-reminders">Reminders</TabsTrigger>
        </TabsList>
        
        <TabsContent value="photos" className="space-y-6">
          <PhotoUpload projects={[{ id: project.id, name: project.name }]} selectedProjectId={project.id} />
          <Separator />
          <PhotoManager projectId={project.id} />
        </TabsContent>
        
        <TabsContent value="documents" className="space-y-6">
          <DocumentUpload projectId={project.id} />
          <DocumentManager projectId={project.id} />
        </TabsContent>
        
        <TabsContent value="reminders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Reminders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Reminder management coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}