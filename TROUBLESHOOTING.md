# Troubleshooting WebRTC Connection Issues

## Problem: "could not establish pc connection"

This error occurs when WebRTC ICE (Interactive Connectivity Establishment) negotiation fails. The WebSocket connects successfully, but the peer connection cannot be established.

## Root Cause

When running LiveKit in Docker, the server is on a different network than your browser. The ICE candidates (network addresses) that the server advertises may not be reachable from your browser, causing the peer connection to fail.

## Solutions

### Solution 1: Use LiveKit Cloud (Easiest for Testing)

For quick testing, use LiveKit's cloud service:
1. Sign up at https://cloud.livekit.io
2. Get your API key and secret
3. Update your `.env` file with the cloud URL

### Solution 2: Run LiveKit Server Natively (Not in Docker)

If you're on macOS or Linux, you can run LiveKit server directly:

```bash
# Download LiveKit server
curl -sSL https://get.livekit.io | bash

# Run in dev mode
livekit-server --dev --bind-addresses 127.0.0.1
```

### Solution 3: Configure Docker with Proper Networking

For Docker, you need to ensure proper port mapping and network configuration:

```bash
docker run --rm \
  -p 7880:7880 \
  -p 7881:7881 \
  -p 7882:7882/udp \
  -p 50000-50100:50000-50100/udp \
  -e LIVEKIT_KEYS="devkey: secret" \
  livekit/livekit-server \
  --dev \
  --bind-addresses 0.0.0.0 \
  --rtc-port-range-start=50000 \
  --rtc-port-range-end=50100
```

**Note:** You may need to find available ports in the 50000-60000 range.

### Solution 4: Use TURN Server (For Production)

For production or when behind strict NAT/firewall, configure a TURN server:

1. Set up a TURN server (coturn)
2. Configure LiveKit to use it
3. Update client connection to include TURN servers

### Solution 5: Test WebSocket Connection Only

If you just need to test the API without video:

1. The WebSocket connection works fine
2. You can test room creation, token generation, etc.
3. WebRTC is only needed for actual video/audio streaming

## Current Status

Your setup is working for:
- ✅ API endpoints (room creation, token generation)
- ✅ WebSocket signaling connection
- ❌ WebRTC peer connection (blocked by NAT/firewall)

## Quick Test

To verify the API is working:

```bash
# Create a room
curl -X POST http://localhost:3000/livekit/rooms \
  -H "Content-Type: application/json" \
  -d '{"name": "test-room"}'

# Generate a token
curl -X POST http://localhost:3000/livekit/token \
  -H "Content-Type: application/json" \
  -d '{"roomName": "test-room", "participantName": "test-user"}'
```

Both should work fine. The WebRTC issue only affects actual video/audio streaming.

## Next Steps

1. **For Development/Testing**: Use LiveKit Cloud or run server natively
2. **For Production**: Set up proper TURN server and configure port ranges
3. **For API Testing**: Your current setup is sufficient - WebRTC isn't needed for API testing

## Additional Resources

- [LiveKit Documentation](https://docs.livekit.io/)
- [Docker Networking Guide](https://docs.docker.com/network/)
- [WebRTC NAT Traversal](https://webrtc.org/getting-started/overview)

