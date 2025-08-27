import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileText, Edit, Trash2, Download, Calendar } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { type Document } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface DocumentManagerProps {
  projectId: string;
}

const editDocumentSchema = z.object({
  originalName: z.string().min(1, "Document name is required"),
  type: z.string().min(1, "Document type is required"),
});

type EditDocumentData = z.infer<typeof editDocumentSchema>;

export default function DocumentManager({ projectId }: DocumentManagerProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: documents = [], isLoading } = useQuery<Document[]>({
    queryKey: ["/api/projects", projectId, "documents"],
    queryFn: () => apiRequest("GET", `/api/projects/${projectId}/documents`),
  });

  const updateDocumentMutation = useMutation({
    mutationFn: async ({ documentId, data }: { documentId: string; data: EditDocumentData }) => {
      return apiRequest("PATCH", `/api/documents/${documentId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "documents"] });
      setIsEditDialogOpen(false);
      setSelectedDocument(null);
      form.reset();
      toast({
        title: "Document updated",
        description: "Document details have been updated successfully",
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

  const deleteDocumentMutation = useMutation({
    mutationFn: async (documentId: string) => {
      return apiRequest("DELETE", `/api/documents/${documentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "documents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setIsDeleteDialogOpen(false);
      setSelectedDocument(null);
      toast({
        title: "Document deleted",
        description: "Document has been deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const form = useForm<EditDocumentData>({
    resolver: zodResolver(editDocumentSchema),
    defaultValues: {
      originalName: "",
      type: "other",
    },
  });

  const handleEditDocument = (document: Document) => {
    setSelectedDocument(document);
    form.reset({
      originalName: document.originalName || document.filename,
      type: document.type,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteDocument = (document: Document) => {
    setSelectedDocument(document);
    setIsDeleteDialogOpen(true);
  };

  const onSubmit = (data: EditDocumentData) => {
    if (selectedDocument) {
      updateDocumentMutation.mutate({ documentId: selectedDocument.id, data });
    }
  };

  const confirmDelete = () => {
    if (selectedDocument) {
      deleteDocumentMutation.mutate(selectedDocument.id);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString() + " " + new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getDocumentTypeColor = (type: string) => {
    switch (type) {
      case "drawing": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "specification": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "report": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "permit": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "invoice": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case "drawing": return "📐";
      case "specification": return "📋";
      case "report": return "📊";
      case "permit": return "📜";
      case "invoice": return "💰";
      default: return "📄";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Project Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-24 bg-muted rounded-lg"></div>
                <div className="h-4 bg-muted rounded mt-2"></div>
                <div className="h-3 bg-muted rounded mt-1 w-3/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Project Documents ({documents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No documents uploaded yet</p>
              <p className="text-sm">Use the document upload section to add documents to this project</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((document) => (
                <div key={document.id} className="group relative">
                  <div className="border border-border rounded-lg p-4 hover:bg-accent transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{getDocumentTypeIcon(document.type)}</span>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-foreground truncate" data-testid={`text-document-name-${document.id}`}>
                            {document.originalName || document.filename}
                          </h4>
                          <p className="text-sm text-muted-foreground" data-testid={`text-document-size-${document.id}`}>
                            {formatFileSize(document.size)}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditDocument(document)}
                          data-testid={`button-edit-document-${document.id}`}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteDocument(document)}
                          data-testid={`button-delete-document-${document.id}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Badge className={getDocumentTypeColor(document.type)} data-testid={`badge-document-type-${document.id}`}>
                        {document.type.charAt(0).toUpperCase() + document.type.slice(1)}
                      </Badge>
                      
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3 mr-1" />
                        <span data-testid={`text-document-date-${document.id}`}>
                          {formatDate(document.uploadedAt || new Date())}
                        </span>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        data-testid={`button-download-document-${document.id}`}
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Document Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Document</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">
                  Editing: {selectedDocument?.filename}
                </p>
                {selectedDocument?.size && (
                  <p className="text-sm text-muted-foreground">
                    Size: {formatFileSize(selectedDocument.size)}
                  </p>
                )}
              </div>
              
              <FormField
                control={form.control}
                name="originalName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter document name" 
                        {...field} 
                        data-testid="input-edit-document-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-edit-document-type">
                          <SelectValue placeholder="Select document type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="drawing">Drawing</SelectItem>
                        <SelectItem value="specification">Specification</SelectItem>
                        <SelectItem value="report">Report</SelectItem>
                        <SelectItem value="permit">Permit</SelectItem>
                        <SelectItem value="invoice">Invoice</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                  data-testid="button-cancel-edit-document"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateDocumentMutation.isPending}
                  data-testid="button-update-document"
                >
                  {updateDocumentMutation.isPending ? "Updating..." : "Update Document"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Document Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this document? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-document">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              disabled={deleteDocumentMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
              data-testid="button-confirm-delete-document"
            >
              {deleteDocumentMutation.isPending ? "Deleting..." : "Delete Document"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}