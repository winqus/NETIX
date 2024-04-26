import { Result } from '../logic/Result';
import { MetadataUploadState, ThumbnailUploadState, VideoUploadRequestState, VideoUploadState } from '../states/VideoUploadRequest.state';
import UniqueEntityID from './UniqueEntityID';
import VideoUploadRequest from './VideoUploadRequest';

describe('VideoUploadRequest', () => {
  const validUUID = new UniqueEntityID();
  const props = {
    videoId: validUUID,
    requesterId: validUUID,
    videoState: VideoUploadState.Processing,
    thumbnailId: validUUID,
    thumbnailState: ThumbnailUploadState.Uploading,
    metadataId: validUUID,
    metadataState: MetadataUploadState.Pending,
    overallState: VideoUploadRequestState.Processing,
    chunksReceived: 5,
    totalChunks: 10,
  };

  describe('create method', () => {
    it('should create a valid VideoUploadRequest when all properties are valid', () => {
      const result = VideoUploadRequest.create(props);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toBeInstanceOf(VideoUploadRequest);
    });

    const propertiesToTest = [
      'videoId',
      'requesterId',
      'videoState',
      'thumbnailState',
      'metadataState',
      'overallState',
      'chunksReceived',
      'totalChunks',
    ];

    propertiesToTest.forEach((property) => {
      it(`should fail when ${property} is missing`, () => {
        const invalidProps = { ...props, [property]: undefined };

        const result = VideoUploadRequest.create(invalidProps as any);

        expect(result.isFailure).toBe(true);
        expect(result.error).toMatch(`is required`);
      });
    });

    ['videoState', 'thumbnailState', 'metadataState', 'overallState'].forEach((state) => {
      it(`should fail when ${state} is invalid`, () => {
        const invalidProps = { ...props, [state]: 'invalid_state' as any };

        const result = VideoUploadRequest.create(invalidProps);

        expect(result.isFailure).toBe(true);
        expect(result.error).toMatch(`Invalid ${state} value`);
      });
    });

    it('should fail when chunksReceived is not an integer', () => {
      const invalidProps = { ...props, chunksReceived: 5.5 };

      const result = VideoUploadRequest.create(invalidProps);

      expect(result.isFailure).toBe(true);
      expect(result.error).toMatch('Invalid chunks received');
    });

    it('should fail when chunksReceived is not in the range of 0 to totalChunks', () => {
      const invalidProps = { ...props, chunksReceived: -1 };

      const result = VideoUploadRequest.create(invalidProps);

      expect(result.isFailure).toBe(true);
      expect(result.error).toMatch('Invalid chunks received');
    });

    it('should fail when chunksReceived is greater than totalChunks', () => {
      const invalidProps = { ...props, chunksReceived: 11 };

      const result = VideoUploadRequest.create(invalidProps);

      expect(result.isFailure).toBe(true);
      expect(result.error).toMatch('Invalid chunks received');
    });

    it('should fail when totalChunks is not an integer', () => {
      const invalidProps = { ...props, totalChunks: 5.5 };

      const result = VideoUploadRequest.create(invalidProps);

      expect(result.isFailure).toBe(true);
      expect(result.error).toMatch('Invalid total chunks value');
    });

    it('should fail when totalChunks is less than 1', () => {
      const invalidProps = { ...props, totalChunks: 0 };

      const result = VideoUploadRequest.create(invalidProps);

      expect(result.isFailure).toBe(true);
      expect(result.error).toMatch('Invalid total chunks value');
    });
  });

  describe('getters and setters', () => {
    const videoUploadRequest = VideoUploadRequest.create(props, validUUID).getValue();

    it('should get the correct videoId', () => {
      expect(videoUploadRequest.videoId).toEqual(props.videoId);
    });

    [
      { propertyName: 'videoState', state: VideoUploadState.Completed },
      { propertyName: 'thumbnailState', state: ThumbnailUploadState.Completed },
      { propertyName: 'metadataState', state: MetadataUploadState.Completed },
      { propertyName: 'overallState', state: VideoUploadRequestState.Completed },
    ].forEach(({ propertyName, state }) => {
      it(`should set and get the correct ${propertyName}`, () => {
        (videoUploadRequest as any)[propertyName] = state;

        expect((videoUploadRequest as any)[propertyName]).toEqual(state);
      });
    });
  });

  describe('chunksRemaining getter', () => {
    it('should calculate the correct number of chunks remaining', () => {
      const videoUploadRequest = VideoUploadRequest.create(props, validUUID).getValue();

      expect(videoUploadRequest.chunksRemaining).toEqual(5);
    });
  });
});
