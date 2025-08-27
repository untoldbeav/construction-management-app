# Contributing to FieldPro

Thank you for your interest in contributing to FieldPro! This document provides guidelines and information for contributors.

## Development Setup

### Prerequisites

- Node.js 18 or higher
- PostgreSQL (local or cloud)
- Git

### Setting Up Your Development Environment

1. **Fork and Clone**:
```bash
git clone https://github.com/yourusername/fieldpro.git
cd fieldpro
```

2. **Install Dependencies**:
```bash
npm install
```

3. **Environment Configuration**:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start Development Server**:
```bash
npm run dev
```

## Project Structure

```
fieldpro/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Page components  
│   │   ├── lib/            # Utilities
│   │   └── hooks/          # Custom hooks
├── server/                 # Express backend
│   ├── index.ts           # Server entry
│   ├── routes.ts          # API routes
│   └── storage.ts         # Data layer
├── shared/                # Shared types
│   └── schema.ts          # Database schema
└── uploads/               # File uploads
```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types and interfaces
- Avoid `any` type when possible
- Use strict TypeScript configuration

### React

- Use functional components with hooks
- Follow React best practices
- Use TypeScript for prop definitions
- Implement proper error boundaries

### API Design

- Follow RESTful conventions
- Use proper HTTP status codes
- Validate input with Zod schemas
- Handle errors gracefully

### Database

- Use Drizzle ORM for database operations
- Define schemas in `shared/schema.ts`
- Follow database naming conventions
- Add proper indexes for performance

## Code Style

### Formatting

- Use Prettier for code formatting
- Follow ESLint rules
- Use consistent indentation (2 spaces)
- Add trailing commas

### Naming Conventions

- Use camelCase for variables and functions
- Use PascalCase for components and types
- Use kebab-case for file names
- Use UPPER_CASE for constants

### Components

- Keep components small and focused
- Use proper prop types
- Add data-testid attributes for testing
- Follow shadcn/ui patterns for UI components

## Testing

### Frontend Testing

Currently using manual testing. Future additions:
- Jest for unit testing
- React Testing Library for component testing
- Cypress for E2E testing

### Backend Testing

Recommended additions:
- Jest for API testing
- Supertest for HTTP testing
- Database seeding for tests

## Git Workflow

### Branching Strategy

- `main` - Production ready code
- `develop` - Integration branch
- `feature/feature-name` - Feature branches
- `bugfix/bug-description` - Bug fix branches
- `hotfix/urgent-fix` - Hotfix branches

### Commit Messages

Follow conventional commits:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Code style changes
- `refactor` - Code refactoring
- `test` - Adding tests
- `chore` - Maintenance tasks

Examples:
```
feat(photos): add photo editing functionality
fix(auth): resolve session timeout issue
docs(api): update endpoint documentation
```

### Pull Request Process

1. **Create Feature Branch**:
```bash
git checkout -b feature/new-feature
```

2. **Make Changes**:
   - Write clean, tested code
   - Follow coding standards
   - Update documentation as needed

3. **Commit Changes**:
```bash
git add .
git commit -m "feat(scope): description"
```

4. **Push and Create PR**:
```bash
git push origin feature/new-feature
```

5. **Pull Request Requirements**:
   - Clear description of changes
   - Reference related issues
   - Include screenshots for UI changes
   - Ensure CI checks pass

## Issue Reporting

### Bug Reports

Include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, browser, Node version)
- Screenshots if applicable

### Feature Requests

Include:
- Clear description of the feature
- Use case and benefits
- Proposed implementation approach
- UI mockups if applicable

## Code Review Guidelines

### For Reviewers

- Check code quality and standards
- Verify functionality works as expected
- Look for potential security issues
- Ensure proper error handling
- Check for performance implications

### For Contributors

- Respond to feedback promptly
- Make requested changes
- Test thoroughly before pushing updates
- Keep PR scope focused and manageable

## Documentation

### Code Documentation

- Add JSDoc comments for complex functions
- Document API endpoints
- Include usage examples
- Keep README.md updated

### Architecture Decisions

- Document significant architectural choices
- Explain trade-offs and alternatives considered
- Update documentation when architecture changes

## Security

### Guidelines

- Never commit secrets or API keys
- Validate all user inputs
- Use proper authentication and authorization
- Follow OWASP security guidelines
- Report security issues privately

### Sensitive Data

- Use environment variables for configuration
- Encrypt sensitive data at rest
- Use HTTPS in production
- Implement proper session management

## Performance

### Frontend

- Optimize bundle size
- Use code splitting
- Implement proper caching
- Optimize images and assets

### Backend

- Use database indexes
- Implement connection pooling
- Cache frequently accessed data
- Monitor API response times

### Database

- Use appropriate data types
- Add indexes for queries
- Avoid N+1 queries
- Monitor query performance

## Release Process

### Version Management

- Follow semantic versioning (semver)
- Update version in package.json
- Create release notes
- Tag releases in Git

### Deployment

- Test in staging environment
- Run full test suite
- Backup database before deployment
- Monitor application after deployment

## Getting Help

### Resources

- Check existing documentation
- Search through issues
- Read the codebase
- Ask questions in discussions

### Communication

- Be respectful and constructive
- Provide context and examples
- Help others when possible
- Follow code of conduct

## Recognition

Contributors will be recognized in:
- CONTRIBUTORS.md file
- Release notes
- Project documentation

Thank you for contributing to FieldPro!