import {Injectable, Logger} from '@nestjs/common';
import {ManagerService} from "../manager/manager.service";
import {ws} from '../ws';
import path from "node:path";
import * as fs from 'fs/promises';
import {genId} from "../common/utils";

export type Bot = {
    id: string,
    name: string,
    desc?: string,
    file: string,
}

const BOTS_LIST_FILE = path.join(process.cwd(), '../data/bots.json');

@Injectable()
export class BotsService {
    private readonly logger = new Logger(BotsService.name);

    managerService: ManagerService;
    bots: Bot[];

    constructor() {
        ws.handlers.getBotsList = this.getBotsList.bind(this);
        ws.handlers.createBot = this.createBot.bind(this);
        ws.handlers.deleteBot = this.deleteBot.bind(this);
    };

    getBot(id: string) {
        return this.bots.find(b => b.id === id);
    }

    async createBot() {
        const bot: Bot = {
            id: genId(24),
            name: `DemoBot ${this.bots.length + 1}`,
            desc: '',
            file: 'demo/index.ts'
        }
        this.bots.push(bot);
        await this.saveBots();
        return bot;
    }

    async deleteBot(id: string) {
        const bot = this.getBot(id);
        if (!bot) return {error: "Can't find bot"}
        this.bots.splice(this.bots.indexOf(bot), 1);
        await this.saveBots();
        return this.bots;
    }

    async saveBots() {
        return fs.writeFile(BOTS_LIST_FILE, JSON.stringify(this.bots, null, 4));
    }

    async getBotsList() {
        const content: string = await fs.readFile(BOTS_LIST_FILE, 'utf8');
        try {
            this.bots = JSON.parse(content);
        } catch (e) {
            return {error: 'Bad bots.json file'};
        }
        !this.bots.length && (await this.createBot());
        return this.bots;
    }
}
