import { VIDEOS_ID_LENGTH, VIDEOS_ID_PREFIX } from '../videos.constants';
import { Video, VideoProps, VideoState } from './video.entity';

describe('Video', () => {
  describe('create', () => {
    it('should create a valid object with valid props', async () => {
      const props: VideoProps = {
        name: 'Test Video',
        state: VideoState.NOT_READY,
      };

      const video = await Video.create(props);

      expect(video).toBeInstanceOf(Video);
      expect(video.uuid).toBeDefined();
      expect(video.name).toBe(props.name);
      expect(video.state).toBe(props.state);
      expect(video.createdAt).toBeInstanceOf(Date);
      expect(video.updatedAt).toBeInstanceOf(Date);
      expect(video.sizeInBytes).toBe(0);
      expect(video.mimeType).toBeDefined();
      expect(video.fileExtention).toBeDefined();
    });
    it('should generate uuid if not provided', async () => {
      const props: VideoProps = {
        name: 'Test Video',
        state: VideoState.READY,
      };

      const video = await Video.create(props);

      expect(video.uuid).toBeDefined();
      expect(video.uuid).toHaveLength(VIDEOS_ID_PREFIX.length + VIDEOS_ID_LENGTH);
      expect(video.uuid.startsWith(VIDEOS_ID_PREFIX)).toBe(true);
    });

    it('should throw validation error when invalid props are provided', async () => {
      const props = {
        state: VideoState.PROCESSING,
      };

      await expect(Video.create(props as VideoProps)).rejects.toBeDefined();
    });
  });

  describe('generateUUID', () => {
    it('should generate a unique ID with correct prefix and length', () => {
      const uuid = Video.generateUUID();

      expect(uuid).toBeDefined();
      expect(uuid).toHaveLength(VIDEOS_ID_PREFIX.length + VIDEOS_ID_LENGTH);
      expect(uuid.startsWith(VIDEOS_ID_PREFIX)).toBe(true);
    });

    it('should generate unique IDs on multiple calls', () => {
      const uuid1 = Video.generateUUID();
      const uuid2 = Video.generateUUID();

      expect(uuid1).not.toBe(uuid2);
    });
  });
});
