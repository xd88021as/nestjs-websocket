import { Module } from '@nestjs/common';
import { WebsocketGateway } from './websocket.gateway';
import { BitstampModule } from 'src/bitstamp/bitstamp.module';

@Module({
  imports: [BitstampModule],
  providers: [WebsocketGateway],
})
export class WebsocketModule {}
