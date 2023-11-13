import { Module } from '@nestjs/common';
import { BitstampService } from './bitstamp.service';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    CacheModule.register({
      store: redisStore,
      host: '127.0.0.1',
      port: 6379,
    }),
  ],
  providers: [BitstampService],
  exports: [BitstampService],
})
export class BitstampModule {}
