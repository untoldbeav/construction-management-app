import { 
  type Project, 
  type InsertProject, 
  type Photo, 
  type InsertPhoto,
  type Document,
  type InsertDocument,
  type MaterialTest,
  type InsertMaterialTest,
  type TestResult,
  type InsertTestResult,
  type Reminder,
  type InsertReminder,
  type CalendarEvent,
  type InsertCalendarEvent,
  type ProjectWithCounts,
  type ProjectStats
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Projects
  getProjects(): Promise<ProjectWithCounts[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: string): Promise<boolean>;
  
  // Photos
  getProjectPhotos(projectId: string): Promise<Photo[]>;
  createPhoto(photo: InsertPhoto): Promise<Photo>;
  deletePhoto(id: string): Promise<boolean>;
  
  // Documents
  getProjectDocuments(projectId: string): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  deleteDocument(id: string): Promise<boolean>;
  
  // Material Tests
  getMaterialTests(): Promise<MaterialTest[]>;
  getMaterialTestsByCategory(category: string): Promise<MaterialTest[]>;
  createMaterialTest(test: InsertMaterialTest): Promise<MaterialTest>;
  
  // Test Results
  getTestResults(): Promise<(TestResult & { projectName: string; testName: string })[]>;
  createTestResult(result: InsertTestResult): Promise<TestResult>;
  
  // Reminders
  getActiveReminders(): Promise<(Reminder & { projectName: string })[]>;
  createReminder(reminder: InsertReminder): Promise<Reminder>;
  markReminderComplete(id: string): Promise<boolean>;
  
  // Calendar Events
  getCalendarEvents(month?: number, year?: number): Promise<(CalendarEvent & { projectName: string })[]>;
  createCalendarEvent(event: InsertCalendarEvent): Promise<CalendarEvent>;
  
  // Stats
  getProjectStats(): Promise<ProjectStats>;
}

export class MemStorage implements IStorage {
  private projects: Map<string, Project> = new Map();
  private photos: Map<string, Photo> = new Map();
  private documents: Map<string, Document> = new Map();
  private materialTests: Map<string, MaterialTest> = new Map();
  private testResults: Map<string, TestResult> = new Map();
  private reminders: Map<string, Reminder> = new Map();
  private calendarEvents: Map<string, CalendarEvent> = new Map();

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // Initialize with some sample data
    const project1: Project = {
      id: "proj-1",
      name: "Downtown Office Complex",
      description: "15-story commercial building with underground parking structure",
      location: "Downtown LA",
      status: "active",
      type: "building",
      createdAt: new Date("2024-11-01"),
      updatedAt: new Date(),
    };

    const project2: Project = {
      id: "proj-2",
      name: "Highway Bridge Inspection",
      description: "Structural integrity assessment of 200ft span bridge",
      location: "I-405 North",
      status: "review",
      type: "infrastructure",
      createdAt: new Date("2024-10-15"),
      updatedAt: new Date(),
    };

    const project3: Project = {
      id: "proj-3",
      name: "Residential Foundation",
      description: "Single-family home foundation inspection and documentation",
      location: "Beverly Hills",
      status: "complete",
      type: "residential",
      createdAt: new Date("2024-10-01"),
      updatedAt: new Date(),
    };

    this.projects.set("proj-1", project1);
    this.projects.set("proj-2", project2);
    this.projects.set("proj-3", project3);

    // Material tests
    const concreteTests: MaterialTest[] = [
      {
        id: "test-1",
        name: "Compressive Strength",
        category: "concrete",
        specification: "Min 4000 PSI @ 28 days",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "test-2",
        name: "Slump Test",
        category: "concrete",
        specification: "4\" ± 1\" per ACI 318",
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    const soilTests: MaterialTest[] = [
      {
        id: "test-3",
        name: "Proctor Density",
        category: "soil",
        specification: "95% max density, ±2% moisture",
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    [...concreteTests, ...soilTests].forEach(test => {
      this.materialTests.set(test.id, test);
    });

    // Reminders
    const reminder1: Reminder = {
      id: "rem-1",
      projectId: "proj-1",
      title: "599 Inspection Due",
      type: "599",
      scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      completed: false,
      createdAt: new Date(),
    };

    this.reminders.set("rem-1", reminder1);
  }

  async getProjects(): Promise<ProjectWithCounts[]> {
    const projects = Array.from(this.projects.values());
    return projects.map(project => ({
      ...project,
      photoCount: Array.from(this.photos.values()).filter(p => p.projectId === project.id).length,
      documentCount: Array.from(this.documents.values()).filter(d => d.projectId === project.id).length,
      nextInspection: this.getNextInspection(project.id),
    }));
  }

  private getNextInspection(projectId: string): string | undefined {
    const projectReminders = Array.from(this.reminders.values())
      .filter(r => r.projectId === projectId && !r.completed)
      .sort((a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime());
    
    if (projectReminders.length > 0) {
      const next = projectReminders[0].scheduledFor;
      const now = new Date();
      const diffDays = Math.ceil((next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "Tomorrow";
      if (diffDays > 1) return `${diffDays} days`;
      return "Overdue";
    }
    
    return undefined;
  }

  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async createProject(project: InsertProject): Promise<Project> {
    const id = randomUUID();
    const newProject: Project = {
      ...project,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.projects.set(id, newProject);
    return newProject;
  }

  async updateProject(id: string, updates: Partial<InsertProject>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;
    
    const updatedProject: Project = {
      ...project,
      ...updates,
      updatedAt: new Date(),
    };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async deleteProject(id: string): Promise<boolean> {
    return this.projects.delete(id);
  }

  async getProjectPhotos(projectId: string): Promise<Photo[]> {
    return Array.from(this.photos.values())
      .filter(photo => photo.projectId === projectId)
      .sort((a, b) => b.takenAt!.getTime() - a.takenAt!.getTime());
  }

  async createPhoto(photo: InsertPhoto): Promise<Photo> {
    const id = randomUUID();
    const newPhoto: Photo = {
      ...photo,
      id,
      takenAt: photo.takenAt || new Date(),
      createdAt: new Date(),
    };
    this.photos.set(id, newPhoto);
    return newPhoto;
  }

  async deletePhoto(id: string): Promise<boolean> {
    return this.photos.delete(id);
  }

  async getProjectDocuments(projectId: string): Promise<Document[]> {
    return Array.from(this.documents.values())
      .filter(doc => doc.projectId === projectId)
      .sort((a, b) => b.uploadedAt!.getTime() - a.uploadedAt!.getTime());
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const id = randomUUID();
    const newDocument: Document = {
      ...document,
      id,
      uploadedAt: new Date(),
    };
    this.documents.set(id, newDocument);
    return newDocument;
  }

  async deleteDocument(id: string): Promise<boolean> {
    return this.documents.delete(id);
  }

  async getMaterialTests(): Promise<MaterialTest[]> {
    return Array.from(this.materialTests.values());
  }

  async getMaterialTestsByCategory(category: string): Promise<MaterialTest[]> {
    return Array.from(this.materialTests.values())
      .filter(test => test.category === category);
  }

  async createMaterialTest(test: InsertMaterialTest): Promise<MaterialTest> {
    const id = randomUUID();
    const newTest: MaterialTest = {
      ...test,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.materialTests.set(id, newTest);
    return newTest;
  }

  async getTestResults(): Promise<(TestResult & { projectName: string; testName: string })[]> {
    return Array.from(this.testResults.values()).map(result => {
      const project = this.projects.get(result.projectId);
      const test = this.materialTests.get(result.materialTestId);
      return {
        ...result,
        projectName: project?.name || "Unknown Project",
        testName: test?.name || "Unknown Test",
      };
    });
  }

  async createTestResult(result: InsertTestResult): Promise<TestResult> {
    const id = randomUUID();
    const newResult: TestResult = {
      ...result,
      id,
      testedAt: new Date(),
    };
    this.testResults.set(id, newResult);
    return newResult;
  }

  async getActiveReminders(): Promise<(Reminder & { projectName: string })[]> {
    return Array.from(this.reminders.values())
      .filter(reminder => !reminder.completed)
      .map(reminder => {
        const project = this.projects.get(reminder.projectId);
        return {
          ...reminder,
          projectName: project?.name || "Unknown Project",
        };
      })
      .sort((a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime());
  }

  async createReminder(reminder: InsertReminder): Promise<Reminder> {
    const id = randomUUID();
    const newReminder: Reminder = {
      ...reminder,
      id,
      createdAt: new Date(),
    };
    this.reminders.set(id, newReminder);
    return newReminder;
  }

  async markReminderComplete(id: string): Promise<boolean> {
    const reminder = this.reminders.get(id);
    if (!reminder) return false;
    
    this.reminders.set(id, { ...reminder, completed: true });
    return true;
  }

  async getCalendarEvents(month?: number, year?: number): Promise<(CalendarEvent & { projectName: string })[]> {
    let events = Array.from(this.calendarEvents.values());
    
    if (month !== undefined && year !== undefined) {
      events = events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.getMonth() === month && eventDate.getFullYear() === year;
      });
    }
    
    return events.map(event => {
      const project = this.projects.get(event.projectId);
      return {
        ...event,
        projectName: project?.name || "Unknown Project",
      };
    });
  }

  async createCalendarEvent(event: InsertCalendarEvent): Promise<CalendarEvent> {
    const id = randomUUID();
    const newEvent: CalendarEvent = {
      ...event,
      id,
      createdAt: new Date(),
    };
    this.calendarEvents.set(id, newEvent);
    return newEvent;
  }

  async getProjectStats(): Promise<ProjectStats> {
    const projects = Array.from(this.projects.values());
    const photos = Array.from(this.photos.values());
    const documents = Array.from(this.documents.values());
    const reminders = Array.from(this.reminders.values());

    return {
      activeProjects: projects.filter(p => p.status === "active").length,
      photosCount: photos.length,
      pendingInspections: reminders.filter(r => !r.completed).length,
      documentsCount: documents.length,
    };
  }
}

export const storage = new MemStorage();
