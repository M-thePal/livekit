import { IsOptional, IsNumber, Min } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateRoomDto {
  @ApiPropertyOptional({
    description: "Time in seconds before room is deleted when empty",
    example: 600,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(5)
  emptyTimeout?: number;

  @ApiPropertyOptional({
    description: "Maximum number of participants allowed (0 = unlimited)",
    example: 20,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(2)
  maxParticipants?: number;
}
