import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisProvider } from '../redis/redis.provider';
import { RedisService } from '../redis/redis.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [RedisProvider, RedisService],
  exports: [RedisService],
})
export class RedisModule {}
