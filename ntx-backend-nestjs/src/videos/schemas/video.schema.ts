import mongoose from 'mongoose';
import { Video } from '../entity/video.entity';

export type VideoDocument = Video & mongoose.Document;

export const VideoSchema = new mongoose.Schema<Video>(
  {
    uuid: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    runtimeMinutes: { type: Number, required: true },
  },
  { timestamps: true },
);
