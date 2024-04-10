import dotenv from 'dotenv';
import { wLoggerInstance } from './src/loaders/logger';
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
type environmentType = 'development' | 'production' | 'testing';
interface AppConfig {
  environment: environmentType;
  port: number;
  api: {
    prefix: string;
  };
  upload: {
    video: {
      maxDurationSeconds: number;
      maxSizeBytes: number;
      allowedMimeTypes: string[];
      resolution: {
        minWidth: number;
        minHeight: number;
        maxWidth: number;
        maxHeight: number;
      };
    };
    thumbnail: {
      maxSizeBytes: number;
      allowedMimeTypes: string[];
      aspectRatio: {
        width: number;
        height: number;
      };
    };
  };
}

const envFound = dotenv.config();
if (!envFound || envFound?.error) {
  wLoggerInstance.warn('⚠️  No .env file found, using default environment variables ⚠️');
}

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
const env: AppEnvironment = process.env as AppEnvironment;

/*
 * App configuration
 */
const config: AppConfig = {
  environment: getCurrentEnvironment(env.NODE_ENV),

  port: parseInt(env.PORT, 10) || 3055,

  api: {
    prefix: '/api',
  },

  upload: {
    video: {
      maxDurationSeconds: 10 * 3600, // 10 hours
      maxSizeBytes: 20 * 1073741824, // 20 GB
      allowedMimeTypes: ['video/mp4', 'video/quicktime', 'video/x-matroska'],
      resolution: {
        minWidth: 640,
        minHeight: 360,
        maxWidth: 1920,
        maxHeight: 1080,
      },
    },
    thumbnail: {
      maxSizeBytes: 50 * 1024, // 50 KB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
      aspectRatio: {
        width: 12,
        height: 17,
      },
    },
  },
};
export default config;

function getCurrentEnvironment(environmentName: string): environmentType {
  let currentEnvironmentName: environmentType = 'development';

  if (['development', 'production', 'testing'].includes(environmentName)) {
    currentEnvironmentName = environmentName as environmentType;
  }

  return currentEnvironmentName;
}
