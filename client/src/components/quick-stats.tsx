import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { FolderOpen, Camera, AlertCircle, FileText } from "lucide-react";
import { type ProjectStats } from "@shared/schema";

export default function QuickStats() {
  const { data: stats, isLoading } = useQuery<ProjectStats>({
    queryKey: ["/api/stats"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-16 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const statItems = [
    {
      label: "Active Projects",
      value: stats.activeProjects,
      icon: FolderOpen,
      color: "text-primary",
    },
    {
      label: "Photos Taken",
      value: stats.photosCount,
      icon: Camera,
      color: "text-green-500",
    },
    {
      label: "Pending Inspections",
      value: stats.pendingInspections,
      icon: AlertCircle,
      color: "text-orange-500",
    },
    {
      label: "Documents",
      value: stats.documentsCount,
      icon: FileText,
      color: "text-blue-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p 
                    className={`text-2xl font-bold ${
                      item.label === "Pending Inspections" ? "text-orange-500" : "text-foreground"
                    }`}
                    data-testid={`stat-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {item.value}
                  </p>
                </div>
                <Icon className={`${item.color} text-xl w-6 h-6`} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
