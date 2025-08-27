# Overview

FieldPro is a comprehensive construction project management application built for field engineers and construction professionals. The application provides tools for managing construction projects, capturing and organizing site photos, handling material testing specifications, tracking inspection reminders, and maintaining project documentation. It features a modern React frontend with a Node.js/Express backend, using PostgreSQL for data persistence and Drizzle ORM for database operations.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client-side application is built with React 18 using TypeScript and follows a modern component-based architecture:

- **UI Framework**: React with Wouter for client-side routing, providing a lightweight alternative to React Router
- **Styling System**: Tailwind CSS with shadcn/ui component library for consistent, accessible UI components
- **State Management**: TanStack React Query for server state management and data fetching, with custom query client configuration
- **Form Handling**: React Hook Form with Zod schema validation for type-safe form management
- **Build Tool**: Vite for fast development and optimized production builds

The frontend follows a feature-based organization with separate pages for dashboard, projects, calendar, materials, and reminders. Components are structured using the shadcn/ui pattern with reusable UI primitives.

## Backend Architecture
The server-side application uses Node.js with Express.js in a RESTful API pattern:

- **Runtime**: Node.js with ES modules and TypeScript support via tsx
- **Framework**: Express.js for HTTP server and routing with middleware for request logging and error handling
- **File Upload Handling**: Multer middleware for processing multipart form data and file uploads with 10MB size limits
- **Development Integration**: Vite integration for development mode with hot module replacement

The API follows REST conventions with routes organized by resource (projects, photos, documents, material tests, etc.).

## Data Storage Architecture
The application uses PostgreSQL as the primary database with Drizzle ORM for type-safe database operations:

- **Database**: PostgreSQL with Neon serverless integration for cloud deployment
- **ORM**: Drizzle ORM with Zod integration for schema validation and type safety
- **Schema Design**: Relational model with separate tables for projects, photos, documents, material tests, test results, reminders, and calendar events
- **Database Hosting**: Neon Database serverless PostgreSQL with connection pooling

The schema supports project-centric organization where most entities are linked to specific projects, enabling proper data isolation and organization.

## Authentication and Session Management
- **Session Storage**: PostgreSQL-based session storage using connect-pg-simple
- **Session Configuration**: Secure session handling with proper cookie configuration

## File Storage System
- **Upload Directory**: Local filesystem storage in `/uploads` directory
- **File Processing**: Automatic filename generation with timestamps and random strings to prevent conflicts
- **File Types**: Support for images (photos) and documents with proper MIME type handling

# External Dependencies

## Core Framework Dependencies
- **@neondatabase/serverless**: Neon Database serverless PostgreSQL driver for cloud database connectivity
- **drizzle-orm**: Type-safe ORM for database operations with PostgreSQL dialect support
- **drizzle-kit**: Database migration and schema management tools

## UI and Styling Dependencies
- **@radix-ui/***: Comprehensive set of unstyled, accessible UI primitives for building the component library
- **tailwindcss**: Utility-first CSS framework for responsive design
- **class-variance-authority**: Utility for creating variant-based component APIs
- **lucide-react**: Modern icon library with consistent iconography

## Data Management Dependencies
- **@tanstack/react-query**: Powerful data fetching and caching library for React applications
- **@hookform/resolvers**: Form validation resolvers for React Hook Form
- **zod**: TypeScript-first schema validation library
- **date-fns**: Modern JavaScript date utility library

## Development and Build Dependencies
- **vite**: Fast build tool and development server
- **tsx**: TypeScript execution environment for Node.js
- **@replit/vite-plugin-runtime-error-modal**: Replit-specific development tooling for error handling
- **@replit/vite-plugin-cartographer**: Replit integration plugin for enhanced development experience

## File Upload Dependencies
- **multer**: Node.js middleware for handling multipart/form-data for file uploads
- **react-dropzone**: React component for drag-and-drop file uploads with accessibility support

## Additional Utilities
- **wouter**: Minimalist routing library for React applications
- **cmdk**: Command palette component for enhanced user experience
- **embla-carousel-react**: Carousel component for image galleries and content navigation