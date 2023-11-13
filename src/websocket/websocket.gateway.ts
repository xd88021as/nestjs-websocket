import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { BitstampService } from 'src/bitstamp/bitstamp.service';
import * as WebSocket from 'ws';
@WebSocketGateway({ namespace: '/streaming' })
export class WebsocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private server: Server;
  private socket: WebSocket;
  constructor(private readonly bitstampService: BitstampService) {}

  afterInit() {
    this.socket = new WebSocket('wss://ws.bitstamp.net');
    this.socket.on('open', () => {
      [
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
      ].forEach((pair) => {
        const subscribeMessage = {
          event: 'bts:subscribe',
          data: {
            channel: `live_trades_${pair}`,
          },
        };
        this.socket.send(JSON.stringify(subscribeMessage));
      });
    });
    this.socket.on('message', async (data) => {
      const message = JSON.parse(data);
      if (message.data.price) {
        const parts = message.channel.split('_');
        await this.bitstampService.setOHLC(parts[2], message.data.price);
      }
    });
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('getTradePrice')
  getTradePrice(client: Socket, currencyPairs: any) {
    this.socket.on('message', async (data) => {
      const message = JSON.parse(data);
      if (message.data.price) {
        const parts = message.channel.split('_');
        if (parts[2] !== currencyPairs) {
          return;
        }
        const ohlc = await this.bitstampService.setOHLC(
          parts[2],
          message.data.price,
        );
        this.server.emit('getTradePrice', {
          currencyPairs: parts[2],
          price: message.data.price,
          ohlc,
        });
      }
    });
    return;
  }
}
