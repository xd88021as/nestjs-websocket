import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DataModule } from './data/data.module';
import { RateLimitingMiddleware } from './rate-limiting/rate-limiting.middleware';

@Module({
  imports: [DataModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RateLimitingMiddleware).forRoutes('GET', 'data');
  }
}
