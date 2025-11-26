import {Injectable, Logger} from '@nestjs/common';
import {BotsService} from "../bots/bots.service";



@Injectable()
export class ManagerService {
  private readonly logger = new Logger(ManagerService.name);

  constructor(
      private readonly botsService: BotsService
  ) {
      this.botsService.managerService = this;
  }
}
