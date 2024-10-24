import { Entity } from '@ntx/common/interfaces/entity.interface';

export interface VideoProps {
  // TODO: Define the properties of a video
}

export class Video implements Entity {
  // TODO: Define the properties of a video (use Movie as example)
  uuid: string;
  createdAt: Date;
  updatedAt: Date;

  public static async create(props: VideoProps): Promise<Video> {
    // TODO: Implement the create method (use Movie as example)
    throw new Error('Not implemented');
  }
}
