import {Injectable, Logger} from '@nestjs/common';
import {RestClientV5} from 'bybit-api';
import dayjs from 'dayjs';
import path from 'node:path';
import {ws} from '../ws';
import {formatTime} from '../common/utils'
import {
  Candle,
  CandlesDb,
  ensureSchema,
  getFirstCandle,
  getLastCandle,
  insertCandles,
  openCandlesDb,
} from "./candles.db";

const PLATFORM = 'bybit';
const CHUNK_SIZE = 4500;

const firstCandleTimeOffset = {
  BTCUSDT: 43200, // +12 hours in seconds
  ETHUSDT: 43200 // +12 hours in seconds
};

@Injectable()
export class BybitCandles {
  private readonly logger = new Logger(BybitCandles.name);

  private client = new RestClientV5({
    key: '',
    secret: '',
    testnet: false,
    enable_time_sync: true,
  });

  private db: CandlesDb;
  private symbol: string;

  private bybitFirstCandleTime: number;
  private loadedMinutes: number;

  async launch(symbol: string) {
    this.symbol = symbol;
    this.db = openCandlesDb(path.join(process.cwd(), '../data/db', `${PLATFORM}-${this.symbol}.sqlite`));

    ensureSchema(this.db);

    this.loadedMinutes = this.getLoadedMinutes();
    this.bybitFirstCandleTime = (await this.getBybitFirstCandleTime()) + firstCandleTimeOffset[this.symbol];
    console.log(`Download [${PLATFORM}:${this.symbol}] history`);
    await this.updateDatabase(this.bybitFirstCandleTime - 1, getFirstCandle(this.db)?.t);
    console.log(`Update tail [${PLATFORM}:${this.symbol}] PASS 1`);
    await this.updateDatabase(getLastCandle(this.db).t);
    console.log(`Update tail [${PLATFORM}:${this.symbol}] PASS 2`);
    await this.updateDatabase(getLastCandle(this.db).t);
    console.log(`[${PLATFORM}:${this.symbol}] updated to ${formatTime(getLastCandle(this.db).t)}`);

    this.logger.log(`[${PLATFORM}:${this.symbol}] DB update done`);
    return;
  }

  async updateDatabase(
    fromTime: number = 0,
    toTime: number = null
  ) {
    toTime = toTime || this.getStartOfMinute();
    let candles: Candle[];
    let result: Candle[] = [];
    while ((candles = await this.downloadCandles(fromTime, toTime)).length) {
      insertCandles(this.db, candles);
      result = candles.concat(result);
      toTime = candles[0].t;
      this.loadedMinutes += candles.length;
      const percent = this.getPercent();
      ws.broadcastFront('updateDbPercent', PLATFORM, this.symbol, percent, toTime, fromTime);
      console.log(`Update DB [${PLATFORM}:${this.symbol}]: ${percent.toFixed(2)}% ${formatTime(toTime)}`);
    }
    return result;
  }

  getPercent() {
    return this.loadedMinutes * 6000 / (this.getStartOfMinute() - this.bybitFirstCandleTime)
  }

  // NOW TIME 8:55, untilTime 08:50
  // const candles = await this.downloadCandles(
  //     fromTime - 1, // - 1 is necessary to take 08:50 as well
  //     dayjs().startOf("minute").valueOf() / 1000); // FIRST WILL BE 8:54 (because last realtime candle not closed)
  async downloadCandles(
    fromTime: number = 0, // самое раннее время до которого будут грузиться данные
    toTime: number = null
  ): Promise<Candle[]> {
    const {result} = await this.client.getKline({
      category: "spot",
      symbol: this.symbol,
      interval: '1',
      end: toTime ? toTime * 1000 - 1 : undefined,
      limit: CHUNK_SIZE
    });
    if (!result?.list) return [];
    let data = result.list
      .map((item: any) => this.getCandleFromRawData(item))
      .reverse();

    if (fromTime) {
      for (var i = 0; i < data.length; i++) {
        if (data[i].t > fromTime) break;
      }
      i && (data = data.slice(i));
    }

    return data;
  }

  getCandleFromRawData(data): Candle {
    const [t, o, h, l, c, v, to] = data.map(parseFloat);
    return {t: Math.round(t / 1000), o, h, l, c, v, to};
  }

  async getBybitFirstCandleTime(symbol?: string) {
    return (((await this.client.getKline({
      category: "spot",
      symbol: symbol || this.symbol,
      interval: '1',
      start: 1,
      limit: 1
    })) as any)?.result?.list?.[0]?.[0] || 0) / 1000;
  }

  getLoadedMinutes() {
    const firstCandleTime = getFirstCandle(this.db)?.t || 0;
    return firstCandleTime ? (getLastCandle(this.db).t - firstCandleTime) / 60 : 0;
  }

  getStartOfMinute() {
    return dayjs().startOf("minute").valueOf() / 1000;
  }
}