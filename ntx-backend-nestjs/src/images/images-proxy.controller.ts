import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Query,
  Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { firstValueFrom } from 'rxjs';
import { IMAGES_PROXY_CONTROLLER_BASE_PATH, IMAGES_SWAGGER_TAG } from './images.constants';

@ApiTags(IMAGES_SWAGGER_TAG)
@Controller(IMAGES_PROXY_CONTROLLER_BASE_PATH)
export class ImagesProxyController {
  constructor(private readonly httpService: HttpService) {}

  private readonly IMAGES_PROXY_ACCEPTED_TARGET_HOSTS = ['image.tmdb.org'];

  @Get()
  async proxyImage(@Res() res: Response, @Query('url') imageUrl: string) {
    if (!imageUrl) {
      throw new BadRequestException('Missing image URL');
    }

    try {
      const parsedUrl = new URL(imageUrl);

      if (!this.IMAGES_PROXY_ACCEPTED_TARGET_HOSTS.includes(parsedUrl.hostname)) {
        throw new BadRequestException('Target host not allowed');
      }

      const response = await firstValueFrom(this.httpService.get(imageUrl, { responseType: 'stream' }));

      if (!response) {
        throw new InternalServerErrorException('No response from image server');
      }

      res.contentType(response.headers['content-type']);

      response.data.pipe(res);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        throw new NotFoundException('Image not found');
      } else if (error instanceof BadRequestException) {
      } else {
        throw new InternalServerErrorException('Error fetching image');
      }
    }
  }
}
