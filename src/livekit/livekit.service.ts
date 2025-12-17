import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  RoomServiceClient,
  AccessToken,
  Room,
  ParticipantInfo,
  EgressClient,
  EncodedFileOutput,
  EgressInfo,
  S3Upload,
} from "livekit-server-sdk";
import {
  CreateRoomDto,
  CreateTokenDto,
  UpdateRoomDto,
  StartRecordingDto,
} from "./dto";

@Injectable()
export class LivekitService {
  private readonly logger = new Logger(LivekitService.name);
  private readonly roomService: RoomServiceClient;
  private readonly egressClient: EgressClient;
  private readonly livekitUrl: string;
  private readonly livekitInternalUrl: string; // For egress (Docker service name)
  private readonly apiKey: string;
  private readonly apiSecret: string;

  constructor(private configService: ConfigService) {
    this.livekitUrl = this.configService.get<string>(
      "LIVEKIT_URL",
      "ws://localhost:7880",
    );
    // Internal URL for egress (uses Docker service name)
    this.livekitInternalUrl = this.configService.get<string>(
      "LIVEKIT_INTERNAL_URL",
      this.livekitUrl, // Falls back to external URL if not set
    );
    this.apiKey = this.configService.get<string>("LIVEKIT_API_KEY", "devkey");
    this.apiSecret = this.configService.get<string>(
      "LIVEKIT_API_SECRET",
      "secret",
    );
    // Egress connects to LiveKit server (same as RoomService)
    // The Egress worker is a separate service that pulls jobs from Redis
    const livekitHttpUrl = this.livekitUrl
      .replace("ws://", "http://")
      .replace("wss://", "https://");

    this.roomService = new RoomServiceClient(
      this.livekitUrl,
      this.apiKey,
      this.apiSecret,
    );

    this.egressClient = new EgressClient(
      livekitHttpUrl,
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
  async createToken(
    createTokenDto: CreateTokenDto,
  ): Promise<{ token: string; testRoomUrl: string }> {
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
        hidden: createTokenDto.hidden,
      });

      const token = await at.toJwt();
      this.logger.log(
        `Token created for ${createTokenDto.participantName} in room: ${createTokenDto.roomName}`,
      );

      // Generate test room URL using the configured LiveKit server URL
      const testRoomUrl = `https://meet.livekit.io/custom?liveKitUrl=${encodeURIComponent(this.livekitUrl)}&token=${encodeURIComponent(token)}`;

      return { token, testRoomUrl };
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

  /**
   * Start recording a room using Egress
   */
  async startRecording(
    startRecordingDto: StartRecordingDto,
  ): Promise<{ egressId: string; status: string }> {
    try {
      // Verify room exists
      const rooms = await this.roomService.listRooms([
        startRecordingDto.roomName,
      ]);
      if (rooms.length === 0) {
        throw new Error(`Room not found: ${startRecordingDto.roomName}`);
      }

      const outputFormat = startRecordingDto.outputFormat || "mp4";
      const fileName = `${startRecordingDto.roomName}-${new Date().getTime()}`;
      // Create encoded file output for recording
      const fileType =
        outputFormat === "mp4" ? 1 : outputFormat === "ogg" ? 2 : 3; // 1=MP4, 2=OGG, 3=WEBM

      // Configure S3 upload if provided (MinIO or AWS S3)
      let s3Config: S3Upload | undefined = undefined;
      if (startRecordingDto.s3Bucket) {
        s3Config = new S3Upload({
          accessKey: this.configService.get("S3_ACCESS_KEY", ""),
          secret: this.configService.get("S3_SECRET_KEY", ""),
          region: this.configService.get("S3_REGION", "us-east-1"),
          bucket: startRecordingDto.s3Bucket,
          endpoint: this.configService.get("S3_ENDPOINT", ""),
          forcePathStyle: true, // Required for MinIO and other S3-compatible storage
        });
      }

      const output = new EncodedFileOutput({
        fileType: fileType,
        filepath: `${fileName}.${outputFormat}`,
        output: s3Config
          ? {
              case: "s3",
              value: s3Config,
            }
          : undefined,
      });

      // Generate access token for egress to join the room
      const egressIdentity = "egress-recorder-bot";
      // const at = new AccessToken(this.apiKey, this.apiSecret, {
      //   identity: egressIdentity,
      //   name: egressIdentity,
      // });
      //
      // at.addGrant({
      //   room: startRecordingDto.roomName,
      //   roomJoin: true,
      //   canPublish: false, // Egress doesn't need to publish
      //   canSubscribe: true, // Egress needs to subscribe to tracks
      // });

      // const token = await at.toJwt();
      const token = (
        await this.createToken({
          roomName: startRecordingDto.roomName,
          participantName: egressIdentity,
          canSubscribe: true,
          canPublish: false,
          hidden: true,
        })
      ).token;
      // Construct the full URL with token for web egress
      // Use internal URL (Docker service name) for egress to connect properly
      const roomUrl =
        startRecordingDto.roomUrl ||
        `https://meet.livekit.io/custom?liveKitUrl=${encodeURIComponent(this.livekitInternalUrl)}&token=${encodeURIComponent(token)}`;

      // Options for web egress
      const options = {
        audioOnly: startRecordingDto.audioOnly || false,
        videoOnly: startRecordingDto.videoOnly || false,
      };

      // Start room composite egress (records entire room)
      // const egressInfo = await this.egressClient.startRoomCompositeEgress(
      //   startRecordingDto.roomName,
      //   output,
      //   options
      // );
      const egressInfo = await this.egressClient.startWebEgress(
        roomUrl,
        output,
        options,
      );
      this.logger.log(
        `Web Egress started for room ${startRecordingDto.roomName}, egress ID: ${egressInfo.egressId}, URL: ${roomUrl}`,
      );

      return {
        egressId: egressInfo.egressId,
        status: egressInfo.status?.toString() || "EGRESS_STARTING",
      };
    } catch (error) {
      this.logger.error(
        `Failed to start recording: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Stop an active recording
   */
  async stopRecording(egressId: string): Promise<EgressInfo> {
    try {
      const egressInfo = await this.egressClient.stopEgress(egressId);
      this.logger.log(`Recording stopped, egress ID: ${egressId}`);
      return egressInfo;
    } catch (error) {
      this.logger.error(
        `Failed to stop recording ${egressId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * List all active recordings (egress)
   */
  async listRecordings(roomName?: string): Promise<EgressInfo[]> {
    try {
      const egressList = await this.egressClient.listEgress(
        roomName ? { roomName } : undefined,
      );
      this.logger.log(`Listed ${egressList.length} active recordings`);
      return egressList;
    } catch (error) {
      this.logger.error(
        `Failed to list recordings: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Get recording status by egress ID
   */
  async getRecordingStatus(egressId: string): Promise<EgressInfo> {
    try {
      // List all egress and find the one with matching ID
      const egressList = await this.egressClient.listEgress();
      const egressInfo = egressList.find((e) => e.egressId === egressId);

      if (!egressInfo) {
        throw new Error(`Recording not found: ${egressId}`);
      }

      this.logger.log(`Retrieved recording status for egress ID: ${egressId}`);
      return egressInfo;
    } catch (error) {
      this.logger.error(
        `Failed to get recording status ${egressId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
