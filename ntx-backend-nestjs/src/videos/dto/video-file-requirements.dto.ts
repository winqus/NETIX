import { ApiProperty } from '@nestjs/swagger';

export class VideoFileRequirementsDTO {
  @ApiProperty({ example: ['video/x-matroska'] })
  public supportedMimeTypes: string[];

  @ApiProperty({ example: ['.mkv'] })
  public allowedExtentions: string[];

  @ApiProperty({ example: 10000000000 })
  public maxFileSizeInBytes: number;
}
