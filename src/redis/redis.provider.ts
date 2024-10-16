import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

export const REDIS_CLIENT = 'REDIS_CLIENT';

export const RedisProvider: Provider = {
  provide: REDIS_CLIENT,
  useFactory: async (
    configService: ConfigService,
  ): Promise<RedisClientType> => {
    const client = createClient({
      url: configService.get<string>('REDIS_URL'),
    });

    client.on('error', (err) => console.error('Redis Client Error', err));

    await client.connect();
    return client as RedisClientType;
  },
  inject: [ConfigService],
};
