import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Camera, Edit, Trash2, MapPin, Calendar } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { type Photo } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PhotoManagerProps {
  projectId: string;
}

const editPhotoSchema = z.object({
  description: z.string().optional(),
});

type EditPhotoData = z.infer<typeof editPhotoSchema>;

export default function PhotoManager({ projectId }: PhotoManagerProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: photos = [], isLoading } = useQuery<Photo[]>({
    queryKey: ["/api/projects", projectId, "photos"],
    queryFn: () => apiRequest("GET", `/api/projects/${projectId}/photos`),
  });

  const updatePhotoMutation = useMutation({
    mutationFn: async ({ photoId, data }: { photoId: string; data: EditPhotoData }) => {
      return apiRequest("PATCH", `/api/photos/${photoId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "photos"] });
      setIsEditDialogOpen(false);
      setSelectedPhoto(null);
      form.reset();
      toast({
        title: "Photo updated",
        description: "Photo description has been updated successfully",
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

  const deletePhotoMutation = useMutation({
    mutationFn: async (photoId: string) => {
      return apiRequest("DELETE", `/api/photos/${photoId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "photos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setIsDeleteDialogOpen(false);
      setSelectedPhoto(null);
      toast({
        title: "Photo deleted",
        description: "Photo has been deleted successfully",
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

  const form = useForm<EditPhotoData>({
    resolver: zodResolver(editPhotoSchema),
    defaultValues: {
      description: "",
    },
  });

  const handleEditPhoto = (photo: Photo) => {
    setSelectedPhoto(photo);
    form.reset({
      description: photo.description || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleDeletePhoto = (photo: Photo) => {
    setSelectedPhoto(photo);
    setIsDeleteDialogOpen(true);
  };

  const onSubmit = (data: EditPhotoData) => {
    if (selectedPhoto) {
      updatePhotoMutation.mutate({ photoId: selectedPhoto.id, data });
    }
  };

  const confirmDelete = () => {
    if (selectedPhoto) {
      deletePhotoMutation.mutate(selectedPhoto.id);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString() + " " + new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Project Photos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-48 bg-muted rounded-lg"></div>
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
            <Camera className="w-5 h-5 mr-2" />
            Project Photos ({photos.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {photos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Camera className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No photos uploaded yet</p>
              <p className="text-sm">Use the photo upload section to add photos to this project</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {photos.map((photo) => (
                <div key={photo.id} className="group relative">
                  <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-lg overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center">
                      <Camera className="w-8 h-8 text-muted-foreground" />
                      <span className="ml-2 text-sm text-muted-foreground">{photo.filename}</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 space-y-2">
                    <div className="flex items-start justify-between">
                      <p className="text-sm text-foreground font-medium line-clamp-2" data-testid={`text-photo-description-${photo.id}`}>
                        {photo.description || "No description"}
                      </p>
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditPhoto(photo)}
                          data-testid={`button-edit-photo-${photo.id}`}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeletePhoto(photo)}
                          data-testid={`button-delete-photo-${photo.id}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3 mr-1" />
                        <span data-testid={`text-photo-date-${photo.id}`}>
                          {formatDate(photo.takenAt || photo.createdAt)}
                        </span>
                      </div>
                      
                      {photo.latitude && photo.longitude && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3 mr-1" />
                          <span data-testid={`text-photo-location-${photo.id}`}>
                            {photo.latitude.toFixed(6)}, {photo.longitude.toFixed(6)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Photo Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Photo</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">
                  Editing: {selectedPhoto?.filename}
                </p>
                {selectedPhoto?.latitude && selectedPhoto?.longitude && (
                  <p className="text-sm text-muted-foreground">
                    Location: {selectedPhoto.latitude.toFixed(6)}, {selectedPhoto.longitude.toFixed(6)}
                  </p>
                )}
              </div>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter photo description" 
                        {...field} 
                        data-testid="textarea-edit-photo-description"
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
                  onClick={() => setIsEditDialogOpen(false)}
                  data-testid="button-cancel-edit-photo"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updatePhotoMutation.isPending}
                  data-testid="button-update-photo"
                >
                  {updatePhotoMutation.isPending ? "Updating..." : "Update Photo"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Photo Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Photo</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this photo? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-photo">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              disabled={deletePhotoMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
              data-testid="button-confirm-delete-photo"
            >
              {deletePhotoMutation.isPending ? "Deleting..." : "Delete Photo"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}