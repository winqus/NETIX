import { Redis } from 'ioredis';
import config from '../config';

const redisLoader = async () => {
  const redisHost = config.redis.host;
  const redisPort = config.redis.port;
  const redisPassword = config.redis.password;

  const redisConnection = new Redis({
    host: redisHost,
    port: redisPort,
    password: redisPassword,
    maxRetriesPerRequest: null,
  });

  await new Promise((resolve, reject) => {
    redisConnection.on('error', (error) => {
      console.error('Error connecting to Redis:', error);
      reject(error);
    });

    redisConnection.on('ready', () => {
      resolve(true);
    });
  });

  return redisConnection;
};

export default redisLoader;
