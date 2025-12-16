# Quick Start Guide

This guide will help you get your LiveKit server and controller running in minutes.

## Step 1: Start LiveKit Server

First, you need to run a LiveKit server. Choose one of these options:

### Option A: Docker (Easiest)

```bash
docker run --rm -p 7880:7880 \
  -p 7881:7881 \
  -p 7882:7882/udp \
  -e LIVEKIT_KEYS="devkey: secret" \
  livekit/livekit-server \
  --dev
```

### Option B: Download Binary

1. Download from: https://github.com/livekit/livekit/releases
2. Run: `./livekit-server --dev`

## Step 2: Start the Controller API

In a new terminal:

```bash
npm run start:dev
```

You should see:

```
🚀 Application is running on: http://localhost:3000
📡 LiveKit Server URL: ws://localhost:7880
📖 Swagger API Docs: http://localhost:3000/api
🎥 Test Client: http://localhost:3000/test-client.html
```

## Step 3: Explore the API

### Option A: Use Swagger UI (Recommended)

Open your browser and go to:

```
http://localhost:3000/api
```

This provides an interactive API documentation where you can:

- Browse all available endpoints
- Try out API calls directly from the browser
- See request/response examples
- View data models and schemas

### Option B: Use the Test Script

```bash
./test-api.sh
```

### Option C: Manual Testing

Create a room:

```bash
curl -X POST http://localhost:3000/livekit/rooms \
  -H "Content-Type: application/json" \
  -d '{"name": "my-room"}'
```

Get an access token:

```bash
curl -X POST http://localhost:3000/livekit/token \
  -H "Content-Type: application/json" \
  -d '{
    "roomName": "my-room",
    "participantName": "john-doe"
  }'
```

List all rooms:

```bash
curl http://localhost:3000/livekit/rooms
```

## Step 4: Try the Visual Tools

### Swagger API Documentation

```
http://localhost:3000/api
```

Interactive API documentation with "Try it out" functionality.

### Web Video Client

Open your browser and go to:

```
http://localhost:3000/test-client.html
```

This provides a visual interface to:

- Create rooms
- Generate tokens
- Join video calls
- See other participants

## Common Issues

### "Connection refused" error

- Make sure LiveKit server is running on port 7880
- Check if the server URL in `.env` is correct

### "Failed to get token" error

- Verify the API key and secret in `.env` match your LiveKit server
- Default values are: `devkey` / `secret`

### Port already in use

- Change the PORT in `.env` file
- Or stop the process using port 3000

## Next Steps

- Read the full [README.md](./README.md) for detailed API documentation
- Modify `.env` file for custom configuration
- Integrate with your frontend application
- Check out [LiveKit documentation](https://docs.livekit.io/) for client SDKs

## Environment Variables

Edit `.env` file to configure:

```env
LIVEKIT_URL=ws://localhost:7880
LIVEKIT_API_KEY=devkey
LIVEKIT_API_SECRET=secret
PORT=3000
```

## Available Endpoints

- `GET /livekit/info` - Server info
- `POST /livekit/rooms` - Create room
- `GET /livekit/rooms` - List rooms
- `GET /livekit/rooms/:name` - Get room
- `DELETE /livekit/rooms/:name` - Delete room
- `POST /livekit/token` - Generate access token
- `GET /livekit/rooms/:name/participants` - List participants

Enjoy building with LiveKit! 🎉
