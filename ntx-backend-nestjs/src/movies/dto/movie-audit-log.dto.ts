import { IsObject, IsOptional, IsString } from 'class-validator';

export class MovieAuditLogDTO {
  @IsString()
  id: string;

  @IsString()
  event: string;

  @IsString()
  movieId: string;

  @IsObject()
  @IsOptional()
  changes: Record<string, any>;

  @IsString()
  timestamp: string;
}
