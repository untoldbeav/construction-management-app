import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Box, Layers, Construction, ExternalLink } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertMaterialTestSchema, type MaterialTest, type InsertMaterialTest } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Materials() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: materialTests = [], isLoading: testsLoading } = useQuery<MaterialTest[]>({
    queryKey: ["/api/material-tests"],
  });

  const { data: testResults = [], isLoading: resultsLoading } = useQuery({
    queryKey: ["/api/test-results"],
  });

  const createTestMutation = useMutation({
    mutationFn: async (data: InsertMaterialTest) => {
      return apiRequest("POST", "/api/material-tests", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/material-tests"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Test specification created",
        description: "New material test specification has been created",
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

  const form = useForm<InsertMaterialTest>({
    resolver: zodResolver(insertMaterialTestSchema),
    defaultValues: {
      name: "",
      category: "concrete",
      specification: "",
    },
  });

  const onSubmit = (data: InsertMaterialTest) => {
    createTestMutation.mutate(data);
  };

  const getTestsByCategory = (category: string) => {
    return materialTests.filter(test => test.category === category);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "concrete":
        return <Box className="w-6 h-6 text-gray-600" />;
      case "soil":
        return <Layers className="w-6 h-6 text-amber-600" />;
      case "asphalt":
        return <Construction className="w-6 h-6 text-slate-600" />;
      default:
        return <Box className="w-6 h-6 text-gray-600" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "concrete":
        return "bg-gray-100";
      case "soil":
        return "bg-amber-100";
      case "asphalt":
        return "bg-slate-100";
      default:
        return "bg-gray-100";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pass":
        return "bg-green-100 text-green-800";
      case "fail":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const shareTestLink = (testId: string) => {
    const url = `${window.location.origin}/materials/${testId}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copied",
      description: "Test specification link has been copied to clipboard",
    });
  };

  const categories = [
    { id: "concrete", name: "Concrete Testing", icon: Box },
    { id: "soil", name: "Soil Testing", icon: Layers },
    { id: "asphalt", name: "Asphalt Testing", icon: Construction },
  ];

  return (
    <div className="space-y-6 lg:ml-72">
      {/* Materials Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Material Testing</h1>
          <p className="text-muted-foreground">Manage testing specifications and technician resources</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-new-test-spec">
              <Plus className="w-4 h-4 mr-2" />
              New Test Spec
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Test Specification</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Test Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter test name" {...field} data-testid="input-test-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-test-category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="concrete">Concrete</SelectItem>
                          <SelectItem value="soil">Soil</SelectItem>
                          <SelectItem value="asphalt">Asphalt</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="specification"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Specification</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter test specification details" 
                          {...field} 
                          data-testid="textarea-test-specification"
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
                    data-testid="button-cancel-test"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createTestMutation.isPending}
                    data-testid="button-create-test"
                  >
                    {createTestMutation.isPending ? "Creating..." : "Create Test"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Material Categories */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => {
          const tests = getTestsByCategory(category.id);
          const Icon = category.icon;
          
          return (
            <Card key={category.id}>
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getCategoryColor(category.id)}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {testsLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-16 bg-muted rounded-md"></div>
                      </div>
                    ))}
                  </div>
                ) : tests.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4 text-sm">
                    No tests in this category
                  </p>
                ) : (
                  tests.map((test) => (
                    <div 
                      key={test.id}
                      className="border border-border rounded-md p-3 hover:bg-accent transition-colors cursor-pointer"
                      data-testid={`test-spec-${test.id}`}
                    >
                      <h4 className="font-medium text-foreground" data-testid={`text-test-name-${test.id}`}>
                        {test.name}
                      </h4>
                      <p className="text-sm text-muted-foreground" data-testid={`text-test-spec-${test.id}`}>
                        {test.specification}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          Last updated: {new Date(test.updatedAt).toLocaleDateString()}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            shareTestLink(test.id);
                          }}
                          className="text-primary text-xs hover:underline p-0 h-auto"
                          data-testid={`button-share-test-${test.id}`}
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Share Link
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          {resultsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-12 bg-muted rounded"></div>
                </div>
              ))}
            </div>
          ) : testResults.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No test results available</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Project</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Test Type</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Result</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Date</th>
                    <th className="text-left p-3 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {testResults.map((result: any) => (
                    <tr key={result.id} className="hover:bg-accent transition-colors" data-testid={`test-result-${result.id}`}>
                      <td className="p-3 text-sm text-foreground" data-testid={`text-result-project-${result.id}`}>
                        {result.projectName}
                      </td>
                      <td className="p-3 text-sm text-foreground" data-testid={`text-result-test-${result.id}`}>
                        {result.testName}
                      </td>
                      <td className="p-3 text-sm text-foreground" data-testid={`text-result-value-${result.id}`}>
                        {result.result}
                      </td>
                      <td className="p-3">
                        <Badge className={getStatusColor(result.status)} data-testid={`badge-result-status-${result.id}`}>
                          {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="p-3 text-sm text-muted-foreground" data-testid={`text-result-date-${result.id}`}>
                        {new Date(result.testedAt).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-primary text-sm hover:underline"
                          data-testid={`button-view-report-${result.id}`}
                        >
                          View Report
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
