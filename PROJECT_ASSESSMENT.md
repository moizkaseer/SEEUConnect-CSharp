# SEEUConnect - Project Requirements Assessment

**Date**: February 7, 2026
**Current Status**: Early Development Phase
**Estimated Completion**: ~40% of minimum requirements

---

## 📊 SCORING BREAKDOWN (Against 30 Point Total)

### 1. Final Project Presentation (5/30) - **TBD**
- Cannot assess until presentation
- ⚠️ **Action Required**: Prepare 12-minute presentation covering problem, solution, design process, and demo

---

### 2. Final Project & Paper Submission (25/30)

#### 2.1 Paper Submission (2/25) - **❌ NOT STARTED (0/2)**
- ❌ No paper document created
- ❌ Not formatted according to template
- **Action Required**: Write final paper describing your project

---

#### 2.2 NET Core Web API Implementation (12/25) - **⚠️ PARTIAL (2-4/12)**

##### ✅ 2.2.1 Basic Service - CRUD Operations (4/12) - **PARTIAL (2/4)**

**What You Have:**
- ✅ Event model with basic properties
- ✅ GET all events endpoint
- ✅ GET event by ID endpoint
- ✅ POST create event endpoint
- ✅ SQL Server database with EF Core
- ✅ Proper migrations setup

**What's Missing:**
- ❌ **PUT/PATCH** update endpoint
- ❌ **DELETE** endpoint
- ❌ Proper HTTP status codes (201 Created, 204 No Content, etc.)
- ❌ Input validation on endpoints
- ❌ Error handling with appropriate status codes (400, 404, 500)

**Current Score Estimate**: 2/4 (only 2 of 4 CRUD operations)

---

##### ❌ 2.2.2 Repository with Business Logic (8/12) - **NOT IMPLEMENTED (0/8)**

**Critical Issues:**
- ❌ **No Repository Pattern** - Controller directly uses DbContext
- ❌ **No Service Layer** - No business logic separation
- ❌ **No Dependency Injection** - Not using interfaces for repositories
- ❌ **No Business Logic** - No validation, filtering, calculated fields
- ❌ **No DTOs** - Models exposed directly in API

**Required Implementation:**
```csharp
// Need to create:
1. IEventRepository interface
2. EventRepository implementation
3. IEventService interface
4. EventService with business logic
5. Inject into EventsController via DI
6. Add business rules (validation, filtering, search)
```

**Current Score Estimate**: 0/8

---

##### ❌ 2.2.3 Complex Logic & Data Relationships (12/12) - **NOT IMPLEMENTED (0/12)**

**Critical Issues:**
- ❌ **Single Table Database** - Only `Events` table exists
- ❌ **No Relationships** - No foreign keys or navigation properties
- ❌ **Tags as Strings** - Stored as comma-delimited text (should be separate entity)
- ❌ **No Users Entity** - Cannot track who created events
- ❌ **No Votes Tracking** - Vote count stored but no Vote entity
- ❌ **No Comments/Attendance** - Missing potential related entities

**Recommended Entity Structure:**
```
User (1) ----< (many) Events
User (1) ----< (many) Votes >---< (many) Events  [Many-to-Many]
Event (1) ----< (many) Comments
Event (1) ----< (many) EventTags >---< (many) Tags [Many-to-Many]
User (1) ----< (many) Attendances >---< (many) Events [Many-to-Many]
```

**Required Implementation:**
- User entity with authentication
- Vote entity (user-event relationship)
- Comment entity (with replies?)
- Tag entity (many-to-many with events)
- Attendance/RSVP entity
- Cascading deletes
- Complex queries (join operations, filtering by relationships)

**Current Score Estimate**: 0/12

---

**Total Web API Score**: **2/12** (Only basic GET/POST implemented)

---

#### 2.3 Authentication and Authorization (7/25) - **❌ NOT IMPLEMENTED (0/7)**

##### ❌ 2.3.1 User Login (2/7) - **NOT STARTED (0/2)**
- ❌ No user authentication system
- ❌ No login endpoint
- ❌ No password hashing
- ❌ No JWT token generation
- ❌ No Identity framework or custom auth

**Required Implementation:**
```csharp
// Need to add:
- Microsoft.AspNetCore.Identity.EntityFrameworkCore
- Microsoft.AspNetCore.Authentication.JwtBearer
- User entity (ApplicationUser : IdentityUser)
- POST /api/auth/register
- POST /api/auth/login (returns JWT token)
- Password hashing with BCrypt or Identity
```

---

##### ❌ 2.3.2 Role-Based Authorization (2/7) - **NOT STARTED (0/2)**
- ❌ No roles defined (Admin, User, Moderator, etc.)
- ❌ No role assignment
- ❌ No authorization policies

**Required Implementation:**
```csharp
// Need to add:
- Role seeding (Admin, User)
- User-Role assignment
- Claims-based authorization
- [Authorize(Roles = "Admin")] attributes
```

---

##### ❌ 2.3.3 Secured Endpoints (3/7) - **NOT STARTED (0/3)**
- ❌ No endpoints protected with [Authorize]
- ❌ No token validation middleware
- ❌ All endpoints publicly accessible

**Required Implementation:**
```csharp
// Need to add:
- JWT Bearer authentication middleware
- [Authorize] attributes on controllers/actions
- Token validation on each request
- 401 Unauthorized responses for unauthenticated users
- 403 Forbidden for unauthorized actions
```

---

**Total Auth Score**: **0/7** (Critical missing component)

---

#### 2.4 Azure Deployment (4/25) - **❌ NOT IMPLEMENTED (0/4)**

##### ❌ 2.4.1 Successful Azure Deployment (2/4) - **NOT DEPLOYED (0/2)**
- ❌ Not deployed to Azure App Service
- ❌ No Azure SQL Database
- ❌ No production environment configured
- ⚠️ Docker setup exists but not deployed

**Required Actions:**
1. Create Azure account (students get free credits)
2. Create App Service (Linux)
3. Create Azure SQL Database
4. Update connection strings
5. Deploy backend API
6. Deploy frontend (Azure Static Web Apps or Blob Storage)

---

##### ❌ 2.4.2 CI/CD Pipeline (2/4) - **NOT IMPLEMENTED (0/2)**
- ❌ No GitHub Actions workflows
- ❌ No automated testing
- ❌ No automated deployment
- ❌ No build pipeline

**Required Implementation:**
```yaml
# Need to create: .github/workflows/deploy.yml
# With:
- Automated builds on push to main
- Run unit tests
- Deploy to Azure on success
```

---

**Total Azure Score**: **0/4** (Can be done quickly near deadline)

---

### 2.5 Bonus Points - **⚠️ PARTIAL (~2-3 bonus points possible)**

#### ✅ GitHub Usage - **PARTIAL (+1 point)**
- ✅ Git repository initialized
- ✅ Some commits present
- ⚠️ Commit messages could be more descriptive
- ❌ No README.md yet

**To Maximize**:
- Make frequent commits with clear messages
- Create comprehensive README with setup instructions
- Document API endpoints
- Include screenshots

---

#### ✅ Front-End Development - **PARTIAL (+1-2 points)**
- ✅ React + TypeScript frontend
- ✅ Modern UI with Tailwind CSS
- ✅ Component-based architecture
- ✅ API integration (needs port fix)
- ⚠️ **BUG**: Frontend points to port 9091 (wrong backend)
- ❌ No authentication UI
- ❌ No user profiles

**To Maximize**:
- Fix API endpoint URLs to match .NET backend
- Add login/register pages
- Add protected routes
- Add user dashboard

---

#### ❌ Advanced Services/Features - **NOT IMPLEMENTED (0 points)**
- ❌ No email notifications
- ❌ No file uploads
- ❌ No caching
- ❌ No third-party API integration
- ❌ Newsletter subscription incomplete (backend missing)

---

**Total Bonus Estimate**: **+2-3 points** (out of possible ~5)

---

## 🎯 FINAL SCORE ESTIMATE

| Component | Points Available | Current Score | Status |
|-----------|------------------|---------------|--------|
| **Presentation** | 5 | TBD | Not yet |
| **Paper** | 2 | 0 | ❌ Not started |
| **Web API - Basic CRUD** | 4 | 2 | ⚠️ Partial |
| **Web API - Repository** | 8 | 0 | ❌ Missing |
| **Web API - Complex** | 12 | 0 | ❌ Missing |
| **Auth - Login** | 2 | 0 | ❌ Missing |
| **Auth - Roles** | 2 | 0 | ❌ Missing |
| **Auth - Secured** | 3 | 0 | ❌ Missing |
| **Azure - Deployment** | 2 | 0 | ❌ Missing |
| **Azure - CI/CD** | 2 | 0 | ❌ Missing |
| **Bonus Points** | ~5 | ~2 | ⚠️ Partial |
| **TOTAL** | **30+** | **~4/30** | 🚨 **Critical** |

---

## 🚨 CRITICAL MISSING COMPONENTS (High Priority)

### Priority 1 - MUST HAVE (17 points total)
1. **Complete CRUD Operations** (2 more points)
   - Add UPDATE (PUT) endpoint
   - Add DELETE endpoint
   - Proper status codes

2. **Repository Pattern + Business Logic** (8 points)
   - Create repository interfaces
   - Implement repositories
   - Add service layer
   - Add validation, filtering, search

3. **Authentication System** (7 points)
   - Add ASP.NET Core Identity
   - JWT token authentication
   - Login/Register endpoints
   - Secure endpoints with [Authorize]
   - Role-based authorization

---

### Priority 2 - SHOULD HAVE (12 points + paper)
4. **Complex Data Relationships** (12 points)
   - User entity
   - Vote entity (many-to-many)
   - Tag entity (many-to-many)
   - Comment entity
   - Foreign key relationships
   - Cascading operations
   - Complex queries

5. **Final Paper** (2 points)
   - Document your project
   - Follow template format

---

### Priority 3 - GOOD TO HAVE (4 points)
6. **Azure Deployment** (4 points)
   - Deploy to Azure
   - Set up CI/CD pipeline
   - *Note: Can be done in final days*

---

## 📋 RECOMMENDED ACTION PLAN

### Week 1: Complete Basic Requirements (9 points)
- [ ] Add UPDATE and DELETE endpoints
- [ ] Implement repository pattern
- [ ] Create service layer with business logic
- [ ] Add input validation
- [ ] Add DTOs

### Week 2: Authentication (7 points)
- [ ] Install Identity framework
- [ ] Create User entity
- [ ] Implement JWT authentication
- [ ] Add login/register endpoints
- [ ] Secure API endpoints
- [ ] Add role-based authorization
- [ ] Create login UI in frontend

### Week 3: Complex Relationships (12 points)
- [ ] Design entity relationships
- [ ] Create Vote, Tag, Comment entities
- [ ] Implement many-to-many relationships
- [ ] Add cascading deletes
- [ ] Create complex queries
- [ ] Test relationships thoroughly

### Week 4: Polish & Deploy (6 points + presentation)
- [ ] Fix frontend-backend connection
- [ ] Write final paper
- [ ] Deploy to Azure
- [ ] Set up CI/CD
- [ ] Create comprehensive README
- [ ] Prepare presentation
- [ ] Record demo video

---

## 🔧 TECHNICAL DEBT TO ADDRESS

### Backend Issues
1. **Port Configuration** - .NET backend needs to run on consistent port
2. **CORS Policy** - `AllowAnyOrigin()` is insecure for production
3. **Connection String** - Should use environment variables
4. **Error Handling** - No global exception handling
5. **Logging** - Minimal logging configuration
6. **Validation** - Only basic `[Required]` attributes

### Frontend Issues
1. **❗ CRITICAL BUG**: API calls point to `http://localhost:9091` (wrong port)
   - Should match .NET backend port (typically 5000/5001 or configured port)
2. **Newsletter Subscription** - Backend endpoint doesn't exist
3. **Vote Persistence** - Votes not saved to database
4. **No Authentication** - No login/protected routes
5. **No Error Boundaries** - React error handling missing

### Database Issues
1. **No Relationships** - Single flat table
2. **Tag Storage** - Should be separate entity, not comma-delimited string
3. **No Indexes** - Performance optimization needed
4. **No Seeding** - No initial data

---

## 💡 QUICK WINS (Do These First)

### 1. Fix Port Configuration (15 minutes)
```json
// appsettings.json - Add explicit port
"Kestrel": {
  "Endpoints": {
    "Http": {
      "Url": "http://localhost:5000"
    }
  }
}
```

```typescript
// client/src/pages/Index.tsx - Fix API URL
const API_URL = 'http://localhost:5000/api/events'; // Match .NET backend
```

### 2. Complete CRUD (1 hour)
Add UPDATE and DELETE endpoints to EventsController

### 3. Add Repository Pattern (2-3 hours)
Create IEventRepository, EventRepository, and inject into controller

### 4. Write README (1 hour)
Document setup instructions, API endpoints, project structure

---

## 📚 RECOMMENDED PACKAGES TO ADD

### Backend
```bash
dotnet add package Microsoft.AspNetCore.Identity.EntityFrameworkCore
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add package BCrypt.Net-Next
dotnet add package FluentValidation.AspNetCore
```

### Testing (Optional but recommended)
```bash
dotnet add package xUnit
dotnet add package Moq
dotnet add package Microsoft.AspNetCore.Mvc.Testing
```

---

## 🎓 RESOURCES

### Authentication Tutorials
- [JWT Authentication in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/security/authentication)
- [ASP.NET Core Identity](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity)

### Repository Pattern
- [Repository Pattern in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/repository-pattern)

### Azure Deployment
- [Deploy ASP.NET Core to Azure](https://learn.microsoft.com/en-us/azure/app-service/quickstart-dotnetcore)
- [Azure for Students](https://azure.microsoft.com/en-us/free/students/)

---

## ⚠️ WARNINGS

1. **Time Management**: You have significant work remaining. Start immediately.
2. **Authentication is Critical**: Worth 7 points and blocks other features
3. **Complex Relationships**: Worth 12 points - most valuable component
4. **Don't Over-Engineer**: Focus on requirements, not extra features
5. **Test Regularly**: Make sure everything works before moving to next step
6. **Commit Often**: Show development process in Git history

---

## ✅ NEXT IMMEDIATE STEPS

1. **Today**: Fix the port configuration bug
2. **Today**: Add UPDATE and DELETE endpoints
3. **Tomorrow**: Start repository pattern implementation
4. **This Week**: Complete authentication system
5. **Next Week**: Implement complex relationships

---

**Last Updated**: February 7, 2026
**Status**: 🔴 Significant work required - Start immediately!
