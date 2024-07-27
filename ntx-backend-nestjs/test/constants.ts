import { ENVIRONMENTS } from '@ntx/constants';

export const TEST_DIRECTORIES = {
  [ENVIRONMENTS.TEST]: 'test',
  [ENVIRONMENTS.CI_TEST]: 'test',
};

export const TEST_CACHE_DIRECTORIES = {
  [ENVIRONMENTS.TEST]: '.cache',
  [ENVIRONMENTS.CI_TEST]: '.ci-data',
};
