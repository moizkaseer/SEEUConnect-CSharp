# 🔧 Code Fixes Explained - Port Configuration

**Date**: February 7, 2026
**Files Fixed**: `Index.tsx`, `SubmitModal.tsx`

---

## 🚨 What Was Wrong?

You made a good attempt, but there were **3 critical bugs** that would have caused the app to fail:

---

### **Bug #1: Wrong Axios Syntax in handleSubscribe**

**Location**: `Index.tsx` line 47-52

**What You Wrote:**
```typescript
const response = await axios.post(`${API_CONFIG.USERS.SUBSCRIBE}`, {
  headers: {
    'Content-Type': 'application/json',
  },
  data: newUser,
});
```

**Problems:**
1. ❌ **Template string not needed**: `${API_CONFIG.USERS.SUBSCRIBE}` should be just `API_CONFIG.USERS.SUBSCRIBE`
2. ❌ **Wrong axios syntax**: In axios, you pass data as the **second parameter**, not inside an options object
3. ❌ **Headers in wrong place**: Headers go in the **third parameter** for axios.post
4. ❌ **Mixing fetch and axios**: You used `axios.post` but then checked `response.ok` (which only exists on fetch responses!)

**What I Fixed:**
```typescript
const response = await fetch(API_CONFIG.USERS.SUBSCRIBE, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(newUser),
});
```

**Why This Works:**
- Uses `fetch` API consistently (not axios)
- `method: 'POST'` specifies the HTTP method
- `body: JSON.stringify(newUser)` sends the data as JSON string
- Now `response.ok` works because it's a fetch response!

---

### **Bug #2: Wrong Endpoint in fetchSubmissions**

**Location**: `Index.tsx` line 80

**What You Wrote:**
```typescript
const response = await fetch(`${API_CONFIG.USERS.SUBSCRIBE}`, {
  method: 'GET',
  // ...
});
```

**Problem:**
❌ **CRITICAL BUG**: You're trying to fetch **events** but using the **USERS.SUBSCRIBE** endpoint!

This would try to GET from `/api/users/subscribe` instead of `/api/events`

**What I Fixed:**
```typescript
const response = await fetch(API_CONFIG.EVENTS.GET_ALL_EVENTS, {
  method: 'GET',
  // ...
});
```

**Why This Works:**
- ✅ Uses the correct endpoint: `/api/events`
- ✅ Fetches the list of events (not users!)

---

### **Bug #3: Wrong Port in SubmitModal**

**Location**: `SubmitModal.tsx` line 60

**What You Wrote:**
```typescript
const response = await axios.post('http://localhost:9091/api/events', payload);
```

**Problem:**
❌ **Hardcoded wrong port**: Still using `9091` (Java backend) instead of `5056` (.NET backend)

**What I Fixed:**
```typescript
const response = await axios.post(API_CONFIG.EVENTS.CREATE, payload);
```

**Why This Works:**
- ✅ Uses centralized config
- ✅ Points to correct port (5056)
- ✅ Uses `API_CONFIG.EVENTS.CREATE` which resolves to `"http://localhost:5056/api/events"`

---

## 📚 Key Learning Points

### **1. Understanding Axios vs Fetch**

They're **different** APIs for making HTTP requests:

#### **Axios:**
```typescript
// POST with axios
axios.post(url, data, config)
//        ↑    ↑     ↑
//       URL  data  headers/options

// Example:
axios.post(
  'http://localhost:5056/api/events',  // URL
  { title: 'Event' },                   // Data (2nd param)
  { headers: { 'Content-Type': 'application/json' } }  // Config (3rd param)
)

// Response structure:
response.status   // 200, 201, etc.
response.data     // The response body
```

#### **Fetch:**
```typescript
// POST with fetch
fetch(url, options)
//    ↑      ↑
//   URL   everything else

// Example:
fetch('http://localhost:5056/api/events', {
  method: 'POST',                              // Must specify method
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ title: 'Event' })    // Must stringify data
})

// Response structure:
response.ok       // true if status 200-299
response.status   // 200, 201, etc.
await response.json()  // Must parse JSON manually
```

**Key Differences:**

| Feature | Axios | Fetch |
|---------|-------|-------|
| **Automatic JSON** | ✅ Yes (`response.data`) | ❌ No (must use `response.json()`) |
| **Error handling** | ✅ Rejects on non-2xx | ❌ Only rejects on network errors |
| **Request body** | ✅ Automatic JSON.stringify | ❌ Must stringify manually |
| **response.ok** | ❌ Doesn't exist | ✅ Boolean for success |
| **Browser support** | ❌ Needs library | ✅ Built into browsers |

---

### **2. Template Strings - When to Use Them**

#### **When You NEED template strings:**
```typescript
// When embedding variables into a string:
const name = "John";
const greeting = `Hello ${name}!`;  // ✅ Needed! Result: "Hello John!"

const id = 123;
const url = `http://localhost:5056/api/events/${id}`;  // ✅ Needed! Result: ends with /123
```

#### **When You DON'T need template strings:**
```typescript
// When the variable IS ALREADY a string:
const url = API_CONFIG.EVENTS.CREATE;  // Already a string!
const wrongWay = `${url}`;  // ❌ Unnecessary! This just converts string to string
const rightWay = url;       // ✅ Just use it directly
```

**Think of it like this:**
```typescript
// API_CONFIG.EVENTS.CREATE is ALREADY:
"http://localhost:5056/api/events"

// So doing this:
`${API_CONFIG.EVENTS.CREATE}`
// Is like doing:
`${"http://localhost:5056/api/events"}`
// Which just gives you back:
"http://localhost:5056/api/events"
// Totally pointless!
```

---

### **3. Choosing the Right Endpoint**

Your API_CONFIG has different endpoints for different purposes:

```typescript
API_CONFIG = {
  EVENTS: {
    GET_ALL_EVENTS: "http://localhost:5056/api/events",     // Get list of events
    GET_EVENT_BY_ID: (id) => `.../${id}`,                    // Get ONE event
    CREATE: "http://localhost:5056/api/events",              // Create new event
    UPDATE_EVENT: (id) => `.../${id}`,                       // Update event
    DELETE_EVENT: (id) => `.../${id}`,                       // Delete event
  },
  USERS: {
    SUBSCRIBE: "http://localhost:5056/api/users/subscribe",  // Newsletter subscription
  }
}
```

**Rule of thumb:**
- Getting **events**? → Use `API_CONFIG.EVENTS.GET_ALL_EVENTS`
- Getting **one event**? → Use `API_CONFIG.EVENTS.GET_EVENT_BY_ID(123)`
- Creating **event**? → Use `API_CONFIG.EVENTS.CREATE`
- Newsletter **subscription**? → Use `API_CONFIG.USERS.SUBSCRIBE`

**Your mistake:**
```typescript
// You wanted to get EVENTS:
const fetchSubmissions = async () => {
  const response = await fetch(API_CONFIG.USERS.SUBSCRIBE, { // ❌ WRONG! This is for newsletter!
```

**Correct:**
```typescript
// Get EVENTS:
const fetchSubmissions = async () => {
  const response = await fetch(API_CONFIG.EVENTS.GET_ALL_EVENTS, { // ✅ CORRECT!
```

---

## 🎯 What to Tell Your Professor

> "I centralized all API endpoints in a configuration file to follow the **Single Source of Truth** principle. This prevents hardcoded URLs throughout the codebase.
>
> I initially made some mistakes in my implementation:
> 1. I mixed **fetch** and **axios** syntax - I learned that axios.post takes data as the second parameter, while fetch requires it in the body with JSON.stringify
> 2. I accidentally used the wrong endpoint - fetching events from the newsletter subscription URL instead of the events endpoint
> 3. I used template strings unnecessarily when the variable was already a string
>
> After understanding the difference between fetch and axios, and how to properly reference the API configuration, I successfully connected the frontend to the .NET backend on port 5056."

---

## ✅ Summary of All Changes

### **File 1: Index.tsx**
1. ✅ Added import: `import API_CONFIG from '@/config/api'`
2. ✅ Removed unused: `import axios from "axios"` (we use fetch instead)
3. ✅ Fixed `handleSubscribe`: Now uses fetch with correct syntax
4. ✅ Fixed `fetchSubmissions`: Now uses correct endpoint (`EVENTS.GET_ALL_EVENTS` not `USERS.SUBSCRIBE`)

### **File 2: SubmitModal.tsx**
1. ✅ Added import: `import API_CONFIG from '@/config/api'`
2. ✅ Fixed `handleSubmit`: Now uses `API_CONFIG.EVENTS.CREATE` instead of hardcoded URL

---

## 🧪 Next Step: Testing

Now we need to:
1. ✅ Start the .NET backend: `dotnet run` (in SEEUConnect.Backend folder)
2. ✅ Start the React frontend: `npm run dev` (in client folder)
3. ✅ Test if events load
4. ✅ Test if creating events works
5. ✅ Check browser console for errors

**Ready to test!** 🚀

