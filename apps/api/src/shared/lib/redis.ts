import Redis, { RedisOptions } from 'ioredis';

const DEFAULT_REDIS_PORT = 6379;

function getRedisPort(value?: string): number {
  if (!value) {
    return DEFAULT_REDIS_PORT;
  }

  const port = Number(value);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('REDIS_PORT debe ser un puerto válido');
  }

  return port;
}

export function getRedisOptions(): RedisOptions {
  return {
    host: process.env.REDIS_HOST || 'localhost',
    port: getRedisPort(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD || undefined,
    lazyConnect: true,
    maxRetriesPerRequest: 3,
  };
}

export function createRedisClient(): Redis {
  return new Redis(getRedisOptions());
}

export const redisClient = createRedisClient();