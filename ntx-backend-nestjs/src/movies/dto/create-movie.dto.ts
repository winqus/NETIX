import { IsDate, IsInt, IsString, Length, Max, Min } from 'class-validator';

export class CreateMovieDTO {
  @IsString()
  @Length(1, 200)
  name: string;

  @IsString()
  @Length(1, 1000)
  summary: string;

  @IsDate()
  originallyReleasedAt: Date;

  @IsInt()
  @Min(1)
  @Max(12000)
  runtimeMinutes: number;
}
