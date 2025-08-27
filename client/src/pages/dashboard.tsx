import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import QuickStats from "@/components/quick-stats";
import PhotoUpload from "@/components/photo-upload";
import { Clock, Building, AlertTriangle, CheckCircle } from "lucide-react";
import { type ProjectWithCounts } from "@shared/schema";

export default function Dashboard() {
  const { data: projects = [], isLoading: projectsLoading } = useQuery<ProjectWithCounts[]>({
    queryKey: ["/api/projects"],
  });

  const { data: reminders = [], isLoading: remindersLoading } = useQuery({
    queryKey: ["/api/reminders"],
  });

  const recentProjects = projects.slice(0, 3);
  const upcomingInspections = reminders.slice(0, 3);

  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    const now = new Date();
    const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays > 1) return `In ${diffDays} days`;
    return "Overdue";
  };

  const getProjectTypeIcon = (type: string) => {
    switch (type) {
      case "building":
        return "🏢";
      case "infrastructure":
        return "🌉";
      case "residential":
        return "🏠";
      default:
        return "📋";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "review":
        return "bg-orange-100 text-orange-800";
      case "complete":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getInspectionIcon = (type: string) => {
    switch (type) {
      case "599":
        return <Clock className="w-5 h-5 text-orange-600" />;
      case "sw3p":
        return <AlertTriangle className="w-5 h-5 text-blue-600" />;
      case "material_test":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return <Clock className="w-5 h-5 text-orange-600" />;
    }
  };

  return (
    <div className="space-y-6 lg:ml-72">
      {/* Stats Overview */}
      <QuickStats />

      {/* Recent Activity & Quick Actions */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {projectsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-muted rounded-md"></div>
                  </div>
                ))}
              </div>
            ) : recentProjects.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No projects found</p>
            ) : (
              recentProjects.map((project) => (
                <div 
                  key={project.id}
                  className="flex items-center space-x-3 p-3 bg-secondary/50 rounded-md hover:bg-accent transition-colors cursor-pointer"
                  data-testid={`recent-project-${project.id}`}
                >
                  <div className="w-10 h-10 bg-primary rounded-md flex items-center justify-center">
                    <span className="text-primary-foreground text-lg">
                      {getProjectTypeIcon(project.type)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground" data-testid={`text-project-name-${project.id}`}>
                      {project.name}
                    </h3>
                    <p className="text-sm text-muted-foreground" data-testid={`text-project-updated-${project.id}`}>
                      Last updated {new Date(project.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(project.status)}>
                      {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Upcoming Inspections */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Inspections</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {remindersLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-muted rounded-md"></div>
                  </div>
                ))}
              </div>
            ) : upcomingInspections.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No upcoming inspections</p>
            ) : (
              upcomingInspections.map((inspection: any) => (
                <div 
                  key={inspection.id}
                  className="flex items-center space-x-3 p-3 border border-border rounded-md"
                  data-testid={`upcoming-inspection-${inspection.id}`}
                >
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    {getInspectionIcon(inspection.type)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground" data-testid={`text-inspection-title-${inspection.id}`}>
                      {inspection.title}
                    </h3>
                    <p className="text-sm text-muted-foreground" data-testid={`text-inspection-project-${inspection.id}`}>
                      {inspection.projectName}
                    </p>
                    <p className="text-xs text-muted-foreground" data-testid={`text-inspection-date-${inspection.id}`}>
                      {formatDate(inspection.scheduledFor)}
                    </p>
                  </div>
                  <Button 
                    size="sm"
                    data-testid={`button-set-reminder-${inspection.id}`}
                  >
                    Set Reminder
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Photo Capture */}
      <PhotoUpload projects={projects} />
    </div>
  );
}
