import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateRoomDto {
  @ApiProperty({
    description: "Unique name for the room",
    example: "my-meeting-room",
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: "Time in seconds before room is deleted when empty",
    example: 300,
    default: 300,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  emptyTimeout?: number;

  @ApiPropertyOptional({
    description: "Maximum number of participants allowed (0 = unlimited)",
    example: 10,
    default: 0,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxParticipants?: number;
}
