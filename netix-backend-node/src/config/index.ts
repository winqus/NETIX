import dotenv from 'dotenv';
import { exit } from 'node:process';
import { wLoggerInstance } from '../loaders/logger';

const envFound = dotenv.config();
if (!envFound || envFound?.error) {
  wLoggerInstance.error('⚠️  No .env file found ⚠️');
  exit(1);
}

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

import { DependencyConfig, dependencyConfig } from '../loaders/dependencyConfig';
import { EnvironmentType, getCurrentEnvironment } from './utils';
import videoConfig, { VideoConfig } from './videos';

/*
 * Environment variables that will be loaded from .env file
 */
interface AppEnvironment extends NodeJS.ProcessEnv {
  NODE_ENV: string;
  PORT: string;
  MONGODB_URI: string;
  REDIS_HOST: string;
  REDIS_PORT: string;
  REDIS_PASSWORD?: string;
}

/*
 * Application configuration properties
 */
interface AppConfig {
  environment: EnvironmentType;
  port: number;
  mongoDbUri: string;
  api: {
    prefix: string;
  };
  video: VideoConfig;
  dependencies: DependencyConfig;
  redis: {
    host: string;
    port: number;
    password?: string;
  };
}

/*
 * Load environment variables from .env file
 */

const env: AppEnvironment = process.env as AppEnvironment;

/*
 * App configuration
 */
const config: AppConfig = {
  environment: getCurrentEnvironment(env.NODE_ENV),

  port: parseInt(env.PORT, 10) || 3055,

  mongoDbUri: env.MONGODB_URI || 'mongodb://127.0.0.1:27017/test',

  api: {
    prefix: '/api',
  },

  video: videoConfig,

  dependencies: dependencyConfig,

  redis: {
    host: env.REDIS_HOST || '127.0.0.1',
    port: parseInt(env.REDIS_PORT, 10) || 6379,
    password: env.REDIS_PASSWORD,
  },
};
export default config;
