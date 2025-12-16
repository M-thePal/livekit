import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTokenDto {
  @ApiProperty({
    description: 'Name of the room to join',
    example: 'my-meeting-room',
  })
  @IsString()
  @IsNotEmpty()
  roomName: string;

  @ApiProperty({
    description: 'Unique identifier for the participant',
    example: 'john-doe',
  })
  @IsString()
  @IsNotEmpty()
  participantName: string;

  @ApiPropertyOptional({
    description: 'Custom metadata for the participant',
    example: '{"role": "moderator", "avatar": "avatar-url"}',
  })
  @IsOptional()
  @IsString()
  metadata?: string;

  @ApiPropertyOptional({
    description: 'Whether the participant can publish audio/video',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  canPublish?: boolean;

  @ApiPropertyOptional({
    description: 'Whether the participant can subscribe to other tracks',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  canSubscribe?: boolean;

  @ApiPropertyOptional({
    description: 'Whether the participant can publish data messages',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  canPublishData?: boolean;
}

