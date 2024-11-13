import mongoose from 'mongoose';
import { Video, VideoState } from '../entity/video.entity';

export type VideoDocument = Video & mongoose.Document;

export const VideoSchema = new mongoose.Schema<Video>(
  {
    uuid: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    state: { type: String, enum: Object.values(VideoState), required: true },
  },
  { timestamps: true },
);
