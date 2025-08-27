import { useState, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, CloudUpload, File } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface DocumentUploadProps {
  projectId: string;
}

export default function DocumentUpload({ projectId }: DocumentUploadProps) {
  const [documentType, setDocumentType] = useState("other");
  const [documentName, setDocumentName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadDocumentMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("document", file);
      formData.append("type", documentType);
      if (documentName) {
        formData.append("originalName", documentName);
      }

      return apiRequest("POST", `/api/projects/${projectId}/documents`, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "documents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setDocumentName("");
      setDocumentType("other");
      toast({
        title: "Document uploaded",
        description: "Document has been successfully uploaded",
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

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      // Set document name to file name if not already set
      if (!documentName) {
        setDocumentName(file.name);
      }
      uploadDocumentMutation.mutate(file);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/plain': ['.txt'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp'],
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024, // 10MB limit
  });

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Set document name to file name if not already set
      if (!documentName) {
        setDocumentName(file.name);
      }
      uploadDocumentMutation.mutate(file);
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          Upload Documents
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Document Type and Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="document-type">Document Type</Label>
            <Select value={documentType} onValueChange={setDocumentType}>
              <SelectTrigger id="document-type" data-testid="select-document-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="drawing">
                  <span className="flex items-center">
                    <span className="mr-2">📐</span>
                    Drawing
                  </span>
                </SelectItem>
                <SelectItem value="specification">
                  <span className="flex items-center">
                    <span className="mr-2">📋</span>
                    Specification
                  </span>
                </SelectItem>
                <SelectItem value="report">
                  <span className="flex items-center">
                    <span className="mr-2">📊</span>
                    Report
                  </span>
                </SelectItem>
                <SelectItem value="permit">
                  <span className="flex items-center">
                    <span className="mr-2">📜</span>
                    Permit
                  </span>
                </SelectItem>
                <SelectItem value="invoice">
                  <span className="flex items-center">
                    <span className="mr-2">💰</span>
                    Invoice
                  </span>
                </SelectItem>
                <SelectItem value="other">
                  <span className="flex items-center">
                    <span className="mr-2">📄</span>
                    Other
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="document-name">Document Name (Optional)</Label>
            <Input
              id="document-name"
              placeholder="Enter custom document name"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              data-testid="input-document-name"
            />
          </div>
        </div>

        {/* Drag and Drop Area */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50"
          }`}
          data-testid="document-dropzone"
        >
          <input {...getInputProps()} />
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.png,.jpg,.jpeg,.gif,.bmp"
            onChange={handleFileChange}
            className="hidden"
            data-testid="document-file-input"
          />
          
          <div className="space-y-4">
            <div className="flex justify-center">
              {uploadDocumentMutation.isPending ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              ) : (
                <CloudUpload className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            
            <div>
              <p className="text-lg font-medium">
                {isDragActive ? "Drop document here" : "Drag & drop or click to upload"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Supports PDF, Word, Excel, Text, and Image files (max 10MB)
              </p>
            </div>
            
            <Button 
              onClick={handleFileSelect} 
              disabled={uploadDocumentMutation.isPending}
              data-testid="button-select-document"
            >
              <File className="w-4 h-4 mr-2" />
              {uploadDocumentMutation.isPending ? "Uploading..." : "Select Document"}
            </Button>
          </div>
        </div>

        {/* Upload Status */}
        {uploadDocumentMutation.isPending && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Uploading document...</p>
          </div>
        )}

        {/* Document Type Preview */}
        <div className="bg-muted p-3 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{getDocumentTypeIcon(documentType)}</span>
            <div>
              <p className="font-medium">
                {documentType.charAt(0).toUpperCase() + documentType.slice(1)} Document
              </p>
              <p className="text-sm text-muted-foreground">
                {documentName || "File name will be used if no custom name is provided"}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}