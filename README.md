# LiveKit Server Controller

A NestJS application for controlling and managing a local LiveKit server. This project provides a REST API to create rooms, manage participants, generate access tokens, and more.

## 🚀 Features

- **Room Management**: Create, list, update, and delete LiveKit rooms
- **Participant Management**: List participants, remove participants from rooms
- **Access Token Generation**: Generate JWT tokens for participants to join rooms
- **Track Control**: Mute/unmute participant tracks
- **REST API**: Easy-to-use REST endpoints for all LiveKit operations

## 📋 Prerequisites

Before running this project, you need to have a LiveKit server running locally.

### Installing and Running LiveKit Server

#### Option 1: Using Cli (Recommended)

```bash
livekit-server --dev
```

#### Option 2: Using Binary

1. Download the latest LiveKit server from [GitHub Releases](https://github.com/livekit/livekit/releases)
2. Create a config file `livekit.yaml`:

```yaml
port: 7880
rtc:
  port_range_start: 50000
  port_range_end: 60000
  use_external_ip: false
keys:
  devkey: secret
```

3. Run the server:

```bash
./livekit-server --config livekit.yaml --dev
```

## 🔧 Installation

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables:
   The `.env` file has been created with default values:

```env
LIVEKIT_URL=ws://localhost:7880
LIVEKIT_API_KEY=devkey
LIVEKIT_API_SECRET=secret
PORT=3000
```

Update these values if your LiveKit server uses different credentials.

## 🏃 Running the Application

```bash
# Development mode with auto-reload
npm run start:dev

# Production mode
npm run start:prod

# Debug mode
npm run start:debug
```

The API will be available at `http://localhost:3000`

## 📖 Swagger API Documentation

Interactive API documentation is available at:
```
http://localhost:3000/api
```

The Swagger UI provides:
- 📋 Complete API reference with all endpoints
- 🧪 Interactive "Try it out" functionality
- 📝 Request/response examples
- 🔍 Schema definitions
- 📦 Model documentation

You can also export the OpenAPI specification from the Swagger UI.

## 📚 API Endpoints

### Server Info

- **GET** `/livekit/info` - Get LiveKit server connection information

### Room Management

- **POST** `/livekit/rooms` - Create a new room
  ```json
  {
    "name": "my-room",
    "emptyTimeout": 300,
    "maxParticipants": 10
  }
  ```
- **GET** `/livekit/rooms` - List all rooms
- **GET** `/livekit/rooms/:roomName` - Get specific room details
- **PATCH** `/livekit/rooms/:roomName` - Update room settings
- **DELETE** `/livekit/rooms/:roomName` - Delete a room

### Participant Management

- **GET** `/livekit/rooms/:roomName/participants` - List participants in a room
- **DELETE** `/livekit/rooms/:roomName/participants/:participantIdentity` - Remove a participant

### Access Tokens

- **POST** `/livekit/token` - Create an access token for a participant
  ```json
  {
    "roomName": "my-room",
    "participantName": "user-123",
    "metadata": "optional-metadata",
    "canPublish": true,
    "canSubscribe": true,
    "canPublishData": true
  }
  ```

### Track Control

- **POST** `/livekit/rooms/:roomName/participants/:participantIdentity/mute?trackSid=xxx&muted=true` - Mute/unmute a track

## 🧪 Example Usage

### Creating a Room

```bash
curl -X POST http://localhost:3000/livekit/rooms \
  -H "Content-Type: application/json" \
  -d '{"name": "test-room", "maxParticipants": 5}'
```

### Generating an Access Token

```bash
curl -X POST http://localhost:3000/livekit/token \
  -H "Content-Type: application/json" \
  -d '{
    "roomName": "test-room",
    "participantName": "john-doe"
  }'
```

### Listing All Rooms

```bash
curl http://localhost:3000/livekit/rooms
```

### Deleting a Room

```bash
curl -X DELETE http://localhost:3000/livekit/rooms/test-room
```

## 🏗️ Project Structure

```
src/
├── livekit/
│   ├── dto/
│   │   ├── create-room.dto.ts
│   │   ├── create-token.dto.ts
│   │   ├── update-room.dto.ts
│   │   └── index.ts
│   ├── livekit.controller.ts
│   ├── livekit.service.ts
│   └── livekit.module.ts
├── app.module.ts
└── main.ts
```

## 🔒 Security Notes

- The default configuration uses development credentials (`devkey`/`secret`)
- **DO NOT** use these credentials in production
- Configure CORS properly for production environments (currently set to `*`)
- Store sensitive credentials in environment variables or secure vaults

## 🛠️ Development

```bash
# Run tests
npm run test

# Run e2e tests
npm run test:e2e

# Run test coverage
npm run test:cov

# Lint and format
npm run lint
npm run format
```

## 📖 Additional Resources

- **Swagger API Docs**: `http://localhost:3000/api`
- [LiveKit Documentation](https://docs.livekit.io/)
- [LiveKit Server SDK](https://github.com/livekit/server-sdk-js)
- [NestJS Documentation](https://docs.nestjs.com)
- [Swagger/OpenAPI](https://swagger.io/)

## 🤝 Support

For issues related to:

- **LiveKit Server**: [LiveKit GitHub Issues](https://github.com/livekit/livekit/issues)
- **This Controller**: Create an issue in this repository

## 📝 License

This project is [MIT licensed](LICENSE).
