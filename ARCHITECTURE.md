# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
├─────────────────────────────────────────────────────────────────┤
│  Web Browser          Mobile App         Desktop App             │
│  (test-client.html)   (React Native)     (Electron)             │
└────────────┬──────────────────┬────────────────┬────────────────┘
             │                  │                │
             │ HTTP/REST        │ HTTP/REST      │ HTTP/REST
             │                  │                │
┌────────────▼──────────────────▼────────────────▼────────────────┐
│                    NestJS Controller API                         │
│                    (localhost:3000)                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              LiveKit Controller                           │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  Endpoints:                                         │  │  │
│  │  │  • POST   /livekit/rooms                           │  │  │
│  │  │  • GET    /livekit/rooms                           │  │  │
│  │  │  • DELETE /livekit/rooms/:name                     │  │  │
│  │  │  • POST   /livekit/token                           │  │  │
│  │  │  • GET    /livekit/rooms/:name/participants        │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │                           │                               │  │
│  │                           ▼                               │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │           LiveKit Service                          │  │  │
│  │  │  • createRoom()                                    │  │  │
│  │  │  • listRooms()                                     │  │  │
│  │  │  • deleteRoom()                                    │  │  │
│  │  │  • createToken()                                   │  │  │
│  │  │  • listParticipants()                              │  │  │
│  │  │  • muteParticipant()                               │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
└────────────┬─────────────────────────────────────────────────────┘
             │
             │ LiveKit Server SDK
             │ (WebSocket/gRPC)
             │
┌────────────▼─────────────────────────────────────────────────────┐
│                    LiveKit Server                                 │
│                    (localhost:7880)                               │
├───────────────────────────────────────────────────────────────────┤
│  • Room Management                                                │
│  • WebRTC Signaling                                               │
│  • Media Routing                                                  │
│  • Participant Management                                         │
└────────────┬──────────────────────────────────────────────────────┘
             │
             │ WebRTC (UDP/TCP)
             │
┌────────────▼──────────────────────────────────────────────────────┐
│                    Video/Audio Clients                             │
│  (Browser, Mobile, Desktop - using livekit-client SDK)            │
└────────────────────────────────────────────────────────────────────┘
```

## Component Breakdown

### 1. Client Layer
- **Web Clients**: Use REST API to manage rooms and get tokens
- **Test Client**: Included HTML page for testing
- **Mobile/Desktop**: Can integrate using HTTP requests

### 2. NestJS Application (Controller API)

#### LiveKit Module
```
livekit/
├── dto/                    # Data Transfer Objects
│   ├── create-room.dto.ts  # Validation for room creation
│   ├── create-token.dto.ts # Validation for token generation
│   └── update-room.dto.ts  # Validation for room updates
├── livekit.controller.ts   # HTTP endpoints
├── livekit.service.ts      # Business logic
└── livekit.module.ts       # Module configuration
```

#### Controller Layer
- Handles HTTP requests
- Validates input using DTOs
- Returns JSON responses
- Manages CORS and authentication

#### Service Layer
- Communicates with LiveKit server
- Implements business logic
- Error handling and logging
- Token generation

### 3. LiveKit Server
- WebRTC media server
- Handles real-time video/audio
- Room and participant management
- Runs independently (Docker or binary)

### 4. Video Clients
- Use tokens from Controller API
- Connect directly to LiveKit server
- Handle media streams
- Use LiveKit client SDKs

## Data Flow

### Creating a Room and Joining

```
1. Client Request
   ↓
   POST /livekit/rooms
   { "name": "my-room" }
   ↓
2. Controller validates request
   ↓
3. Service calls LiveKit SDK
   ↓
4. LiveKit Server creates room
   ↓
5. Response returns room details
   ↓
6. Client requests token
   ↓
   POST /livekit/token
   { "roomName": "my-room", "participantName": "user1" }
   ↓
7. Service generates JWT token
   ↓
8. Client receives token
   ↓
9. Client connects to LiveKit Server with token
   ↓
10. Video call established
```

## Technology Stack

### Backend (NestJS Controller)
- **Framework**: NestJS 11.x
- **Language**: TypeScript 5.x
- **Runtime**: Node.js
- **Validation**: class-validator, class-transformer
- **Configuration**: @nestjs/config

### LiveKit Integration
- **SDK**: livekit-server-sdk
- **Protocol**: WebSocket/gRPC
- **Authentication**: JWT tokens

### Frontend (Test Client)
- **Client SDK**: livekit-client
- **UI**: Vanilla HTML/CSS/JavaScript
- **Video**: WebRTC

## Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Client Application                                          │
└────────────┬────────────────────────────────────────────────┘
             │
             │ 1. Request Token
             │    (with user credentials)
             ▼
┌─────────────────────────────────────────────────────────────┐
│  Controller API                                              │
│  • Authenticate user (TODO: Add auth)                        │
│  • Validate permissions                                      │
│  • Generate JWT token with grants                            │
└────────────┬────────────────────────────────────────────────┘
             │
             │ 2. Return signed JWT
             │
┌────────────▼────────────────────────────────────────────────┐
│  Client                                                      │
│  • Receives token                                            │
│  • Connects to LiveKit Server                                │
└────────────┬────────────────────────────────────────────────┘
             │
             │ 3. Connect with token
             │
┌────────────▼────────────────────────────────────────────────┐
│  LiveKit Server                                              │
│  • Validates JWT signature                                   │
│  • Checks room permissions                                   │
│  • Allows/denies connection                                  │
└─────────────────────────────────────────────────────────────┘
```

## Configuration Flow

```
.env file
   ↓
ConfigModule (NestJS)
   ↓
LivekitService
   ↓
RoomServiceClient (SDK)
   ↓
LiveKit Server
```

### Environment Variables
- `LIVEKIT_URL`: WebSocket URL of LiveKit server
- `LIVEKIT_API_KEY`: API key for authentication
- `LIVEKIT_API_SECRET`: Secret for JWT signing
- `PORT`: HTTP port for Controller API

## Deployment Architecture

### Development
```
┌──────────────────┐
│  Docker          │
│  LiveKit Server  │
│  :7880           │
└──────────────────┘
         ↑
         │
┌──────────────────┐
│  Local           │
│  NestJS App      │
│  :3000           │
└──────────────────┘
```

### Production (Recommended)
```
┌─────────────────────────────────────────────────────┐
│  Load Balancer / Reverse Proxy (nginx)              │
└────────────┬────────────────────────────────────────┘
             │
      ┌──────┴──────┐
      ▼             ▼
┌──────────┐  ┌──────────┐
│ NestJS   │  │ NestJS   │  (Multiple instances)
│ Instance │  │ Instance │
└────┬─────┘  └────┬─────┘
     │             │
     └──────┬──────┘
            ▼
   ┌────────────────┐
   │ LiveKit Server │  (Can be clustered)
   │ or Cloud       │
   └────────────────┘
```

## API Request/Response Flow

### Example: Creating a Room

```
Request:
  POST /livekit/rooms
  Content-Type: application/json
  
  {
    "name": "my-room",
    "emptyTimeout": 300,
    "maxParticipants": 10
  }

Flow:
  1. Request hits Controller
  2. ValidationPipe validates DTO
  3. Controller calls Service.createRoom()
  4. Service calls RoomServiceClient.createRoom()
  5. SDK makes gRPC call to LiveKit Server
  6. LiveKit Server creates room
  7. Response flows back through layers

Response:
  201 Created
  Content-Type: application/json
  
  {
    "sid": "RM_xxxxx",
    "name": "my-room",
    "emptyTimeout": 300,
    "maxParticipants": 10,
    "creationTime": "1234567890",
    "numParticipants": 0
  }
```

## Error Handling

```
Client Request
   ↓
Controller (try/catch)
   ↓
Service (try/catch + logging)
   ↓
LiveKit SDK
   ↓
Error occurs
   ↓
Service logs error
   ↓
Service throws exception
   ↓
NestJS Exception Filter
   ↓
HTTP Error Response to Client
```

## Scalability Considerations

1. **Horizontal Scaling**: Multiple NestJS instances behind load balancer
2. **LiveKit Clustering**: Multiple LiveKit servers for high load
3. **Database**: Add database for persistent room metadata
4. **Caching**: Redis for token caching and rate limiting
5. **Message Queue**: For async operations and webhooks

## Future Enhancements

1. **Authentication Layer**: Add JWT auth for API
2. **Database Integration**: PostgreSQL for room history
3. **Webhooks**: Handle LiveKit server events
4. **Recording Service**: Manage recordings
5. **Analytics**: Track usage metrics
6. **Admin Dashboard**: Web UI for management

