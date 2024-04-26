import Container from 'typedi';
import { wLoggerInstance as logger } from './logger';

interface DependencyLoaderArgs {
  schemas: { name: string; class: any }[];
  repositories: { name: string; class: any }[];
  services: { name: string; class: any }[];
}

export default ({ schemas, repositories, services }: DependencyLoaderArgs) => {
  try {
    Container.set('logger', logger);

    // Load schemas
    schemas.forEach(({ name, class: SchemaClass }) => {
      Container.set(name, SchemaClass);
    });

    // Load repositories
    repositories.forEach(({ name, class: RepoClass }) => {
      const repoInstance = Container.get(RepoClass);
      Container.set(name, repoInstance);
    });

    // Load services
    services.forEach(({ name, class: ServiceClass }) => {
      const serviceInstance = Container.get(ServiceClass);
      Container.set(name, serviceInstance);
    });
  } catch (error) {
    logger.error(`[DependencyLoader]: ${error}`);
    throw new Error('Failed to load dependencies');
  }
};
