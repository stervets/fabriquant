import { Module } from '@nestjs/common';
import {ManagerModule} from "./manager/manager.module";

@Module({
  imports: [ManagerModule],
})
export class AppModule {}
