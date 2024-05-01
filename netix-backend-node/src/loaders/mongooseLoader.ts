import { Db } from 'mongodb';
import mongoose from 'mongoose';
import config from '../config';

export default async (): Promise<Db> => {
  const connection = await mongoose.connect(config.mongoDbUri, { autoIndex: true });

  return connection.connection.db;
};
