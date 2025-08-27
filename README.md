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

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Wouter** for client-side routing
- **Tailwind CSS** with shadcn/ui components
- **TanStack React Query** for server state management
- **React Hook Form** with Zod validation
- **Vite** for build tooling

### Backend
- **Node.js** with Express.js
- **TypeScript** with ES modules
- **Multer** for file upload handling
- **Drizzle ORM** with PostgreSQL support

### Database
- **PostgreSQL** with Neon serverless integration
- **Drizzle ORM** for type-safe database operations

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

## Development

### Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── lib/            # Utilities and configurations
│   │   └── hooks/          # Custom React hooks
├── server/                 # Backend Express application
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Data storage interface
│   └── vite.ts            # Vite integration
├── shared/                # Shared types and schemas
│   └── schema.ts          # Database schema and types
└── uploads/               # File upload directory
```

### Available Scripts

- `npm run dev` - Start development server (frontend + backend)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run type-check` - Run TypeScript type checking

### Database Schema

The application uses the following main entities:

- **Projects**: Construction projects with metadata
- **Photos**: Project photos with descriptions and metadata
- **Documents**: Project documents and files
- **Material Tests**: Material testing specifications and results
- **Reminders**: Inspection and deadline reminders
- **Calendar Events**: Project events and milestones

### API Endpoints

#### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create new project
- `PATCH /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

#### Photos
- `GET /api/projects/:projectId/photos` - Get project photos
- `POST /api/projects/:projectId/photos` - Upload photo
- `PATCH /api/photos/:id` - Update photo
- `DELETE /api/photos/:id` - Delete photo

#### Documents
- `GET /api/projects/:projectId/documents` - Get project documents
- `POST /api/projects/:projectId/documents` - Upload document
- `PATCH /api/documents/:id` - Update document
- `DELETE /api/documents/:id` - Delete document

#### Material Tests
- `GET /api/material-tests` - List material tests
- `POST /api/material-tests` - Create material test
- `PATCH /api/material-tests/:id` - Update material test
- `DELETE /api/material-tests/:id` - Delete material test

#### Reminders
- `GET /api/reminders` - List active reminders
- `POST /api/reminders` - Create reminder
- `PATCH /api/reminders/:id` - Update reminder
- `DELETE /api/reminders/:id` - Delete reminder

#### Calendar
- `GET /api/calendar/events` - Get calendar events
- `POST /api/calendar/events` - Create calendar event
- `PATCH /api/calendar/events/:id` - Update calendar event
- `DELETE /api/calendar/events/:id` - Delete calendar event

## Configuration

### Environment Variables

- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Secret for session encryption
- `NODE_ENV` - Environment (development/production)

### File Upload Configuration

- Maximum file size: 10MB
- Supported image formats: PNG, JPG, JPEG, GIF, BMP
- Supported document formats: PDF, DOC, DOCX, XLS, XLSX, TXT
- Upload directory: `/uploads`

## Deployment

### Production Build

1. Build the application:
```bash
npm run build
```

2. Set production environment variables
3. Start the production server:
```bash
NODE_ENV=production node dist/server/index.js
```

### Database Setup

For production, set up a PostgreSQL database and update the `DATABASE_URL` environment variable.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Commit your changes: `git commit -am 'Add some feature'`
5. Push to the branch: `git push origin feature-name`
6. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.