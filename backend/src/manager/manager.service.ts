import {Injectable, Logger} from '@nestjs/common';
import {BotsService} from "../bots/bots.service";
import {ws} from "../ws";
import {timeout} from "../common/utils";


@Injectable()
export class ManagerService {
  private readonly logger = new Logger(ManagerService.name);

  constructor(
      private readonly botsService: BotsService
  ) {
      this.botsService.managerService = this;
      this.startManager().then();
  }

  async startManager(){
      await this.botsService.loadAllBotsList();
      await this.botsService.runAllBots();
      await timeout(0);
      ws.startServer();
  }
}
