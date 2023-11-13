import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DataModule } from './data/data.module';
import { RateLimitingMiddleware } from './rate-limiting/rate-limiting.middleware';
import { WebsocketGateway } from './websocket/websocket.gateway';
import { BitstampModule } from './bitstamp/bitstamp.module';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    CacheModule.register({
      store: redisStore,
      host: '127.0.0.1',
      port: 6379,
    }),
    DataModule,
    BitstampModule,
  ],
  controllers: [AppController],
  providers: [AppService, WebsocketGateway],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RateLimitingMiddleware).forRoutes('GET', 'data');
  }
}
