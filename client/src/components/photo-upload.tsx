import { useState, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Camera, CloudUpload, Mic, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface PhotoUploadProps {
  projects: Array<{ id: string; name: string }>;
  selectedProjectId?: string;
  onProjectSelect?: (projectId: string) => void;
}

export default function PhotoUpload({ projects, selectedProjectId, onProjectSelect }: PhotoUploadProps) {
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState(selectedProjectId || "");
  const [location, setLocation] = useState<{ latitude?: number; longitude?: number }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          toast({
            title: "Location captured",
            description: `GPS: ${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`,
          });
        },
        (error) => {
          toast({
            title: "Location error",
            description: "Unable to get current location",
            variant: "destructive",
          });
        }
      );
    }
  };

  const uploadPhotoMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!projectId) {
        throw new Error("Please select a project");
      }

      const formData = new FormData();
      formData.append("photo", file);
      formData.append("description", description);
      if (location.latitude) formData.append("latitude", location.latitude.toString());
      if (location.longitude) formData.append("longitude", location.longitude.toString());

      return apiRequest("POST", `/api/projects/${projectId}/photos`, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setDescription("");
      toast({
        title: "Photo uploaded",
        description: "Photo has been successfully uploaded",
      });
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        uploadPhotoMutation.mutate(acceptedFiles[0]);
      }
    },
  });

  const handleCameraCapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadPhotoMutation.mutate(file);
    }
  };

  const startVoiceToText = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setDescription(prev => prev + (prev ? ' ' : '') + transcript);
      };

      recognition.onerror = () => {
        toast({
          title: "Voice recognition error",
          description: "Unable to capture voice input",
          variant: "destructive",
        });
      };

      recognition.start();
      toast({
        title: "Listening...",
        description: "Speak now to add description",
      });
    } else {
      toast({
        title: "Not supported",
        description: "Voice recognition is not supported in this browser",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Quick Photo Capture</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Button 
              className="w-full h-16"
              onClick={handleCameraCapture}
              disabled={uploadPhotoMutation.isPending}
              data-testid="button-take-photo"
            >
              <Camera className="w-6 h-6 mr-3" />
              <span className="font-medium">Take Photo</span>
            </Button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="camera"
              onChange={handleFileSelect}
              className="hidden"
              data-testid="input-camera"
            />
            
            <div 
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragActive 
                  ? "border-primary bg-primary/5" 
                  : "border-border hover:border-primary/50"
              }`}
              data-testid="dropzone-photos"
            >
              <input {...getInputProps()} />
              <CloudUpload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">
                {isDragActive ? "Drop photos here" : "Drop photos here or click to browse"}
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <Label htmlFor="project-select" className="text-sm font-medium text-foreground mb-1">
                Project
              </Label>
              <Select 
                value={projectId} 
                onValueChange={(value) => {
                  setProjectId(value);
                  onProjectSelect?.(value);
                }}
              >
                <SelectTrigger data-testid="select-project">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="description" className="text-sm font-medium text-foreground mb-1">
                Description
              </Label>
              <div className="relative">
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what you're capturing..."
                  className="resize-none pr-10"
                  rows={3}
                  data-testid="textarea-description"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute bottom-2 right-2 p-1"
                  onClick={startVoiceToText}
                  data-testid="button-voice-to-text"
                >
                  <Mic className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span data-testid="text-gps-location">
                  {location.latitude && location.longitude
                    ? `GPS: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`
                    : "GPS: Not captured"
                  }
                </span>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={getCurrentLocation}
                data-testid="button-get-location"
              >
                Get Location
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
