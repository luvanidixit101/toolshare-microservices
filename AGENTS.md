# ToolShare Codebase Guide for AI Agents

ToolShare is a polyglot microservices platform with a Java/Spring Boot backend and a React/TypeScript frontend. This guide helps AI agents quickly understand the project structure, conventions, and how to navigate contributions.

---

## Quick Start for AI Agents

### Project Structure
- **Backend**: 6 Java Spring Boot microservices + 1 API Gateway in `backend/`
- **Frontend**: React/TypeScript SPA with Vite in `frontend/`
- **Infrastructure**: Docker Compose with PostgreSQL in `docker/`

### Essential Commands

#### Backend (Java/Maven)
```bash
# Build all services
mvn -f backend/pom.xml clean install

# Build specific service
mvn -f backend/{service-name}/pom.xml clean package

# Run tests
mvn -f backend/{service-name}/pom.xml test

# Start specific service
mvn -f backend/{service-name}/pom.xml spring-boot:run
```

#### Frontend (React/Vite)
```bash
cd frontend

# Install dependencies
npm install

# Development server (http://localhost:5173)
npm run dev

# Production build
npm run build

# Linting and type checking
npm run lint
npm run typecheck

# Preview production build
npm run preview
```

#### Docker & Database
```bash
# Start PostgreSQL and all infrastructure
docker-compose up -d

# Stop containers
docker-compose down

# View logs
docker-compose logs -f {service-name}
```

---

## Architecture

### Microservices Overview

| Service | Port | Purpose | Database |
|---------|------|---------|----------|
| **API Gateway** | 8080 | Routes requests to backend services | N/A |
| **Auth Service** | 8081 | User authentication, JWT token management, OAuth2 | `toolshare_auth` |
| **User Service** | 8082 | User profiles, account management | `toolshare_user` |
| **Tool Service** | 8083 | Tool listings, details, availability | `toolshare_tool` |
| **Booking Service** | 8084 | Tool bookings, reservations | `toolshare_booking` |
| **Chat Service** | 8085 | Direct messaging between users | `toolshare_chat` |
| **Frontend** | 5173 | React SPA | N/A |

### Gateway Routing Patterns
```yaml
# All requests go through API Gateway (port 8080)
GET  /api/auth/**      → Auth Service (8081)
GET  /api/users/**     → User Service (8082)
GET  /api/tools/**     → Tool Service (8083)
POST /api/bookings/**  → Booking Service (8084)
GET  /api/chat/**      → Chat Service (8085)
```

### Technology Stack

**Backend (all microservices)**
- Spring Boot 3.3.5 (api-gateway: 3.2.5)
- Java 21
- Spring Security + JWT authentication
- OAuth2 Resource Server
- Spring Data JPA + Hibernate
- PostgreSQL 16
- Lombok (reduce boilerplate)
- SpringDoc OpenAPI (Swagger/API docs at `/swagger-ui.html`)
- Spring Actuator (health, info)

**Frontend**
- React 18
- TypeScript 5.5 (strict mode)
- Vite 5.4
- Tailwind CSS 3.4
- Axios (HTTP client)
- React Router DOM (SPA routing)
- Supabase JS client (backend integration)
- ESLint + TypeScript rules

**Database**
- PostgreSQL 16 Alpine
- 5 separate databases (one per service)
- Schema auto-created via JPA Hibernate (`ddl-auto: update`)
- Initialized at startup by `docker/postgres/init-databases.sql`

---

## Backend Conventions

### Package Structure (All Microservices)
```
src/main/java/com/toolshare/{service-name}/
├── config/           # Spring configuration, security config
├── controller/       # REST API endpoints
├── dto/             # Data Transfer Objects (request/response models)
├── exception/       # Custom exceptions, global exception handler
├── model/           # JPA Entity models
├── repository/      # Spring Data JPA repositories
├── security/        # JWT, OAuth2 configs
├── service/         # Business logic layer
└── {ServiceName}Application.java  # Main Spring Boot application class
```

### Naming Conventions
- **Packages**: `com.toolshare.{service-name}` (e.g., `com.toolshare.auth`, `com.toolshare.user`)
- **Controllers**: Suffixed with `Controller` (e.g., `UserController`)
- **Services**: Suffixed with `Service` (e.g., `UserService`)
- **Repositories**: Suffixed with `Repository` (e.g., `UserRepository`)
- **DTOs**: Suffixed with `Dto`, `Request`, or `Response` (e.g., `CreateUserRequest`, `UserResponse`)
- **Entities**: PascalCase, no suffix (e.g., `User`, `Tool`, `Booking`)

### Key Patterns
- **Service Layer Pattern**: Controllers → Services → Repositories
- **DTO Mapping**: Map entities to DTOs in service layer, return DTOs in API responses
- **Exception Handling**: Custom exceptions (e.g., `ResourceNotFoundException`, `UnauthorizedException`) with global `@RestControllerAdvice` handler
- **Security**: `@EnableWebSecurity`, JWT validation via Spring Security filters
- **API Documentation**: All endpoints have `@Operation`, `@ApiResponse` annotations for Swagger

### Configuration via Environment Variables
```properties
# Database
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=admin
DB_PASSWORD=admin

# Service-specific databases
AUTH_DB_NAME=toolshare_auth
USER_DB_NAME=toolshare_user
TOOL_DB_NAME=toolshare_tool
BOOKING_DB_NAME=toolshare_booking
CHAT_DB_NAME=toolshare_chat

# Security
JWT_SECRET=your-secret-key-here
JWT_ACCESS_TOKEN_MINUTES=30
JWT_REFRESH_TOKEN_DAYS=7

# CORS
FRONTEND_URL=http://localhost:5173

# Spring profiles
SPRING_PROFILES_ACTIVE=dev
```

---

## Frontend Conventions

### Folder Structure (Folder-by-Feature)
```
src/
├── components/                    # Reusable UI components
│   ├── common/                    # Generic components (Button, Input, Modal, etc.)
│   ├── layout/                    # Layout components (Navbar, Sidebar, etc.)
│   └── tools/                     # Tool-specific components (ToolCard, etc.)
├── pages/                         # Full-page components (one per route)
│   ├── auth/                      # Login, Register, ResetPassword pages
│   ├── bookings/                  # Booking management pages
│   ├── chat/                      # Chat/messaging pages
│   ├── home/                      # Dashboard/landing page
│   ├── profile/                   # User profile pages
│   └── tools/                     # Tool browsing/detail pages
├── services/                      # API integration layer
│   ├── api.ts                     # Axios instance with base config
│   ├── authService.ts             # Auth API calls
│   ├── userService.ts             # User API calls
│   ├── toolService.ts             # Tool API calls
│   ├── bookingService.ts          # Booking API calls
│   ├── chatService.ts             # Chat API calls
│   └── mappers.ts                 # DTO → UI model conversions
├── context/                       # React Context for global state
│   └── AuthContext.tsx            # Authentication context provider
├── hooks/                         # Custom React hooks
│   └── index.ts                   # Export all hooks
├── types/                         # TypeScript interfaces
│   ├── auth.ts                    # Auth-related types
│   ├── user.ts                    # User-related types
│   ├── tool.ts                    # Tool-related types
│   └── api.ts                     # API response types
├── utils/                         # Utility functions
│   ├── formatters.ts              # Date, currency formatting
│   ├── validators.ts              # Form validation
│   └── helpers.ts                 # General helpers
├── index.css                      # Global Tailwind imports
├── App.tsx                        # Main App component with routing
└── main.tsx                       # Entry point
```

### Naming Conventions
- **Components**: PascalCase (e.g., `UserCard.tsx`, `BookingModal.tsx`)
- **Utilities/Hooks**: camelCase (e.g., `useAuth.ts`, `formatDate.ts`)
- **Types/Interfaces**: PascalCase (e.g., `User`, `ToolResponse`)
- **Pages**: PascalCase (e.g., `HomePage.tsx`, `ToolDetailPage.tsx`)

### Key Patterns
- **Path Alias**: Use `@/` for depth-invariant imports: `import { Button } from '@/components/common'` works from any file
- **API Service Layer**: All HTTP calls go through service functions (e.g., `authService.login()`, `toolService.getTools()`)
- **Global State**: React Context for authentication, consider adding Zustand/Redux for complex state
- **Styling**: Tailwind CSS with custom colors (primary: blue shades, accent: amber shades)
- **TypeScript**: Strict mode enabled; all components and functions should have explicit types

### TypeScript Configuration
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "jsx": "react-jsx",
    "strict": true,
    "moduleResolution": "bundler",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

### ESLint Rules
- React hooks rules (dependencies, rules of hooks)
- React Refresh compatibility
- No console logs in production (warn in dev)
- TypeScript best practices

---

## Common Development Workflows

### Adding a New Backend Feature
1. Create a new endpoint in `{ServiceName}Controller`
2. Create DTOs for request/response in `dto/` package
3. Implement business logic in `{Feature}Service`
4. Create JPA repository if data access needed
5. Add exception handling in service layer
6. Add Swagger annotations (`@Operation`, `@ApiResponse`)
7. Write unit tests in `src/test/java/`
8. Verify with Swagger docs at `http://localhost:8081/swagger-ui.html` (replace 8081 with service port)

### Adding a New Frontend Feature
1. Create page component in `pages/{feature}/`
2. Create service functions in `services/{feature}Service.ts`
3. Add types in `types/{feature}.ts`
4. Create reusable components in `components/{feature}/` if needed
5. Use React Router to add route in `App.tsx`
6. Use `AuthContext` for authentication checks
7. Call API via service layer, handle errors with `.catch()`
8. Style with Tailwind CSS

### Running Tests
```bash
# Backend: Run all tests
mvn -f backend/pom.xml test

# Backend: Run specific service tests
mvn -f backend/{service-name}/pom.xml test

# Frontend: If test runner configured
npm run test
```

### Debugging
- **Backend**: Spring logs output to console, Spring Actuator at `/actuator` per service
- **Frontend**: Browser DevTools, React DevTools extension
- **Database**: Connect to PostgreSQL at `localhost:5432` with `admin/admin`
- **API Testing**: Use Swagger UI at `http://localhost:{8080-8085}/swagger-ui.html`

---

## Important Caveats for AI Agents

### Environment Setup
- `.env` files are git-ignored; they must be created manually
- Missing JWT_SECRET will cause auth-service to fail on startup
- Database credentials default to `admin/admin`; ensure PostgreSQL is running

### Port Conflicts
- Services use ports 8080-8085; verify these ports are free before starting
- Frontend uses port 5173; this is configurable in `vite.config.ts` but keep it as default

### CORS & Frontend
- API Gateway only allows `http://localhost:5173` (frontend origin)
- Modify `FRONTEND_URL` env var to change allowed origin
- This is configured in API Gateway's Spring Security settings

### Spring Version Mismatch
- API Gateway uses Spring Boot 3.2.5 (older)
- All other services use Spring Boot 3.3.5 (newer)
- When upgrading, keep api-gateway in sync or verify compatibility

### Database Initialization
- Databases are created automatically at `docker-compose up`
- Schema is auto-created via JPA Hibernate on first run
- Modify `docker/postgres/init-databases.sql` to add init data or schema

### Build Artifacts
- `target/` and `dist/` directories are git-ignored
- Fresh clones require `mvn install` and `npm install`
- Use `mvn clean` to reset build state if issues occur

---

## Key Files Reference

| File | Purpose |
|------|---------|
| [docker-compose.yml](docker-compose.yml) | Infrastructure (PostgreSQL, ports) |
| [backend/pom.xml](backend/pom.xml) | Backend project POM (shared deps) |
| [backend/{service}/pom.xml](backend/auth-service/pom.xml) | Service-specific Maven config |
| [frontend/package.json](frontend/package.json) | Frontend dependencies, scripts |
| [frontend/vite.config.ts](frontend/vite.config.ts) | Vite build & dev server config |
| [frontend/tsconfig.json](frontend/tsconfig.json) | TypeScript configuration |
| [frontend/tailwind.config.js](frontend/tailwind.config.js) | Tailwind CSS customization |
| [docker/postgres/init-databases.sql](docker/postgres/init-databases.sql) | Database initialization script |

---

## For Complex Multi-File Tasks

When working on large refactorings or architectural changes:
1. **Understand the impact**: Identify all affected services and components
2. **Plan changes**: Create a change list before implementing
3. **Test incrementally**: Build and test each service independently
4. **Verify integrations**: Test end-to-end flows after changes

Use `grep_search` or similar tools to find all usages of a class/method before refactoring across services.

---

## Support for AI Agents

This guide is designed to be self-contained. When implementing features:
- **Reference this guide** for conventions and patterns
- **Follow naming conventions** consistently across backend and frontend
- **Preserve existing patterns** (e.g., DTO mapping, service layer, React Context)
- **Test your changes** using the build/test commands above
- **Keep documentation updated** if adding new patterns or conventions

For additional context on specific areas, consult the main README or architecture documentation if available.
