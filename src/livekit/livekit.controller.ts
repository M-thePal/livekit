import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Patch,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { LivekitService } from './livekit.service';
import { CreateRoomDto, CreateTokenDto, UpdateRoomDto } from './dto';

@ApiTags('livekit')
@Controller('livekit')
export class LivekitController {
  constructor(private readonly livekitService: LivekitService) {}

  /**
   * GET /livekit/info
   * Get LiveKit server connection information
   */
  @Get('info')
  @ApiOperation({
    summary: 'Get server information',
    description: 'Returns LiveKit server connection details including URL and API key',
  })
  @ApiResponse({
    status: 200,
    description: 'Server information retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        url: { type: 'string', example: 'ws://localhost:7880' },
        apiKey: { type: 'string', example: 'devkey' },
      },
    },
  })
  getInfo() {
    return this.livekitService.getConnectionInfo();
  }

  /**
   * POST /livekit/rooms
   * Create a new room
   */
  @Post('rooms')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new room',
    description: 'Creates a new LiveKit room with specified settings',
  })
  @ApiBody({ type: CreateRoomDto })
  @ApiResponse({
    status: 201,
    description: 'Room created successfully',
    schema: {
      type: 'object',
      properties: {
        sid: { type: 'string', example: 'RM_xxxxx' },
        name: { type: 'string', example: 'my-meeting-room' },
        emptyTimeout: { type: 'number', example: 300 },
        maxParticipants: { type: 'number', example: 10 },
        creationTime: { type: 'string', example: '1234567890' },
        numParticipants: { type: 'number', example: 0 },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data',
  })
  @ApiResponse({
    status: 409,
    description: 'Room already exists',
  })
  async createRoom(@Body() createRoomDto: CreateRoomDto) {
    return this.livekitService.createRoom(createRoomDto);
  }

  /**
   * GET /livekit/rooms
   * List all rooms
   */
  @Get('rooms')
  @ApiOperation({
    summary: 'List all rooms',
    description: 'Returns a list of all active rooms on the LiveKit server',
  })
  @ApiResponse({
    status: 200,
    description: 'List of rooms retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          sid: { type: 'string', example: 'RM_xxxxx' },
          name: { type: 'string', example: 'my-meeting-room' },
          emptyTimeout: { type: 'number', example: 300 },
          maxParticipants: { type: 'number', example: 10 },
          creationTime: { type: 'string', example: '1234567890' },
          numParticipants: { type: 'number', example: 2 },
        },
      },
    },
  })
  async listRooms() {
    return this.livekitService.listRooms();
  }

  /**
   * GET /livekit/rooms/:roomName
   * Get room details by name
   */
  @Get('rooms/:roomName')
  @ApiOperation({
    summary: 'Get room details',
    description: 'Returns detailed information about a specific room',
  })
  @ApiParam({
    name: 'roomName',
    description: 'Name of the room',
    example: 'my-meeting-room',
  })
  @ApiResponse({
    status: 200,
    description: 'Room details retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        sid: { type: 'string', example: 'RM_xxxxx' },
        name: { type: 'string', example: 'my-meeting-room' },
        emptyTimeout: { type: 'number', example: 300 },
        maxParticipants: { type: 'number', example: 10 },
        creationTime: { type: 'string', example: '1234567890' },
        numParticipants: { type: 'number', example: 2 },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Room not found',
  })
  async getRoom(@Param('roomName') roomName: string) {
    return this.livekitService.getRoom(roomName);
  }

  /**
   * PATCH /livekit/rooms/:roomName
   * Update room settings
   */
  @Patch('rooms/:roomName')
  @ApiOperation({
    summary: 'Update room settings',
    description: 'Updates configuration settings for an existing room',
  })
  @ApiParam({
    name: 'roomName',
    description: 'Name of the room to update',
    example: 'my-meeting-room',
  })
  @ApiBody({ type: UpdateRoomDto })
  @ApiResponse({
    status: 200,
    description: 'Room updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Room not found',
  })
  async updateRoom(
    @Param('roomName') roomName: string,
    @Body() updateRoomDto: UpdateRoomDto,
  ) {
    return this.livekitService.updateRoom(roomName, updateRoomDto);
  }

  /**
   * DELETE /livekit/rooms/:roomName
   * Delete a room
   */
  @Delete('rooms/:roomName')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a room',
    description: 'Deletes a room and disconnects all participants',
  })
  @ApiParam({
    name: 'roomName',
    description: 'Name of the room to delete',
    example: 'my-meeting-room',
  })
  @ApiResponse({
    status: 204,
    description: 'Room deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Room not found',
  })
  async deleteRoom(@Param('roomName') roomName: string) {
    await this.livekitService.deleteRoom(roomName);
  }

  /**
   * GET /livekit/rooms/:roomName/participants
   * List participants in a room
   */
  @Get('rooms/:roomName/participants')
  @ApiOperation({
    summary: 'List participants',
    description: 'Returns a list of all participants currently in the room',
  })
  @ApiParam({
    name: 'roomName',
    description: 'Name of the room',
    example: 'my-meeting-room',
  })
  @ApiResponse({
    status: 200,
    description: 'List of participants retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          sid: { type: 'string', example: 'PA_xxxxx' },
          identity: { type: 'string', example: 'john-doe' },
          name: { type: 'string', example: 'John Doe' },
          state: { type: 'string', example: 'ACTIVE' },
          joinedAt: { type: 'string', example: '1234567890' },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Room not found',
  })
  async listParticipants(@Param('roomName') roomName: string) {
    return this.livekitService.listParticipants(roomName);
  }

  /**
   * DELETE /livekit/rooms/:roomName/participants/:participantIdentity
   * Remove a participant from a room
   */
  @Delete('rooms/:roomName/participants/:participantIdentity')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remove participant',
    description: 'Removes a participant from the room',
  })
  @ApiParam({
    name: 'roomName',
    description: 'Name of the room',
    example: 'my-meeting-room',
  })
  @ApiParam({
    name: 'participantIdentity',
    description: 'Identity of the participant to remove',
    example: 'john-doe',
  })
  @ApiResponse({
    status: 204,
    description: 'Participant removed successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Room or participant not found',
  })
  async removeParticipant(
    @Param('roomName') roomName: string,
    @Param('participantIdentity') participantIdentity: string,
  ) {
    await this.livekitService.removeParticipant(roomName, participantIdentity);
  }

  /**
   * POST /livekit/token
   * Create an access token for a participant to join a room
   */
  @Post('token')
  @ApiOperation({
    summary: 'Generate access token',
    description: 'Creates a JWT access token for a participant to join a room',
  })
  @ApiBody({ type: CreateTokenDto })
  @ApiResponse({
    status: 200,
    description: 'Access token generated successfully',
    schema: {
      type: 'object',
      properties: {
        token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          description: 'JWT token to connect to the LiveKit room',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data',
  })
  async createToken(@Body() createTokenDto: CreateTokenDto) {
    const token = await this.livekitService.createToken(createTokenDto);
    return { token };
  }

  /**
   * POST /livekit/rooms/:roomName/participants/:participantIdentity/mute
   * Mute a participant's track
   */
  @Post('rooms/:roomName/participants/:participantIdentity/mute')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mute/unmute participant track',
    description: 'Mutes or unmutes a specific track for a participant',
  })
  @ApiParam({
    name: 'roomName',
    description: 'Name of the room',
    example: 'my-meeting-room',
  })
  @ApiParam({
    name: 'participantIdentity',
    description: 'Identity of the participant',
    example: 'john-doe',
  })
  @ApiQuery({
    name: 'trackSid',
    description: 'SID of the track to mute/unmute',
    example: 'TR_XXXXX',
  })
  @ApiQuery({
    name: 'muted',
    description: 'Whether to mute (true) or unmute (false)',
    example: 'true',
  })
  @ApiResponse({
    status: 200,
    description: 'Track muted/unmuted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Track muted successfully' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Room, participant, or track not found',
  })
  async muteParticipant(
    @Param('roomName') roomName: string,
    @Param('participantIdentity') participantIdentity: string,
    @Query('trackSid') trackSid: string,
    @Query('muted') muted: string,
  ) {
    const isMuted = muted === 'true';
    await this.livekitService.muteParticipant(
      roomName,
      participantIdentity,
      trackSid,
      isMuted,
    );
    return { message: `Track ${isMuted ? 'muted' : 'unmuted'} successfully` };
  }
}

