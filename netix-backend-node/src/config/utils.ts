export type EnvironmentType = 'development' | 'production' | 'testing';

export function getCurrentEnvironment(environmentName: string): EnvironmentType {
  let currentEnvironmentName: EnvironmentType = 'development';

  if (['development', 'production', 'testing'].includes(environmentName)) {
    currentEnvironmentName = environmentName as EnvironmentType;
  }

  return currentEnvironmentName;
}
