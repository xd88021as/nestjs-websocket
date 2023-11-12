import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { io, Socket as ClientSocket } from 'socket.io-client';
@WebSocketGateway({ namespace: '/streaming' })
export class WebsocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;
  private bitstampSocket: ClientSocket;

  afterInit() {
    this.bitstampSocket = io('wss://ws.bitstamp.net');
    this.bitstampSocket.on('connect', () => {
      const currencyPairs = [
        'btcusd',
        'btceur',
        'ethusd',
        'eurusd',
        'gbpusd',
        'ltcbtc',
        'ltcusd',
        'ltceur',
        'ltcgbp',
        'xrpusd',
      ];
      currencyPairs.forEach((pair) => {
        this.bitstampSocket.emit('bts:subscribe', {
          channel: `live_trades_${pair}`,
        });
      });
    });
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('bitstampTradePrice')
  bitstampTradePrice() {
    this.bitstampSocket.on('trade', (data) => {
      const latestPrice = data.data.price;
      this.server.emit('bitstampTradePrice', { latestPrice });
    });
  }
}
