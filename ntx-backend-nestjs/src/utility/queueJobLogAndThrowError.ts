import { Job } from 'bullmq';

export const jobLogErrorAndThrowError = async (job: Job<any>, message: string): Promise<void> => {
  const timestamp = new Date().toISOString();
  const formattedMessage = `[ERROR] ${message} (${timestamp})`;
  await job.log(formattedMessage);
  throw new Error(message);
};

export const jobLogWarningAndThrowError = async (job: Job<any>, message: string): Promise<void> => {
  const timestamp = new Date().toISOString();
  const formattedMessage = `[WARN] ${message} (${timestamp})`;
  await job.log(formattedMessage);
  throw new Error(message);
};

export const jobLogWithTimestamp = async (job: Job<any>, message: string): Promise<void> => {
  const timestamp = new Date().toISOString();
  const formattedMessage = `${message} (${timestamp})`;
  await job.log(formattedMessage);
};

export const jobLogError = async (job: Job<any>, message: string): Promise<void> => {
  const timestamp = new Date().toISOString();
  const formattedMessage = `[ERROR] ${message} (${timestamp})`;
  await job.log(formattedMessage);
};
