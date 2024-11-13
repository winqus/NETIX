import { FileInStorage } from '@ntx/file-storage/types';
import { Job, Queue } from 'bullmq';

export interface ProcessVideoJobPayload {
  videoID: string;
  file: FileInStorage;
}

export type ProcessVideoJob = Job<ProcessVideoJobPayload, FileInStorage, string>;

export type ProcessVideoQueue = Queue<ProcessVideoJobPayload, FileInStorage, string>;
