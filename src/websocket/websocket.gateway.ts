import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
} from '@nestjs/websockets';
import { BitstampService } from 'src/bitstamp/bitstamp.service';
import * as WebSocket from 'ws';
@WebSocketGateway({ namespace: '/streaming' })
export class WebsocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private server: WebSocket.Server;
  private socket: WebSocket;
  private clientDataMap: Map<
    string,
    { ws: WebSocket; currencyPairs: string[] }
  > = new Map();
  private currencyPairs = [
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
  constructor(private readonly bitstampService: BitstampService) {}

  afterInit() {
    this.socket = new WebSocket('wss://ws.bitstamp.net');
    this.socket.on('open', () => {
      this.currencyPairs.forEach((pair) => {
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
        const ohlc = await this.bitstampService.setOHLC(
          parts[2],
          message.data.price,
        );
        this.clientDataMap.forEach((value, key) => {
          if (
            value.currencyPairs.find(
              (currencyPair) => currencyPair === parts[2],
            )
          ) {
            value.ws.send({
              currencyPairs: parts[2],
              price: message.data.price,
              ohlc,
            });
          }
        });
      }
    });
  }

  handleConnection(client: WebSocket) {
    console.log(`Client connected`);
    this.clientDataMap.set(client.conn.remoteAddress, {
      ws: client,
      currencyPairs: [],
    });
  }

  handleDisconnect(client: WebSocket) {
    console.log(`Client disconnected`);
    this.clientDataMap.delete(client.conn.remoteAddress);
  }

  @SubscribeMessage('subscribeCurrencyPairs')
  subscribeCurrencyPairs(client: WebSocket, currencyPairs: string) {
    if (
      !this.currencyPairs.find((currencyPair) => currencyPair === currencyPairs)
    ) {
      return;
    }
    const clientData = this.clientDataMap.get(client.conn.remoteAddress);
    if (
      clientData.currencyPairs.find(
        (currencyPair) => currencyPair === currencyPairs,
      )
    ) {
      return;
    }
    clientData.currencyPairs.push(currencyPairs);
  }

  @SubscribeMessage('unsubscribeCurrencyPairs')
  unsubscribeCurrencyPairs(client: WebSocket, currencyPairs: string) {
    if (
      !this.currencyPairs.find((currencyPair) => currencyPair === currencyPairs)
    ) {
      return;
    }
    const clientData = this.clientDataMap.get(client.conn.remoteAddress);
    clientData.currencyPairs.filter(
      (currencyPair) => currencyPair !== currencyPairs,
    );
  }
}
