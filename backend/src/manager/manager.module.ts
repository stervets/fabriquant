import {Module} from '@nestjs/common';
import {ManagerService} from './manager.service';
import {BotsService} from "../bots/bots.service";
import {BybitCandles} from "../candles/bybit.candles";

@Module({
    imports: [],
    providers: [ManagerService, BotsService, BybitCandles],
    exports: [ManagerService, BotsService, BybitCandles],
})
export class ManagerModule {
}