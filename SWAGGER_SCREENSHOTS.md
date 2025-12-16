# Swagger UI Visual Guide

## What You'll See

When you visit `http://localhost:3000/api`, you'll see the Swagger UI interface with:

### 1. Header Section
```
┌─────────────────────────────────────────────────────────────┐
│  LiveKit Server Controller API                    v1.0      │
│  REST API for controlling and managing LiveKit server       │
└─────────────────────────────────────────────────────────────┘
```

### 2. Server Selection
```
Servers:
▼ http://localhost:3000 - Local development server
  https://your-production-url.com - Production server
```

### 3. Endpoint Groups (Tags)

#### livekit
All LiveKit-related endpoints grouped together

```
┌─ livekit ──────────────────────────────────────────────────┐
│                                                              │
│  GET    /livekit/info                                       │
│         Get server information                              │
│                                                              │
│  POST   /livekit/rooms                                      │
│         Create a new room                                   │
│                                                              │
│  GET    /livekit/rooms                                      │
│         List all rooms                                      │
│                                                              │
│  GET    /livekit/rooms/{roomName}                          │
│         Get room details                                    │
│                                                              │
│  PATCH  /livekit/rooms/{roomName}                          │
│         Update room settings                                │
│                                                              │
│  DELETE /livekit/rooms/{roomName}                          │
│         Delete a room                                       │
│                                                              │
│  GET    /livekit/rooms/{roomName}/participants             │
│         List participants                                   │
│                                                              │
│  DELETE /livekit/rooms/{roomName}/participants/{identity}  │
│         Remove participant                                  │
│                                                              │
│  POST   /livekit/token                                      │
│         Generate access token                               │
│                                                              │
│  POST   /livekit/rooms/{roomName}/participants/{identity}/mute │
│         Mute/unmute participant track                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 4. Expanded Endpoint View

When you click on an endpoint, you'll see:

```
POST /livekit/rooms
Create a new room
Creates a new LiveKit room with specified settings

┌─ Parameters ────────────────────────────────────────────────┐
│  (No parameters)                                             │
└──────────────────────────────────────────────────────────────┘

┌─ Request body ──────────────────────────────────────────────┐
│  application/json                                            │
│                                                              │
│  CreateRoomDto *required                                     │
│                                                              │
│  Example Value | Schema                                      │
│                                                              │
│  {                                                           │
│    "name": "my-meeting-room",                               │
│    "emptyTimeout": 300,                                      │
│    "maxParticipants": 10                                     │
│  }                                                           │
│                                                              │
│  [Try it out]                                                │
└──────────────────────────────────────────────────────────────┘

┌─ Responses ─────────────────────────────────────────────────┐
│  Code  Description                                           │
│  201   Room created successfully                             │
│  400   Invalid request data                                  │
│  409   Room already exists                                   │
└──────────────────────────────────────────────────────────────┘
```

### 5. "Try it out" Mode

After clicking "Try it out":

```
POST /livekit/rooms

┌─ Request body ──────────────────────────────────────────────┐
│  {                                                           │
│    "name": "my-meeting-room",        [editable]            │
│    "emptyTimeout": 300,              [editable]            │
│    "maxParticipants": 10             [editable]            │
│  }                                                           │
│                                                              │
│  [Execute]  [Cancel]                                         │
└──────────────────────────────────────────────────────────────┘
```

### 6. Response View

After executing:

```
┌─ Responses ─────────────────────────────────────────────────┐
│                                                              │
│  Code: 201                                                   │
│  Details: Room created successfully                          │
│                                                              │
│  Response body                                               │
│  {                                                           │
│    "sid": "RM_abc123xyz",                                   │
│    "name": "my-meeting-room",                               │
│    "emptyTimeout": 300,                                      │
│    "maxParticipants": 10,                                    │
│    "creationTime": "1234567890",                            │
│    "numParticipants": 0                                      │
│  }                                                           │
│                                                              │
│  Response headers                                            │
│  content-type: application/json; charset=utf-8              │
│                                                              │
│  Curl                                                        │
│  curl -X 'POST' \                                           │
│    'http://localhost:3000/livekit/rooms' \                  │
│    -H 'accept: application/json' \                          │
│    -H 'Content-Type: application/json' \                    │
│    -d '{"name":"my-meeting-room",...}'                      │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 7. Schema View

Click on "Schema" tab to see the data structure:

```
┌─ CreateRoomDto Schema ──────────────────────────────────────┐
│                                                              │
│  {                                                           │
│    name*         string                                      │
│                  Unique name for the room                    │
│                  Example: "my-meeting-room"                  │
│                                                              │
│    emptyTimeout  integer($int32)                            │
│                  Time in seconds before room is deleted      │
│                  Default: 300                                │
│                  Minimum: 0                                  │
│                                                              │
│    maxParticipants  integer($int32)                         │
│                     Maximum number of participants           │
│                     Default: 0                               │
│                     Minimum: 1                               │
│  }                                                           │
│                                                              │
│  * = required                                                │
└──────────────────────────────────────────────────────────────┘
```

## Color Coding

In the actual Swagger UI, you'll see color-coded HTTP methods:

- 🟢 **GET** - Green (retrieve data)
- 🔵 **POST** - Blue (create data)
- 🟡 **PATCH** - Orange (update data)
- 🔴 **DELETE** - Red (delete data)

## Interactive Features

### Search/Filter
```
┌─────────────────────────────────────────────────────────────┐
│  🔍 Filter by tag                                           │
└─────────────────────────────────────────────────────────────┘
```

### Expand/Collapse
- Click on any tag to expand/collapse all endpoints in that group
- Click "Expand Operations" to see all endpoints at once

### Model Definitions
At the bottom of the page:
```
┌─ Schemas ───────────────────────────────────────────────────┐
│  ▼ CreateRoomDto                                            │
│  ▼ CreateTokenDto                                           │
│  ▼ UpdateRoomDto                                            │
└─────────────────────────────────────────────────────────────┘
```

## Common UI Elements

### Success Badge
```
┌──────────┐
│ 200  ✓   │  Success response
└──────────┘
```

### Error Badge
```
┌──────────┐
│ 400  ✗   │  Bad Request
└──────────┘
```

### Required Field Indicator
```
fieldName *
         ↑
    (asterisk means required)
```

## Navigation Tips

1. **Scroll** to browse all endpoints
2. **Click tags** to jump to specific sections
3. **Use search** to find specific endpoints
4. **Click endpoint** to expand details
5. **Try it out** to test the API
6. **View schema** to understand data structure

## Mobile View

On mobile devices, the UI adapts:
- Endpoints stack vertically
- "Try it out" forms are touch-friendly
- Responses are scrollable
- All features remain accessible

## Keyboard Shortcuts

- **Tab** - Navigate between fields
- **Enter** - Submit/Execute request
- **Esc** - Cancel "Try it out" mode

## Browser Compatibility

Swagger UI works best on:
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers

## Tips for Best Experience

1. **Use Chrome DevTools** - Open alongside Swagger for debugging
2. **Keep console open** - See any errors immediately
3. **Bookmark the page** - Quick access to API docs
4. **Use "Try it out"** - Test before writing code
5. **Copy curl commands** - Use in scripts or terminal

## What Makes It Interactive?

Unlike static documentation, Swagger UI lets you:
- ✅ Execute real API calls
- ✅ See actual responses
- ✅ Test different parameters
- ✅ Validate your requests
- ✅ Copy working curl commands
- ✅ Understand data structures
- ✅ Export OpenAPI spec

## Next Steps

1. Visit `http://localhost:3000/api`
2. Try creating a room
3. Generate a token
4. Explore all endpoints
5. Use the generated curl commands in your code

---

The visual interface makes API exploration intuitive and testing effortless! 🎨

