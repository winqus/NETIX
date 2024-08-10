import { MongoMemoryServer } from 'mongodb-memory-server';

/**
 * Creates a basic MongoMemoryServer at mongodb://127.0.0.1:27019
 * @returns {Promise<MongoMemoryServer>} The created MongoMemoryServer instance.
 */
export default () => {
  return MongoMemoryServer.create({
    instance: {
      port: 27019,
    },
  });
};
