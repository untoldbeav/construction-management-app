# FieldPro - Construction Project Management

A comprehensive construction project management application built for field engineers and construction professionals. FieldPro provides tools for managing construction projects, capturing and organizing site photos, handling material testing specifications, tracking inspection reminders, and maintaining project documentation.

## Features

- **Project Management**: Create, edit, and track construction projects with detailed information
- **Photo Management**: Upload, organize, and edit project photos with metadata  
- **Document Management**: Upload and organize project documents (PDFs, Word docs, Excel files, images)
- **Material Testing**: Track material tests and results with detailed specifications
- **Inspection Reminders**: Schedule and manage 599 and SW3P inspection reminders
- **Calendar Integration**: View and manage project events and deadlines
- **Responsive Design**: Works on desktop and mobile devices

## Architecture Overview

### System Design Philosophy

FieldPro follows a **modular, component-based architecture** with clear separation between frontend, backend, and data layers. The design prioritizes:

- **Type Safety**: Full TypeScript coverage with Zod validation
- **Consistency**: Standardized patterns for CRUD operations across all entities
- **Extensibility**: Easy addition of new features following established patterns
- **Performance**: Efficient data fetching with React Query and optimistic updates
- **User Experience**: Dialog-based editing with comprehensive error handling

### Tech Stack

#### Frontend Architecture
- **React 18** with TypeScript for component-based UI
- **Wouter** for lightweight client-side routing (chosen over React Router for simplicity)
- **Tailwind CSS** with shadcn/ui for consistent, accessible components
- **TanStack React Query v5** for server state management and caching
- **React Hook Form** with Zod resolvers for type-safe form validation
- **Vite** for fast development and optimized production builds

#### Backend Architecture
- **Node.js** with Express.js in RESTful API pattern
- **TypeScript** with ES modules for modern JavaScript features
- **Multer** for multipart form data and file upload handling
- **In-Memory Storage** (current) with interface for easy database migration

#### Database Strategy
- **Current**: In-memory storage for rapid development and prototyping
- **Production Ready**: Drizzle ORM with PostgreSQL integration
- **Scalable**: Designed for easy migration to cloud databases (Neon, Supabase)

## Getting Started

### Prerequisites

- Node.js 18 or higher
- PostgreSQL database (or use Neon for serverless option)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd fieldpro
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/fieldpro

# Session Secret
SESSION_SECRET=your-session-secret-here

# Node Environment
NODE_ENV=development
```

4. Set up the database:
```bash
# If using Drizzle migrations (when implemented)
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Adding New Features: Step-by-Step Guide

### 1. Adding a New Entity (e.g., "Equipment")

FieldPro follows a consistent pattern for all entities. Here's how to add a new entity:

#### Step 1: Define Schema (`shared/schema.ts`)

```typescript
// Add to shared/schema.ts
export const equipment = pgTable("equipment", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(), // excavator, crane, etc.
  serialNumber: text("serial_number"),
  status: text("status").notNull().default("active"), // active, maintenance, retired
  location: text("location"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Export types
export type Equipment = typeof equipment.$inferSelect;
export type InsertEquipment = typeof equipment.$inferInsert;

// Create insert schema for forms
export const insertEquipmentSchema = createInsertSchema(equipment).omit({
  id: true,
  createdAt: true,
});
export type InsertEquipmentData = z.infer<typeof insertEquipmentSchema>;
```

#### Step 2: Update Storage Interface (`server/storage.ts`)

```typescript
// Add to IStorage interface
interface IStorage {
  // ... existing methods
  
  // Equipment
  getProjectEquipment(projectId: string): Promise<Equipment[]>;
  createEquipment(equipment: InsertEquipment): Promise<Equipment>;
  updateEquipment(id: string, updates: Partial<InsertEquipment>): Promise<Equipment | null>;
  deleteEquipment(id: string): Promise<boolean>;
}

// Implement in MemStorage class
export class MemStorage implements IStorage {
  private equipment: Map<string, Equipment> = new Map();
  
  async getProjectEquipment(projectId: string): Promise<Equipment[]> {
    return Array.from(this.equipment.values())
      .filter(eq => eq.projectId === projectId);
  }

  async createEquipment(equipment: InsertEquipment): Promise<Equipment> {
    const id = randomUUID();
    const newEquipment: Equipment = {
      ...equipment,
      id,
      createdAt: new Date(),
    };
    this.equipment.set(id, newEquipment);
    return newEquipment;
  }

  async updateEquipment(id: string, updates: Partial<InsertEquipment>): Promise<Equipment | null> {
    const equipment = this.equipment.get(id);
    if (!equipment) return null;
    
    const updatedEquipment: Equipment = { ...equipment, ...updates };
    this.equipment.set(id, updatedEquipment);
    return updatedEquipment;
  }

  async deleteEquipment(id: string): Promise<boolean> {
    return this.equipment.delete(id);
  }
}
```

#### Step 3: Add API Routes (`server/routes.ts`)

```typescript
// Add equipment routes
app.get("/api/projects/:projectId/equipment", async (req, res) => {
  try {
    const equipment = await storage.getProjectEquipment(req.params.projectId);
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch equipment" });
  }
});

app.post("/api/equipment", async (req, res) => {
  try {
    const equipmentData = insertEquipmentSchema.parse(req.body);
    const equipment = await storage.createEquipment(equipmentData);
    res.status(201).json(equipment);
  } catch (error) {
    res.status(400).json({ message: "Invalid equipment data" });
  }
});

app.patch("/api/equipment/:id", async (req, res) => {
  try {
    const updates = insertEquipmentSchema.partial().parse(req.body);
    const equipment = await storage.updateEquipment(req.params.id, updates);
    if (!equipment) {
      return res.status(404).json({ message: "Equipment not found" });
    }
    res.json(equipment);
  } catch (error) {
    res.status(400).json({ message: "Invalid update data" });
  }
});

app.delete("/api/equipment/:id", async (req, res) => {
  try {
    const deleted = await storage.deleteEquipment(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Equipment not found" });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Failed to delete equipment" });
  }
});
```

#### Step 4: Create Frontend Components

**Create Equipment Manager (`client/src/components/equipment-manager.tsx`):**

```typescript
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Trash2, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type Equipment, insertEquipmentSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface EquipmentManagerProps {
  projectId: string;
}

export default function EquipmentManager({ projectId }: EquipmentManagerProps) {
  // Follow the same pattern as DocumentManager, PhotoManager, etc.
  // Include: useState for dialogs, useQuery for data, useMutation for CRUD operations
  // Implement: create, edit, delete functionality with proper error handling
}
```

#### Step 5: Add to Project Details Page

```typescript
// In client/src/pages/project-details.tsx
import EquipmentManager from "@/components/equipment-manager";

// Add to the tabs
<TabsTrigger value="equipment" data-testid="tab-equipment">Equipment</TabsTrigger>

// Add to tab content
<TabsContent value="equipment" className="space-y-6">
  <EquipmentManager projectId={project.id} />
</TabsContent>
```

### 2. Adding New UI Components

Follow the **shadcn/ui pattern** established throughout the application:

#### Component Structure
```typescript
// Always include proper TypeScript interfaces
interface ComponentProps {
  // Define all props with proper types
  data: SomeType;
  onAction?: (data: SomeType) => void;
  className?: string;
}

// Use forwardRef when needed
const Component = forwardRef<HTMLDivElement, ComponentProps>(
  ({ data, onAction, className, ...props }, ref) => {
    // Component implementation
    return (
      <div ref={ref} className={cn("base-classes", className)} {...props}>
        {/* Content */}
      </div>
    );
  }
);

Component.displayName = "Component";
export default Component;
```

#### Required Patterns
1. **data-testid attributes** on all interactive elements
2. **Proper loading states** with skeleton components  
3. **Error handling** with toast notifications
4. **Responsive design** with mobile-first approach
5. **Accessibility** following shadcn/ui standards

### 3. Adding File Upload Features

To add file upload to a new entity:

#### Backend Setup
```typescript
// Add multer configuration for new file types
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    // Define allowed file types
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  }
});

// Add route with file upload
app.post("/api/equipment/:id/attachments", upload.single("file"), async (req, res) => {
  // Handle file upload similar to photos/documents
});
```

#### Frontend File Upload Component
```typescript
// Use react-dropzone pattern established in DocumentUpload
import { useDropzone } from "react-dropzone";

const { getRootProps, getInputProps, isDragActive } = useDropzone({
  onDrop: (acceptedFiles: File[]) => {
    // Handle file upload
  },
  accept: {
    'image/*': ['.png', '.jpg', '.jpeg'],
    'application/pdf': ['.pdf'],
  },
  multiple: false,
  maxSize: 10 * 1024 * 1024,
});
```

## Current Constraints and Limitations

### Storage Layer Constraints

**Current State**: In-memory storage for rapid development
- **Limitation**: Data is lost on server restart
- **Impact**: Not suitable for production use
- **Migration Path**: Follow Database Migration Guide below

**File Storage**: Local filesystem (`/uploads` directory)
- **Limitation**: Not scalable for cloud deployments
- **Impact**: Files lost when containers restart
- **Solution**: Migrate to cloud storage (S3, Cloudinary, etc.)

### Authentication Constraints

**Current State**: Basic session-based authentication placeholder
- **Limitation**: No user registration/login system implemented
- **Impact**: Single-user application
- **Enhancement Needed**: Implement proper user management

### Frontend State Management

**Current Pattern**: React Query for server state, component state for UI
- **Limitation**: No global client state management
- **Impact**: Complex state sharing between distant components is difficult
- **Consider**: Redux Toolkit or Zustand for complex client state

### API Rate Limiting

**Current State**: No rate limiting implemented
- **Limitation**: Vulnerable to abuse
- **Impact**: Performance and security concerns
- **Enhancement**: Add rate limiting middleware (express-rate-limit)

### File Upload Constraints

**Current Limitations**:
- Maximum file size: 10MB (configurable)
- Local storage only (not cloud-ready)
- No file compression/optimization
- No virus scanning
- Limited file type validation

### Database Migration Considerations

**Moving from In-Memory to PostgreSQL**:

1. **Update storage implementation**:
```typescript
// Replace MemStorage with DrizzleStorage
export class DrizzleStorage implements IStorage {
  constructor(private db: NodePgDatabase) {}
  
  async getProjects(): Promise<ProjectWithCounts[]> {
    return await this.db
      .select({
        ...projects,
        photoCount: sql<number>`count(${photos.id})`,
        documentCount: sql<number>`count(${documents.id})`,
      })
      .from(projects)
      .leftJoin(photos, eq(projects.id, photos.projectId))
      .leftJoin(documents, eq(projects.id, documents.projectId))
      .groupBy(projects.id);
  }
  
  // Implement all interface methods using Drizzle queries
}
```

2. **Run database migrations**:
```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

3. **Update server initialization**:
```typescript
// In server/index.ts
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);
const storage = new DrizzleStorage(db);
```

## Areas for Improvement and Extension

### High Priority Enhancements

#### 1. User Authentication and Authorization

**Current Gap**: No user management system

**Implementation Plan**:
```typescript
// Add to shared/schema.ts
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("user"), // admin, manager, user
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  organization: text("organization"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Add foreign keys to existing tables
// projectId -> projects.id (already exists)
// createdBy -> users.id (add to all entities)
```

**Required Components**:
- Login/Register forms with proper validation
- Password hashing (bcrypt)
- JWT or session-based authentication
- Role-based access control middleware
- User profile management

#### 2. Real-time Collaboration Features

**Implementation Options**:
- WebSocket integration for live updates
- Real-time notifications for project changes
- Collaborative editing of project details
- Live chat or commenting system

**Technical Implementation**:
```typescript
// Add WebSocket support
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

// Broadcast updates to connected clients
const broadcastUpdate = (type: string, data: any) => {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type, data }));
    }
  });
};
```

#### 3. Advanced Photo Management

**GPS Integration**:
```typescript
// Extend photo schema
export const photos = pgTable("photos", {
  // ... existing fields
  gpsLatitude: real("gps_latitude"),
  gpsLongitude: real("gps_longitude"),
  gpsAccuracy: real("gps_accuracy"),
  compass: real("compass"), // Direction photo was taken
  metadata: jsonb("metadata"), // EXIF data, device info, etc.
});
```

**Voice-to-Text Integration**:
```typescript
// Add speech recognition for photo descriptions
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const VoiceInput = ({ onTranscript }: { onTranscript: (text: string) => void }) => {
  const startRecording = () => {
    const recognition = new SpeechRecognition();
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
    };
    recognition.start();
  };
  
  return <Button onClick={startRecording}>🎤 Record Description</Button>;
};
```

#### 4. Offline Capability

**Service Worker Implementation**:
```typescript
// public/sw.js
const CACHE_NAME = 'fieldpro-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});
```

**Data Synchronization**:
```typescript
// Implement background sync for offline data
const syncOfflineData = async () => {
  const offlineActions = await getOfflineActions();
  
  for (const action of offlineActions) {
    try {
      await apiRequest(action.method, action.url, action.data);
      await removeOfflineAction(action.id);
    } catch (error) {
      console.warn('Sync failed for action:', action);
    }
  }
};
```

### Performance Optimizations

#### 1. Image Optimization

**Frontend Implementation**:
```typescript
// Add image compression before upload
import imageCompression from 'browser-image-compression';

const compressImage = async (file: File): Promise<File> => {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  };
  
  return await imageCompression(file, options);
};
```

**Backend Optimization**:
```typescript
// Add Sharp for server-side image processing
import sharp from 'sharp';

const processImage = async (inputPath: string, outputPath: string) => {
  await sharp(inputPath)
    .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toFile(outputPath);
};
```

#### 2. Database Query Optimization

**Add Indexes**:
```sql
-- Performance indexes for common queries
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_photos_project_id ON photos(project_id);
CREATE INDEX idx_documents_project_id ON documents(project_id);
CREATE INDEX idx_reminders_scheduled_for ON reminders(scheduled_for);
CREATE INDEX idx_calendar_events_date ON calendar_events(date);
```

**Implement Pagination**:
```typescript
// Add pagination to large datasets
interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

const getPaginatedProjects = async (params: PaginationParams) => {
  const offset = (params.page - 1) * params.limit;
  
  return await db
    .select()
    .from(projects)
    .limit(params.limit)
    .offset(offset)
    .orderBy(
      params.sortOrder === 'desc' 
        ? desc(projects[params.sortBy]) 
        : asc(projects[params.sortBy])
    );
};
```

#### 3. Frontend Performance

**Implement Virtual Scrolling** for large lists:
```typescript
import { FixedSizeList as List } from 'react-window';

const VirtualizedProjectList = ({ projects }: { projects: Project[] }) => {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      <ProjectCard project={projects[index]} />
    </div>
  );

  return (
    <List
      height={600}
      itemCount={projects.length}
      itemSize={150}
      width="100%"
    >
      {Row}
    </List>
  );
};
```

**Code Splitting**:
```typescript
// Lazy load heavy components
import { lazy, Suspense } from 'react';

const Calendar = lazy(() => import('@/pages/calendar'));
const Materials = lazy(() => import('@/pages/materials'));

// In App.tsx
<Suspense fallback={<div>Loading...</div>}>
  <Route path="/calendar" component={Calendar} />
  <Route path="/materials" component={Materials} />
</Suspense>
```

### Security Enhancements

#### 1. Input Validation and Sanitization

**Enhanced Zod Schemas**:
```typescript
import { z } from 'zod';

// Add comprehensive validation
export const projectSchema = z.object({
  name: z.string()
    .min(1, "Project name is required")
    .max(100, "Project name too long")
    .regex(/^[a-zA-Z0-9\s\-_]+$/, "Invalid characters in project name"),
  
  description: z.string()
    .max(1000, "Description too long")
    .optional(),
    
  location: z.string()
    .max(200, "Location too long")
    .optional(),
    
  status: z.enum(["active", "review", "complete", "on-hold"]),
  
  type: z.enum(["building", "infrastructure", "residential", "commercial"]),
});
```

#### 2. File Upload Security

**Enhanced File Validation**:
```typescript
import fileType from 'file-type';
import crypto from 'crypto';

const validateFile = async (buffer: Buffer, originalName: string) => {
  // Check file type by content, not just extension
  const detectedType = await fileType.fromBuffer(buffer);
  
  if (!detectedType || !allowedMimeTypes.includes(detectedType.mime)) {
    throw new Error('Invalid file type');
  }
  
  // Generate secure filename
  const hash = crypto.createHash('sha256').update(buffer).digest('hex');
  const timestamp = Date.now();
  const extension = detectedType.ext;
  
  return `${timestamp}-${hash.substring(0, 16)}.${extension}`;
};
```

#### 3. API Security

**Rate Limiting**:
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
});

app.use('/api/', limiter);
```

**Input Sanitization**:
```typescript
import helmet from 'helmet';
import xss from 'xss';

app.use(helmet());

const sanitizeInput = (req, res, next) => {
  for (const key in req.body) {
    if (typeof req.body[key] === 'string') {
      req.body[key] = xss(req.body[key]);
    }
  }
  next();
};

app.use(sanitizeInput);
```

## Development Patterns and Conventions

### Code Organization Principles

#### 1. Component-Based Architecture

**File Naming Convention**:
- Components: `PascalCase.tsx` (e.g., `ProjectCard.tsx`)
- Pages: `kebab-case.tsx` (e.g., `project-details.tsx`)  
- Utilities: `camelCase.ts` (e.g., `queryClient.ts`)
- Types: `PascalCase.ts` when standalone (e.g., `ApiTypes.ts`)

**Component Structure Pattern**:
```typescript
// Every component follows this structure
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// UI imports grouped together
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// Icon imports
import { Plus, Edit, Trash2 } from "lucide-react";
// Type imports
import { type ComponentProps } from "@shared/schema";
// Utility imports
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ComponentNameProps {
  // Always define explicit prop interfaces
  requiredProp: string;
  optionalProp?: number;
  onAction?: (data: SomeType) => void;
}

export default function ComponentName({ requiredProp, optionalProp }: ComponentNameProps) {
  // 1. Hooks (in order: state, query, mutations, other hooks)
  const [localState, setLocalState] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data, isLoading } = useQuery({
    queryKey: ["resourceName", requiredProp],
  });
  
  const mutation = useMutation({
    mutationFn: async (data: SomeType) => apiRequest("POST", "/api/endpoint", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resourceName"] });
      toast({ title: "Success message" });
    },
  });
  
  // 2. Event handlers
  const handleAction = (data: SomeType) => {
    mutation.mutate(data);
  };
  
  // 3. Early returns for loading/error states
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  // 4. Main render
  return (
    <Card>
      <CardHeader>
        <CardTitle>Component Title</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Component content with proper data-testid attributes */}
        <Button onClick={handleAction} data-testid="button-action">
          Action
        </Button>
      </CardContent>
    </Card>
  );
}
```

#### 2. CRUD Operation Pattern

**Every entity follows this exact pattern for consistency**:

```typescript
// 1. State management for dialogs
const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
const [selectedItem, setSelectedItem] = useState<EntityType | null>(null);

// 2. Data fetching
const { data: items = [], isLoading } = useQuery<EntityType[]>({
  queryKey: ["/api/endpoint"],
});

// 3. Create mutation
const createMutation = useMutation({
  mutationFn: async (data: CreateEntityData) => {
    return apiRequest("POST", "/api/endpoint", data);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["/api/endpoint"] });
    setIsCreateDialogOpen(false);
    form.reset();
    toast({ title: "Item created", description: "Success message" });
  },
  onError: (error) => {
    toast({ title: "Create failed", description: error.message, variant: "destructive" });
  },
});

// 4. Update mutation (identical pattern)
const updateMutation = useMutation({
  mutationFn: async ({ id, data }: { id: string; data: UpdateEntityData }) => {
    return apiRequest("PATCH", `/api/endpoint/${id}`, data);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["/api/endpoint"] });
    setIsEditDialogOpen(false);
    setSelectedItem(null);
    form.reset();
    toast({ title: "Item updated", description: "Success message" });
  },
  onError: (error) => {
    toast({ title: "Update failed", description: error.message, variant: "destructive" });
  },
});

// 5. Delete mutation (identical pattern)
const deleteMutation = useMutation({
  mutationFn: async (id: string) => {
    return apiRequest("DELETE", `/api/endpoint/${id}`);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["/api/endpoint"] });
    setIsDeleteDialogOpen(false);
    setSelectedItem(null);
    toast({ title: "Item deleted", description: "Success message" });
  },
  onError: (error) => {
    toast({ title: "Delete failed", description: error.message, variant: "destructive" });
  },
});
```

#### 3. Form Handling Pattern

**Every form follows this structure**:

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// 1. Define form schema
const formSchema = z.object({
  field1: z.string().min(1, "Field is required"),
  field2: z.string().optional(),
  field3: z.enum(["option1", "option2"]),
});

type FormData = z.infer<typeof formSchema>;

// 2. Initialize form
const form = useForm<FormData>({
  resolver: zodResolver(formSchema),
  defaultValues: {
    field1: "",
    field2: "",
    field3: "option1",
  },
});

// 3. Form submission
const onSubmit = (data: FormData) => {
  if (selectedItem) {
    updateMutation.mutate({ id: selectedItem.id, data });
  } else {
    createMutation.mutate(data);
  }
};

// 4. Form JSX structure
<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
    <FormField
      control={form.control}
      name="field1"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Field Label</FormLabel>
          <FormControl>
            <Input placeholder="Enter value" {...field} data-testid="input-field1" />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    
    {/* Submit buttons */}
    <div className="flex justify-end space-x-2">
      <Button type="button" variant="outline" onClick={() => handleCancel()}>
        Cancel
      </Button>
      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Saving..." : "Save"}
      </Button>
    </div>
  </form>
</Form>
```

#### 4. Error Handling Strategy

**Consistent error handling across the application**:

```typescript
// 1. API request wrapper with error handling
export const apiRequest = async (method: string, url: string, data?: any) => {
  try {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: data ? JSON.stringify(data) : undefined,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Request failed");
    }
    
    return response.json();
  } catch (error) {
    // Log error for debugging
    console.error(`API ${method} ${url} failed:`, error);
    throw error;
  }
};

// 2. Component-level error boundaries
const ErrorFallback = ({ error, resetErrorBoundary }: ErrorFallbackProps) => (
  <div className="text-center py-8">
    <h2 className="text-lg font-semibold text-destructive mb-2">Something went wrong</h2>
    <p className="text-muted-foreground mb-4">{error.message}</p>
    <Button onClick={resetErrorBoundary}>Try again</Button>
  </div>
);

// 3. Query error handling
const { data, isLoading, error } = useQuery({
  queryKey: ["key"],
  retry: 3,
  retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
});

if (error) {
  return <ErrorFallback error={error} resetErrorBoundary={() => {}} />;
}
```

### Testing Strategy and Patterns

#### 1. Component Testing Structure

```typescript
// ComponentName.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ComponentName } from './ComponentName';

// Test utilities
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

// Test patterns
describe('ComponentName', () => {
  it('renders correctly with required props', () => {
    renderWithProviders(<ComponentName requiredProp="test" />);
    expect(screen.getByTestId('component-element')).toBeInTheDocument();
  });
  
  it('handles user interactions correctly', async () => {
    renderWithProviders(<ComponentName requiredProp="test" />);
    
    fireEvent.click(screen.getByTestId('button-action'));
    
    await waitFor(() => {
      expect(screen.getByText('Expected result')).toBeInTheDocument();
    });
  });
  
  it('displays loading state', () => {
    // Mock loading state
    renderWithProviders(<ComponentName requiredProp="test" />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
  
  it('handles error states gracefully', () => {
    // Mock error state
    renderWithProviders(<ComponentName requiredProp="test" />);
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });
});
```

#### 2. API Testing Pattern

```typescript
// api.test.ts
import request from 'supertest';
import { app } from '../server/index';

describe('API Endpoints', () => {
  describe('GET /api/projects', () => {
    it('returns list of projects', async () => {
      const response = await request(app)
        .get('/api/projects')
        .expect(200);
        
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('name');
    });
  });
  
  describe('POST /api/projects', () => {
    it('creates new project with valid data', async () => {
      const projectData = {
        name: 'Test Project',
        type: 'building',
        status: 'active',
      };
      
      const response = await request(app)
        .post('/api/projects')
        .send(projectData)
        .expect(201);
        
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(projectData.name);
    });
    
    it('validates required fields', async () => {
      await request(app)
        .post('/api/projects')
        .send({})
        .expect(400);
    });
  });
});
```

### Performance Monitoring and Optimization

#### 1. React Query Configuration

```typescript
// lib/queryClient.ts - Optimized configuration
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error.status >= 400 && error.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Cache invalidation patterns
const invalidateProjectData = () => {
  queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
  queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
};
```

#### 2. Bundle Analysis and Optimization

```typescript
// Add to package.json scripts
{
  "analyze": "npx vite-bundle-analyzer",
  "bundle-size": "npx bundlephobia",
}

// Vite configuration for optimization
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-form'],
          charts: ['recharts'],
        },
      },
    },
    sourcemap: false, // Disable in production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
});
```

### Integration Examples

#### 1. Adding Third-Party Integrations

**Example: Google Maps for Project Locations**

```typescript
// Install dependencies
npm install @googlemaps/js-api-loader

// Create map component
import { Loader } from '@googlemaps/js-api-loader';

const ProjectMap = ({ project }: { project: Project }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  
  useEffect(() => {
    const initMap = async () => {
      const loader = new Loader({
        apiKey: process.env.VITE_GOOGLE_MAPS_API_KEY!,
        version: 'weekly',
      });
      
      const { Map } = await loader.importLibrary('maps');
      const { AdvancedMarkerElement } = await loader.importLibrary('marker');
      
      const mapInstance = new Map(mapRef.current!, {
        center: { lat: project.latitude, lng: project.longitude },
        zoom: 15,
        mapId: 'project-map',
      });
      
      new AdvancedMarkerElement({
        map: mapInstance,
        position: { lat: project.latitude, lng: project.longitude },
        title: project.name,
      });
      
      setMap(mapInstance);
    };
    
    if (project.latitude && project.longitude) {
      initMap();
    }
  }, [project]);
  
  return <div ref={mapRef} className="h-64 w-full rounded-lg" />;
};
```

**Example: AWS S3 File Upload Integration**

```typescript
// Install AWS SDK
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner

// Backend implementation
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

app.post('/api/upload/presigned-url', async (req, res) => {
  const { fileName, fileType } = req.body;
  
  const key = `uploads/${Date.now()}-${fileName}`;
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    ContentType: fileType,
  });
  
  try {
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    res.json({ signedUrl, key });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate signed URL' });
  }
});

// Frontend implementation
const uploadToS3 = async (file: File) => {
  // Get presigned URL
  const { signedUrl, key } = await apiRequest('POST', '/api/upload/presigned-url', {
    fileName: file.name,
    fileType: file.type,
  });
  
  // Upload directly to S3
  const response = await fetch(signedUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type,
    },
  });
  
  if (response.ok) {
    return key; // Return the S3 key for database storage
  } else {
    throw new Error('Upload failed');
  }
};
```

### Common Modification Scenarios

#### 1. Adding New Pages

```typescript
// 1. Create page component in client/src/pages/
// 2. Add route to App.tsx
import NewPage from '@/pages/new-page';

// In App.tsx routes
<Route path="/new-page" component={NewPage} />

// 3. Add navigation link
// In navigation component
<Link href="/new-page" data-testid="nav-new-page">
  <SomeIcon className="w-4 h-4" />
  New Page
</Link>
```

#### 2. Extending Existing Entities

```typescript
// Example: Adding "priority" field to projects

// 1. Update schema (shared/schema.ts)
export const projects = pgTable("projects", {
  // ... existing fields
  priority: text("priority").notNull().default("medium"), // low, medium, high, urgent
});

// 2. Update storage interface and implementation
interface IStorage {
  // Update method signatures to include new field
}

// 3. Update forms
const projectSchema = z.object({
  // ... existing fields
  priority: z.enum(["low", "medium", "high", "urgent"]),
});

// 4. Update UI components
<FormField
  control={form.control}
  name="priority"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Priority</FormLabel>
      <Select onValueChange={field.onChange} value={field.value}>
        <SelectTrigger>
          <SelectValue placeholder="Select priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="low">Low</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="urgent">Urgent</SelectItem>
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>
```

#### 3. Adding Filtering and Sorting

```typescript
// Add filtering to project list
const [filters, setFilters] = useState({
  status: "",
  type: "",
  search: "",
});

const [sortConfig, setSortConfig] = useState({
  field: "createdAt",
  direction: "desc" as "asc" | "desc",
});

// Filter data
const filteredProjects = useMemo(() => {
  return projects.filter(project => {
    if (filters.status && project.status !== filters.status) return false;
    if (filters.type && project.type !== filters.type) return false;
    if (filters.search && !project.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });
}, [projects, filters]);

// Sort data
const sortedProjects = useMemo(() => {
  return [...filteredProjects].sort((a, b) => {
    const aValue = a[sortConfig.field];
    const bValue = b[sortConfig.field];
    
    if (sortConfig.direction === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });
}, [filteredProjects, sortConfig]);

// Filter UI
<div className="flex space-x-4 mb-6">
  <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
    <SelectTrigger className="w-40">
      <SelectValue placeholder="Filter by status" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="">All Statuses</SelectItem>
      <SelectItem value="active">Active</SelectItem>
      <SelectItem value="review">Review</SelectItem>
      <SelectItem value="complete">Complete</SelectItem>
    </SelectContent>
  </Select>
  
  <Input
    placeholder="Search projects..."
    value={filters.search}
    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
    className="max-w-sm"
  />
</div>
```

## Project Structure

```
fieldpro/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── ui/         # shadcn/ui base components
│   │   │   ├── photo-*     # Photo management components
│   │   │   ├── document-*  # Document management components
│   │   │   └── project-*   # Project-specific components
│   │   ├── pages/          # Page components (dashboard, projects, etc.)
│   │   ├── lib/            # Utilities and configurations
│   │   │   ├── utils.ts    # General utilities
│   │   │   └── queryClient.ts # React Query configuration
│   │   └── hooks/          # Custom React hooks
│   │       └── use-toast.ts
├── server/                 # Backend Express application
│   ├── index.ts           # Server entry point and configuration
│   ├── routes.ts          # All API route definitions
│   ├── storage.ts         # Data storage interface and implementation
│   └── vite.ts            # Vite integration for development
├── shared/                # Shared types and schemas
│   └── schema.ts          # Database schema definitions and types
├── uploads/               # File upload directory (development only)
├── .env.example           # Environment variable template
├── drizzle.config.ts      # Database ORM configuration
├── vite.config.ts         # Build tool configuration
├── tailwind.config.ts     # CSS framework configuration
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── README.md              # This comprehensive guide
├── DEPLOYMENT.md          # Deployment instructions
├── CONTRIBUTING.md        # Contribution guidelines
└── LICENSE                # MIT license
```

### Available Scripts

- `npm run dev` - Start development server (frontend + backend on port 5000)
- `npm run build` - Build for production (creates dist/ directory)
- `npm run preview` - Preview production build locally
- `npm run check` - Run TypeScript type checking
- `npm run db:push` - Push database schema changes (when using real database)

### Database Schema

The application uses the following main entities with full CRUD operations:

#### Core Entities
- **Projects**: Construction projects with metadata, status tracking, and counts
- **Photos**: Project photos with descriptions, metadata, and file information
- **Documents**: Project documents with categorization and file handling
- **Material Tests**: Material testing specifications with results tracking
- **Reminders**: Inspection and deadline reminders with completion status
- **Calendar Events**: Project events, milestones, and scheduled activities

#### Entity Relationships
```
Projects (1) → (Many) Photos
Projects (1) → (Many) Documents  
Projects (1) → (Many) Material Tests
Projects (1) → (Many) Reminders
Projects (1) → (Many) Calendar Events
```

### API Endpoints Reference

#### Projects
- `GET /api/projects` - List all projects with counts
- `POST /api/projects` - Create new project
- `PATCH /api/projects/:id` - Update project details
- `DELETE /api/projects/:id` - Delete project and related data

#### Photos
- `GET /api/projects/:projectId/photos` - Get project photos
- `POST /api/projects/:projectId/photos` - Upload new photo (multipart/form-data)
- `PATCH /api/photos/:id` - Update photo details
- `DELETE /api/photos/:id` - Delete photo and file

#### Documents
- `GET /api/projects/:projectId/documents` - Get project documents
- `POST /api/projects/:projectId/documents` - Upload document (multipart/form-data)
- `PATCH /api/documents/:id` - Update document metadata
- `DELETE /api/documents/:id` - Delete document and file

#### Material Tests
- `GET /api/material-tests` - List all material tests
- `GET /api/material-tests/:id/results` - Get test results
- `POST /api/material-tests` - Create new test
- `POST /api/material-tests/:id/results` - Add test result
- `PATCH /api/material-tests/:id` - Update test details
- `DELETE /api/material-tests/:id` - Delete test and results

#### Reminders
- `GET /api/reminders` - List active reminders
- `POST /api/reminders` - Create new reminder
- `PATCH /api/reminders/:id` - Update reminder
- `PATCH /api/reminders/:id/complete` - Mark reminder as complete
- `DELETE /api/reminders/:id` - Delete reminder

#### Calendar Events
- `GET /api/calendar/events?month=X&year=Y` - Get calendar events (optionally filtered)
- `POST /api/calendar/events` - Create new event
- `PATCH /api/calendar/events/:id` - Update event
- `DELETE /api/calendar/events/:id` - Delete event

#### Statistics
- `GET /api/stats` - Get application statistics (project counts, etc.)

### Configuration

#### Environment Variables

**Required**:
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Secure random string for session encryption

**Optional**:
- `NODE_ENV` - Environment (development/production, default: development)
- `PORT` - Server port (default: 5000)
- `MAX_FILE_SIZE` - Maximum upload size in bytes (default: 10MB)
- `UPLOAD_DIR` - Upload directory path (default: uploads)

#### File Upload Configuration

**Current Settings**:
- Maximum file size: 10MB per file
- Supported image formats: PNG, JPG, JPEG, GIF, BMP
- Supported document formats: PDF, DOC, DOCX, XLS, XLSX, TXT
- Storage: Local filesystem (`/uploads` directory)

**Production Recommendations**:
- Migrate to cloud storage (AWS S3, Cloudinary, etc.)
- Implement file compression and optimization
- Add virus scanning for uploaded files
- Set up CDN for file serving

### Development Workflow

#### 1. Making Changes

```bash
# 1. Start development environment
npm run dev

# 2. Make your changes following the established patterns
# 3. Test changes in browser at http://localhost:5000
# 4. Check TypeScript types
npm run check

# 5. Commit changes
git add .
git commit -m "feat: description of changes"
```

#### 2. Adding New Features

Follow the **Step-by-Step Guide** in the "Adding New Features" section above. Every new feature should:

1. **Define schema** in `shared/schema.ts`
2. **Update storage interface** in `server/storage.ts`
3. **Add API routes** in `server/routes.ts`
4. **Create UI components** following established patterns
5. **Add to appropriate pages** with proper navigation

#### 3. Code Quality Standards

- **TypeScript**: Strict mode enabled, no `any` types
- **Linting**: Follow ESLint rules for consistency
- **Testing**: Add data-testid attributes for all interactive elements
- **Accessibility**: Follow shadcn/ui accessibility standards
- **Performance**: Use React Query for caching, implement loading states

### Deployment Options

See `DEPLOYMENT.md` for comprehensive deployment instructions including:

- Traditional VPS/Server deployment
- Railway (recommended for simplicity)
- Docker containerization
- Vercel (requires adaptation for serverless)
- Database migration from in-memory to PostgreSQL

### Troubleshooting

#### Common Issues

**"Cannot connect to database"**:
- Verify `DATABASE_URL` in `.env`
- Ensure PostgreSQL is running
- Check firewall settings

**"File upload fails"**:
- Check file size limits
- Verify upload directory permissions
- Ensure file type is supported

**"Build fails"**:
- Run `npm run check` for TypeScript errors
- Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`
- Check for missing dependencies

**"React Query not updating"**:
- Ensure proper query key structure
- Call `queryClient.invalidateQueries()` after mutations
- Check network tab for failed API requests

### Contributing

See `CONTRIBUTING.md` for detailed contribution guidelines including:

- Development setup instructions
- Coding standards and patterns
- Git workflow and commit conventions
- Pull request requirements
- Code review guidelines

### Support and Resources

- **Documentation**: This README and associated markdown files
- **Type Definitions**: Check `shared/schema.ts` for all data structures
- **Component Examples**: Review existing components for patterns
- **API Examples**: Use existing routes as templates for new endpoints

### License

This project is licensed under the MIT License - see the `LICENSE` file for details.

---

This comprehensive guide provides the granular detail needed for future development, covering architectural patterns, constraints, improvement areas, and practical implementation examples for extending FieldPro. The application is designed for scalability and maintainability, with clear patterns that make it easy to add new features while maintaining consistency and quality.