export interface RedisConnectionOptions {
  connection: {
    host: string;
    port: number;
    password?: string;
  };
}
