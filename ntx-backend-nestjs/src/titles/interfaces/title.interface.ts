import { Document } from 'mongoose';

export interface Title extends Document {
  readonly uuid: string;
}
