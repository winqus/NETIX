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
    prefix: '/api/v1',
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
