import {Injectable, Logger} from '@nestjs/common';
import {BotsService} from "../bots/bots.service";
import {ws} from "../ws";
import {timeout} from "../common/utils";
import {BybitCandles} from "../candles/bybit.candles";


@Injectable()
export class ManagerService {
  private readonly logger = new Logger(ManagerService.name);

  constructor(
      private readonly botsService: BotsService,
      private readonly bybitCandles: BybitCandles
  ) {
      this.botsService.managerService = this;
      this.startManager().then();
  }

  async startManager(){
      await this.botsService.loadAllBotsList();
      await timeout(0);
      ws.startServer();
      await this.bybitCandles.launch('BTCUSDT');
      console.log('UPDATE DONE');
      await this.botsService.runAllBots();
  }
}
