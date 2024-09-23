import { FileInStorage } from '@ntx/file-storage/types';
import { Job, Queue } from 'bullmq';

export interface CreatePosterJobPayload {
  posterID: string;
  file: FileInStorage;
}

export type CreatePosterJob = Job<CreatePosterJobPayload, FileInStorage[], string>;

export type CreatePosterQueue = Queue<CreatePosterJobPayload, FileInStorage[], string>;
