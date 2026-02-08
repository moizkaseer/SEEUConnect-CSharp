# SEEUConnect

A full-stack campus event management platform built for South East European University (SEEU). Students can browse, create, and manage university events with real-time search, category filtering, and role-based access control.

**Live Demo**: [seeu-connect-etamcwc8hvabard7.francecentral-01.azurewebsites.net](https://seeu-connect-etamcwc8hvabard7.francecentral-01.azurewebsites.net)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | ASP.NET Core (.NET 10.0) Web API |
| **Frontend** | React 18 + TypeScript + Vite |
| **Database** | SQL Server (LocalDB dev / Azure SQL prod) |
| **ORM** | Entity Framework Core 10 |
| **Auth** | JWT Bearer Tokens + BCrypt password hashing |
| **UI** | Tailwind CSS + shadcn/ui (Radix) |
| **CI/CD** | GitHub Actions + Azure App Service |
| **Cloud** | Microsoft Azure (App Service + Azure SQL) |

## Architecture

```
┌──────────────┐     HTTP/JSON      ┌──────────────────┐     EF Core     ┌──────────────┐
│   React SPA  │ ◄────────────────► │  .NET Web API    │ ◄─────────────► │  SQL Server  │
│   (Vite)     │                    │  (Controllers)   │                 │  (Azure SQL) │
└──────────────┘                    └──────────────────┘                 └──────────────┘
                                           │
                                    ┌──────┴──────┐
                                    │   Service   │  ← Business Logic
                                    │   Layer     │    (validation, filtering)
                                    ├─────────────┤
                                    │ Repository  │  ← Data Access
                                    │   Layer     │    (EF Core queries)
                                    └─────────────┘
```

**Design Pattern**: Controller → Service → Repository → DbContext

## Features

- **Event CRUD** - Create, read, update, and delete campus events
- **JWT Authentication** - Register/login with secure token-based auth
- **Role-Based Authorization** - User and Admin roles with different permissions
- **Search & Filter** - Search events by title/description/location, filter by category
- **Voting System** - Upvote events
- **Comments** - Users can comment on events
- **Tagging** - Many-to-many event tagging system
- **Responsive UI** - Mobile-friendly design with dark mode support
- **CI/CD Pipeline** - Automated build, test, and deploy on every push

## API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register a new user | Public |
| POST | `/api/auth/login` | Login and receive JWT | Public |

### Events (`/api/events`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/events` | Get all events | Public |
| GET | `/api/events/{id}` | Get event by ID | Public |
| POST | `/api/events` | Create a new event | User |
| PUT | `/api/events/{id}` | Update an event | User |
| DELETE | `/api/events/{id}` | Delete an event | Admin |
| GET | `/api/events/category/{category}` | Filter by category | Public |
| GET | `/api/events/search?term=` | Search events | Public |

## Database Schema

```
┌─────────┐       ┌───────────┐       ┌──────────┐
│  Users  │       │  Events   │       │   Tags   │
├─────────┤       ├───────────┤       ├──────────┤
│ Id      │       │ Id        │       │ Id       │
│ Username│       │ Title     │       │ Name     │
│ Email   │       │ Description│      └────┬─────┘
│ Password│       │ Location  │           │
│ Role    │       │ Category  │     ┌─────┴──────┐
│ Created │       │ Date      │     │ EventTags  │
└────┬────┘       │ Tags      │     ├────────────┤
     │            │ Votes     │◄────┤ EventId(FK)│
     │            └─────┬─────┘     │ TagId (FK) │
     │                  │           └────────────┘
     │            ┌─────┴─────┐
     │            │ Comments  │
     └───────────►├───────────┤
                  │ Id        │
                  │ Content   │
                  │ CreatedAt │
                  │ EventId(FK)│
                  │ UserId(FK)│
                  └───────────┘
```

**Relationships**:
- User → Comments (One-to-Many)
- Event → Comments (One-to-Many)
- Event ↔ Tags (Many-to-Many via EventTags junction table)

## Project Structure

```
SEEUConnect/
├── .github/workflows/
│   └── ci-cd.yml                    # GitHub Actions CI/CD pipeline
│
├── SEEUConnect.Backend/
│   └── SEEUConnect.Backend/
│       ├── Controllers/
│       │   ├── AuthController.cs    # Login & Register endpoints
│       │   └── EventsController.cs  # Event CRUD endpoints
│       ├── Models/
│       │   ├── User.cs              # User entity
│       │   ├── Event.cs             # Event entity
│       │   ├── Comment.cs           # Comment entity
│       │   ├── Tag.cs               # Tag entity
│       │   └── EventTag.cs          # Junction table entity
│       ├── DTOs/
│       │   └── AuthDTOs.cs          # Register, Login, AuthResponse DTOs
│       ├── Services/
│       │   ├── IEventService.cs     # Service interface
│       │   └── EventService.cs      # Business logic & validation
│       ├── Repositories/
│       │   ├── IEventRepository.cs  # Repository interface
│       │   └── EventRepository.cs   # Data access layer
│       ├── Data/
│       │   └── AppDbContext.cs       # EF Core DbContext
│       ├── Migrations/              # EF Core database migrations
│       ├── Program.cs               # App configuration & middleware
│       └── appsettings.json         # Configuration
│
├── client/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Index.tsx            # Home page (event listing)
│   │   │   ├── Login.tsx            # Auth page (login/register)
│   │   │   └── NotFound.tsx         # 404 page
│   │   ├── components/              # Reusable UI components
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx       # Auth state management
│   │   └── config/
│   │       └── api.ts               # API endpoint configuration
│   ├── .env.development             # Dev environment (localhost)
│   └── .env.production              # Prod environment (Azure URL)
│
└── README.md
```

## Getting Started

### Prerequisites

- [.NET 10.0 SDK](https://dotnet.microsoft.com/download)
- [Node.js 20+](https://nodejs.org/)
- SQL Server LocalDB (included with Visual Studio)

### Backend Setup

```bash
cd SEEUConnect.Backend/SEEUConnect.Backend

# Restore packages
dotnet restore

# Apply database migrations
dotnet ef database update

# Run the API (http://localhost:5056)
dotnet run
```

### Frontend Setup

```bash
cd client

# Install dependencies
npm install

# Run dev server (http://localhost:8081)
npm run dev
```

### Environment Variables

| Variable | Dev Value | Description |
|----------|-----------|-------------|
| `VITE_API_URL` | `http://localhost:5056` | Backend API base URL |

## CI/CD Pipeline

The GitHub Actions pipeline runs automatically on every push to `master`:

```
Push to master
     │
     ├── Job 1: Build & Test Backend (.NET 10.0)
     │        └── dotnet restore → build → publish → upload artifact
     │
     ├── Job 2: Build Frontend (Node.js 20)
     │        └── npm ci → npm run build → upload artifact
     │
     └── Job 3: Deploy to Azure
              └── Download artifacts → Copy frontend to wwwroot → Deploy to App Service
```

Both the React frontend and .NET API are served from a single Azure App Service, with the frontend deployed as static files in `wwwroot`.

## Azure Deployment

| Resource | Service | Region |
|----------|---------|--------|
| Backend + Frontend | Azure App Service (Free F1) | France Central |
| Database | Azure SQL Database (Basic) | France Central |

### Key Configuration (Azure App Settings)

- `ConnectionStrings__DefaultConnection` - Azure SQL connection string
- `Jwt__Key` - JWT signing key
- `Jwt__Issuer` - Token issuer (`SEEUConnect`)
- `Jwt__Audience` - Token audience (`SEEUConnectUsers`)

## .NET Concepts Demonstrated

| Concept | Implementation |
|---------|---------------|
| **Dependency Injection** | `AddScoped<IEventRepository, EventRepository>()` in Program.cs |
| **Repository Pattern** | `IEventRepository` / `EventRepository` for data access abstraction |
| **Service Layer** | `IEventService` / `EventService` for business logic separation |
| **Entity Framework Core** | Code-first approach with migrations, DbContext, relationships |
| **JWT Authentication** | `AddAuthentication().AddJwtBearer()` with token validation |
| **Authorization** | `[Authorize]` and `[Authorize(Roles = "Admin")]` attributes |
| **Password Hashing** | BCrypt.Net for secure password storage |
| **CORS** | Configured policy for cross-origin requests |
| **DTOs** | Data Transfer Objects for API request/response separation |
| **Entity Relationships** | One-to-Many (User→Comments) and Many-to-Many (Event↔Tags) |
| **Middleware Pipeline** | Auth → CORS → Static Files → Routing → Controllers |
| **Configuration** | `appsettings.json` with environment overrides |

---

**Course**: .NET Programming - South East European University
**Student**: ma31558@seeu.edu.mk
**Semester**: Spring 2026
