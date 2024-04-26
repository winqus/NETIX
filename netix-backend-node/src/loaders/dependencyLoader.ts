import Container from 'typedi';
import { wLoggerInstance as logger } from './logger';

// interface DependencyLoaderArgs {
//   schemas: { name: string; path: string }[];
//   repositories: { name: string; path: string }[];
//   services: { name: string; path: string }[];
//   controllers: { name: string; path: string }[];
// }

interface DependencyLoaderArgs {
  schemas: { name: string; class: any }[];
  repositories: { name: string; class: any }[];
  services: { name: string; class: any }[];
}

export default ({ schemas, repositories, services }: DependencyLoaderArgs) => {
  try {
    Container.set('logger', logger);

    // Load schemas
    // schemas.forEach(({ name, path }) => {
    //   const schema = require(path).default;
    //   Container.set(name, schema);
    // });
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

    // Load controllers
    // controllers.forEach(({ name, class: ControllerClass }) => {
    //   const controllerInstance = Container.get(ControllerClass);
    //   Container.set(name, controllerInstance);
    // });

    /*
    const dependencies: { name: string; class: any }[] = [
      { name: 'videoUploadService', class: VideoUploadService },
      { name: 'videoUploadRequestService', class: VideoUploadRequestService },
    ];

    dependencies.forEach(({ name, class: serviceClass }) => {
      const serviceInstance = Container.get(serviceClass);
      Container.set(name, serviceInstance);
    });

    // Container.set('videoUploadService', Container.get(VideoUploadService));
    // Container.set('videoUploadRequestService', Container.get(VideoUploadRequestService));

    controllers.forEach(({ name, path }) => {
      const controllerClass = require(path).default;
      const controllerInstance = Container.get(controllerClass);
      Container.set(name, controllerInstance);
    });
    */
  } catch (error) {
    logger.error(`[DependencyLoader]: ${error}`);
    throw new Error('Failed to load dependencies');
  }
};
