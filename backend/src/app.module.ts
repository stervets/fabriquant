// src/app.module.ts
import { Module } from '@nestjs/common';
import {ManagerService} from "./manager/manager.service";
import {ManagerModule} from "./manager/manager.module";

@Module({
  imports: [ManagerModule],
})
export class AppModule {}
