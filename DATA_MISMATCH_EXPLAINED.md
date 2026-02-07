# 🐛 Data Mismatch Fix - Frontend vs Backend

**Error**: `AxiosError: Request failed with status code 400`
**Cause**: Frontend sending data in wrong format
**Date**: February 7, 2026

---

## 🔍 The Problem

**400 Bad Request** means the backend received your data but **rejected it** because the format doesn't match what it expects.

Think of it like ordering a pizza:
- You said: "I want a pizza with toppings: ['pepperoni', 'mushrooms']"
- Pizza place expects: "I want a pizza with toppings: 'pepperoni,mushrooms'"
- Result: "Sorry, we don't understand that format!" (400 error)

---

## 📋 What Was Wrong?

### **Issue #1: Property Name Casing**

**Backend (C#) uses PascalCase:**
```csharp
public class Event
{
    public string Title { get; set; }        // ← Capital T
    public string Description { get; set; }  // ← Capital D
    public string Location { get; set; }     // ← Capital L
    public string Category { get; set; }     // ← Capital C
}
```

**Frontend (JavaScript) was using camelCase:**
```javascript
const payload = {
  title: "Event",        // ❌ lowercase t
  description: "...",    // ❌ lowercase d
  location: "...",       // ❌ lowercase l
  category: "...",       // ❌ lowercase c
}
```

**Why this matters:**
- C# is **case-sensitive** for property names
- When you send `{ title: "..." }`, C# looks for a property called `title`
- But the property is called `Title` (capital T)
- C# says: "I don't have a property called 'title'" → 400 error!

---

### **Issue #2: Date/Time Format**

**Backend expects combined DateTime:**
```csharp
public DateTime Date { get; set; }  // "2026-02-07T10:00:00"
```

**Frontend was sending separate fields:**
```javascript
{
  date: "2026-02-07",  // ❌ Only date
  time: "10:00"        // ❌ Separate time (backend doesn't even have this property!)
}
```

**Why this matters:**
- .NET's `DateTime` expects: `"2026-02-07T10:00:00"` (ISO 8601 format)
- The `T` separates date from time
- Sending separate `date` and `time` confuses the backend
- Sending `time` property that doesn't exist in the model → ignored or error!

---

### **Issue #3: Tags Format**

**Backend expects comma-separated string:**
```csharp
public string Tags { get; set; }  // "tag1,tag2,tag3"
```

**Frontend was sending array:**
```javascript
{
  tags: ["tag1", "tag2", "tag3"]  // ❌ Array
}
```

**Why this matters:**
- C# `string` type expects text: `"tag1,tag2,tag3"`
- Sending an array `["tag1", "tag2"]` can't be converted to string
- Backend tries to convert and fails → 400 error!

---

## ✅ The Fix

I changed the `handleSubmit` function in `SubmitModal.tsx`:

### **Before (Wrong):**
```javascript
const payload = {
  title: formData.title,           // ❌ lowercase
  description: formData.description,
  location: formData.location,
  category: formData.category,
  date: formData.date,             // ❌ Only date
  time: formData.time,             // ❌ Extra field
  tags: formData.tags.split(',').map(tag => tag.trim())  // ❌ Array
};
```

### **After (Correct):**
```javascript
// 1. Combine date + time into DateTime format
const combinedDateTime = formData.time
  ? `${formData.date}T${formData.time}:00`  // "2026-02-07T10:00:00"
  : `${formData.date}T00:00:00`;             // Default to midnight

// 2. Create payload with PascalCase properties
const payload = {
  Title: formData.title,           // ✅ Capital T
  Description: formData.description, // ✅ Capital D
  Location: formData.location,     // ✅ Capital L
  Category: formData.category,     // ✅ Capital C
  Date: combinedDateTime,          // ✅ Combined DateTime
  Tags: formData.tags || '',       // ✅ String (already comma-separated)
  Votes: 0
};
```

---

## 📚 Key Concepts

### **1. PascalCase vs camelCase**

**PascalCase** (C#, .NET):
- Every word starts with capital letter
- `Title`, `FirstName`, `DateOfBirth`

**camelCase** (JavaScript):
- First word lowercase, rest capitalized
- `title`, `firstName`, `dateOfBirth`

**Why different?**
- C# convention: Public properties use PascalCase
- JavaScript convention: Variables/properties use camelCase
- When communicating between them, you must match the backend's format!

---

### **2. DateTime Format (ISO 8601)**

**Format**: `YYYY-MM-DDTHH:mm:ss`

Examples:
- `2026-02-07T10:30:00` = February 7, 2026, 10:30 AM
- `2026-12-25T00:00:00` = December 25, 2026, midnight
- `2026-01-01T23:59:59` = January 1, 2026, 11:59:59 PM

**Breaking it down:**
```
2026-02-07T10:30:00
└──┬──┘ └─┬─┘ └─┬─┘
  Year  Month Day
         │
         T = separator
         │
        └─────────┘
         Time (HH:mm:ss)
```

**How we create it:**
```javascript
const date = "2026-02-07";  // From date picker
const time = "10:30";       // From time picker

// Combine with T and add :00 for seconds
const dateTime = `${date}T${time}:00`;
// Result: "2026-02-07T10:30:00"
```

---

### **3. String vs Array**

**In JavaScript:**
```javascript
// Array
const tags = ["tag1", "tag2", "tag3"];

// String (comma-separated)
const tagsString = "tag1,tag2,tag3";

// Convert array to string
const tagsString = tags.join(',');  // "tag1,tag2,tag3"

// Convert string to array
const tags = tagsString.split(','); // ["tag1", "tag2", "tag3"]
```

**Why the backend uses strings:**
- Database column is `nvarchar` (text)
- Easier to store as comma-separated text
- Later we'll improve this with a separate Tags table (many-to-many relationship)

---

## 🎯 What to Tell Your Professor

> "I encountered a **400 Bad Request error** when submitting events from the frontend to the backend. After debugging, I identified a **data contract mismatch** between the frontend and backend.
>
> The issues were:
> 1. **Property naming**: JavaScript uses camelCase (`title`) but C# uses PascalCase (`Title`). C# property names are case-sensitive, so the mismatch caused the backend to reject the data.
>
> 2. **DateTime format**: The frontend was sending separate `date` and `time` fields, but .NET's `DateTime` expects a combined ISO 8601 format (`YYYY-MM-DDTHH:mm:ss`). I fixed this by concatenating them with a 'T' separator.
>
> 3. **Data types**: The frontend was converting tags to an array, but the backend expects a comma-separated string.
>
> I resolved this by transforming the frontend payload to match the backend's `Event` model structure before sending the POST request. This taught me the importance of ensuring data contracts align between client and server."

---

## 🧪 How to Test

1. **Start backend** (if not running):
   ```bash
   cd SEEUConnect.Backend/SEEUConnect.Backend
   dotnet run
   ```

2. **Start frontend** (if not running):
   ```bash
   cd client
   npm run dev
   ```

3. **Test creating an event:**
   - Open browser to `http://localhost:8081`
   - Click "Submit" button
   - Fill out the form:
     - Title: "Test Event"
     - Location: "Campus Center"
     - Category: "Event"
     - Date: Pick today
     - Time: "14:00"
     - Description: "Testing the fix"
     - Tags: "test,debug"
   - Click Submit

4. **Check for success:**
   - Should see "Submission successful!" toast
   - Event should appear in the list
   - Check browser console (F12) - should have no errors

5. **If it still fails:**
   - Open Network tab in DevTools (F12)
   - Look at the request payload
   - Look at the response error message
   - Share the error with me!

---

## 🔑 Key Takeaways

1. **Always match backend data contracts** - Property names, types, and formats must align
2. **C# uses PascalCase** - Remember to capitalize property names
3. **DateTime needs proper format** - Use ISO 8601: `YYYY-MM-DDTHH:mm:ss`
4. **Arrays vs Strings** - Know what the backend expects
5. **Use DevTools** - Network tab shows exactly what's being sent and received
6. **Read error messages** - 400 = data format problem, 404 = not found, 500 = server crash

---

**Status**: ✅ Fixed! Ready to test.

