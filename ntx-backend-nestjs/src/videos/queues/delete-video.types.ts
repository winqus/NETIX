import { Job, Queue } from 'bullmq';

export interface DeleteVideoJobPayload {
  videoID: string;
}

export type DeleteVideoJob = Job<DeleteVideoJobPayload, void, string>;

export type DeleteVideoQueue = Queue<DeleteVideoJobPayload, void, string>;
