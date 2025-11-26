import { Module } from '@nestjs/common';
import { ManagerService } from './manager.service';
import {BotsService} from "../bots/bots.service";

@Module({
  imports: [],
  providers: [ManagerService, BotsService],
  exports: [ManagerService, BotsService],
})
export class ManagerModule {}