import Container from 'typedi';
import { wLoggerInstance as logger } from './logger';

interface DependencyLoaderArgs {
  schemas: { name: string; path: string }[];
  repositories: { name: string; path: string }[];
  services: { name: string; path: string }[];
  controllers: { name: string; path: string }[];
}
export default ({ schemas, repositories, services, controllers }: DependencyLoaderArgs) => {
  try {
    Container.set('logger', logger);

    schemas.forEach(({ name, path }) => {
      const schema = require(path).default;
      Container.set(name, schema);
    });

    repositories.forEach(({ name, path }) => {
      const repoClass = require(path).default;
      const repoInstance = Container.get(repoClass);
      Container.set(name, repoInstance);
    });

    services.forEach(({ name, path }) => {
      const serviceClass = require(path).default;
      const serviceInstance = Container.get(serviceClass);
      Container.set(name, serviceInstance);
    });

    controllers.forEach(({ name, path }) => {
      const controllerClass = require(path).default;
      const controllerInstance = Container.get(controllerClass);
      Container.set(name, controllerInstance);
    });
  } catch (error) {
    logger.error(`[DependencyLoader]: ${error}`);
    throw new Error('Failed to load dependencies');
  }
};
