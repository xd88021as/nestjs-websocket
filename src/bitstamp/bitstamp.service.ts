import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { OHLCData } from './bitstamp.interface';

type currencyPairs =
  | 'btcusd'
  | 'btceur'
  | 'ethusd'
  | 'eurusd'
  | 'gbpusd'
  | 'ltcbtc'
  | 'ltcusd'
  | 'ltceur'
  | 'ltcgbp'
  | 'xrpusd';

@Injectable()
export class BitstampService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  #getKey(timestamp: number, currencyPairs: currencyPairs): string {
    return `${currencyPairs}-OHLC-${timestamp}`;
  }

  async set(timestamp: number, currencyPairs: currencyPairs, data: OHLCData) {
    const key = this.#getKey(timestamp, currencyPairs);
    await this.cacheManager.set(key, data, 60 * 15);
  }

  async get(
    timestamp: number,
    currencyPairs: currencyPairs,
  ): Promise<OHLCData> {
    const key = this.#getKey(timestamp, currencyPairs);
    const data = await this.cacheManager.get<OHLCData>(key);
    return data;
  }

  async setOHLC(currencyPairs: currencyPairs, price: number) {
    const now = new Date();
    const startOfMinute = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      now.getHours(),
      now.getMinutes(),
      0,
      0,
    );
    const timestamp = startOfMinute.getTime();
    const ohlc = await this.get(timestamp, currencyPairs);
    if (!ohlc) {
      await this.set(timestamp, currencyPairs, {
        firstPrice: price,
        highestPrice: price,
        lastPrice: price,
        lowestPrice: price,
      });
    } else {
      await this.set(timestamp, currencyPairs, {
        firstPrice: ohlc.firstPrice,
        highestPrice: ohlc.firstPrice > price ? ohlc.firstPrice : price,
        lastPrice: price,
        lowestPrice: ohlc.firstPrice < price ? ohlc.firstPrice : price,
      });
    }
    return await this.get(timestamp, currencyPairs);
  }
}
