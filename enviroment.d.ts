// http://dev.to/asjadanis/parsing-env-with-typescript-3jjm
declare namespace NodeJS {
  interface ProcessEnv {
    MONGO_URI: string;
    PORT: string;
    JWT_SECRET: string;
    REDIS_HOST: string;
    REDIS_PORT: string;
  }
}
