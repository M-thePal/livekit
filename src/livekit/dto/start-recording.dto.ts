import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsBoolean,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export enum RecordingOutputFormat {
  MP4 = "mp4",
  OGG = "ogg",
  WEBM = "webm",
}

export enum RecordingPreset {
  HD_30 = "preset-hd-30",
  HD_60 = "preset-hd-60",
  FULL_HD_30 = "preset-full-hd-30",
  FULL_HD_60 = "preset-full-hd-60",
}

export class StartRecordingDto {
  @ApiProperty({
    description: "Name of the room to record",
    example: "my-meeting-room",
  })
  @IsString()
  @IsNotEmpty()
  roomName: string;

  @ApiPropertyOptional({
    description: "Output format for the recording",
    enum: RecordingOutputFormat,
    default: RecordingOutputFormat.MP4,
    example: RecordingOutputFormat.MP4,
  })
  @IsOptional()
  @IsEnum(RecordingOutputFormat)
  outputFormat?: RecordingOutputFormat;

  @ApiPropertyOptional({
    description: "Recording preset (quality settings)",
    enum: RecordingPreset,
    default: RecordingPreset.HD_30,
    example: RecordingPreset.HD_30,
  })
  @IsOptional()
  @IsEnum(RecordingPreset)
  preset?: RecordingPreset;

  @ApiPropertyOptional({
    description: "Whether to record only audio",
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  audioOnly?: boolean;

  @ApiPropertyOptional({
    description: "Whether to record video only (no audio)",
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  videoOnly?: boolean;

  // S3-compatible storage (MinIO) configuration
  @ApiPropertyOptional({
    description: "S3 bucket name",
    example: "livekit-recordings",
  })
  @IsOptional()
  @IsString()
  s3Bucket?: string;

  @ApiPropertyOptional({
    description: "Room URL (auto-generated if not provided)",
    example:
      "https://meet.livekit.io/custom?liveKitUrl=ws://localhost:7880&token=token",
  })
  @IsOptional()
  @IsString()
  roomUrl?: string;
}
