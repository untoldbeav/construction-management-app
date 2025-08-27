import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, FileText, Clock, MapPin } from "lucide-react";
import { type ProjectWithCounts } from "@shared/schema";

interface ProjectCardProps {
  project: ProjectWithCounts;
  onClick?: () => void;
}

export default function ProjectCard({ project, onClick }: ProjectCardProps) {
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

  const getProjectIcon = (type: string) => {
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

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffHours < 48) return "Yesterday";
    return date.toLocaleDateString();
  };

  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
      data-testid={`card-project-${project.id}`}
    >
      {/* Project thumbnail - using a placeholder pattern */}
      <div className="w-full h-48 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-6xl opacity-50">
          {getProjectIcon(project.type)}
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-foreground" data-testid={`text-project-name-${project.id}`}>
            {project.name}
          </h3>
          <Badge 
            className={getStatusColor(project.status)}
            data-testid={`badge-status-${project.id}`}
          >
            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
          </Badge>
        </div>
        
        <p className="text-sm text-muted-foreground mb-3" data-testid={`text-project-description-${project.id}`}>
          {project.description}
        </p>
        
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
          <span className="flex items-center">
            <MapPin className="w-4 h-4 mr-1" />
            {project.location}
          </span>
          <span data-testid={`text-last-updated-${project.id}`}>
            {formatDate(project.updatedAt)}
          </span>
        </div>
        
        <div className="flex items-center space-x-4 text-sm">
          <span className="flex items-center text-muted-foreground">
            <Camera className="w-4 h-4 mr-1" />
            <span data-testid={`text-photo-count-${project.id}`}>{project.photoCount}</span>
          </span>
          <span className="flex items-center text-muted-foreground">
            <FileText className="w-4 h-4 mr-1" />
            <span data-testid={`text-document-count-${project.id}`}>{project.documentCount}</span>
          </span>
          {project.nextInspection && (
            <span className="flex items-center text-muted-foreground">
              <Clock className="w-4 h-4 mr-1" />
              <span data-testid={`text-next-inspection-${project.id}`}>{project.nextInspection}</span>
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
