import dotenv from 'dotenv';

const envFound = dotenv.config();
if (!envFound || envFound?.error) {
  wLoggerInstance.warn('⚠️  No .env file found, using default environment variables ⚠️');
}

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

import { wLoggerInstance } from '../loaders/logger';
import { EnvironmentType, getCurrentEnvironment } from './utils';
import { VideoConfig, config as videoConfig } from './videos';

/*
 * Environment variables that will be loaded from .env file
 */
interface AppEnvironment extends NodeJS.ProcessEnv {
  NODE_ENV: string;
  PORT: string;
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
};
export default config;
