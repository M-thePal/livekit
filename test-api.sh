#!/bin/bash

# LiveKit Server Controller API Test Script
# Make sure your LiveKit server is running before executing this script

BASE_URL="http://localhost:3000"

echo "🧪 LiveKit Server Controller - API Test Script"
echo "================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Get server info
echo -e "${BLUE}1. Getting LiveKit server info...${NC}"
curl -s "${BASE_URL}/livekit/info" | jq .
echo ""
echo ""

# 2. Create a room
echo -e "${BLUE}2. Creating a test room...${NC}"
ROOM_RESPONSE=$(curl -s -X POST "${BASE_URL}/livekit/rooms" \
  -H "Content-Type: application/json" \
  -d '{"name": "test-room", "emptyTimeout": 300, "maxParticipants": 10}')
echo "$ROOM_RESPONSE" | jq .
echo ""
echo ""

# 3. List all rooms
echo -e "${BLUE}3. Listing all rooms...${NC}"
curl -s "${BASE_URL}/livekit/rooms" | jq .
echo ""
echo ""

# 4. Get specific room
echo -e "${BLUE}4. Getting test-room details...${NC}"
curl -s "${BASE_URL}/livekit/rooms/test-room" | jq .
echo ""
echo ""

# 5. Create access token for participant
echo -e "${BLUE}5. Creating access token for participant...${NC}"
TOKEN_RESPONSE=$(curl -s -X POST "${BASE_URL}/livekit/token" \
  -H "Content-Type: application/json" \
  -d '{
    "roomName": "test-room",
    "participantName": "john-doe",
    "metadata": "Test user",
    "canPublish": true,
    "canSubscribe": true,
    "canPublishData": true
  }')
echo "$TOKEN_RESPONSE" | jq .
TOKEN=$(echo "$TOKEN_RESPONSE" | jq -r '.token')
echo ""
echo -e "${GREEN}Access Token (use this to connect to the room):${NC}"
echo "$TOKEN"
echo ""
echo ""

# 6. List participants in room
echo -e "${BLUE}6. Listing participants in test-room...${NC}"
curl -s "${BASE_URL}/livekit/rooms/test-room/participants" | jq .
echo ""
echo ""

# 7. Update room
echo -e "${BLUE}7. Updating room settings...${NC}"
curl -s -X PATCH "${BASE_URL}/livekit/rooms/test-room" \
  -H "Content-Type: application/json" \
  -d '{"maxParticipants": 20}' | jq .
echo ""
echo ""

# Wait before cleanup
echo -e "${YELLOW}Waiting 3 seconds before cleanup...${NC}"
sleep 3
echo ""

# 8. Delete room
echo -e "${BLUE}8. Deleting test-room...${NC}"
curl -s -X DELETE "${BASE_URL}/livekit/rooms/test-room"
echo -e "${GREEN}Room deleted successfully!${NC}"
echo ""
echo ""

# 9. Verify room is deleted
echo -e "${BLUE}9. Verifying room deletion (should return empty or error)...${NC}"
curl -s "${BASE_URL}/livekit/rooms/test-room" | jq .
echo ""
echo ""

echo -e "${GREEN}✅ API test complete!${NC}"
echo ""
echo -e "${YELLOW}Note: To join the room with the token, use a LiveKit client SDK${NC}"
echo -e "${YELLOW}and connect to: ws://localhost:7880${NC}"

