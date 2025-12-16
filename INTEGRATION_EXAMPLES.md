# Integration Examples

This document provides code examples for integrating the LiveKit Controller API with various frontend frameworks and platforms.

## Table of Contents
- [React Integration](#react-integration)
- [Vue.js Integration](#vuejs-integration)
- [Angular Integration](#angular-integration)
- [React Native Integration](#react-native-integration)
- [Plain JavaScript](#plain-javascript)
- [Python Backend](#python-backend)
- [Next.js Integration](#nextjs-integration)

---

## React Integration

### Setup

```bash
npm install livekit-client
```

### Custom Hook for LiveKit

```typescript
// hooks/useLiveKit.ts
import { useState, useEffect, useCallback } from 'react';
import { Room, RoomEvent, RemoteParticipant } from 'livekit-client';

const API_URL = 'http://localhost:3000';
const LIVEKIT_URL = 'ws://localhost:7880';

export function useLiveKit() {
  const [room, setRoom] = useState<Room | null>(null);
  const [participants, setParticipants] = useState<RemoteParticipant[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const createRoomAndConnect = useCallback(async (
    roomName: string,
    participantName: string
  ) => {
    try {
      // Create room
      await fetch(`${API_URL}/livekit/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: roomName })
      });

      // Get token
      const tokenResponse = await fetch(`${API_URL}/livekit/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomName,
          participantName,
          canPublish: true,
          canSubscribe: true
        })
      });

      const { token } = await tokenResponse.json();

      // Connect to room
      const newRoom = new Room();
      
      newRoom.on(RoomEvent.ParticipantConnected, (participant) => {
        setParticipants(prev => [...prev, participant]);
      });

      newRoom.on(RoomEvent.ParticipantDisconnected, (participant) => {
        setParticipants(prev => prev.filter(p => p.sid !== participant.sid));
      });

      await newRoom.connect(LIVEKIT_URL, token);
      await newRoom.localParticipant.enableCameraAndMicrophone();
      
      setRoom(newRoom);
      setIsConnected(true);
      setParticipants(Array.from(newRoom.participants.values()));

    } catch (error) {
      console.error('Failed to connect:', error);
      throw error;
    }
  }, []);

  const disconnect = useCallback(async () => {
    if (room) {
      await room.disconnect();
      setRoom(null);
      setIsConnected(false);
      setParticipants([]);
    }
  }, [room]);

  return {
    room,
    participants,
    isConnected,
    createRoomAndConnect,
    disconnect
  };
}
```

### React Component

```typescript
// components/VideoCall.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useLiveKit } from '../hooks/useLiveKit';

export function VideoCall() {
  const [roomName, setRoomName] = useState('');
  const [userName, setUserName] = useState('');
  const { room, participants, isConnected, createRoomAndConnect, disconnect } = useLiveKit();
  const localVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (room && localVideoRef.current) {
      const videoTrack = room.localParticipant.videoTracks.values().next().value;
      if (videoTrack) {
        videoTrack.track.attach(localVideoRef.current);
      }
    }
  }, [room]);

  const handleJoin = async () => {
    try {
      await createRoomAndConnect(roomName, userName);
    } catch (error) {
      alert('Failed to join room');
    }
  };

  return (
    <div className="video-call">
      {!isConnected ? (
        <div className="join-form">
          <input
            type="text"
            placeholder="Room Name"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Your Name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
          <button onClick={handleJoin}>Join Room</button>
        </div>
      ) : (
        <div className="video-grid">
          <div className="local-video">
            <video ref={localVideoRef} autoPlay muted />
            <span>You</span>
          </div>
          {participants.map((participant) => (
            <ParticipantView key={participant.sid} participant={participant} />
          ))}
          <button onClick={disconnect}>Leave Room</button>
        </div>
      )}
    </div>
  );
}

function ParticipantView({ participant }: { participant: any }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      const videoTrack = participant.videoTracks.values().next().value;
      if (videoTrack) {
        videoTrack.track.attach(videoRef.current);
      }
    }
  }, [participant]);

  return (
    <div className="participant-video">
      <video ref={videoRef} autoPlay />
      <span>{participant.identity}</span>
    </div>
  );
}
```

---

## Vue.js Integration

### Composable

```typescript
// composables/useLiveKit.ts
import { ref, onUnmounted } from 'vue';
import { Room, RoomEvent } from 'livekit-client';

const API_URL = 'http://localhost:3000';
const LIVEKIT_URL = 'ws://localhost:7880';

export function useLiveKit() {
  const room = ref<Room | null>(null);
  const participants = ref([]);
  const isConnected = ref(false);

  const createRoomAndConnect = async (roomName: string, participantName: string) => {
    try {
      // Create room
      await fetch(`${API_URL}/livekit/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: roomName })
      });

      // Get token
      const tokenResponse = await fetch(`${API_URL}/livekit/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName, participantName })
      });

      const { token } = await tokenResponse.json();

      // Connect
      const newRoom = new Room();
      
      newRoom.on(RoomEvent.ParticipantConnected, (participant) => {
        participants.value.push(participant);
      });

      await newRoom.connect(LIVEKIT_URL, token);
      await newRoom.localParticipant.enableCameraAndMicrophone();
      
      room.value = newRoom;
      isConnected.value = true;
    } catch (error) {
      console.error('Failed to connect:', error);
      throw error;
    }
  };

  const disconnect = async () => {
    if (room.value) {
      await room.value.disconnect();
      room.value = null;
      isConnected.value = false;
      participants.value = [];
    }
  };

  onUnmounted(() => {
    disconnect();
  });

  return {
    room,
    participants,
    isConnected,
    createRoomAndConnect,
    disconnect
  };
}
```

### Vue Component

```vue
<!-- components/VideoCall.vue -->
<template>
  <div class="video-call">
    <div v-if="!isConnected" class="join-form">
      <input v-model="roomName" placeholder="Room Name" />
      <input v-model="userName" placeholder="Your Name" />
      <button @click="handleJoin">Join Room</button>
    </div>
    <div v-else class="video-grid">
      <div class="local-video">
        <video ref="localVideoRef" autoplay muted></video>
        <span>You</span>
      </div>
      <button @click="disconnect">Leave Room</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useLiveKit } from '../composables/useLiveKit';

const roomName = ref('');
const userName = ref('');
const localVideoRef = ref<HTMLVideoElement | null>(null);

const { room, isConnected, createRoomAndConnect, disconnect } = useLiveKit();

const handleJoin = async () => {
  try {
    await createRoomAndConnect(roomName.value, userName.value);
  } catch (error) {
    alert('Failed to join room');
  }
};

watch(room, (newRoom) => {
  if (newRoom && localVideoRef.value) {
    const videoTrack = newRoom.localParticipant.videoTracks.values().next().value;
    if (videoTrack) {
      videoTrack.track.attach(localVideoRef.value);
    }
  }
});
</script>
```

---

## Angular Integration

### Service

```typescript
// services/livekit.service.ts
import { Injectable } from '@angular/core';
import { Room, RoomEvent, RemoteParticipant } from 'livekit-client';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LiveKitService {
  private API_URL = 'http://localhost:3000';
  private LIVEKIT_URL = 'ws://localhost:7880';
  
  private room: Room | null = null;
  private participantsSubject = new BehaviorSubject<RemoteParticipant[]>([]);
  private isConnectedSubject = new BehaviorSubject<boolean>(false);

  participants$: Observable<RemoteParticipant[]> = this.participantsSubject.asObservable();
  isConnected$: Observable<boolean> = this.isConnectedSubject.asObservable();

  constructor(private http: HttpClient) {}

  async createRoomAndConnect(roomName: string, participantName: string): Promise<void> {
    try {
      // Create room
      await this.http.post(`${this.API_URL}/livekit/rooms`, { name: roomName }).toPromise();

      // Get token
      const response: any = await this.http.post(`${this.API_URL}/livekit/token`, {
        roomName,
        participantName
      }).toPromise();

      // Connect
      this.room = new Room();
      
      this.room.on(RoomEvent.ParticipantConnected, (participant) => {
        const current = this.participantsSubject.value;
        this.participantsSubject.next([...current, participant]);
      });

      await this.room.connect(this.LIVEKIT_URL, response.token);
      await this.room.localParticipant.enableCameraAndMicrophone();
      
      this.isConnectedSubject.next(true);
    } catch (error) {
      console.error('Failed to connect:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.room) {
      await this.room.disconnect();
      this.room = null;
      this.isConnectedSubject.next(false);
      this.participantsSubject.next([]);
    }
  }

  getRoom(): Room | null {
    return this.room;
  }
}
```

---

## React Native Integration

```typescript
// screens/VideoCallScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';
import { LiveKitRoom, VideoView, useParticipants } from '@livekit/react-native';

const API_URL = 'http://localhost:3000';
const LIVEKIT_URL = 'ws://localhost:7880';

export function VideoCallScreen() {
  const [roomName, setRoomName] = useState('');
  const [userName, setUserName] = useState('');
  const [token, setToken] = useState('');

  const handleJoin = async () => {
    try {
      // Create room
      await fetch(`${API_URL}/livekit/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: roomName })
      });

      // Get token
      const response = await fetch(`${API_URL}/livekit/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName, participantName: userName })
      });

      const data = await response.json();
      setToken(data.token);
    } catch (error) {
      console.error('Failed to join:', error);
    }
  };

  if (!token) {
    return (
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder="Room Name"
          value={roomName}
          onChangeText={setRoomName}
        />
        <TextInput
          style={styles.input}
          placeholder="Your Name"
          value={userName}
          onChangeText={setUserName}
        />
        <Button title="Join Room" onPress={handleJoin} />
      </View>
    );
  }

  return (
    <LiveKitRoom
      serverUrl={LIVEKIT_URL}
      token={token}
      connect={true}
      options={{
        adaptiveStream: true,
        dynacast: true,
      }}
    >
      <RoomView />
    </LiveKitRoom>
  );
}

function RoomView() {
  const participants = useParticipants();

  return (
    <View style={styles.roomContainer}>
      {participants.map((participant) => (
        <VideoView
          key={participant.sid}
          style={styles.video}
          participant={participant}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  roomContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  video: {
    width: '50%',
    height: 200,
  },
});
```

---

## Plain JavaScript

```javascript
// livekit-client.js
const API_URL = 'http://localhost:3000';
const LIVEKIT_URL = 'ws://localhost:7880';

class LiveKitClient {
  constructor() {
    this.room = null;
  }

  async createRoomAndConnect(roomName, participantName) {
    try {
      // Create room
      await fetch(`${API_URL}/livekit/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: roomName })
      });

      // Get token
      const tokenResponse = await fetch(`${API_URL}/livekit/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName, participantName })
      });

      const { token } = await tokenResponse.json();

      // Connect
      this.room = new LivekitClient.Room();
      
      this.room.on('participantConnected', (participant) => {
        console.log('Participant connected:', participant.identity);
        this.onParticipantConnected?.(participant);
      });

      await this.room.connect(LIVEKIT_URL, token);
      await this.room.localParticipant.enableCameraAndMicrophone();
      
      return this.room;
    } catch (error) {
      console.error('Failed to connect:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.room) {
      await this.room.disconnect();
      this.room = null;
    }
  }
}

// Usage
const client = new LiveKitClient();
client.onParticipantConnected = (participant) => {
  console.log('New participant:', participant.identity);
};

document.getElementById('joinBtn').addEventListener('click', async () => {
  const roomName = document.getElementById('roomName').value;
  const userName = document.getElementById('userName').value;
  await client.createRoomAndConnect(roomName, userName);
});
```

---

## Python Backend

```python
# livekit_client.py
import requests
from typing import Dict, Optional

class LiveKitController:
    def __init__(self, api_url: str = "http://localhost:3000"):
        self.api_url = api_url
        self.base_path = f"{api_url}/livekit"
    
    def create_room(self, name: str, max_participants: int = 0, 
                    empty_timeout: int = 300) -> Dict:
        """Create a new LiveKit room"""
        response = requests.post(
            f"{self.base_path}/rooms",
            json={
                "name": name,
                "maxParticipants": max_participants,
                "emptyTimeout": empty_timeout
            }
        )
        response.raise_for_status()
        return response.json()
    
    def list_rooms(self) -> list:
        """List all rooms"""
        response = requests.get(f"{self.base_path}/rooms")
        response.raise_for_status()
        return response.json()
    
    def get_room(self, room_name: str) -> Dict:
        """Get room details"""
        response = requests.get(f"{self.base_path}/rooms/{room_name}")
        response.raise_for_status()
        return response.json()
    
    def delete_room(self, room_name: str) -> None:
        """Delete a room"""
        response = requests.delete(f"{self.base_path}/rooms/{room_name}")
        response.raise_for_status()
    
    def create_token(self, room_name: str, participant_name: str,
                     can_publish: bool = True, can_subscribe: bool = True,
                     metadata: Optional[str] = None) -> str:
        """Generate access token for a participant"""
        response = requests.post(
            f"{self.base_path}/token",
            json={
                "roomName": room_name,
                "participantName": participant_name,
                "canPublish": can_publish,
                "canSubscribe": can_subscribe,
                "metadata": metadata
            }
        )
        response.raise_for_status()
        return response.json()["token"]
    
    def list_participants(self, room_name: str) -> list:
        """List participants in a room"""
        response = requests.get(
            f"{self.base_path}/rooms/{room_name}/participants"
        )
        response.raise_for_status()
        return response.json()

# Usage example
if __name__ == "__main__":
    controller = LiveKitController()
    
    # Create a room
    room = controller.create_room("my-python-room", max_participants=10)
    print(f"Created room: {room['name']}")
    
    # Generate token
    token = controller.create_token("my-python-room", "user123")
    print(f"Token: {token}")
    
    # List all rooms
    rooms = controller.list_rooms()
    print(f"Total rooms: {len(rooms)}")
```

---

## Next.js Integration

### API Route

```typescript
// pages/api/livekit/join.ts
import type { NextApiRequest, NextApiResponse } from 'next';

const CONTROLLER_API = process.env.LIVEKIT_CONTROLLER_URL || 'http://localhost:3000';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { roomName, participantName } = req.body;

  try {
    // Create room
    await fetch(`${CONTROLLER_API}/livekit/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: roomName })
    });

    // Get token
    const tokenResponse = await fetch(`${CONTROLLER_API}/livekit/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomName, participantName })
    });

    const { token } = await tokenResponse.json();

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Failed to join room' });
  }
}
```

### Page Component

```typescript
// pages/room/[roomName].tsx
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { Room } from 'livekit-client';

export default function RoomPage() {
  const router = useRouter();
  const { roomName } = router.query;
  const [room, setRoom] = useState<Room | null>(null);

  const joinRoom = async () => {
    const response = await fetch('/api/livekit/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomName,
        participantName: 'User-' + Math.random().toString(36).substr(2, 9)
      })
    });

    const { token } = await response.json();

    const newRoom = new Room();
    await newRoom.connect(process.env.NEXT_PUBLIC_LIVEKIT_URL!, token);
    await newRoom.localParticipant.enableCameraAndMicrophone();
    
    setRoom(newRoom);
  };

  useEffect(() => {
    if (roomName) {
      joinRoom();
    }
  }, [roomName]);

  return (
    <div>
      <h1>Room: {roomName}</h1>
      {room && <div>Connected!</div>}
    </div>
  );
}
```

---

## Testing Examples

### Jest Test

```typescript
// __tests__/livekit.test.ts
import { LiveKitService } from '../src/livekit/livekit.service';

describe('LiveKitService', () => {
  let service: LiveKitService;

  beforeEach(() => {
    service = new LiveKitService(configService);
  });

  it('should create a room', async () => {
    const room = await service.createRoom({
      name: 'test-room',
      maxParticipants: 10
    });

    expect(room.name).toBe('test-room');
  });

  it('should generate a token', async () => {
    const token = await service.createToken({
      roomName: 'test-room',
      participantName: 'test-user'
    });

    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
  });
});
```

---

These examples should help you integrate the LiveKit Controller API with your preferred framework or platform!

