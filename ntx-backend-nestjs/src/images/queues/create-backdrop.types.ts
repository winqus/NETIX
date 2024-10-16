import { FileInStorage } from '@ntx/file-storage/types';
import { Job, Queue } from 'bullmq';

export interface CreateBackdropJobPayload {
  backdropID: string;
  file: FileInStorage;
}

export type CreateBackdropJob = Job<CreateBackdropJobPayload, FileInStorage[], string>;

export type CreateBackdropQueue = Queue<CreateBackdropJobPayload, FileInStorage[], string>;
