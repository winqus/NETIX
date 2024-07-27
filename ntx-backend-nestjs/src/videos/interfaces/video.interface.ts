import { Document } from 'mongoose';

export interface Video extends Document {
  readonly uuid: string;
}
