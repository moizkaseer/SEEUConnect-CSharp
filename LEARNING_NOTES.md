# 🎓 SEEUConnect - Learning Notes & Explanations

**Your Name**: [Your Name Here]
**Project**: SEEUConnect - Campus Event Platform
**Date**: February 7, 2026

---

## 📚 TABLE OF CONTENTS
1. [Port Configuration & Client-Server Communication](#lesson-1)
2. [CRUD Operations](#lesson-2)
3. [Repository Pattern](#lesson-3)
4. [Service Layer & Business Logic](#lesson-4)
5. [Entity Relationships](#lesson-5)
6. [Authentication & Authorization](#lesson-6)

---

<a name="lesson-1"></a>
## 🔌 LESSON 1: Port Configuration & Client-Server Communication

### **What is this? (The Concept)**

In a web application, you have two separate programs talking to each other:
- **Frontend (Client)**: React app running in the browser - the "face" of your app
- **Backend (Server)**: .NET API running on your computer - the "brain" of your app

These two programs are **separate processes** and need to communicate over the network.

### **Real-World Analogy**

Imagine a restaurant:
- **Frontend** = Waiter (talks to customers, shows menu, takes orders)
- **Backend** = Kitchen (cooks food, manages inventory, has recipes)
- **Port** = Kitchen window number (which window the waiter goes to)

If the waiter goes to the wrong window (wrong port), they can't get food!

### **Technical Explanation**

**Port Numbers** are like apartment numbers in a building:
- Your computer (localhost) is the building
- Port 5056 = Apartment 5056 (.NET backend lives here)
- Port 9091 = Apartment 9091 (nobody home - Java backend was supposed to be here)
- Port 8081 = Apartment 8081 (React frontend lives here)

### **Your Current Problem**

```
Frontend (React) ---X--> Port 9091 (Empty!)

Frontend (React) ---✓--> Port 5056 (.NET Backend) ← We need this!
```

**Why Port 9091?**
- Someone probably started this project with a Java backend on port 9091
- Then switched to .NET but forgot to update the frontend
- Result: Frontend is knocking on the wrong door!

### **How Ports Are Configured**

#### **Backend Port Configuration**
File: `launchSettings.json`
```json
{
  "profiles": {
    "http": {
      "applicationUrl": "http://localhost:5056"  ← Backend listens here
    },
    "https": {
      "applicationUrl": "https://localhost:7052;http://localhost:5056"
    }
  }
}
```

**What this means:**
- When you run `dotnet run`, your backend starts listening on port 5056
- It's like opening a store at address "5056 Main Street"
- Anyone who wants to talk to your backend must go to "localhost:5056"

#### **Frontend API Configuration**
File: `Index.tsx` and `SubmitModal.tsx`
```typescript
const response = await axios.get("http://localhost:9091/api/events");
                                                    ^^^^
                                                   WRONG PORT!
```

**The Fix:**
```typescript
const response = await axios.get("http://localhost:5056/api/events");
                                                    ^^^^
                                                   CORRECT!
```

### **Best Practice: Environment Variables**

Instead of hardcoding `http://localhost:5056` everywhere, we use **environment variables**:

```typescript
// .env.development
VITE_API_URL=http://localhost:5056/api

// In your code
const API_URL = import.meta.env.VITE_API_URL;
const response = await axios.get(`${API_URL}/events`);
```

**Benefits:**
1. **Change once, affect everywhere** - No need to search/replace
2. **Different environments** - Development vs Production URLs
3. **Security** - Don't expose production URLs in code
4. **Professional** - Industry standard practice

### **What to Tell Your Professor**

> "Professor, our application uses a **client-server architecture**. The React frontend runs on port 8081 and makes HTTP requests to the .NET backend API on port 5056.
>
> We configure the backend port in `launchSettings.json`, which tells ASP.NET Core which port to listen on when we run `dotnet run`.
>
> The frontend needs to know this port to make API calls. We use **environment variables** to store this configuration, following industry best practices. This allows us to easily change the backend URL for different environments (development, staging, production) without modifying the code.
>
> Previously, there was a **port mismatch** - the frontend was calling port 9091 (a Java backend) while our .NET backend was on port 5056. We fixed this by creating a centralized API configuration."

---

### **The Fix (What We're About to Do)**

We'll fix this in 3 steps:
1. ✅ **Verify backend port** - Confirm .NET runs on 5056
2. 🔧 **Create API configuration** - Centralize the URL
3. 🔧 **Update all API calls** - Use the centralized URL

---

## 🔍 Understanding HTTP Requests

When frontend talks to backend, it uses **HTTP methods**:

| Method | Purpose | Example | Database Operation |
|--------|---------|---------|-------------------|
| **GET** | Read data | Get all events | SELECT |
| **POST** | Create new | Submit new event | INSERT |
| **PUT** | Update existing | Edit event title | UPDATE |
| **DELETE** | Remove | Delete event | DELETE |

**Full URL Structure:**
```
http://localhost:5056/api/events/123
└─┬─┘ └────┬────┘└┬┘ └──┬──┘└─┬─┘
  │        │      │     │     │
Protocol  Host   Port  Path  ID
```

- **Protocol**: http or https (secure)
- **Host**: localhost (your computer) or a domain (seeuconnect.com)
- **Port**: 5056 (which service to talk to)
- **Path**: `/api/events` (which endpoint on the backend)
- **ID**: 123 (optional - specific resource)

---

## 🎯 Key Takeaways

1. **Frontend and Backend are separate programs** that communicate over HTTP
2. **Ports** identify which service to talk to
3. **Environment variables** store configuration (best practice)
4. **API calls** must use the correct protocol, host, and port
5. **CORS** allows frontend (port 8081) to talk to backend (port 5056)

---

**Next Lesson**: CRUD Operations - Understanding Create, Read, Update, Delete

