import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Plus, Clock, AlertTriangle, CheckCircle, Bell, Droplets } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertReminderSchema, type Reminder, type InsertReminder, type ProjectWithCounts } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Reminders() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: reminders = [], isLoading: remindersLoading } = useQuery({
    queryKey: ["/api/reminders"],
  });

  const { data: projects = [], isLoading: projectsLoading } = useQuery<ProjectWithCounts[]>({
    queryKey: ["/api/projects"],
  });

  const createReminderMutation = useMutation({
    mutationFn: async (data: InsertReminder) => {
      return apiRequest("POST", "/api/reminders", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Reminder created",
        description: "New inspection reminder has been set",
      });
    },
    onError: (error) => {
      toast({
        title: "Creation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const markCompleteMutation = useMutation({
    mutationFn: async (reminderId: string) => {
      return apiRequest("PATCH", `/api/reminders/${reminderId}/complete`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
      toast({
        title: "Reminder marked complete",
        description: "Inspection has been marked as completed",
      });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const form = useForm<InsertReminder>({
    resolver: zodResolver(insertReminderSchema),
    defaultValues: {
      projectId: "",
      title: "",
      type: "599",
      scheduledFor: new Date(),
    },
  });

  const onSubmit = (data: InsertReminder) => {
    createReminderMutation.mutate(data);
  };

  const getInspectionIcon = (type: string) => {
    switch (type) {
      case "599":
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case "sw3p":
        return <Droplets className="w-5 h-5 text-blue-600" />;
      case "material_test":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return <Clock className="w-5 h-5 text-orange-600" />;
    }
  };

  const getInspectionBgColor = (type: string) => {
    switch (type) {
      case "599":
        return "bg-orange-100";
      case "sw3p":
        return "bg-blue-100";
      case "material_test":
        return "bg-green-100";
      default:
        return "bg-orange-100";
    }
  };

  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    const now = new Date();
    const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays > 1) return `In ${diffDays} days`;
    return "Overdue";
  };

  const formatDateTime = (date: string | Date) => {
    return new Date(date).toLocaleString();
  };

  const activeReminders = reminders.filter((reminder: any) => !reminder.completed);
  const completedReminders = reminders.filter((reminder: any) => reminder.completed);

  return (
    <div className="space-y-6 lg:ml-72">
      {/* Reminders Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inspection Reminders</h1>
          <p className="text-muted-foreground">Manage 599 and SW3P inspection schedules and notifications</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-set-reminder">
              <Plus className="w-4 h-4 mr-2" />
              Set Reminder
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Set New Reminder</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="projectId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-reminder-project">
                            <SelectValue placeholder="Select a project" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {projects.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Inspection Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-reminder-type">
                            <SelectValue placeholder="Select inspection type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="599">599 Inspection</SelectItem>
                          <SelectItem value="sw3p">SW3P Inspection</SelectItem>
                          <SelectItem value="material_test">Material Testing</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter reminder title" {...field} data-testid="input-reminder-title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="scheduledFor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Scheduled Date & Time</FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          value={field.value instanceof Date ? field.value.toISOString().slice(0, 16) : field.value}
                          onChange={(e) => field.onChange(new Date(e.target.value))}
                          data-testid="input-reminder-datetime"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsCreateDialogOpen(false)}
                    data-testid="button-cancel-reminder"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createReminderMutation.isPending}
                    data-testid="button-create-reminder"
                  >
                    {createReminderMutation.isPending ? "Creating..." : "Set Reminder"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Reminders */}
      <Card>
        <CardHeader>
          <CardTitle>Active Reminders</CardTitle>
        </CardHeader>
        <CardContent>
          {remindersLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-muted rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : activeReminders.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No active reminders</p>
          ) : (
            <div className="space-y-4">
              {activeReminders.map((reminder: any) => (
                <div 
                  key={reminder.id}
                  className="flex items-center space-x-4 p-4 border border-border rounded-lg"
                  data-testid={`active-reminder-${reminder.id}`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getInspectionBgColor(reminder.type)}`}>
                    {getInspectionIcon(reminder.type)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground" data-testid={`text-reminder-title-${reminder.id}`}>
                      {reminder.title}
                    </h3>
                    <p className="text-sm text-muted-foreground" data-testid={`text-reminder-project-${reminder.id}`}>
                      {reminder.projectName}
                    </p>
                    <p className="text-sm text-muted-foreground" data-testid={`text-reminder-schedule-${reminder.id}`}>
                      <Clock className="w-4 h-4 mr-1 inline" />
                      {formatDate(reminder.scheduledFor)} at {new Date(reminder.scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      onClick={() => markCompleteMutation.mutate(reminder.id)}
                      disabled={markCompleteMutation.isPending}
                      data-testid={`button-mark-complete-${reminder.id}`}
                    >
                      Mark Complete
                    </Button>
                    <Button 
                      variant="secondary"
                      data-testid={`button-snooze-${reminder.id}`}
                    >
                      Snooze
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reminder Configuration */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* 599 Inspection Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-orange-500 mr-2" />
              599 Inspection Reminders
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Default Reminder Time</Label>
              <Select defaultValue="1day">
                <SelectTrigger data-testid="select-599-default-time">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1day">1 day before</SelectItem>
                  <SelectItem value="2days">2 days before</SelectItem>
                  <SelectItem value="1week">1 week before</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-sm font-medium mb-2 block">Notification Method</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="599-push" defaultChecked data-testid="checkbox-599-push" />
                  <Label htmlFor="599-push" className="text-sm">Push Notification</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="599-email" data-testid="checkbox-599-email" />
                  <Label htmlFor="599-email" className="text-sm">Email</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="599-sms" data-testid="checkbox-599-sms" />
                  <Label htmlFor="599-sms" className="text-sm">SMS</Label>
                </div>
              </div>
            </div>
            
            <Button className="w-full" data-testid="button-save-599-settings">
              Save 599 Settings
            </Button>
          </CardContent>
        </Card>

        {/* SW3P Inspection Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Droplets className="w-5 h-5 text-blue-500 mr-2" />
              SW3P Inspection Reminders
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Default Reminder Time</Label>
              <Select defaultValue="1day">
                <SelectTrigger data-testid="select-sw3p-default-time">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1day">1 day before</SelectItem>
                  <SelectItem value="2days">2 days before</SelectItem>
                  <SelectItem value="1week">1 week before</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-sm font-medium mb-2 block">Weather-Based Alerts</Label>
              <div className="flex items-center space-x-2">
                <Checkbox id="weather-alerts" defaultChecked data-testid="checkbox-weather-alerts" />
                <Label htmlFor="weather-alerts" className="text-sm">Alert before rain events</Label>
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium mb-2 block">Notification Method</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="sw3p-push" defaultChecked data-testid="checkbox-sw3p-push" />
                  <Label htmlFor="sw3p-push" className="text-sm">Push Notification</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="sw3p-email" data-testid="checkbox-sw3p-email" />
                  <Label htmlFor="sw3p-email" className="text-sm">Email</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="sw3p-sms" data-testid="checkbox-sw3p-sms" />
                  <Label htmlFor="sw3p-sms" className="text-sm">SMS</Label>
                </div>
              </div>
            </div>
            
            <Button className="w-full" data-testid="button-save-sw3p-settings">
              Save SW3P Settings
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Inspection History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Inspections</CardTitle>
        </CardHeader>
        <CardContent>
          {completedReminders.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No completed inspections</p>
          ) : (
            <div className="space-y-3">
              {completedReminders.slice(0, 5).map((inspection: any) => (
                <div 
                  key={inspection.id}
                  className="flex items-center space-x-3 p-3 bg-secondary/50 rounded-md"
                  data-testid={`completed-inspection-${inspection.id}`}
                >
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground" data-testid={`text-completed-title-${inspection.id}`}>
                      {inspection.title} - Completed
                    </h3>
                    <p className="text-sm text-muted-foreground" data-testid={`text-completed-project-${inspection.id}`}>
                      {inspection.projectName}
                    </p>
                    <p className="text-xs text-muted-foreground" data-testid={`text-completed-date-${inspection.id}`}>
                      Completed on {formatDateTime(inspection.scheduledFor)}
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-primary hover:underline"
                    data-testid={`button-view-report-${inspection.id}`}
                  >
                    View Report
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
