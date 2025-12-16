import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  RoomServiceClient,
  AccessToken,
  Room,
  ParticipantInfo,
} from "livekit-server-sdk";
import { CreateRoomDto, CreateTokenDto, UpdateRoomDto } from "./dto";

@Injectable()
export class LivekitService implements OnModuleInit {
  private readonly logger = new Logger(LivekitService.name);
  private readonly roomService: RoomServiceClient;
  private readonly livekitUrl: string;
  private readonly apiKey: string;
  private readonly apiSecret: string;
  onModuleInit() {
    console.log(this.apiKey);
  }

  constructor(private configService: ConfigService) {
    this.livekitUrl = this.configService.get<string>(
      "LIVEKIT_URL",
      "ws://localhost:7880",
    );
    this.apiKey = this.configService.get<string>("LIVEKIT_API_KEY", "devkey");
    this.apiSecret = this.configService.get<string>(
      "LIVEKIT_API_SECRET",
      "secret",
    );

    this.roomService = new RoomServiceClient(
      this.livekitUrl,
      this.apiKey,
      this.apiSecret,
    );

    this.logger.log(`LiveKit service initialized with URL: ${this.livekitUrl}`);
  }

  /**
   * Create a new room
   */
  async createRoom(createRoomDto: CreateRoomDto): Promise<Room> {
    try {
      const opts = {
        name: createRoomDto.name,
        emptyTimeout: createRoomDto.emptyTimeout || 300, // 5 minutes default
        maxParticipants: createRoomDto.maxParticipants || 0, // 0 = unlimited
      };

      const room = await this.roomService.createRoom(opts);
      this.logger.log(`Room created: ${room.name}`);
      return room;
    } catch (error) {
      this.logger.error(`Failed to create room: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * List all rooms
   */
  async listRooms(): Promise<Room[]> {
    try {
      const rooms = await this.roomService.listRooms();
      this.logger.log(`Listed ${rooms.length} rooms`);
      return rooms;
    } catch (error) {
      this.logger.error(`Failed to list rooms: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get room details by name
   */
  async getRoom(roomName: string): Promise<Room> {
    try {
      const room = await this.roomService.listRooms([roomName]);
      if (room.length === 0) {
        throw new Error(`Room not found: ${roomName}`);
      }
      this.logger.log(`Retrieved room: ${roomName}`);
      return room[0];
    } catch (error) {
      this.logger.error(
        `Failed to get room ${roomName}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Update room settings
   */
  async updateRoom(
    roomName: string,
    updateRoomDto: UpdateRoomDto,
  ): Promise<Room> {
    try {
      const room = await this.roomService.updateRoomMetadata(
        roomName,
        JSON.stringify(updateRoomDto),
      );
      this.logger.log(`Room updated: ${roomName}`);
      return room;
    } catch (error) {
      this.logger.error(
        `Failed to update room ${roomName}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Delete a room
   */
  async deleteRoom(roomName: string): Promise<void> {
    try {
      await this.roomService.deleteRoom(roomName);
      this.logger.log(`Room deleted: ${roomName}`);
    } catch (error) {
      this.logger.error(
        `Failed to delete room ${roomName}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * List participants in a room
   */
  async listParticipants(roomName: string): Promise<ParticipantInfo[]> {
    try {
      const participants = await this.roomService.listParticipants(roomName);
      this.logger.log(
        `Listed ${participants.length} participants in room: ${roomName}`,
      );
      return participants;
    } catch (error) {
      this.logger.error(
        `Failed to list participants in room ${roomName}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Remove a participant from a room
   */
  async removeParticipant(
    roomName: string,
    participantIdentity: string,
  ): Promise<void> {
    try {
      await this.roomService.removeParticipant(roomName, participantIdentity);
      this.logger.log(
        `Participant ${participantIdentity} removed from room: ${roomName}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to remove participant ${participantIdentity} from room ${roomName}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Create an access token for a participant to join a room
   */
  async createToken(createTokenDto: CreateTokenDto): Promise<string> {
    try {
      const at = new AccessToken(this.apiKey, this.apiSecret, {
        identity: createTokenDto.participantName,
        name: createTokenDto.participantName,
        metadata: createTokenDto.metadata || "",
      });

      at.addGrant({
        room: createTokenDto.roomName,
        roomJoin: true,
        canPublish: createTokenDto.canPublish !== false,
        canSubscribe: createTokenDto.canSubscribe !== false,
        canPublishData: createTokenDto.canPublishData !== false,
      });

      const token = await at.toJwt();
      this.logger.log(
        `Token created for ${createTokenDto.participantName} in room: ${createTokenDto.roomName}`,
      );
      return token;
    } catch (error) {
      this.logger.error(
        `Failed to create token: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Mute a participant's track
   */
  async muteParticipant(
    roomName: string,
    participantIdentity: string,
    trackSid: string,
    muted: boolean,
  ): Promise<void> {
    try {
      await this.roomService.mutePublishedTrack(
        roomName,
        participantIdentity,
        trackSid,
        muted,
      );
      this.logger.log(
        `Track ${trackSid} ${muted ? "muted" : "unmuted"} for participant ${participantIdentity} in room: ${roomName}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to mute/unmute track: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Get connection info for the LiveKit server
   */
  getConnectionInfo(): { url: string; apiKey: string } {
    return {
      url: this.livekitUrl,
      apiKey: this.apiKey,
    };
  }
}
