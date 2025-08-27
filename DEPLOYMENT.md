# FieldPro Deployment Guide

This guide covers different deployment options for FieldPro.

## Quick Start

### Local Development

1. **Clone and Install**:
```bash
git clone <your-repo-url>
cd fieldpro
npm install
```

2. **Environment Setup**:
```bash
cp .env.example .env
# Edit .env with your database URL and session secret
```

3. **Database Setup**:
   - Install PostgreSQL locally OR use a cloud service like Neon
   - Create a database named `fieldpro`
   - Update `DATABASE_URL` in your `.env` file

4. **Start Development**:
```bash
npm run dev
```

## Production Deployment Options

### Option 1: Traditional VPS/Server

**Requirements:**
- Node.js 18+
- PostgreSQL
- Reverse proxy (nginx recommended)

**Steps:**
1. Clone repository on server
2. Install dependencies: `npm install`
3. Set production environment variables
4. Build application: `npm run build`
5. Set up PostgreSQL database
6. Configure nginx reverse proxy
7. Use PM2 or similar for process management

**Example PM2 config (ecosystem.config.js):**
```javascript
module.exports = {
  apps: [{
    name: 'fieldpro',
    script: 'dist/server/index.js',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

### Option 2: Railway

1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard:
   - `DATABASE_URL` (Railway can provide PostgreSQL)
   - `SESSION_SECRET`
   - `NODE_ENV=production`
3. Railway will automatically build and deploy

### Option 3: Vercel + Serverless

**Note**: FieldPro is currently built as a traditional Express app. For Vercel deployment, you would need to:
1. Adapt the Express routes to Vercel's API routes format
2. Use an external database (Neon, PlanetScale, etc.)
3. Handle file uploads with cloud storage (AWS S3, Cloudinary)

### Option 4: Docker

**Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 5000

CMD ["node", "dist/server/index.js"]
```

**docker-compose.yml:**
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/fieldpro
      - SESSION_SECRET=your-secret-here
    depends_on:
      - db
    volumes:
      - ./uploads:/app/uploads

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=fieldpro
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## Database Migration

### Current State
The app currently uses in-memory storage for development. To use a real database:

1. **Install Drizzle CLI**: `npm install -g drizzle-kit`

2. **Create migrations from schema**:
```bash
npx drizzle-kit generate:pg
```

3. **Run migrations**:
```bash
npx drizzle-kit push:pg
```

### Recommended Production Database Services

- **Neon**: Serverless PostgreSQL, great for scaling
- **Supabase**: PostgreSQL with additional features
- **Railway PostgreSQL**: Simple managed PostgreSQL
- **AWS RDS**: Full-featured managed PostgreSQL

## File Upload Considerations

### Local Storage (Current)
- Files stored in `/uploads` directory
- Good for development and small deployments
- Requires persistent storage on server

### Cloud Storage (Recommended for Production)
Consider migrating to cloud storage for production:

- **AWS S3**: Most popular, reliable
- **Cloudinary**: Great for image processing
- **Google Cloud Storage**: Good integration with GCP

**Migration needed**: Update `multer` configuration to use cloud storage adapters.

## Environment Variables

### Required
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Secure random string for session encryption

### Optional
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment (development/production)
- `MAX_FILE_SIZE`: Maximum upload size in bytes
- `UPLOAD_DIR`: Upload directory path

### Security Notes
- Use strong, unique `SESSION_SECRET` in production
- Use SSL/TLS for database connections in production
- Consider using environment variable management tools (AWS Secrets Manager, etc.)

## Performance Optimizations

### Database
- Add database indexes for frequently queried fields
- Implement connection pooling
- Consider read replicas for high-traffic applications

### File Serving
- Use CDN for static file serving
- Implement image optimization and resizing
- Add file caching headers

### Application
- Enable compression middleware
- Implement Redis for session storage in multi-server setups
- Add rate limiting for API endpoints

## Monitoring and Logging

### Recommended Tools
- **Application Monitoring**: New Relic, DataDog, or Sentry
- **Log Management**: LogTail, Papertrail, or ELK stack
- **Uptime Monitoring**: Pingdom, UptimeRobot

### Health Checks
Add health check endpoint for monitoring:

```javascript
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version 
  });
});
```

## Backup Strategy

### Database Backups
- Set up automated daily backups
- Test backup restoration procedures
- Store backups in multiple locations

### File Backups
- Regular backup of upload directory
- Consider versioning for important files
- Sync with cloud storage for redundancy

## Support

For deployment issues:
1. Check the application logs
2. Verify all environment variables are set
3. Ensure database connectivity
4. Check file upload permissions

Common issues and solutions available in the main README.md file.