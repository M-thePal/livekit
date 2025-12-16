# Testing with Mobile Phone

## Quick Setup Guide

### Step 1: Find Your Laptop's IP Address

Your laptop's local IP address is: **10.127.31.178**

To find it again, run:
```bash
ipconfig getifaddr en0
# or
ifconfig | grep "inet " | grep -v 127.0.0.1
```

### Step 2: Make Sure Everything is Running

1. **NestJS Application** (should be running on port 3000)
   ```bash
   npm run start:dev
   ```
   The app now listens on `0.0.0.0:3000` (all network interfaces)

2. **LiveKit Server** (should be running in Docker)
   ```bash
   docker ps | grep livekit
   ```
   
   If not running, start it:
   ```bash
   docker run --rm -d --name livekit-dev \
     -p 7880:7880 \
     -p 7881:7881 \
     -p 7882:7882/udp \
     -e LIVEKIT_KEYS="devkey: secret" \
     livekit/livekit-server \
     --dev
   ```

### Step 3: Access from Your Phone

1. **Make sure your phone is on the same Wi-Fi network** as your laptop

2. **Open your phone's browser** and go to:
   ```
   http://10.127.31.178:3000/test-client.html
   ```

3. **The test client will automatically detect** the correct server URLs:
   - API: `http://10.127.31.178:3000`
   - LiveKit: `ws://10.127.31.178:7880`

### Step 4: Test the Connection

1. Enter a room name (e.g., "mobile-test")
2. Enter your name
3. Click "Get Token & Connect"
4. Allow camera/microphone permissions when prompted
5. You should see your video!

## Troubleshooting

### Can't Access from Phone

1. **Check Firewall**: Make sure your Mac's firewall allows incoming connections
   ```bash
   # Check firewall status
   /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate
   ```

2. **Verify IP Address**: Make sure you're using the correct IP
   ```bash
   ipconfig getifaddr en0
   ```

3. **Test from Laptop First**: Try accessing from your laptop using the IP:
   ```
   http://10.127.31.178:3000/test-client.html
   ```

4. **Check Network**: Make sure both devices are on the same Wi-Fi network

### Connection Issues

- **WebSocket fails**: Check if port 7880 is accessible
- **API fails**: Check if port 3000 is accessible
- **WebRTC fails**: This is normal for Docker setup - see TROUBLESHOOTING.md

### Firewall Settings (macOS)

If you can't access from your phone:

1. Go to **System Settings** → **Network** → **Firewall**
2. Click **Options**
3. Make sure **Block all incoming connections** is **OFF**
4. Or add exceptions for Node.js and Docker

## Testing Multiple Devices

You can test with multiple devices:

1. **Device 1** (Laptop): `http://10.127.31.178:3000/test-client.html`
2. **Device 2** (Phone): `http://10.127.31.178:3000/test-client.html`
3. **Device 3** (Tablet): `http://10.127.31.178:3000/test-client.html`

All can join the same room and see each other's video!

## Alternative: Use ngrok for External Access

If you want to test from outside your local network:

```bash
# Install ngrok
brew install ngrok

# Expose your app
ngrok http 3000
```

Then use the ngrok URL on your phone (works from anywhere).

## Quick Reference

- **Laptop IP**: `10.127.31.178`
- **API URL**: `http://10.127.31.178:3000`
- **LiveKit URL**: `ws://10.127.31.178:7880`
- **Test Client**: `http://10.127.31.178:3000/test-client.html`
- **Swagger Docs**: `http://10.127.31.178:3000/api`

## Security Note

⚠️ **For Development Only**: This setup exposes your server to your local network. For production:
- Use proper authentication
- Use HTTPS
- Configure firewall rules
- Use a reverse proxy (nginx)

