import { Inject, Injectable } from '@nestjs/common';
import { makeCaseInsensitiveRegex } from '@ntx/common/utils/regex.utils';
import { EntityRepository } from '@ntx/database/entity.repository';
import { FilterQuery, Model } from 'mongoose';
import { Video } from './entity/video.entity';
import { VideoDocument } from './schemas/video.schema';
import { VIDEOS_MODEL_TOKEN } from './videos.constants';
import { VideosMapper } from './videos.mapper';

@Injectable()
export class VideosRepository extends EntityRepository<Video> {
  constructor(@Inject(VIDEOS_MODEL_TOKEN) private readonly model: Model<VideoDocument>) {
    super(model);
  }

  public async findOneByUUID(uuid: string): Promise<Video | null> {
    const query: FilterQuery<VideoDocument> = { uuid };
    const found = await super.findOne(query);

    return found == null ? null : VideosMapper.any2Video(found);
  }

  public async findAllByName(name: string): Promise<Video[]> {
    const query: FilterQuery<VideoDocument> = { name: { $regex: makeCaseInsensitiveRegex(name) } };
    const videoDocuments = await this.model.find(query).exec();

    if (videoDocuments.length > 0) {
      return VideosMapper.any2Videos(videoDocuments);
    }

    return [];
  }

  public async existsByUUID(uuid: string): Promise<boolean> {
    const query: FilterQuery<VideoDocument> = { uuid };

    return super.exists(query);
  }

  public async existsByHash(hash: string): Promise<boolean> {
    const query: FilterQuery<VideoDocument> = { hash };

    return super.exists(query);
  }

  public async createOne(video: Video): Promise<Video> {
    const created = await super.create(video);

    return VideosMapper.any2Video(created);
  }

  public async updateOneByUUID(uuid: string, update: Partial<Video>): Promise<Video | null> {
    const query: FilterQuery<VideoDocument> = { uuid };
    const updated = await super.findOneAndUpdate(query, update);

    return updated == null ? null : VideosMapper.any2Video(updated);
  }
}
